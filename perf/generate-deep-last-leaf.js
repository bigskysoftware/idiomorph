// Generates the worst case for skipUnchanged: every section differs, but only
// in its last, deepest text node, so every ancestor's isEqualNode walks its
// whole subtree before failing. Deterministic; re-run to regenerate.
import fs from "node:fs";

const SECTIONS = 20;
const DEPTH = 10;
const FILLERS_PER_LEVEL = 2;

function level(section, depth, changed) {
  const fillers = Array.from(
    { length: FILLERS_PER_LEVEL },
    (_, i) => `<p class="filler">s${section}d${depth}i${i}</p>`,
  ).join("");
  if (depth === DEPTH) {
    const leaf = changed ? "changed" : "original";
    return `<div class="level-${depth}">${fillers}<span class="leaf">${leaf}</span></div>`;
  }
  return `<div class="level-${depth}">${fillers}${level(section, depth + 1, changed)}</div>`;
}

function document(changed) {
  const sections = Array.from(
    { length: SECTIONS },
    (_, i) => `<section id="section-${i}">${level(i, 1, changed)}</section>`,
  ).join("\n");
  return `<main id="root">\n${sections}\n</main>\n`;
}

const dir = new URL("benchmarks/", import.meta.url);
fs.writeFileSync(new URL("deep-last-leaf.old.html", dir), document(false));
fs.writeFileSync(new URL("deep-last-leaf.new.html", dir), document(true));
