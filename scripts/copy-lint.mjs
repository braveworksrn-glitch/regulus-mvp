#!/usr/bin/env node
// Copy lint (spec §1.4): the words invest/return/flip/appreciate must never
// appear in game-facing copy. Run in CI: `node scripts/copy-lint.mjs`.
// Scans src/app/(game), src/components/game, and src/lib/game.ts.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const BANNED = /\b(invest(?:ment|or|ing)?|returns?|flip(?:ping|ped)?|appreciat\w*)\b/i;

// Only user-facing text counts: string literals and JSX text — never code keywords.
function copySegments(line) {
  const segs = [];
  const strings = line.match(/"([^"\\]|\\.)*"|'([^'\\]|\\.)*'|`([^`\\]|\\.)*`/g);
  if (strings) segs.push(...strings);
  const jsxText = line.match(/>([^<>{}]+)</g);
  if (jsxText) segs.push(...jsxText.map((s) => s.slice(1, -1)));
  return segs;
}

const TARGETS = ["src/app/(game)", "src/components/game", "src/lib/game.ts"];

let failures = 0;

function scan(path) {
  const st = statSync(path);
  if (st.isDirectory()) {
    for (const f of readdirSync(path)) scan(join(path, f));
    return;
  }
  if (!/\.(tsx?|jsx?|md)$/.test(path)) return;
  const lines = readFileSync(path, "utf8").split("\n");
  lines.forEach((line, i) => {
    if (copySegments(line).some((seg) => BANNED.test(seg))) {
      failures++;
      console.error(`${path}:${i + 1}: banned copy word: ${line.trim()}`);
    }
  });
}

for (const t of TARGETS) {
  try {
    scan(t);
  } catch {
    /* target may not exist yet */
  }
}

if (failures) {
  console.error(`\ncopy-lint: ${failures} violation(s). The words invest/return/flip/appreciate are banned from game copy.`);
  process.exit(1);
}
console.log("copy-lint: clean");
