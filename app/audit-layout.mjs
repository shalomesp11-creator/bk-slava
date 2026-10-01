import { chromium } from "playwright";
import fs from "node:fs";
const base = process.env.SITE_TEST_URL || "http://127.0.0.1:8080";
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
  "/audit-missing-page",
];
const phase = process.env.LAYOUT_PHASE || "after";
const report = { phase, pages: [], failures: [] };
const browser = await chromium.launch({
  headless: true,
  args: ["--disable-gpu", "--renderer-process-limit=1"],
});
try {
  for (const viewport of [
    { width: 320, height: 568 },
    { width: 360, height: 640 },
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 844, height: 390 },
    { width: 1440, height: 900 },
  ]) {
    const ctx = await browser.newContext({ viewport, reducedMotion: "reduce" });
    await ctx.addInitScript(() => {
      window.__auditShifts = [];
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries())
          if (!entry.hadRecentInput)
            window.__auditShifts.push({
              value: entry.value,
              startTime: entry.startTime,
              sources: entry.sources.map((s) => ({
                node: s.node?.tagName + "." + s.node?.className,
                previous: s.previousRect.toJSON(),
                current: s.currentRect.toJSON(),
              })),
            });
      }).observe({ type: "layout-shift", buffered: true });
    });
    const page = await ctx.newPage();
    page.on("pageerror", (e) => report.failures.push(e.message));
    // Exercise cold loads and slower font/image arrival, without user input.
    await page.route("**/fonts/*.woff2", async (route) => {
      await new Promise((r) => setTimeout(r, 1000));
      await route.continue();
    });
    await page.route("**/assets/*.{webp,png}", async (route) => {
      await new Promise((r) => setTimeout(r, 400));
      await route.continue();
    });
    for (const path of paths) {
      const response = await page.goto(base + path, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      await page.evaluate(
        () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
      );
      const data = await page.evaluate(() => {
        const selector = (e) =>
          e.tagName.toLowerCase() +
          (e.className ? "." + String(e.className).trim().replaceAll(" ", ".") : "");
        const shown = (e) =>
          e.getClientRects().length &&
          !e.closest(".sr-only") &&
          getComputedStyle(e).visibility !== "hidden";
        const outside = [...document.querySelectorAll("header *,main *,footer *")]
          .filter((e) => {
            if (!shown(e) || e.closest(".work-track")) return false;
            const rect = e.getBoundingClientRect();
            return rect.left < -1 || rect.right > innerWidth + 1;
          })
          .map((e) => ({ selector: selector(e), text: e.textContent.trim().slice(0, 70) }));
        const small = [
          ...document.querySelectorAll(
            "p,a,button,small,label,.eyebrow,.hero-kicker,.hero-caption",
          ),
        ]
          .filter(shown)
          .filter((e) => parseFloat(getComputedStyle(e).fontSize) < 12)
          .map((e) => ({
            selector: selector(e),
            text: e.textContent.trim().slice(0, 70),
            size: getComputedStyle(e).fontSize,
          }));
        const controls = [...document.querySelectorAll("button,a")]
          .filter(shown)
          .map((e) => ({
            text: (e.textContent || e.getAttribute("aria-label")).trim(),
            color: getComputedStyle(e).color,
            background: getComputedStyle(e).backgroundColor,
            border: getComputedStyle(e).border,
            radius: getComputedStyle(e).borderRadius,
          }));
        const debug = [...document.querySelectorAll("button,a,[role=button]")]
          .filter(shown)
          .filter((e) =>
            /\b(debug|test|demo|generate|upload|inspector|higgsfield)\b/i.test(
              e.textContent + " " + e.getAttribute("aria-label"),
            ),
          )
          .map((e) => e.outerHTML);
        let cls = 0,
          score = 0,
          first = 0,
          previous = 0;
        for (const shift of window.__auditShifts) {
          if (shift.startTime - previous > 1000 || shift.startTime - first > 5000) {
            score = shift.value;
            first = shift.startTime;
          } else score += shift.value;
          previous = shift.startTime;
          cls = Math.max(cls, score);
        }
        return {
          cls,
          shifts: window.__auditShifts,
          overflow: document.documentElement.scrollWidth > innerWidth + 1,
          outside,
          small,
          controls,
          debug,
        };
      });
      const entry = { viewport, path, status: response.status(), ...data };
      report.pages.push(entry);
      if (
        data.overflow ||
        data.outside.length ||
        data.debug.length ||
        data.cls > 0.1 ||
        response.status() !== (path === "/audit-missing-page" ? 404 : 200)
      )
        report.failures.push(entry);
    }
    console.log(`Layout inspected ${viewport.width}x${viewport.height}`);
    await ctx.close();
  }
} catch (e) {
  report.failures.push(e.stack);
} finally {
  await browser.close();
}
const out = `../refs/audit-${phase}`;
if (!fs.existsSync(out)) fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(out + "/layout-report.json", JSON.stringify(report, null, 2));
console.log(
  JSON.stringify(
    {
      pages: report.pages.length,
      maxCLS: Math.max(...report.pages.map((p) => p.cls)),
      failures: report.failures.map((f) =>
        typeof f === "string"
          ? f
          : { viewport: f.viewport, path: f.path, cls: f.cls, outside: f.outside, debug: f.debug },
      ),
    },
    null,
    2,
  ),
);
if (report.failures.length) process.exitCode = 1;
