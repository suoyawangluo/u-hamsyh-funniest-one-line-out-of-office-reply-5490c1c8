// Funniest One-Line Out-of-Office Reply — make.fun entry
// u-hamsyh-funniest-one-line-out-of-office-reply-5490c1c8
//
// The entry is a single out-of-office auto-reply, one line, 1-160 characters.
// It turns on the usual away message: instead of promising a reply on return,
// it forwards the sender to the author's future self — who is also on holiday.
// The laugh lands on the first read, no setup, and it still reads like a real
// away message a person would actually switch on before going away.
//
// Entry (98 code points, 1 line):
//   I am away until Monday. Please direct all urgent emails to my future self, who is also on holiday.

import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The away message is built from two named parts so the turn is visible:
// the absence itself, then the punchline that redirects the sender.
const ABSENCE = "I am away until Monday.";
const REDIRECT =
  "Please direct all urgent emails to my future self, who is also on holiday.";

function buildEntry(): string {
  return `${ABSENCE} ${REDIRECT}`;
}

interface GateReport {
  codePoints: number;
  lines: number;
  sha256: string;
}

function validateEntry(entry: string): GateReport {
  const codePoints = [...entry].length;
  if (codePoints < 1 || codePoints > 160) {
    throw new Error(`gate: ${codePoints} characters, need 1-160`);
  }
  if (!entry.trim()) throw new Error("gate: entry is blank");
  const lines = entry.split("\n").length;
  if (lines !== 1) throw new Error(`gate: entry must be one line, got ${lines}`);
  const sha256 = createHash("sha256").update(entry, "utf8").digest("hex");
  return { codePoints, lines, sha256 };
}

function verifyWritten(outPath: string, expected: GateReport): void {
  const written = readFileSync(outPath, "utf8");
  const actual = createHash("sha256").update(written, "utf8").digest("hex");
  if (actual !== expected.sha256) {
    throw new Error(`read-back mismatch: ${actual} != ${expected.sha256}`);
  }
}

function main(): void {
  const entry = buildEntry();
  const report = validateEntry(entry);
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "entry.txt");
  writeFileSync(outPath, entry, "utf8");
  verifyWritten(outPath, report);
  console.log(
    `gate passes: ${report.codePoints} code points, ${report.lines} line, sha256 ${report.sha256}`,
  );
  console.log(`wrote ${outPath}`);
  console.log(`verified: ${JSON.stringify(entry)}`);
}

main();
