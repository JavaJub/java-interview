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

  async function initQuizApp(app) {
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
      currentQuiz: null,
      questions: [],
      currentIndex: 0,
      answers: [],
      checked: new Set(),
      submitted: false,
    };

    const requestedQuiz = new URLSearchParams(window.location.search).get("quiz");
    renderCatalog(state);
    if (requestedQuiz && catalog.quizzes.some((quiz) => quiz.id === requestedQuiz)) {
      startQuiz(state, requestedQuiz);
    }
  }

  function renderCatalog(state) {
    const { catalog, mode } = state;
    const topics = catalog.quizzes.filter((quiz) => quiz.kind === "topic");
    const companies = catalog.quizzes.filter((quiz) => quiz.kind === "company");
    const history = getHistory();

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
        <div class="quiz-modes">
          ${catalog.modes.map((item) => `
            <button class="quiz-mode ${item.id === mode.id ? "is-active" : ""}" type="button" data-mode="${item.id}">
              <strong>${escapeHtml(item.title)}</strong>
              <span>${item.questionCount} вопросов · ${escapeHtml(item.description)}</span>
            </button>
          `).join("")}
        </div>
      </section>

      ${history.length ? `
        <section class="quiz-panel">
          <h3>Последний результат</h3>
          <p>${escapeHtml(history[0].title)}: <strong>${history[0].score}/${history[0].total}</strong> (${history[0].percent}%).</p>
          <button class="quiz-secondary" type="button" data-weak-retry="1">Повторить слабые темы</button>
        </section>
      ` : ""}

      ${renderQuizGroup("Тесты по темам", topics)}
      ${renderQuizGroup("Тесты по компаниям", companies)}
    `;

    state.app.querySelectorAll("[data-mode]").forEach((button) => {
      button.addEventListener("click", () => {
        state.mode = normalizeMode(catalog, button.dataset.mode);
        renderCatalog(state);
      });
    });
    state.app.querySelectorAll("[data-quiz]").forEach((button) => {
      button.addEventListener("click", () => startQuiz(state, button.dataset.quiz));
    });
    const weakRetry = state.app.querySelector("[data-weak-retry]");
    if (weakRetry) {
      weakRetry.addEventListener("click", () => {
        state.mode = normalizeMode(catalog, "weak");
        startQuiz(state, "all-java-interview");
      });
    }
  }

  function renderQuizGroup(title, quizzes) {
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
                <button type="button" data-quiz="${quiz.id}">Начать</button>
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
    state.questions = shuffle(pool).slice(0, limit).map((question) => ({
      ...question,
      choices: shuffle(question.choices),
    }));
    state.currentIndex = 0;
    state.answers = [];
    state.checked = new Set();
    state.submitted = false;
    renderQuestion(state);
  }

  function renderQuestion(state) {
    const question = state.questions[state.currentIndex];
    const progress = `${state.currentIndex + 1} / ${state.questions.length}`;
    const inputType = question.type === "multi" ? "checkbox" : "radio";
    const selected = state.checked;

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
            <label class="quiz-choice ${selected.has(choice.id) ? "is-selected" : ""}">
              <input type="${inputType}" name="answer" value="${escapeHtml(choice.id)}" ${selected.has(choice.id) ? "checked" : ""}>
              <span>${escapeHtml(choice.text)}</span>
            </label>
          `).join("")}
        </div>
        <div class="quiz-actions">
          <button type="button" data-submit="1" ${selected.size === 0 ? "disabled" : ""}>Проверить ответ</button>
        </div>
      </section>
    `;

    state.app.querySelector("[data-back]").addEventListener("click", () => renderCatalog(state));
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

  function renderPrompt(prompt) {
    const escaped = escapeHtml(prompt);
    return escaped.replace(/```([\s\S]+?)```/g, "<pre><code>$1</code></pre>").replace(/\n/g, "<br>");
  }

  function submitAnswer(state) {
    const question = state.questions[state.currentIndex];
    const selected = [...state.checked];
    const isCorrect = arraysEqual(selected, question.correct);
    state.answers.push({ question, selected, isCorrect });
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
        <div class="quiz-explanation">
          <strong>Разбор:</strong> ${escapeHtml(question.explanation)}
        </div>
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
      for (const topic of answer.question.topics) {
        missesByTopic.set(topic, (missesByTopic.get(topic) || 0) + 1);
      }
    }
    const weakTopics = [...missesByTopic.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
    localStorage.setItem(WEAK_TOPICS_KEY, JSON.stringify(weakTopics.map(([topic]) => topic)));
    saveHistory({
      title: state.currentQuiz.title,
      score,
      total,
      percent,
      weakTopics: weakTopics.map(([topic]) => topic),
      date: new Date().toISOString(),
    });

    state.app.innerHTML = `
      <section class="quiz-panel quiz-summary">
        <p class="quiz-kicker">Результат</p>
        <h2>${score}/${total} · ${percent}%</h2>
        <h3>${escapeHtml(label)}</h3>
        <p>${escapeHtml(description)}</p>
        ${weakTopics.length ? `
          <h4>Слабые темы</h4>
          <ul>
            ${weakTopics.map(([topic, count]) => `<li>${escapeHtml(topic)} — ошибок: ${count}</li>`).join("")}
          </ul>
        ` : "<p>Ошибок по темам нет. Отличный прогон.</p>"}
        <div class="quiz-actions">
          <button type="button" data-retry="1">Пройти ещё раз</button>
          <button class="quiz-secondary" type="button" data-catalog="1">К списку тестов</button>
          <a class="quiz-telegram" href="${TELEGRAM_URL}" target="_blank" rel="noreferrer">Новые вопросы в Telegram</a>
        </div>
      </section>
    `;

    state.app.querySelector("[data-retry]").addEventListener("click", () => startQuiz(state, state.currentQuiz.id));
    state.app.querySelector("[data-catalog]").addEventListener("click", () => renderCatalog(state));
  }

  document.addEventListener("DOMContentLoaded", () => {
    const app = document.querySelector("#quiz-app");
    if (!app) return;
    initQuizApp(app).catch((error) => {
      app.innerHTML = `<div class="quiz-panel"><h2>Не удалось загрузить тесты</h2><p>${escapeHtml(error.message)}</p></div>`;
    });
  });
}());
