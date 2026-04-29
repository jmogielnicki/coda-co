// Pixel-diffs the live homepage against the prototype baseline.
//
// Prereqs:
//   - `npm run dev` running on http://localhost:3000 (or set BASE_URL)
//   - Chromium binary path in CHROMIUM_PATH (auto-detected from
//     ~/.cache/cft/chrome-linux64/chrome if present)
//
// Usage:
//   node scripts/visual-diff.mjs                 # full page + per-section
//   node scripts/visual-diff.mjs hero            # just the named section
//
// Output: writes baseline.png / actual.png / diff.png per section to
// ./diff/, prints a mismatched-pixel percentage per section.

import { chromium } from "playwright";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import fs from "node:fs";
import path from "node:path";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const VIEWPORT = { width: 1440, height: 2400 };
const OUT_DIR = path.resolve("diff");

const DEFAULT_CHROME = path.join(
  process.env.HOME || "/home/user",
  ".cache/cft/chrome-linux64/chrome"
);
const executablePath = process.env.CHROMIUM_PATH || DEFAULT_CHROME;

// Sections defined by an anchor selector inside each frame. We screenshot
// the bounding rect of each selector. The matching baseline selector lives
// in the prototype's nested `.pg#p0` page-0 wrapper.
const sections = [
  { name: "full",       baseline: "#p0",                 actual: "main, body" },
  { name: "hero",       baseline: "#p0 .hero",           actual: "section:nth-of-type(1)" },
  { name: "categories", baseline: "#p0 .cat-g",          actual: "section:nth-of-type(2)" },
  { name: "services",   baseline: "#p0 .sv-g",           actual: "section:nth-of-type(3)" },
  { name: "products",   baseline: "#p0 .pr-g",           actual: "section:nth-of-type(4)" },
  { name: "books",      baseline: "#p0 .bk-g",           actual: "section:nth-of-type(5)" },
  { name: "humor",      baseline: "#p0 .hm-g",           actual: "section:nth-of-type(6)" },
  { name: "vendor",     baseline: "#p0 .vd-steps",       actual: "section:nth-of-type(7)" },
];

async function snap(page, url, selector, file) {
  await page.goto(url, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts && document.fonts.ready);
  await page.waitForTimeout(400); // settle
  if (selector === "main, body" || selector === "#p0") {
    await page.screenshot({ path: file, fullPage: true });
    return;
  }
  const handle = await page.locator(selector).first();
  await handle.scrollIntoViewIfNeeded();
  await page.waitForTimeout(150);
  // Screenshot the section in the surrounding section element so wave
  // dividers/backgrounds are included.
  const target = handle;
  await target.screenshot({ path: file });
}

function pad(img, w, h) {
  if (img.width === w && img.height === h) return img;
  const out = new PNG({ width: w, height: h });
  out.data.fill(255);
  PNG.bitblt(img, out, 0, 0, Math.min(img.width, w), Math.min(img.height, h), 0, 0);
  return out;
}

async function diff(name) {
  const baselinePath = path.join(OUT_DIR, `${name}.baseline.png`);
  const actualPath = path.join(OUT_DIR, `${name}.actual.png`);
  const diffPath = path.join(OUT_DIR, `${name}.diff.png`);

  const a = PNG.sync.read(fs.readFileSync(baselinePath));
  const b = PNG.sync.read(fs.readFileSync(actualPath));
  const w = Math.max(a.width, b.width);
  const h = Math.max(a.height, b.height);
  const ap = pad(a, w, h);
  const bp = pad(b, w, h);
  const out = new PNG({ width: w, height: h });
  const mismatch = pixelmatch(ap.data, bp.data, out.data, w, h, {
    threshold: 0.1,
    includeAA: false,
    diffColor: [255, 0, 0],
  });
  fs.writeFileSync(diffPath, PNG.sync.write(out));
  const total = w * h;
  const pct = ((mismatch / total) * 100).toFixed(2);
  return { mismatch, total, pct, w, h };
}

async function main() {
  const only = process.argv[2];
  const list = only ? sections.filter((s) => s.name === only) : sections;
  if (!list.length) {
    console.error(`Unknown section "${only}". Available: ${sections.map((s) => s.name).join(", ")}`);
    process.exit(1);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });

  if (!fs.existsSync(executablePath)) {
    console.error(`Chromium binary not found at ${executablePath}`);
    console.error(`Set CHROMIUM_PATH or download Chrome for Testing first.`);
    process.exit(1);
  }

  const browser = await chromium.launch({ executablePath, headless: true });
  const ctx = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 1 });
  const page = await ctx.newPage();

  console.log(`viewport: ${VIEWPORT.width}x${VIEWPORT.height}`);
  console.log(`base URL: ${BASE_URL}\n`);

  const results = [];
  for (const s of list) {
    const baselineFile = path.join(OUT_DIR, `${s.name}.baseline.png`);
    const actualFile = path.join(OUT_DIR, `${s.name}.actual.png`);
    try {
      await snap(page, `${BASE_URL}/__prototype__/index.html`, s.baseline, baselineFile);
      await snap(page, `${BASE_URL}/`, s.actual, actualFile);
      const r = await diff(s.name);
      results.push({ name: s.name, ...r });
      console.log(
        `${s.name.padEnd(11)} ${r.w}x${r.h}  ${String(r.mismatch).padStart(8)} px  ${r.pct.padStart(5)}%`
      );
    } catch (e) {
      console.log(`${s.name.padEnd(11)} ERROR: ${e.message}`);
    }
  }

  await browser.close();
  console.log(`\noutput in ${OUT_DIR}/`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
