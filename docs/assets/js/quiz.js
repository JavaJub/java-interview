(function () {
  const TELEGRAM_URL = "https://t.me/+vDYjUmPrBYZmMTAy";
  const STORAGE_KEY = "javajub.quiz.history";
  const WEAK_TOPICS_KEY = "javajub.quiz.weakTopics";

  function shuffle(items) {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function arraysEqual(left, right) {
    const a = [...left].sort();
    const b = [...right].sort();
    return a.length === b.length && a.every((value, index) => value === b[index]);
  }

  function getHistory() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch (_) {
      return [];
    }
  }

  function saveHistory(entry) {
    const history = getHistory();
    history.unshift(entry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 10)));
  }

  function scoreLabel(percent) {
    if (percent >= 85) return ["Хорошая готовность", "Можно идти на mock interview и добивать слабые темы."];
    if (percent >= 65) return ["Почти готово", "База есть, но перед собеседованием лучше повторить ошибки."];
    if (percent >= 45) return ["Нужно повторить", "Есть узнавание тем, но пока не хватает устойчивости в ответах."];
    return ["Рано на боевой собес", "Сначала пройти гайды по слабым темам и вернуться к тесту."];
  }

  function normalizeMode(catalog, requestedMode) {
    return catalog.modes.find((mode) => mode.id === requestedMode) || catalog.modes.find((mode) => mode.id === "express") || catalog.modes[0];
  }

  function scoreBucket(percent) {
    if (percent >= 85) return "85-100";
    if (percent >= 65) return "65-84";
    if (percent >= 45) return "45-64";
    return "0-44";
  }

  function trackQuizEvent(eventName, props = {}) {
    if (typeof window.javajubTrack !== "function") return;
    window.javajubTrack(eventName, props);
  }

  function quizQuestionCount(quiz, mode) {
    return Math.min(mode.questionCount, quiz.questionCount);
  }

  function syncModeToUrl(modeId) {
    const url = new URL(window.location.href);
    url.searchParams.set("mode", modeId);
    window.history.replaceState({}, "", url);
  }

  function syncFormatToUrl(format) {
    const url = new URL(window.location.href);
    url.searchParams.set("format", format);
    window.history.replaceState({}, "", url);
  }

  async function initQuizApp(app) {
    if (app.dataset.quizInitialized === "1") return;
    app.dataset.quizInitialized = "1";

    const catalogUrl = new URL(app.dataset.catalog || "../assets/quizzes/catalog.json", window.location.href);
    const catalog = await fetch(catalogUrl).then((response) => {
      if (!response.ok) throw new Error(`Cannot load quiz catalog: ${response.status}`);
      return response.json();
    });
    const state = {
      app,
      catalog,
      catalogUrl,
      mode: normalizeMode(catalog, new URLSearchParams(window.location.search).get("mode")),
      format: new URLSearchParams(window.location.search).get("format") === "flashcard" ? "flashcard" : "mcq",
      currentQuiz: null,
      currentQuizMeta: null,
      questions: [],
      currentIndex: 0,
      answers: [],
      checked: new Set(),
      revealed: false,
    };

    const requestedQuiz = new URLSearchParams(window.location.search).get("quiz");
    renderCatalog(state);
    if (requestedQuiz && catalog.quizzes.some((quiz) => quiz.id === requestedQuiz)) {
      startQuiz(state, requestedQuiz);
    }
  }

  function renderCatalog(state) {
    const { catalog, mode, format } = state;
    const topics = catalog.quizzes.filter((quiz) => quiz.kind === "topic");
    const companies = catalog.quizzes.filter((quiz) => quiz.kind === "company");
    const history = getHistory();
    trackQuizEvent("quiz_catalog_view", {
      mode_id: mode.id,
      has_history: history.length > 0,
      topic_quizzes: topics.length,
      company_quizzes: companies.length,
    });

    state.app.innerHTML = `
      <section class="quiz-hero">
        <div>
          <p class="quiz-kicker">JavaJub self-check</p>
          <h2>Проверь готовность к Java-собеседованию</h2>
          <p>Тесты собраны из текущей базы гайдов: Java Core, Spring, SQL, Kafka, AQA, live-coding и readiness-проверки по компаниям.</p>
        </div>
        <a class="quiz-telegram" href="${TELEGRAM_URL}" target="_blank" rel="noreferrer">Свежие вопросы в Telegram</a>
      </section>
      <section class="quiz-panel">
        <h3>Режим</h3>
        <p class="quiz-mode-summary">Сейчас выбран <strong>${escapeHtml(mode.title)}</strong>: до ${mode.questionCount} вопросов. После выбора режима нажмите «Начать» у нужной темы или компании.</p>
        <div class="quiz-modes">
          ${catalog.modes.map((item) => `
            <button class="quiz-mode ${item.id === mode.id ? "is-active" : ""}" type="button" data-mode="${item.id}">
              <strong>${escapeHtml(item.title)}</strong>
              ${item.id === mode.id ? `<em>Выбрано</em>` : ""}
              <span>${item.questionCount} вопросов · ${escapeHtml(item.description)}</span>
            </button>
          `).join("")}
        </div>
      </section>
      <section class="quiz-panel">
        <h3>Формат</h3>
        <p class="quiz-mode-summary">Выберите, как проходить: вопросы с вариантами ответа или флешкарты на вспоминание.</p>
        <div class="quiz-modes">
          <button class="quiz-mode ${format === "mcq" ? "is-active" : ""}" type="button" data-format="mcq">
            <strong>Тест с вариантами</strong>
            ${format === "mcq" ? `<em>Выбрано</em>` : ""}
            <span>4 варианта ответа, проверка выбора и разбор.</span>
          </button>
          <button class="quiz-mode ${format === "flashcard" ? "is-active" : ""}" type="button" data-format="flashcard">
            <strong>Флешкарты</strong>
            ${format === "flashcard" ? `<em>Выбрано</em>` : ""}
            <span>Вспомните ответ сами, затем откройте его и оцените себя.</span>
          </button>
        </div>
      </section>
      ${history.length ? `
        <section class="quiz-panel">
          <h3>Последний результат</h3>
          <p>${escapeHtml(history[0].title)}: <strong>${history[0].score}/${history[0].total}</strong> (${history[0].percent}%).</p>
          <button class="quiz-secondary" type="button" data-weak-retry="1">Повторить слабые темы</button>
        </section>
      ` : ""}
      ${renderQuizGroup("Тесты по темам", topics, mode)}
      ${renderQuizGroup("Тесты по компаниям", companies, mode)}
    `;

    state.app.querySelectorAll("[data-mode]").forEach((button) => {
      button.addEventListener("click", () => {
        trackQuizEvent("quiz_mode_select", {
          previous_mode_id: state.mode.id,
          mode_id: button.dataset.mode,
        });
        state.mode = normalizeMode(catalog, button.dataset.mode);
        syncModeToUrl(state.mode.id);
        renderCatalog(state);
      });
    });
    state.app.querySelectorAll("[data-format]").forEach((button) => {
      button.addEventListener("click", () => {
        const next = button.dataset.format === "flashcard" ? "flashcard" : "mcq";
        if (next === state.format) return;
        trackQuizEvent("quiz_format_select", { previous_format: state.format, format: next });
        state.format = next;
        syncFormatToUrl(state.format);
        renderCatalog(state);
      });
    });
    state.app.querySelectorAll("[data-quiz]").forEach((button) => {
      button.addEventListener("click", () => startQuiz(state, button.dataset.quiz));
    });
    const weakRetry = state.app.querySelector("[data-weak-retry]");
    if (weakRetry) {
      weakRetry.addEventListener("click", () => {
        trackQuizEvent("quiz_weak_retry", {
          previous_mode_id: state.mode.id,
        });
        state.mode = normalizeMode(catalog, "weak");
        startQuiz(state, "all-java-interview");
      });
    }
  }

  function renderQuizGroup(title, quizzes, mode) {
    return `
      <section class="quiz-panel">
        <h3>${escapeHtml(title)}</h3>
        <div class="quiz-grid">
          ${quizzes.map((quiz) => `
            <article class="quiz-card">
              <div>
                <h4>${escapeHtml(quiz.title)}</h4>
                <p>${escapeHtml(quiz.description)}</p>
              </div>
              <div class="quiz-card-footer">
                <span>${quiz.questionCount} вопросов</span>
                <button type="button" data-quiz="${quiz.id}">Начать ${quizQuestionCount(quiz, mode)}</button>
              </div>
            </article>
          `).join("")}
        </div>
      </section>
    `;
  }

  async function startQuiz(state, quizId) {
    const quizMeta = state.catalog.quizzes.find((quiz) => quiz.id === quizId);
    if (!quizMeta) return;
    const quizUrl = new URL(quizMeta.file, state.catalogUrl);
    const quiz = await fetch(quizUrl).then((response) => {
      if (!response.ok) throw new Error(`Cannot load quiz: ${response.status}`);
      return response.json();
    });

    let pool = quiz.questions;
    if (state.mode.id === "weak") {
      const weakTopics = JSON.parse(localStorage.getItem(WEAK_TOPICS_KEY) || "[]");
      const filtered = pool.filter((question) => question.topics.some((topic) => weakTopics.includes(topic)));
      if (filtered.length >= 5) pool = filtered;
    }

    const limit = Math.min(state.mode.questionCount, pool.length);
    state.currentQuiz = quiz;
    state.currentQuizMeta = quizMeta;
    state.questions = shuffle(pool).slice(0, limit).map((question) => ({ ...question, choices: shuffle(question.choices) }));
    state.currentIndex = 0;
    state.answers = [];
    state.checked = new Set();
    state.revealed = false;
    trackQuizEvent("quiz_start", {
      quiz_id: quiz.id,
      quiz_kind: quizMeta.kind,
      quiz_title: quiz.title,
      mode_id: state.mode.id,
      format: state.format,
      question_count: limit,
      pool_size: pool.length,
    });
    if (state.format === "flashcard") renderFlashcard(state);
    else renderQuestion(state);
  }

  function renderPrompt(prompt) {
    const escaped = escapeHtml(prompt);
    return escaped.replace(/```([\s\S]+?)```/g, "<pre><code>$1</code></pre>").replace(/\n/g, "<br>");
  }

  function recordFlashcard(state, knew) {
    const question = state.questions[state.currentIndex];
    state.answers.push({ question, selected: [], isCorrect: knew });
    trackQuizEvent("quiz_flashcard_grade", {
      quiz_id: state.currentQuiz?.id,
      quiz_kind: state.currentQuizMeta?.kind,
      mode_id: state.mode.id,
      question_id: question.id,
      level: question.level,
      topics: question.topics,
      question_index: state.currentIndex + 1,
      knew,
    });
    state.currentIndex += 1;
    state.revealed = false;
    if (state.currentIndex >= state.questions.length) renderResult(state);
    else renderFlashcard(state);
  }

  function renderFlashcard(state) {
    const question = state.questions[state.currentIndex];
    const progress = `${state.currentIndex + 1} / ${state.questions.length}`;
    const correctChoice = question.choices.find((choice) => question.correct.includes(choice.id));
    const correctText = correctChoice ? correctChoice.text : "";

    state.app.innerHTML = `
      <section class="quiz-panel quiz-run">
        <div class="quiz-run-header">
          <button class="quiz-secondary" type="button" data-back="1">← К списку тестов</button>
          <span>${progress}</span>
        </div>
        <div class="quiz-progress"><span style="width: ${((state.currentIndex + 1) / state.questions.length) * 100}%"></span></div>
        <p class="quiz-kicker">Флешкарта · ${escapeHtml(question.level)} · ${question.topics.map(escapeHtml).join(", ")}</p>
        <h3>${renderPrompt(question.prompt)}</h3>
        ${state.revealed ? `
          <div class="quiz-flashcard-answer">
            <p class="quiz-kicker">Ответ</p>
            <p>${escapeHtml(correctText)}</p>
            <div class="quiz-explanation"><strong>Разбор:</strong> ${escapeHtml(question.explanation)}</div>
            ${question.reviewLinks && question.reviewLinks.length ? `<div class="quiz-review-links">${question.reviewLinks.map((link) => `<a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a>`).join("")}</div>` : ""}
          </div>
          <div class="quiz-actions">
            <button type="button" data-grade="known">Знал</button>
            <button class="quiz-secondary" type="button" data-grade="unknown">Не знал</button>
          </div>
        ` : `
          <p class="quiz-flashcard-hint">Вспомните ответ сами, затем откройте правильный и честно оцените себя.</p>
          <div class="quiz-actions">
            <button type="button" data-reveal="1">Показать ответ</button>
          </div>
        `}
      </section>
    `;

    state.app.querySelector("[data-back]").addEventListener("click", () => {
      trackQuizEvent("quiz_back_to_catalog", {
        quiz_id: state.currentQuiz?.id,
        quiz_kind: state.currentQuizMeta?.kind,
        mode_id: state.mode.id,
        question_index: state.currentIndex + 1,
        question_count: state.questions.length,
      });
      renderCatalog(state);
    });
    const reveal = state.app.querySelector("[data-reveal]");
    if (reveal) {
      reveal.addEventListener("click", () => {
        state.revealed = true;
        renderFlashcard(state);
      });
    }
    state.app.querySelectorAll("[data-grade]").forEach((button) => {
      button.addEventListener("click", () => recordFlashcard(state, button.dataset.grade === "known"));
    });
  }

  function renderQuestion(state) {
    const question = state.questions[state.currentIndex];
    const progress = `${state.currentIndex + 1} / ${state.questions.length}`;
    const inputType = question.type === "multi" ? "checkbox" : "radio";

    state.app.innerHTML = `
      <section class="quiz-panel quiz-run">
        <div class="quiz-run-header">
          <button class="quiz-secondary" type="button" data-back="1">← К списку тестов</button>
          <span>${progress}</span>
        </div>
        <div class="quiz-progress"><span style="width: ${((state.currentIndex + 1) / state.questions.length) * 100}%"></span></div>
        <p class="quiz-kicker">${escapeHtml(question.type)} · ${escapeHtml(question.level)} · ${question.topics.map(escapeHtml).join(", ")}</p>
        <h3>${renderPrompt(question.prompt)}</h3>
        <div class="quiz-choices">
          ${question.choices.map((choice) => `
            <label class="quiz-choice ${state.checked.has(choice.id) ? "is-selected" : ""}">
              <input type="${inputType}" name="answer" value="${escapeHtml(choice.id)}" ${state.checked.has(choice.id) ? "checked" : ""}>
              <span>${escapeHtml(choice.text)}</span>
            </label>
          `).join("")}
        </div>
        <div class="quiz-actions">
          <button type="button" data-submit="1" ${state.checked.size === 0 ? "disabled" : ""}>Проверить ответ</button>
        </div>
      </section>
    `;

    state.app.querySelector("[data-back]").addEventListener("click", () => {
      trackQuizEvent("quiz_back_to_catalog", {
        quiz_id: state.currentQuiz?.id,
        quiz_kind: state.currentQuizMeta?.kind,
        mode_id: state.mode.id,
        question_index: state.currentIndex + 1,
        question_count: state.questions.length,
      });
      renderCatalog(state);
    });
    state.app.querySelectorAll("input[name='answer']").forEach((input) => {
      input.addEventListener("change", () => {
        if (question.type === "multi") {
          if (input.checked) state.checked.add(input.value);
          else state.checked.delete(input.value);
        } else {
          state.checked = new Set([input.value]);
        }
        renderQuestion(state);
      });
    });
    state.app.querySelector("[data-submit]").addEventListener("click", () => submitAnswer(state));
  }

  function submitAnswer(state) {
    const question = state.questions[state.currentIndex];
    const selected = [...state.checked];
    const isCorrect = arraysEqual(selected, question.correct);
    state.answers.push({ question, selected, isCorrect });
    trackQuizEvent("quiz_answer", {
      quiz_id: state.currentQuiz?.id,
      quiz_kind: state.currentQuizMeta?.kind,
      mode_id: state.mode.id,
      question_id: question.id,
      question_type: question.type,
      level: question.level,
      topics: question.topics,
      question_index: state.currentIndex + 1,
      is_correct: isCorrect,
    });
    renderFeedback(state, isCorrect);
  }

  function renderFeedback(state, isCorrect) {
    const question = state.questions[state.currentIndex];
    const correct = new Set(question.correct);
    state.app.innerHTML = `
      <section class="quiz-panel quiz-run">
        <p class="quiz-result-badge ${isCorrect ? "is-good" : "is-bad"}">${isCorrect ? "Верно" : "Нужно повторить"}</p>
        <h3>${renderPrompt(question.prompt)}</h3>
        <div class="quiz-choices">
          ${question.choices.map((choice) => `
            <div class="quiz-choice ${correct.has(choice.id) ? "is-correct" : ""}">
              <span>${escapeHtml(choice.text)}</span>
            </div>
          `).join("")}
        </div>
        <div class="quiz-explanation"><strong>Разбор:</strong> ${escapeHtml(question.explanation)}</div>
        <div class="quiz-review-links">
          ${question.reviewLinks.map((link) => `<a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a>`).join("")}
        </div>
        <div class="quiz-actions">
          <button type="button" data-next="1">${state.currentIndex + 1 === state.questions.length ? "Показать результат" : "Следующий вопрос"}</button>
        </div>
      </section>
    `;
    state.app.querySelector("[data-next]").addEventListener("click", () => {
      state.currentIndex += 1;
      state.checked = new Set();
      if (state.currentIndex >= state.questions.length) renderResult(state);
      else renderQuestion(state);
    });
  }

  function renderResult(state) {
    const score = state.answers.filter((answer) => answer.isCorrect).length;
    const total = state.answers.length;
    const percent = Math.round((score / total) * 100);
    const [label, description] = scoreLabel(percent);
    const missesByTopic = new Map();
    for (const answer of state.answers) {
      if (answer.isCorrect) continue;
      for (const topic of answer.question.topics) missesByTopic.set(topic, (missesByTopic.get(topic) || 0) + 1);
    }
    const weakTopics = [...missesByTopic.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
    localStorage.setItem(WEAK_TOPICS_KEY, JSON.stringify(weakTopics.map(([topic]) => topic)));
    saveHistory({ title: state.currentQuiz.title, score, total, percent, weakTopics: weakTopics.map(([topic]) => topic), date: new Date().toISOString() });
    trackQuizEvent("quiz_complete", {
      quiz_id: state.currentQuiz.id,
      quiz_kind: state.currentQuizMeta?.kind,
      quiz_title: state.currentQuiz.title,
      mode_id: state.mode.id,
      score,
      total,
      percent,
      score_bucket: scoreBucket(percent),
      weak_topics: weakTopics.map(([topic]) => topic),
    });

    state.app.innerHTML = `
      <section class="quiz-panel quiz-summary">
        <p class="quiz-kicker">Результат</p>
        <h2>${score}/${total} · ${percent}%</h2>
        <h3>${escapeHtml(label)}</h3>
        <p>${escapeHtml(description)}</p>
        ${weakTopics.length ? `
          <h4>Слабые темы</h4>
          <ul>${weakTopics.map(([topic, count]) => `<li>${escapeHtml(topic)} — ошибок: ${count}</li>`).join("")}</ul>
        ` : "<p>Ошибок по темам нет. Отличный прогон.</p>"}
        <div class="quiz-actions">
          <button type="button" data-retry="1">Пройти ещё раз</button>
          <button class="quiz-secondary" type="button" data-catalog="1">К списку тестов</button>
          <a class="quiz-telegram" href="${TELEGRAM_URL}" target="_blank" rel="noreferrer">Новые вопросы в Telegram</a>
        </div>
      </section>
    `;
    state.app.querySelector("[data-retry]").addEventListener("click", () => {
      trackQuizEvent("quiz_retry", {
        quiz_id: state.currentQuiz.id,
        quiz_kind: state.currentQuizMeta?.kind,
        mode_id: state.mode.id,
      });
      startQuiz(state, state.currentQuiz.id);
    });
    state.app.querySelector("[data-catalog]").addEventListener("click", () => {
      trackQuizEvent("quiz_result_to_catalog", {
        quiz_id: state.currentQuiz.id,
        quiz_kind: state.currentQuizMeta?.kind,
        mode_id: state.mode.id,
      });
      renderCatalog(state);
    });
  }

  function bootQuizApp() {
    const app = document.querySelector("#quiz-app");
    if (!app) return;
    initQuizApp(app).catch((error) => {
      app.innerHTML = `<div class="quiz-panel"><h2>Не удалось загрузить тесты</h2><p>${escapeHtml(error.message)}</p></div>`;
    });
  }

  document.addEventListener("DOMContentLoaded", bootQuizApp);
  if (window.document$ && typeof window.document$.subscribe === "function") {
    window.document$.subscribe(bootQuizApp);
  }
  bootQuizApp();
}());
