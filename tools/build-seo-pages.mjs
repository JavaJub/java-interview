import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const docsDir = path.join(root, "docs");
const quizDir = path.join(docsDir, "assets/quizzes");

const topicOrder = [
  "java-core",
  "collections",
  "jvm",
  "concurrency",
  "spring",
  "hibernate",
  "sql",
  "kafka",
  "devops",
  "testing-aqa",
  "algorithms",
  "system-design",
  "security",
];

const companyOrder = [
  "sber-middle",
  "sberseasons-trainee",
  "alfa-bank-middle",
  "t1-innotech-middle",
  "vk-middle",
  "yandex-travel-middle",
  "mts-bank-aqa-junior",
  "itk-academy-junior",
  "liga-middle",
  "x5-code-review-senior",
];

const quizDetails = {
  "java-core": {
    audience: "Junior и Middle Java-разработчикам, которым нужно быстро проверить базу Java Core перед интервью.",
    keywords: "Java Core interview questions, Java interview questions, Java собеседование",
    guideLinks: [
      ["Сбер Java Core", "../../guides/sber.md"],
      ["SberSeasons Java Core", "../../guides/sber-internship.md"],
      ["Альфа-Банк Java Core", "../../guides/alfa-bank.md"],
    ],
  },
  collections: {
    audience: "Тем, кто хочет уверенно отвечать про HashMap, List, Set, fail-fast и выбор коллекций.",
    keywords: "Java Collections interview questions, HashMap interview, Java собеседование",
    guideLinks: [
      ["Сбер Collections", "../../guides/sber.md"],
      ["VK Collections", "../../guides/vk.md"],
      ["Т1 Иннотех Collections", "../../guides/t1-innotech.md"],
    ],
  },
  jvm: {
    audience: "Кандидатам, которым нужно проверить JVM, память, GC, classloading и диагностику.",
    keywords: "JVM interview questions, Java GC interview, Java Middle interview",
    guideLinks: [
      ["Сбер JVM", "../../guides/sber.md"],
      ["SberSeasons JVM", "../../guides/sber-internship.md"],
      ["Т1 Иннотех JVM", "../../guides/t1-innotech.md"],
    ],
  },
  concurrency: {
    audience: "Middle Java-разработчикам, которые повторяют JMM, volatile, synchronized, executors и deadlock.",
    keywords: "Java concurrency interview, multithreading interview questions, Java Middle interview",
    guideLinks: [
      ["Альфа-Банк многопоточность", "../../guides/alfa-bank.md"],
      ["VK JMM", "../../guides/vk.md"],
      ["X5 code review", "../../tasks/x5-blackfriday-code-review.md"],
    ],
  },
  spring: {
    audience: "Java backend-разработчикам, которые готовятся к вопросам по Spring Boot, DI, AOP и транзакциям.",
    keywords: "Spring Boot interview questions, Spring interview, Java Middle interview",
    guideLinks: [
      ["Сбер Spring", "../../guides/sber.md"],
      ["Альфа-Банк Spring Boot", "../../guides/alfa-bank.md"],
      ["Лига Spring", "../../guides/liga.md"],
    ],
  },
  hibernate: {
    audience: "Тем, кто хочет проверить JPA/Hibernate: entity states, lazy/eager, N+1, dirty checking и locks.",
    keywords: "Hibernate interview questions, JPA interview, Spring Data JPA interview",
    guideLinks: [
      ["Альфа-Банк Hibernate", "../../guides/alfa-bank.md"],
      ["Т1 Иннотех Hibernate", "../../guides/t1-innotech.md"],
      ["Яндекс Путешествия Hibernate", "../../guides/yandex-travel.md"],
    ],
  },
  sql: {
    audience: "Кандидатам, которым нужно повторить SQL, PostgreSQL, индексы, JOIN, EXPLAIN и транзакции.",
    keywords: "SQL interview questions, PostgreSQL interview, Java backend interview",
    guideLinks: [
      ["Альфа-Банк SQL", "../../guides/alfa-bank.md"],
      ["VK SQL", "../../guides/vk.md"],
      ["МТС Банк AQA SQL", "../../guides/mts-bank-aqa.md"],
    ],
  },
  kafka: {
    audience: "Java backend-разработчикам, которые готовятся к Kafka, consumer groups, offsets и delivery guarantees.",
    keywords: "Kafka interview questions, microservices interview, Java Middle interview",
    guideLinks: [
      ["Альфа-Банк Kafka", "../../guides/alfa-bank.md"],
      ["VK Kafka", "../../guides/vk.md"],
      ["Т1 Иннотех Kafka", "../../guides/t1-innotech.md"],
    ],
  },
  devops: {
    audience: "Тем, кто хочет проверить Docker, Kubernetes, CI/CD и production-инфраструктуру вокруг Java-сервиса.",
    keywords: "Docker interview questions, Kubernetes interview, Java DevOps interview",
    guideLinks: [
      ["Альфа-Банк Docker/Kubernetes", "../../guides/alfa-bank.md"],
      ["VK Kubernetes", "../../guides/vk.md"],
      ["ITK Academy Docker", "../../guides/itk-academy.md"],
    ],
  },
  "testing-aqa": {
    audience: "AQA Java-кандидатам, которые повторяют тест-дизайн, Rest Assured, JUnit, Mockito и Testcontainers.",
    keywords: "AQA Java interview, Rest Assured interview, testing interview questions",
    guideLinks: [
      ["МТС Банк AQA", "../../guides/mts-bank-aqa.md"],
      ["AQA roadmap", "../../roadmaps/java-aqa.md"],
    ],
  },
  algorithms: {
    audience: "Кандидатам, которым нужно потренировать live coding, строки, массивы, HashMap-задачи и code review.",
    keywords: "Java live coding interview, algorithms interview, Java interview tasks",
    guideLinks: [
      ["VK live coding", "../../guides/vk.md"],
      ["Яндекс Путешествия алгоритмы", "../../guides/yandex-travel.md"],
      ["X5 code review", "../../tasks/x5-blackfriday-code-review.md"],
    ],
  },
  "system-design": {
    audience: "Middle/Senior Java-разработчикам, которые готовятся к архитектурным вопросам и high-load задачам.",
    keywords: "System Design interview, Java backend system design, high-load interview",
    guideLinks: [
      ["Сбер System Design", "../../guides/sber.md"],
      ["VK System Design", "../../guides/vk.md"],
      ["Яндекс Путешествия System Design", "../../guides/yandex-travel.md"],
    ],
  },
  security: {
    audience: "Тем, кто повторяет OAuth 2.0, OIDC, JWT, Keycloak и типовые security-вопросы Java backend.",
    keywords: "OAuth interview questions, JWT interview, Java security interview",
    guideLinks: [
      ["ITK Academy OAuth", "../../guides/itk-academy.md"],
      ["МТС Банк AQA security", "../../guides/mts-bank-aqa.md"],
    ],
  },
};

