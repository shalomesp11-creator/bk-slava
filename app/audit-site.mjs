import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";

const base = process.env.SITE_TEST_URL || "http://127.0.0.1:8080";
const phase = process.env.AUDIT_PHASE || "after";
const out = `../refs/audit-${phase}`;
if (!fs.existsSync(out)) fs.mkdirSync(out, { recursive: true });
const paths = [
  "/",
  "/poslugy",
  "/poslugy/remont-pid-klyuch",
  "/poslugy/demontazh",
  "/poslugy/gipsokarton",
  "/poslugy/steli",
  "/poslugy/ozdoblennya",
  "/poslugy/santehnika-elektryka",
  "/portfolio",
  "/pro-kompaniyu",
  "/kontakty",
  "/pryvatnist",
];
const widths = process.env.AUDIT_WIDTHS?.split(",").map(Number) || [
  320, 390, 600, 601, 768, 900, 1024, 1440, 1920,
];
const report = {
  base,
  phase,
  pages: [],
  interactions: [],
  accessibility: [],
  failures: [],
  links: [],
};
const links = new Set();
const browser = await chromium.launch({
  headless: true,
  args: ["--disable-gpu", "--renderer-process-limit=1"],
});
const check = (condition, name) => {
  report.interactions.push({ name, passed: !!condition });
  if (!condition) report.failures.push(name);
};
const settleScroll = (page) =>
  page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
  );
const focusReturned = (locator) =>
  locator.evaluate(
    (element) =>
      new Promise((resolve) => {
        const start = performance.now();
        const poll = () => {
          if (document.activeElement === element) resolve(true);
          else if (performance.now() - start > 1500) resolve(false);
          else requestAnimationFrame(poll);
        };
        poll();
      }),
  );
