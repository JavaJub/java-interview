// Merges the generation-workflow result into the persistent answer bank.
// Usage: node tools/merge-answers.mjs <workflow-output.json>
import fs from "node:fs";
import path from "node:path";

const outputPath = process.argv[2];
if (!outputPath) {
  console.error("Usage: node tools/merge-answers.mjs <workflow-output.json>");
  process.exit(1);
}

const root = process.cwd();
const genDir = path.join(root, "tools/_gen");
const bankPath = path.join(root, "tools/quiz-answers.json");

const payload = JSON.parse(fs.readFileSync(outputPath, "utf8"));
const batches = payload?.result?.batches || payload?.batches || [];

// Start from any existing bank so partial re-runs accumulate.
const bank = fs.existsSync(bankPath) ? JSON.parse(fs.readFileSync(bankPath, "utf8")) : {};

let added = 0;
let skippedBad = 0;
for (const batch of batches) {
  if (!batch || !Array.isArray(batch.answers)) continue;
  const batchFile = path.join(genDir, `batch-${String(batch.batchIndex).padStart(3, "0")}.json`);
  if (!fs.existsSync(batchFile)) continue;
  const questions = JSON.parse(fs.readFileSync(batchFile, "utf8"));
  const byN = new Map(questions.map((q) => [q.n, q]));
  for (const ans of batch.answers) {
    const q = byN.get(ans.n);
    if (!q) continue;
    const distractors = (ans.distractors || []).map((d) => String(d).trim()).filter(Boolean);
    if (distractors.length !== 3 || !ans.explanation) {
      skippedBad += 1;
      continue;
    }
    bank[q.key] = {
      prompt: q.prompt,
      correct: q.correct,
      distractors,
      explanation: String(ans.explanation).trim(),
    };
    added += 1;
  }
}

fs.writeFileSync(bankPath, `${JSON.stringify(bank, null, 2)}\n`);

// Coverage report against the full question list.
const questionsList = JSON.parse(fs.readFileSync(path.join(root, "tools/_questions-to-generate.json"), "utf8"));
const missing = questionsList.filter((q) => !bank[q.key]);
console.log(`Bank entries: ${Object.keys(bank).length}`);
console.log(`Added/updated this run: ${added}, skipped malformed: ${skippedBad}`);
console.log(`Coverage: ${questionsList.length - missing.length}/${questionsList.length}`);
if (missing.length) {
  fs.writeFileSync(path.join(root, "tools/_missing-keys.json"), `${JSON.stringify(missing.map((q) => q.key), null, 2)}\n`);
  console.log(`Missing ${missing.length} keys -> tools/_missing-keys.json`);
}