const companyDetails = {
  "sber-middle": {
    audience: "Java Middle-кандидатам, которые готовятся к Сберу и хотят проверить Java Core, Spring, SQL, JVM и System Design.",
    keywords: "Сбер Java Middle interview, Java Middle interview, Java interview questions",
    guideLinks: [["Гайд по Сберу", "../../guides/sber.md"], ["Middle roadmap", "../../roadmaps/java-middle.md"]],
  },
  "sberseasons-trainee": {
    audience: "Стажёрам и Junior-кандидатам, которые готовятся к SberSeasons Java Trainee.",
    keywords: "SberSeasons Java Trainee interview, Java Junior interview, Java собеседование",
    guideLinks: [["Гайд SberSeasons", "../../guides/sber-internship.md"], ["Junior roadmap", "../../roadmaps/java-junior.md"]],
  },
  "alfa-bank-middle": {
    audience: "Java Middle-кандидатам в Альфа-Банк: Spring Boot, Kafka, PostgreSQL, Docker и live coding.",
    keywords: "Альфа-Банк Java Middle interview, Spring Boot interview, Kafka interview",
    guideLinks: [["Гайд по Альфа-Банку", "../../guides/alfa-bank.md"], ["Middle roadmap", "../../roadmaps/java-middle.md"]],
  },
  "t1-innotech-middle": {
    audience: "Junior/Middle Java-кандидатам в Т1 Иннотех: enterprise backend, Spring, Hibernate, SQL и Kafka.",
    keywords: "Т1 Иннотех Java interview, Java Middle interview, Hibernate interview",
    guideLinks: [["Гайд Т1 Иннотех", "../../guides/t1-innotech.md"], ["Middle roadmap", "../../roadmaps/java-middle.md"]],
  },
  "vk-middle": {
    audience: "Java Middle-кандидатам в VK: Java 21, алгоритмы, Spring Boot, Kafka, high-load и System Design.",
    keywords: "VK Java Middle interview, Java live coding interview, System Design interview",
    guideLinks: [["Гайд VK", "../../guides/vk.md"], ["Middle roadmap", "../../roadmaps/java-middle.md"]],
  },
  "yandex-travel-middle": {
    audience: "Java Middle-кандидатам в Яндекс Путешествия: алгоритмы, backend, PostgreSQL и System Design.",
    keywords: "Яндекс Java Middle interview, Java algorithms interview, System Design interview",
    guideLinks: [["Гайд Яндекс Путешествия", "../../guides/yandex-travel.md"], ["Middle roadmap", "../../roadmaps/java-middle.md"]],
  },
  "mts-bank-aqa-junior": {
    audience: "AQA Java Junior-кандидатам в МТС Банк: Rest Assured, JUnit 5, SQL, Kafka и WireMock.",
    keywords: "МТС Банк AQA Java interview, Rest Assured interview, AQA Java interview",
    guideLinks: [["Гайд МТС Банк AQA", "../../guides/mts-bank-aqa.md"], ["AQA roadmap", "../../roadmaps/java-aqa.md"]],
  },
  "itk-academy-junior": {
    audience: "Java Junior-кандидатам в ITK Academy: Java Core, Spring basics, Docker, SQL и Git.",
    keywords: "ITK Academy Java Junior interview, Java Junior interview, Spring Boot interview",
    guideLinks: [["Гайд ITK Academy", "../../guides/itk-academy.md"], ["Junior roadmap", "../../roadmaps/java-junior.md"]],
  },
  "liga-middle": {
    audience: "Java Middle-кандидатам в Лигу Цифровой Экономики: Java 11, Spring, Hibernate, PostgreSQL и тесты.",
    keywords: "Лига Java Middle interview, Java Middle interview, Spring Hibernate interview",
    guideLinks: [["Гайд Лига", "../../guides/liga.md"], ["Middle roadmap", "../../roadmaps/java-middle.md"]],
  },
  "x5-code-review-senior": {
    audience: "Senior Java-кандидатам, которым нужно потренировать code review, concurrency и production-мышление.",
    keywords: "X5 Tech Senior Java interview, Java code review interview, concurrency interview",
    guideLinks: [["Разбор X5 Tech", "../../tasks/x5-blackfriday-code-review.md"], ["Middle roadmap", "../../roadmaps/java-middle.md"]],
  },
};

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(quizDir, file), "utf8"));
}