const checkDialogAccessibility = async (page, selector, width) => {
  const result = await new AxeBuilder({ page })
    .include(selector)
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  const violations = result.violations.map((v) => ({
    id: v.id,
    impact: v.impact,
    nodes: v.nodes.map((n) => ({ target: n.target, summary: n.failureSummary })),
  }));
  report.accessibility.push({ width, path: selector, violations });
  if (violations.length) report.failures.push({ width, path: selector, accessibility: violations });
};
try {
  for (const width of widths) {
    const ctx = await browser.newContext({
      viewport: { width, height: 900 },
      reducedMotion: "reduce",
    });
    const page = await ctx.newPage();
    page.setDefaultTimeout(15000);
    page.on("pageerror", (e) => report.failures.push(`JS ${width}: ${e.message}`));
    for (const path of paths) {
      const response = await page.goto(base + path, { waitUntil: "networkidle" });
      await page.evaluate(async () => {
        await document.fonts.ready;
        // Load every lazy image, including offscreen carousel items, before inspecting.
        await Promise.all(
          [...document.images].map((img) => {
            img.loading = "eager";
            return img.decode().catch(() => {});
          }),
        );
      });
      const state = await page.evaluate(() => ({
        title: document.title,
        h1Count: document.querySelectorAll("main h1").length,
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
        overflowing: [...document.querySelectorAll("main *")]
          .filter((e) => {
            const r = e.getBoundingClientRect();
            return r.right > innerWidth + 2 && !e.closest(".work-track");
          })
          .slice(0, 8)
          .map((e) => e.className),
        broken: [...document.images]
          .filter((i) => !i.complete || i.naturalWidth === 0)
          .map((i) => i.src),
        missingAlt: [...document.images].filter((i) => !i.hasAttribute("alt")).map((i) => i.src),
        images: [...document.images].map((i) => ({
          src: i.currentSrc,
          width: i.clientWidth,
          height: i.clientHeight,
          naturalWidth: i.naturalWidth,
        })),
        links: [...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href")),
        emptyButtons: [...document.querySelectorAll("button")].filter(
          (b) => !b.textContent.trim() && !b.getAttribute("aria-label"),
        ).length,
      }));
      state.links.filter((h) => h.startsWith("/")).forEach((h) => links.add(h));
      delete state.links;
      const entry = { width, path, status: response.status(), ...state };
      report.pages.push(entry);
      if (
        entry.status !== 200 ||
        state.overflow ||
        state.broken.length ||
        state.missingAlt.length ||
        state.h1Count !== 1 ||
        state.emptyButtons
      )
        report.failures.push(entry);
      if ([390, 768, 1440].includes(width)) {
        const axe = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze();
        const violations = axe.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          description: v.description,
          nodes: v.nodes.map((n) => ({ target: n.target, summary: n.failureSummary })),
        }));
        report.accessibility.push({ width, path, violations });
        if (violations.length) report.failures.push({ width, path, accessibility: violations });
        {
          const label = path === "/" ? "home" : path.replaceAll("/", "_");
          await page.screenshot({ path: `${out}/${width}-${label}-top.png` });
          for (const selector of path === "/"
            ? [
                ".year-section",
                ".service-index",
                ".selected-work",
                ".process-section",
                ".contact-band",
                ".site-footer",
              ]
            : [".site-footer"]) {
            await page.locator(selector).scrollIntoViewIfNeeded();
            await page.screenshot({ path: `${out}/${width}-${label}-${selector.slice(1)}.png` });
          }
        }
      }
    }
    console.log(`Pages inspected at ${width}px`);
    if ([390, 768, 1440].includes(width) && phase !== "before") {
      await page.goto(base + "/", { waitUntil: "networkidle" });
      const next = page.getByRole("button", { name: "Наступна робота", exact: true });
      for (let i = 0; i < 6 && (await next.isEnabled()); i++) {
        await next.click();
        await page.evaluate(
          () =>
            new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
        );
      }
      check(await next.isDisabled(), `Carousel reaches end ${width}`);
      await page.getByRole("button", { name: "Попередня робота", exact: true }).click();
      await settleScroll(page);
      check(await next.isEnabled(), `Carousel returns ${width}`);
      const track = page.getByRole("group", { name: "Карусель робіт", exact: true });
      await track.focus();
      await page.keyboard.press("ArrowLeft");
      await settleScroll(page);
      check(
        await page.locator(".work-track").evaluate((e) => e.scrollLeft > 0),
        `Carousel keyboard ${width}`,
      );
      for (const button of await page.locator("main .button-primary").all()) {
        await button.click();
        check(
          await page.locator(".consult-panel").isVisible(),
          `CTA ${width} ${await button.textContent()}`,
        );
        await page.keyboard.press("Escape");
        check(await focusReturned(button), `CTA restores focus ${width}`);
      }
      if (width <= 900) {
        await page.getByRole("button", { name: "Відкрити меню" }).click();
        check(await page.locator(".mobile-menu").isVisible(), `Mobile menu ${width}`);
        await checkDialogAccessibility(page, ".mobile-menu", width);
        await page.locator(".menu-consult").click();
        check(
          (await page.getByRole("dialog").count()) === 1,
          `Menu to consultation has one dialog ${width}`,
        );
        await page.keyboard.press("Escape");
        check(
          await focusReturned(page.locator(".menu-toggle")),
          `Menu consultation restores focus ${width}`,
        );
      }
      await page.goto(base + "/kontakty", { waitUntil: "networkidle" });
      await page.locator(".invitation-consult").click();
      await checkDialogAccessibility(page, ".consult-panel", width);
      const submit = page.getByRole("button", { name: "Підготувати звернення", exact: true });
      await submit.click();
      check(
        (await page.locator("[name=name]").getAttribute("aria-invalid")) === "true",
        `Name validation ${width}`,
      );
      check(
        await page.locator("[name=name]").evaluate((e) => e === document.activeElement),
        `Invalid field focus ${width}`,
      );
      await page.getByLabel("Ваше ім’я *").fill("Олена");
      await page.getByLabel("Телефон *").fill("123");
      await submit.click();
      check(
        (await page.locator("[name=phone]").getAttribute("aria-invalid")) === "true",
        `Phone validation ${width}`,
      );
      await page.getByLabel("Телефон *").fill("+380676090075");
      await submit.click();
      check(
        (await page.getByRole("checkbox").getAttribute("aria-invalid")) === "true",
        `Consent validation ${width}`,
      );
      await page.getByRole("checkbox").check();
      await submit.click();
      check(
        await page.getByText("Звернення підготовлено", { exact: true }).isVisible(),
        `Form completion ${width}`,
      );
      check(
        (await page.locator(".email-draft").getAttribute("href")).includes(
          encodeURIComponent("Олена"),
        ),
        `Email draft ${width}`,
      );
      await page.screenshot({ path: `${out}/${width}-form-complete.png` });
      await page.keyboard.press("Escape");
      await page.goto(base + "/portfolio", { waitUntil: "networkidle" });
      const counts = [6, 2, 2, 1, 1];
      const filters = page.locator(".portfolio-filters button");
      for (let i = 0; i < counts.length; i++) {
        await filters.nth(i).click();
        check(
          (await page.locator(".portfolio-project").count()) === counts[i],
          `Portfolio filter ${i} ${width}`,
        );
      }
      await filters.first().click();
      let auditedProject = false;
      for (const card of await page.locator(".portfolio-project").all()) {
        await card.click();
        check(await page.locator(".project-dialog").isVisible(), `Portfolio dialog ${width}`);
        if (!auditedProject) {
          await checkDialogAccessibility(page, ".project-dialog", width);
          auditedProject = true;
        }
        await page.locator(".project-consult").click();
        check(
          (await page.getByRole("dialog").count()) === 1,
          `Project to consultation has one dialog ${width}`,
        );
        check(
          (await page.locator("select[name=service]").inputValue()).length > 0,
          `Project service selection ${width}`,
        );
        await page.keyboard.press("Escape");
        check(await focusReturned(card), `Project consultation restores focus ${width}`);
      }
      const slider = page.getByRole("slider");
      await slider.focus();
      await page.keyboard.press("ArrowRight");
      check((await slider.inputValue()) === "51", `Before/after keyboard ${width}`);
      const axe = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      check(axe.violations.length === 0, `Slider accessibility ${width}`);
      await page.goto(base + "/portfolio?project=armstrong-ofis", { waitUntil: "networkidle" });
      check(await page.getByRole("dialog").isVisible(), `Deep link project ${width}`);
      await page.keyboard.press("Escape");
    }
    await ctx.close();
    fs.writeFileSync(`${out}/report.json`, JSON.stringify(report, null, 2));
  }
  const ctx = await browser.newContext();
  for (const href of links) {
    const response = await ctx.request.get(base + href);
    report.links.push({ href, status: response.status() });
    if (response.status() !== 200)
      report.failures.push(`Broken link ${href}: ${response.status()}`);
  }
  const notFound = await ctx.request.get(base + "/audit-missing-page");
  check(notFound.status() === 404, "Missing page returns 404");
  await ctx.close();
} catch (e) {
  report.failures.push(e.stack);
} finally {
  await browser.close();
  fs.writeFileSync(`${out}/report.json`, JSON.stringify(report, null, 2));
  console.log(
    JSON.stringify(
      {
        pages: report.pages.length,
        interactions: report.interactions.length,
        links: report.links.length,
        failures: report.failures.map((f) =>
          typeof f === "string"
            ? f
            : {
                width: f.width,
                path: f.path,
                overflow: f.overflow,
                broken: f.broken,
                accessibility: f.accessibility?.map((a) => ({
                  id: a.id,
                  targets: a.nodes.map((n) => n.target),
                })),
              },
        ),
      },
      null,
      2,
    ),
  );
}
if (report.failures.length) process.exitCode = 1;
