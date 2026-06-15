import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const quizDir = path.join(root, "docs/assets/quizzes");
const forbidden = [
  /вс[её]\s+вышеперечислен/i,
  /ничего\s+из\s+перечислен/i,
  /оба\s+варианта\s+верны/i,
  /зависит\s+от\s+настроения/i,
  // Шаблонные "палевные" хвосты-приписки старого генератора дистракторов.
  /на собеседовании это звучит правдоподобно/i,
  /такой вариант часто говорят на собеседовании/i,
  /звучит правдоподобно, но не объясняет/i,
  /это типичный неверный ответ/i,
];

const DISTRACTOR_REUSE_CAP = 8;

function normalizeText(value) {
  return String(value).toLowerCase().replace(/ё/g, "е").replace(/\s+/g, " ").trim();
}
let failures = 0;

function fail(message) {
  failures += 1;
  console.error(`FAIL ${message}`);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(quizDir, file), "utf8"));
}

function assertArray(value, message) {
  if (!Array.isArray(value) || value.length === 0) fail(message);
}

function validateQuestion(question, file) {
  const prefix = `${file}:${question.id || "<no-id>"}`;
  if (!question.id || typeof question.id !== "string") fail(`${prefix} missing id`);
  if (!["single", "multi", "code_output", "scenario", "code_review"].includes(question.type)) fail(`${prefix} invalid type`);
  if (!question.prompt || question.prompt.length < 12) fail(`${prefix} prompt is too short`);
  assertArray(question.topics, `${prefix} missing topics`);
  assertArray(question.companies, `${prefix} missing companies`);
  assertArray(question.sourceRefs, `${prefix} missing sourceRefs`);
  assertArray(question.reviewLinks, `${prefix} missing reviewLinks`);
  assertArray(question.choices, `${prefix} missing choices`);
  assertArray(question.correct, `${prefix} missing correct`);

  const choiceIds = new Set((question.choices || []).map((choice) => choice.id));
  if (choiceIds.size !== (question.choices || []).length) fail(`${prefix} duplicate choice ids`);
  for (const correctId of question.correct || []) {
    if (!choiceIds.has(correctId)) fail(`${prefix} correct id ${correctId} is not in choices`);
  }

  if (question.type === "multi" && question.correct.length < 2) fail(`${prefix} multi question needs 2+ correct choices`);
  if (question.type !== "multi" && question.correct.length !== 1) fail(`${prefix} non-multi question needs exactly 1 correct choice`);

  const correctChoice = (question.choices || []).find((choice) => question.correct.includes(choice.id));
  const correctNorm = correctChoice ? normalizeText(correctChoice.text) : "";

  for (const choice of question.choices || []) {
    if (!choice.text || choice.text.length < 12) fail(`${prefix} choice ${choice.id} is too short`);
    if (forbidden.some((pattern) => pattern.test(choice.text))) fail(`${prefix} choice ${choice.id} contains weak wording`);
    if (question.correct.includes(choice.id)) continue;
    const choiceNorm = normalizeText(choice.text);
    if (correctNorm && (choiceNorm === correctNorm || choiceNorm.includes(correctNorm) || correctNorm.includes(choiceNorm))) {
      fail(`${prefix} distractor ${choice.id} equals or contains the correct answer`);
    }
  }

  if (!question.explanation || question.explanation.length < 20) fail(`${prefix} explanation is too short`);
  if (correctNorm && question.explanation && normalizeText(question.explanation) === correctNorm) {
    fail(`${prefix} explanation just duplicates the correct answer`);
  }
}

function validateDistribution(questions, file) {
  const singles = questions.filter((question) => question.type !== "multi" && question.choices.length >= 4);
  if (singles.length < 20) return;

  const positions = [0, 0, 0, 0];
  let correctLongest = 0;
  let correctShortest = 0;

  for (const question of singles) {
    const correctId = question.correct[0];
    const index = question.choices.findIndex((choice) => choice.id === correctId);
    if (index >= 0 && index < 4) positions[index] += 1;

    const lengths = question.choices.map((choice) => choice.text.length);
    const correctLength = question.choices[index]?.text.length ?? 0;
    const otherLengths = question.choices
      .filter((choice) => choice.id !== correctId)
      .map((choice) => choice.text.length);
    if (otherLengths.length > 0 && otherLengths.every((length) => correctLength > length)) correctLongest += 1;
    if (otherLengths.length > 0 && otherLengths.every((length) => correctLength < length)) correctShortest += 1;
  }

  const maxPositionShare = Math.max(...positions) / singles.length;
  if (maxPositionShare > 0.45) fail(`${file} correct answer positions are too predictable: ${positions.join(", ")}`);

  if (correctLongest / singles.length > 0.62) fail(`${file} correct answer is longest too often`);
  if (correctShortest / singles.length > 0.62) fail(`${file} correct answer is shortest too often`);
}

function validateCatalog() {
  const catalog = readJson("catalog.json");
  assertArray(catalog.quizzes, "catalog missing quizzes");
  assertArray(catalog.modes, "catalog missing modes");
  if (catalog.telegramUrl !== "https://t.me/+vDYjUmPrBYZmMTAy") fail("catalog has wrong Telegram URL");

  for (const quiz of catalog.quizzes) {
    const filePath = path.join(quizDir, quiz.file);
    if (!fs.existsSync(filePath)) fail(`catalog references missing file ${quiz.file}`);
  }
}

function validateFiles() {
  const files = fs
    .readdirSync(quizDir)
    .filter((file) => file.endsWith(".json") && file !== "catalog.json")
    .sort();

  for (const file of files) {
    const data = readJson(file);
    assertArray(data.questions, `${file} missing questions`);
    if (data.telegramUrl !== "https://t.me/+vDYjUmPrBYZmMTAy") fail(`${file} has wrong Telegram URL`);
    if (data.questionCount !== data.questions.length) fail(`${file} questionCount mismatch`);
    const ids = new Set();
    for (const question of data.questions) {
      if (ids.has(question.id)) fail(`${file} duplicate question ${question.id}`);
      ids.add(question.id);
      validateQuestion(question, file);
    }
    validateDistribution(data.questions, file);
  }
}

function validateDistractorReuse() {
  const data = readJson("full-bank.json");
  const freq = new Map();
  for (const question of data.questions) {
    const correct = new Set(question.correct);
    for (const choice of question.choices || []) {
      if (correct.has(choice.id)) continue;
      const key = normalizeText(choice.text);
      freq.set(key, (freq.get(key) || 0) + 1);
    }
  }
  for (const [text, count] of freq) {
    if (count > DISTRACTOR_REUSE_CAP) {
      fail(`distractor reused ${count}× across the bank (cap ${DISTRACTOR_REUSE_CAP}): "${text.slice(0, 70)}…"`);
    }
  }
}

validateCatalog();
validateFiles();
validateDistractorReuse();

if (failures > 0) {
  console.error(`Quiz validation failed with ${failures} issue(s).`);
  process.exit(1);
}

console.log("Quiz validation passed.");
