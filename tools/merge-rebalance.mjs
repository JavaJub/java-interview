// Merges length-rebalanced distractors back into the answer bank, overwriting
// ONLY the distractors for affected questions (prompt/correct/explanation kept).
// Usage: node tools/merge-rebalance.mjs <workflow-output.json>
import fs from "node:fs";
import path from "node:path";

const outputPath = process.argv[2];
if (!outputPath) {
  console.error("Usage: node tools/merge-rebalance.mjs <workflow-output.json>");
  process.exit(1);
}

const root = process.cwd();
const dir = path.join(root, "tools/_rebalance");
const bankPath = path.join(root, "tools/quiz-answers.json");

const payload = JSON.parse(fs.readFileSync(outputPath, "utf8"));
const batches = payload?.result?.batches || payload?.batches || [];
const bank = JSON.parse(fs.readFileSync(bankPath, "utf8"));

let updated = 0;
let skipped = 0;
for (const batch of batches) {
  if (!batch || !Array.isArray(batch.answers)) continue;
  const batchFile = path.join(dir, `batch-${String(batch.batchIndex).padStart(3, "0")}.json`);
  if (!fs.existsSync(batchFile)) continue;
  const questions = JSON.parse(fs.readFileSync(batchFile, "utf8"));
  const byN = new Map(questions.map((q) => [q.n, q]));
  for (const ans of batch.answers) {
    const q = byN.get(ans.n);
    if (!q || !bank[q.key]) continue;
    const distractors = (ans.distractors || []).map((d) => String(d).trim()).filter(Boolean);
    if (distractors.length !== 3) {
      skipped += 1;
      continue;
    }
    bank[q.key].distractors = distractors;
    updated += 1;
  }
}

fs.writeFileSync(bankPath, `${JSON.stringify(bank, null, 2)}\n`);

// Report remaining length skew across the whole bank.
let allLonger = 0;
let allShorter = 0;
for (const key of Object.keys(bank)) {
  const cl = bank[key].correct.length;
  const dl = bank[key].distractors.map((d) => d.length);
  if (dl.every((l) => l > cl)) allLonger += 1;
  else if (dl.every((l) => l < cl)) allShorter += 1;
}
console.log(`Updated distractors for ${updated} questions, skipped ${skipped}.`);
console.log(`Remaining skew — correct shortest: ${allLonger}, correct longest: ${allShorter} (of ${Object.keys(bank).length}).`);
