// Pixel-diffs the live webapp against the prototype baseline.
//
// Prereqs:
//   - `npm run dev` running on http://localhost:3000 (or set BASE_URL)
//   - Chromium binary path in CHROMIUM_PATH (auto-detected from
//     ~/.cache/cft/chrome-linux64/chrome if present)
//
// Usage:
//   node scripts/visual-diff.mjs                 # all sections
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

// Each section says which page to load on each side and what selector to
// screenshot. The prototype is one HTML file with multiple `.pg` panes;
// `protoPage` switches which pane is `.on` before screenshotting.
//
// Homepage sections target the prototype's `#p0` (default-on) and the
// webapp's `/`. Services-page sections target `#p1` and `/services`.
const sections = [
  // Homepage
  { name: "full",       protoPage: "p0", baseline: "#p0",       actualPath: "/", actual: "main" },
  { name: "hero",       protoPage: "p0", baseline: "#p0 .hero", actualPath: "/", actual: "main > section", actualNth: 0 },
  { name: "categories", protoPage: "p0", baseline: "#p0 .wu", baselineNth: 0, actualPath: "/", actual: "main > section", actualNth: 1 },
  { name: "services",   protoPage: "p0", baseline: "#p0 .wu", baselineNth: 1, actualPath: "/", actual: "main > section", actualNth: 2 },
  { name: "products",   protoPage: "p0", baseline: "#p0 .wu", baselineNth: 2, actualPath: "/", actual: "main > section", actualNth: 3 },
  { name: "books",      protoPage: "p0", baseline: "#p0 .wu", baselineNth: 3, actualPath: "/", actual: "main > section", actualNth: 4 },
  { name: "humor",      protoPage: "p0", baseline: "#p0 .wu", baselineNth: 4, actualPath: "/", actual: "main > section", actualNth: 5 },
  { name: "vendor",     protoPage: "p0", baseline: "#p0 .wu", baselineNth: 5, actualPath: "/", actual: "main > section", actualNth: 6 },
  // Services page
  { name: "services-page",      protoPage: "p1", baseline: "#p1",         actualPath: "/services?type=doula&distance=15%20mi&minRating=4", actual: "main" },
  { name: "services-header",    protoPage: "p1", baseline: "#p1 .svc-ph-hd", actualPath: "/services?type=doula&distance=15%20mi&minRating=4", actual: "main > section", actualNth: 0 },
  { name: "services-results",   protoPage: "p1", baseline: "#p1 .wu",     actualPath: "/services?type=doula&distance=15%20mi&minRating=4", actual: "main > section", actualNth: 1 },
  // Other prototype pages — full-page diffs only for now; per-section
  // breakdowns can be added when chasing drift on a specific page.
  { name: "product-detail",     protoPage: "p2", baseline: "#p2", actualPath: "/shop/urn-sage-001",         actual: "main" },
  { name: "shop",               protoPage: "p3", baseline: "#p3", actualPath: "/shop",                      actual: "main" },
  { name: "list-with-us",       protoPage: "p4", baseline: "#p4", actualPath: "/list-with-us",              actual: "main" },
  { name: "list-goods",         protoPage: "p5", baseline: "#p5", actualPath: "/list-with-us/goods",        actual: "main" },
  { name: "list-services",      protoPage: "p6", baseline: "#p6", actualPath: "/list-with-us/services",     actual: "main" },
  { name: "plan",               protoPage: "p7", baseline: "#p7", actualPath: "/list-with-us/plan?type=goods", actual: "main" },
  { name: "confirm",            protoPage: "p8", baseline: "#p8", actualPath: "/list-with-us/confirm",      actual: "main" },
  { name: "where-to-start",     protoPage: "p9", baseline: "#p9", actualPath: "/where-to-start",            actual: "main" },
];

async function setProtoPage(page, pageId) {
  // Toggle the prototype's `.pg.on` so we can screenshot any pane (#p0..#p9).
  await page.evaluate((id) => {
    document.querySelectorAll(".pg").forEach((p) => p.classList.remove("on"));
    const target = document.getElementById(id);
    if (target) target.classList.add("on");
    window.scrollTo(0, 0);
  }, pageId);
}

async function snap(page, url, opts, file) {
  await page.goto(url, { waitUntil: "networkidle" });
  // Hide Next.js dev overlay/floater so it doesn't pollute diffs.
  await page.addStyleTag({
    content:
      'nextjs-portal, [data-nextjs-toast], [data-next-badge-root], [data-next-mark-loading] { display: none !important; visibility: hidden !important; }',
  });
  if (opts.protoPage) await setProtoPage(page, opts.protoPage);
  await page.evaluate(() => document.fonts && document.fonts.ready);
  await page.waitForTimeout(400); // settle
  if (opts.selector === "main" || /^#p\d+$/.test(opts.selector)) {
    await page.screenshot({ path: file, fullPage: true });
    return;
  }
  const handle = page.locator(opts.selector).nth(opts.nth ?? 0);
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

  for (const s of list) {
    const baselineFile = path.join(OUT_DIR, `${s.name}.baseline.png`);
    const actualFile = path.join(OUT_DIR, `${s.name}.actual.png`);
    try {
      await snap(
        page,
        `${BASE_URL}/__prototype__/index.html`,
        { selector: s.baseline, nth: s.baselineNth, protoPage: s.protoPage },
        baselineFile
      );
      await snap(
        page,
        `${BASE_URL}${s.actualPath ?? "/"}`,
        { selector: s.actual, nth: s.actualNth },
        actualFile
      );
      const r = await diff(s.name);
      console.log(
        `${s.name.padEnd(18)} ${r.w}x${r.h}  ${String(r.mismatch).padStart(8)} px  ${r.pct.padStart(5)}%`
      );
    } catch (e) {
      console.log(`${s.name.padEnd(18)} ERROR: ${e.message}`);
    }
  }

  await browser.close();
  console.log(`\noutput in ${OUT_DIR}/`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