function writeFile(relativePath, content) {
  const absolutePath = path.join(docsDir, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, `${content.trim()}\n`);
}

function frontMatter(title, description) {
  return `---\ntitle: ${JSON.stringify(title)}\ndescription: ${JSON.stringify(description)}\n---\n`;
}

function listLinks(links) {
  return links.map(([label, href]) => `- [${label}](${href})`).join("\n");
}

function topicBadges(quiz) {
  const sampleTopics = new Set();
  for (const question of quiz.questions.slice(0, 80)) {
    for (const topic of question.topics) sampleTopics.add(topic);
  }
  return [...sampleTopics].slice(0, 8);
}

function renderQuizPage(quiz, meta, kind) {
  const title = kind === "company"
    ? `${quiz.title}: вопросы и тест для собеседования`
    : `${quiz.title}: вопросы для собеседования Java`;
  const description = `${quiz.description} ${meta.audience}`;
  const startHref = kind === "topic"
    ? `../index.md?quiz=${quiz.id}&mode=express`
    : `../index.md?quiz=${quiz.id}&mode=express`;
  const siblingsHref = kind === "topic" ? "../topics.md" : "../companies.md";
  const siblingLabel = kind === "topic" ? "Все тесты по темам" : "Все тесты по компаниям";
  const topics = topicBadges(quiz);

  return `${frontMatter(title, description)}
# ${title}

${meta.audience}

В тесте ${quiz.questionCount} вопросов из базы JavaJub. Он помогает проверить готовность к собеседованию, увидеть слабые темы и перейти к нужным гайдам для повторения. Формулировки подходят под поисковые запросы ${meta.keywords}, но сама страница остаётся нормальным русскоязычным маршрутом подготовки.

[Начать Express-тест](${startHref}) · [${siblingLabel}](${siblingsHref}) · [Каталог тестов](../index.md)

## Что проверяет тест

${topics.map((topic) => `- ${topic}`).join("\n")}

## Кому подойдёт

${meta.audience}

## Как проходить

1. Начните с Express-режима на 15 вопросов.
2. После результата откройте слабые темы и повторите связанные гайды.
3. Перед собеседованием пройдите Standard или Interview simulation.

## Что повторить

${listLinks(meta.guideLinks)}

## Следующий шаг

Новые вопросы и разборы собеседований выходят в Telegram-канале JavaJub: [получать свежие вопросы](https://t.me/+vDYjUmPrBYZmMTAy).
`;
}

