// Dumps the unique auto-extracted quiz questions so per-question answer options
// (distractors + explanation) can be authored once and stored in tools/quiz-answers.json.
// Key = stable hash of the normalized prompt (same key build-quizzes.mjs looks up).
import fs from "node:fs";
import path from "node:path";
import { extractCandidates, normalizeQuestion } from "./build-quizzes.mjs";

const items = extractCandidates();
const out = items.map((item) => ({
  key: normalizeQuestion(item.rawPrompt),
  prompt: item.prompt,
  correct: item.correctAnswer,
  type: item.type,
  level: item.level,
  topics: item.topics,
  companies: item.companies,
}));

// Stable order for reproducible batching.
out.sort((a, b) => a.key.localeCompare(b.key));

const target = path.join(process.cwd(), "tools/_questions-to-generate.json");
fs.writeFileSync(target, `${JSON.stringify(out, null, 2)}\n`);
console.log(`Dumped ${out.length} unique questions to ${target}`);
