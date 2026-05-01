// Scans the codebase for patterns banned by AGENTS.md "Reuse conventions".
// Friendly, plain-English output. Exits 0 when clean, 1 when issues found.
//
// Usage:
//   npm run check-drift
//
// What this catches: copy-pasted styling that should come from a shared
// primitive instead. Each finding tells you what was found, what to use
// instead, and why it matters in one sentence.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const SCAN_DIRS = ["app", "components"];

// Files where a known pattern is intentionally allowed. Add entries
// sparingly. The key format is "<relative path>::<rule id>".
const ALLOWLIST = new Set([
  // Footer bundles padding + grid into the same wrapper. Splitting it
  // just to use <Container> would make the markup busier, not cleaner.
  "components/layout/Footer.tsx::max-w",
  // ProductTabs's max-w-[680px] is inside a tab body, not a page wrapper.
  "components/pdp/ProductTabs.tsx::max-w",
  // /shop's "The marketplace" page-H1 section keeps its inline markup
  // because it's a page heading, not a section header (different
  // semantics and spacing from <SectionHeader>).
  "app/shop/page.tsx::section-header",
]);

// Each rule:
//   id     — short stable id, also used in the allowlist key
//   match  — function(text) → array of { line, snippet } findings
//   found  — short label of what was matched
//   use    — the primitive or token to use instead
//   why    — one-sentence non-jargon explanation
const RULES = [
  {
    id: "max-w",
    found: "max-w-[680px] / max-w-[880px] / max-w-[900px]",
    use: '<Container width="narrow|mid|wide"> from components/ui/Container.tsx',
    why: "Page widths come from one place so the design can be tuned globally.",
    match: lineRegex(/max-w-\[(680|880|900)px\]/),
  },
  {
    id: "rgba-line",
    found: "border-[rgba(44,40,37,.08|.12|.20)] or bg-[rgba(44,40,37,.08)]",
    use: "border-line / border-line-strong / border-line-bold (from app/globals.css)",
    why: "Hairline border colors come from the design tokens so they all change together.",
    match: lineRegex(/(border|bg)-\[rgba\(44,\s*40,\s*37,\s*\.?(0?8|12|20)\)\]/),
  },
  {
    id: "grid-auto",
    found: "grid-cols-[repeat(auto-fit/fill,minmax(130|178|200px,1fr))]",
    use: ".grid-auto-130 / .grid-auto-178 / .grid-auto-200",
    why: "Repeated grid templates are extracted to one class so spacing stays consistent.",
    match: lineRegex(
      /grid-cols-\[repeat\(auto-(fit|fill),\s*minmax\((130|178|200)px,\s*1fr\)\)\]/,
    ),
  },
  {
    id: "stars-inline",
    found: "inline ★/☆ characters (hand-rolled rating display)",
    use: "<Stars rating={n} reviewCount={n}> from components/ui/Stars.tsx",
    why: "All ratings render through one component so they look the same everywhere.",
    match: lineRegex(/[★☆][★☆]/),
  },
  {
    id: "url-search-params",
    found: "new URLSearchParams(...) inside a filter component",
    use: "useFilterParams() from lib/hooks/useFilterParams.ts",
    why: "Filter URL handling lives in one hook so adding a new filter doesn't repeat the wiring.",
    match: lineRegex(/new URLSearchParams\(/),
  },
  {
    id: "avatar-inline",
    found: "inline avatar circle (rounded-full + bg-sg-p + border-sg-l + font-serif)",
    use: '<Avatar initials="…" size="sm|md|lg"> from components/ui/Avatar.tsx',
    why: "Avatar circles share one component so size and tone stay consistent.",
    match: lineRegex(
      /rounded-full[^"'`]*bg-(sg|tr)-p[^"'`]*border-(sg|tr)-l[^"'`]*font-serif/,
    ),
  },
  {
    id: "section-header",
    found: "centered eyebrow + serif H2 + subtitle markup",
    use: "<SectionHeader eyebrow=… title=… subtitle=…> from components/ui/SectionHeader.tsx",
    why: "Section headers all share one component so the typography stays in sync.",
    match: (text) => {
      // Multi-line heuristic: file contains both the eyebrow class pattern
      // and the canonical 32px serif H2 class pattern.
      const hasEyebrow =
        /text-\[11px\][^"'`]*tracking-\[\.14em\][^"'`]*uppercase/.test(text);
      const hasTitle =
        /font-serif[^"'`]*text-\[32px\][^"'`]*font-light[^"'`]*text-ch/.test(
          text,
        );
      return hasEyebrow && hasTitle ? [{ line: 0, snippet: "" }] : [];
    },
  },
];

function lineRegex(re) {
  return (text) => {
    const out = [];
    const lines = text.split("\n");
    for (let i = 0; i < lines.length; i++) {
      if (re.test(lines[i])) out.push({ line: i + 1, snippet: lines[i].trim() });
    }
    return out;
  };
}

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const s = statSync(full);
    if (s.isDirectory()) yield* walk(full);
    else if (s.isFile() && /\.tsx?$/.test(entry)) yield full;
  }
}

function checkFile(absPath) {
  const rel = relative(ROOT, absPath);
  const text = readFileSync(absPath, "utf8");
  const findings = [];
  for (const rule of RULES) {
    if (ALLOWLIST.has(`${rel}::${rule.id}`)) continue;
    for (const hit of rule.match(text)) {
      findings.push({ rule, ...hit });
    }
  }
  return findings;
}

const RED = "\x1b[31m";
const YEL = "\x1b[33m";
const GRN = "\x1b[32m";
const DIM = "\x1b[2m";
const BOLD = "\x1b[1m";
const RESET = "\x1b[0m";

const allFiles = [];
for (const dir of SCAN_DIRS) {
  for (const f of walk(join(ROOT, dir))) allFiles.push(f);
}

const byFile = new Map();
for (const file of allFiles) {
  const findings = checkFile(file);
  if (findings.length) byFile.set(relative(ROOT, file), findings);
}

const totalIssues = [...byFile.values()].reduce((n, fs) => n + fs.length, 0);

if (totalIssues === 0) {
  console.log(
    `${GRN}✓${RESET} Drift check passed — no banned patterns found.`,
  );
  console.log(
    `  ${DIM}Scanned ${allFiles.length} files across ${SCAN_DIRS.join(", ")}/.${RESET}`,
  );
  process.exit(0);
}

console.log(
  `${RED}✗${RESET} Drift check failed — ${totalIssues} ${totalIssues === 1 ? "issue" : "issues"} found in ${byFile.size} ${byFile.size === 1 ? "file" : "files"}.\n`,
);

for (const [file, findings] of byFile) {
  console.log(`${BOLD}${file}${RESET}`);
  for (const f of findings) {
    if (f.line > 0) {
      console.log(`  ${YEL}line ${f.line}${RESET}  ${f.snippet}`);
    }
    console.log(`  ${DIM}Found:${RESET}    ${f.rule.found}`);
    console.log(`  ${DIM}Use:${RESET}      ${f.rule.use}`);
    console.log(`  ${DIM}Why:${RESET}      ${f.rule.why}`);
    console.log("");
  }
}

console.log(
  `${DIM}For the full list of rules, see AGENTS.md → "Reuse conventions".${RESET}`,
);
console.log(
  `${DIM}If a finding is intentional, add the file to ALLOWLIST in scripts/check-drift.mjs with a comment.${RESET}`,
);
process.exit(1);
