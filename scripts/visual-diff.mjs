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

// Sections defined by an anchor selector + optional index inside each
// frame. Prototype (#p0) is a .hero block followed by alternating .wd/.wu
// pairs; actual page is <WaveDivider/> + <section> pairs inside <main>.
// We anchor on the content-bearing wrapper in each so screenshots cover
// equivalent regions. nth is 0-based.
const sections = [
  { name: "full",       baseline: "#p0",       actual: "main" },
  { name: "hero",       baseline: "#p0 .hero", actual: "main > section", actualNth: 0 },
  { name: "categories", baseline: "#p0 .wu", baselineNth: 0, actual: "main > section", actualNth: 1 },
  { name: "services",   baseline: "#p0 .wu", baselineNth: 1, actual: "main > section", actualNth: 2 },
  { name: "products",   baseline: "#p0 .wu", baselineNth: 2, actual: "main > section", actualNth: 3 },
  { name: "books",      baseline: "#p0 .wu", baselineNth: 3, actual: "main > section", actualNth: 4 },
  { name: "humor",      baseline: "#p0 .wu", baselineNth: 4, actual: "main > section", actualNth: 5 },
  { name: "vendor",     baseline: "#p0 .wu", baselineNth: 5, actual: "main > section", actualNth: 6 },
];

async function snap(page, url, selector, nth, file) {
  await page.goto(url, { waitUntil: "networkidle" });
  // Hide Next.js dev overlay/floater so it doesn't pollute diffs.
  await page.addStyleTag({
    content:
      'nextjs-portal, [data-nextjs-toast], [data-next-badge-root], [data-next-mark-loading] { display: none !important; visibility: hidden !important; }',
  });
  await page.evaluate(() => document.fonts && document.fonts.ready);
  await page.waitForTimeout(400); // settle
  if (selector === "main" || selector === "#p0") {
    await page.screenshot({ path: file, fullPage: true });
    return;
  }
  const handle = page.locator(selector).nth(nth ?? 0);
  await handle.scrollIntoViewIfNeeded();
  await page.waitForTimeout(150);
  await handle.screenshot({ path: file });
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
      await snap(page, `${BASE_URL}/__prototype__/index.html`, s.baseline, s.baselineNth, baselineFile);
      await snap(page, `${BASE_URL}/`, s.actual, s.actualNth, actualFile);
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