function buildIndex(title, description, rows, basePath) {
  return `${frontMatter(title, description)}
# ${title}

${description}

| Тест | Вопросов | Открыть |
|---|---:|---|
${rows.map((quiz) => `| ${quiz.title} | ${quiz.questionCount} | [Описание и старт](${basePath}/${quiz.id}.md) |`).join("\n")}
`;
}

function build() {
  const catalog = readJson("catalog.json");
  const byId = new Map(catalog.quizzes.map((quiz) => [quiz.id, quiz]));

  const topicRows = [];
  for (const id of topicOrder) {
    const meta = byId.get(id);
    if (!meta) throw new Error(`Missing topic quiz in catalog: ${id}`);
    const quiz = readJson(meta.file);
    writeFile(`quizzes/topics/${id}.md`, renderQuizPage(quiz, quizDetails[id], "topic"));
    topicRows.push({ ...meta, questionCount: quiz.questionCount });
  }

  const companyRows = [];
  for (const id of companyOrder) {
    const meta = byId.get(id);
    if (!meta) throw new Error(`Missing company quiz in catalog: ${id}`);
    const quiz = readJson(meta.file);
    writeFile(`quizzes/companies/${id}.md`, renderQuizPage(quiz, companyDetails[id], "company"));
    companyRows.push({ ...meta, questionCount: quiz.questionCount });
  }

  writeFile(
    "quizzes/topics.md",
    buildIndex(
      "Тесты по темам Java interview",
      "Статические SEO-страницы и интерактивные тесты по Java Core, Spring Boot, SQL, Kafka, JVM, AQA и System Design.",
      topicRows,
      "topics",
    ),
  );

  writeFile(
    "quizzes/companies.md",
    buildIndex(
      "Тесты по компаниям",
      "Readiness-тесты по форматам собеседований: Сбер, Альфа-Банк, VK, Яндекс, Т1, МТС Банк, Лига и X5 Tech.",
      companyRows,
      "companies",
    ),
  );

  console.log(`Generated ${topicRows.length + companyRows.length} SEO quiz pages.`);
}

build();
