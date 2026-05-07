// End-to-end smoke test for the CodaCo webapp.
//
// Boots Playwright, hits the landing page and /smoke-test, and verifies
// that the design system is wired up: page renders, key copy is present,
// brand fonts are loaded, terracotta token resolves, no console errors.
//
// Prereqs:
//   - `npm run dev` running on http://localhost:3000 (or set BASE_URL)
//   - Chromium binary path in CHROMIUM_PATH (auto-detected from
//     ~/.cache/cft/chrome-linux64/chrome if present)
//
// Usage:
//   npm run smoke
//
// Exits 0 on PASS, 1 on FAIL. Prints a per-check summary.

import { chromium } from "playwright";
import path from "node:path";
import fs from "node:fs";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const VIEWPORT = { width: 1440, height: 900 };

const DEFAULT_CHROME = path.join(
  process.env.HOME || "/home/user",
  ".cache/cft/chrome-linux64/chrome",
);
const executablePath = process.env.CHROMIUM_PATH || DEFAULT_CHROME;

const TERRACOTTA = "rgb(193, 99, 79)"; // --color-tr

const checks = [];
function record(name, ok, detail = "") {
  checks.push({ name, ok, detail });
  const tag = ok ? "\x1b[32m✓\x1b[0m" : "\x1b[31m✗\x1b[0m";
  const tail = detail ? `  \x1b[2m${detail}\x1b[0m` : "";
  console.log(`  ${tag} ${name}${tail}`);
}

async function gotoQuiet(page, url) {
  await page.goto(url, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts && document.fonts.ready);
}

async function checkLanding(page) {
  console.log("\n\x1b[1mLanding page (/)\x1b[0m");
  const consoleErrors = [];
  page.on("pageerror", (e) => consoleErrors.push(e.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });

  await gotoQuiet(page, `${BASE_URL}/`);

  const title = await page.title();
  record("page title mentions CodaCo", /CodaCo/i.test(title), title);

  const eyebrow = await page.locator("text=Welcome").first();
  record("hero eyebrow 'Welcome' renders", await eyebrow.count() > 0);

  const h1 = page.locator("h1").first();
  const h1Text = (await h1.textContent())?.trim() ?? "";
  record(
    "hero H1 carries the prototype copy",
    /Death is a part of life/i.test(h1Text),
    h1Text.replace(/\s+/g, " "),
  );

  const h1FontFamily = await h1.evaluate(
    (el) => getComputedStyle(el).fontFamily,
  );
  record(
    "hero H1 uses Crimson Pro (serif)",
    /Crimson Pro/i.test(h1FontFamily),
    h1FontFamily,
  );

  const trSpanColor = await page
    .locator("h1 span")
    .first()
    .evaluate((el) => getComputedStyle(el).color);
  record(
    "terracotta accent resolves to --color-tr",
    trSpanColor === TERRACOTTA,
    trSpanColor,
  );

  const bodyFont = await page
    .locator("body")
    .evaluate((el) => getComputedStyle(el).fontFamily);
  record(
    "body uses Nunito Sans",
    /Nunito Sans/i.test(bodyFont),
    bodyFont,
  );

  record("no console errors on landing", consoleErrors.length === 0,
    consoleErrors.slice(0, 3).join(" | "));
}

async function checkSmokePage(page) {
  console.log("\n\x1b[1mSmoke-test page (/smoke-test)\x1b[0m");
  const consoleErrors = [];
  page.removeAllListeners("pageerror");
  page.removeAllListeners("console");
  page.on("pageerror", (e) => consoleErrors.push(e.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });

  await gotoQuiet(page, `${BASE_URL}/smoke-test`);

  const root = page.locator('[data-testid="smoke-test-page"]');
  record("smoke-test root renders", (await root.count()) === 1);

  const sections = ["smoke-palette", "smoke-typography", "smoke-primitives"];
  for (const id of sections) {
    const count = await page.locator(`[data-testid="${id}"]`).count();
    record(`section '${id}' renders`, count === 1);
  }

  const h1Text = (await page.locator("h1").first().textContent())?.trim() ?? "";
  record(
    "hero H1 reads 'All systems quiet.'",
    /All systems quiet/i.test(h1Text),
    h1Text.replace(/\s+/g, " "),
  );

  const primaryBtn = page.locator("button.btn-primary").first();
  const btnBg = await primaryBtn.evaluate(
    (el) => getComputedStyle(el).backgroundColor,
  );
  record(
    "primary button background is terracotta",
    btnBg === TERRACOTTA,
    btnBg,
  );

  const swatchCount = await page
    .locator('[data-testid="smoke-palette"] .grid-auto-178 > div')
    .count();
  record("palette has 12 swatches", swatchCount === 12, `${swatchCount} found`);

  record("no console errors on smoke-test", consoleErrors.length === 0,
    consoleErrors.slice(0, 3).join(" | "));
}

async function main() {
  if (!fs.existsSync(executablePath)) {
    console.error(`Chromium binary not found at ${executablePath}`);
    console.error(`Set CHROMIUM_PATH or download Chrome for Testing first.`);
    process.exit(1);
  }

  console.log(`base URL: ${BASE_URL}`);
  console.log(`viewport: ${VIEWPORT.width}x${VIEWPORT.height}`);

  const browser = await chromium.launch({ executablePath, headless: true });
  const ctx = await browser.newContext({ viewport: VIEWPORT });
  const page = await ctx.newPage();

  try {
    await checkLanding(page);
    await checkSmokePage(page);
  } finally {
    await browser.close();
  }

  const failed = checks.filter((c) => !c.ok);
  console.log(
    `\n${failed.length === 0 ? "\x1b[32m✓ PASS\x1b[0m" : "\x1b[31m✗ FAIL\x1b[0m"}  ${checks.length - failed.length}/${checks.length} checks passed`,
  );
  process.exit(failed.length === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
