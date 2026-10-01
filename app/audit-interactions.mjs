import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
const base = process.env.SITE_TEST_URL || "http://127.0.0.1:8080";
const checks = [];
const failures = [];
const browser = await chromium.launch({
  headless: true,
  args: ["--disable-gpu", "--renderer-process-limit=1"],
});
const check = (condition, name) => {
  checks.push({ name, passed: !!condition });
  if (!condition) failures.push(name);
};
try {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
  });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => failures.push(e.message));
  const resources = [];
  page.on("request", (r) => resources.push(r.url()));
  await page.goto(base, { waitUntil: "networkidle" });
  check(
    !resources.some((r) => r.includes("logo-clean.png") || r.endsWith(".mp4")),
    "Small logo and no intro download with reduced motion",
  );
  await page.locator('.desktop-nav a[href="/poslugy"]').click();
  await page.waitForURL("**/poslugy");
  check(
    (await page.locator(".desktop-nav a[aria-current=page]").getAttribute("href")) === "/poslugy",
    "Current navigation section",
  );
  const rows = page.locator(".service-rows > a");
  const services = [];
  for (let i = 0; i < (await rows.count()); i++) {
    const row = rows.nth(i);
    const title = await row.locator("h3").textContent();
    const href = await row.getAttribute("href");
    services.push({ title, href });
    await row.hover();
    check(
      (await page.locator(".preview-description h3").textContent()) === title,
      `Service hover: ${title}`,
    );
    await row.focus();
    check(
      (await page.locator(".service-preview img").getAttribute("alt")) === title,
      `Service keyboard preview: ${title}`,
    );
  }
  for (let i = 0; i < services.length; i++) {
    const service = services[i];
    await page.goto(base + service.href, { waitUntil: "networkidle" });
    check(
      (await page.locator("h1").textContent()) === service.title,
      `Service page: ${service.title}`,
    );
    check(
      (await page.locator(".next-service").getAttribute("href")) ===
        services[(i + 1) % services.length].href,
      `Next service: ${service.title}`,
    );
    await page.locator(".faq summary").first().click();
    check(
      (await page.locator(".faq details").first().getAttribute("open")) !== null,
      `FAQ: ${service.title}`,
    );
    await page.locator(".service-consult").click();
    check(
      (await page.locator("select[name=service]").inputValue()) === service.title,
      `Service preselection: ${service.title}`,
    );
    await page.keyboard.press("Escape");
  }
  await page.goto(base + "/portfolio", { waitUntil: "networkidle" });
  await page.locator(".portfolio-project").first().click();
  await page.keyboard.press("Escape");
  await page.waitForFunction(() => document.activeElement?.classList.contains("portfolio-project"));
  check(true, "Project close returns focus to its card");
  const range = page.getByRole("slider");
  await range.focus();
  await page.keyboard.press("Home");
  check((await range.inputValue()) === "0", "Comparison Home key");
  await page.keyboard.press("End");
  check((await range.inputValue()) === "100", "Comparison End key");
  await page.goto(base + "/portfolio?project=unknown", { waitUntil: "networkidle" });
  check((await page.getByRole("dialog").count()) === 0, "Invalid project query is safe");
  const response404 = await page.goto(base + "/audit-missing-page", { waitUntil: "networkidle" });
  check(response404.status() === 404, "404 page");
  const axe404 = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  check(axe404.violations.length === 0, "404 accessibility");
  for (const path of [
    "/robots.txt",
    "/sitemap.xml",
    "/site.webmanifest",
    "/favicon.ico",
    "/apple-touch-icon.png",
    "/icon-192.png",
    "/icon-512.png",
    "/icon-maskable.png",
  ]) {
    const response = await ctx.request.get(base + path);
    check(response.status() === 200, `Public resource ${path}`);
  }
  const rangeResponse = await ctx.request.get(base + "/assets/intro.mp4", {
    headers: { Range: "bytes=0-1023" },
  });
  check(
    rangeResponse.status() === 206 && (await rangeResponse.body()).length === 1024,
    "Video partial download",
  );
  await ctx.close();

  const blocked = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  await blocked.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("Disabled", "SecurityError");
    };
  });
  const formPage = await blocked.newPage();
  await formPage.goto(base + "/kontakty", { waitUntil: "networkidle" });
  await formPage.locator(".invitation-consult").click();
  await formPage.getByLabel("Ваше ім’я *").fill("Олена");
  await formPage.getByLabel("Телефон *").fill("0676090075");
  await formPage.getByRole("checkbox").check();
  await formPage.getByRole("button", { name: "Підготувати звернення", exact: true }).click();
  check(
    await formPage.getByText("Дані доступні лише у відкритій формі.", { exact: false }).isVisible(),
    "Honest form state when storage is disabled",
  );
  check(
    await formPage.locator(".email-draft").isVisible(),
    "Email draft still works without storage",
  );
  await blocked.close();

  for (const width of [390, 1440]) {
    const introCtx = await browser.newContext({
      viewport: { width, height: 844 },
      reducedMotion: "no-preference",
    });
    const introPage = await introCtx.newPage();
    const videoRequests = [];
    introPage.on("request", (r) => {
      if (r.url().endsWith(".mp4")) videoRequests.push(r.url());
    });
    await introPage.goto(base, { waitUntil: "domcontentloaded" });
    await introPage.locator(".intro").waitFor();
    const expected = width === 390 ? "/assets/intro-mobile.mp4" : "/assets/intro.mp4";
    check(
      (await introPage.locator(".intro video").getAttribute("src")) === expected,
      `Intro video selection ${width}`,
    );
    if (width === 1440) await introPage.keyboard.press("Escape");
    else await introPage.locator(".intro-skip").click();
    await introPage.locator(".intro").waitFor({ state: "hidden" });
    await introPage.waitForFunction(() => document.activeElement?.tagName === "MAIN");
    check(
      await introPage.locator("main").evaluate((e) => e === document.activeElement),
      `Intro close restores focus ${width}`,
    );
    check(
      await introPage.locator("main").evaluate((e) => getComputedStyle(e).outlineStyle === "none"),
      `No accidental landmark frame ${width}`,
    );
    await introPage.keyboard.press("Tab");
    check(
      await introPage.evaluate(() => {
        const element = document.activeElement;
        return (
          element.matches(":focus-visible") && getComputedStyle(element).outlineStyle !== "none"
        );
      }),
      `Keyboard control focus remains visible ${width}`,
    );
    const before = videoRequests.length;
    await introPage.reload({ waitUntil: "networkidle" });
    check(
      (await introPage.locator(".intro").count()) === 0 && before === videoRequests.length,
      `Intro runs once per session ${width}`,
    );
    await introCtx.close();
  }
  const stalled = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const stalledPage = await stalled.newPage();
  let held;
  await stalledPage.route("**/assets/intro*.mp4", (route) => {
    held = route;
  });
  await stalledPage.goto(base, { waitUntil: "domcontentloaded" });
  await stalledPage.locator(".intro").waitFor();
  await stalledPage.locator(".intro").waitFor({ state: "hidden", timeout: 10000 });
  check(true, "Stalled intro exits automatically");
  if (held) await held.abort();
  await stalled.close();
} catch (e) {
  failures.push(e.stack);
} finally {
  await browser.close();
}
const out = "../refs/audit-after";
if (!fs.existsSync(out)) fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(out + "/interaction-report.json", JSON.stringify({ checks, failures }, null, 2));
console.log(JSON.stringify({ checks: checks.length, failures }, null, 2));
if (failures.length) process.exitCode = 1;
