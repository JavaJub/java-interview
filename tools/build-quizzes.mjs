import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = process.cwd();
const outDir = path.join(root, "docs/assets/quizzes");
const telegramUrl = "https://t.me/+vDYjUmPrBYZmMTAy";

// Per-question answer options (distractors + explanation) authored once and
// stored in tools/quiz-answers.json, keyed by normalizeQuestion(rawPrompt).
// This replaces the old template-based distractor generation.
const answerBankPath = path.join(root, "tools/quiz-answers.json");
const answerBank = fs.existsSync(answerBankPath)
  ? JSON.parse(fs.readFileSync(answerBankPath, "utf8"))
  : {};
const missingAnswerKeys = new Set();

const sourceFiles = [
  "guides/sber.md",
  "guides/sber-internship.md",
  "guides/alfa-bank.md",
  "guides/t1-innotech.md",
  "guides/vk.md",
  "guides/yandex-travel.md",
  "guides/mts-bank-aqa.md",
  "guides/itk-academy.md",
  "guides/liga.md",
  "tasks/x5-blackfriday-code-review.md",
];

const sourceMeta = {
  "guides/sber.md": {
    company: "sber",
    companyLabel: "Сбер",
    level: "middle",
    page: "../guides/sber/",
  },
  "guides/sber-internship.md": {
    company: "sberseasons",
    companyLabel: "SberSeasons",
    level: "trainee",
    page: "../guides/sber-internship/",
  },
  "guides/alfa-bank.md": {
    company: "alfa-bank",
    companyLabel: "Альфа-Банк",
    level: "middle",
    page: "../guides/alfa-bank/",
  },
  "guides/t1-innotech.md": {
    company: "t1-innotech",
    companyLabel: "Т1 Иннотех",
    level: "middle",
    page: "../guides/t1-innotech/",
  },
  "guides/vk.md": {
    company: "vk",
    companyLabel: "VK",
    level: "middle",
    page: "../guides/vk/",
  },
  "guides/yandex-travel.md": {
    company: "yandex-travel",
    companyLabel: "Яндекс Путешествия",
    level: "middle",
    page: "../guides/yandex-travel/",
  },
  "guides/mts-bank-aqa.md": {
    company: "mts-bank-aqa",
    companyLabel: "МТС Банк AQA",
    level: "junior",
    page: "../guides/mts-bank-aqa/",
  },
  "guides/itk-academy.md": {
    company: "itk-academy",
    companyLabel: "ITK Academy",
    level: "junior",
    page: "../guides/itk-academy/",
  },
  "guides/liga.md": {
    company: "liga",
    companyLabel: "Лига Цифровой Экономики",
    level: "middle",
    page: "../guides/liga/",
  },
  "tasks/x5-blackfriday-code-review.md": {
    company: "x5-tech",
    companyLabel: "X5 Tech",
    level: "senior",
    page: "../tasks/x5-blackfriday-code-review/",
  },
};

const topicDefs = [
  {
    id: "java-core",
    label: "Java Core",
    match: /(java core|ооп|jdk|jre|jvm|object|equals|hashcode|string|optional|stream|map vs flatmap|generics|pecs|type erasure|record|sealed|final|static|exception|try-with-resources|functional|primitive|autobox|immutable)/i,
    generic: [
      "Это работает только как compile-time ограничение и не влияет на runtime-поведение.",
      "JVM автоматически нормализует такой случай, поэтому коллекции и сравнение не страдают.",
      "Главный эффект связан только с синтаксисом; контракт объектов при этом не меняется.",
      "Это нужно в основном для unit-тестов и редко влияет на production-код.",
      "Такой подход корректен, если объект используется только внутри одного метода.",
    ],
  },
  {
    id: "collections",
    label: "Collections",
    match: /(collection|hashmap|hashset|arraylist|linkedlist|treemap|linkedhashmap|concurrenthashmap|priorityqueue|iterator|fail-fast|list\.of|load factor|bucket|resize|ключ|\bmap\b|\bset\b|\bqueue\b)/i,
    generic: [
      "Коллекция сохраняет порядок вставки и всегда даёт O(1) для любых операций.",
      "Коллизии невозможны, если hashCode распределён достаточно хорошо.",
      "Проблема решается только увеличением heap, потому что структура коллекции не меняется.",
      "В многопоточном коде достаточно использовать обычный HashMap, если чтений больше, чем записей.",
      "Изменяемые ключи безопасны, если equals переопределён корректно.",
    ],
  },
  {
    id: "jvm",
    label: "JVM",
    match: /(jvm|heap|stack|metaspace|gc|garbage|oom|outofmemory|classloader|jit|zgc|g1|shenandoah|reference|softreference|weakreference|phantomreference|memory|память|сборщик|classloading)/i,
    generic: [
      "Все объекты Java обычно размещаются в stack, а heap нужен только для массивов.",
      "GC гарантирует отсутствие утечек памяти, если в коде нет native-вызовов.",
      "JIT компилирует весь код сразу при старте приложения.",
      "Metaspace хранит локальные переменные методов и параметры вызова.",
      "Stop-the-World полностью отсутствует во всех современных сборщиках мусора.",
    ],
  },
  {
    id: "concurrency",
    label: "Concurrency / JMM",
    match: /(thread|многопоточ|jmm|volatile|synchronized|happens-before|atomic|\bcas\b|executor|completablefuture|\bwait\b|\bnotify\b|deadlock|livelock|starvation|threadlocal|virtual thread|parallelstream|forkjoin|race condition|reentrantlock|semaphore|countdownlatch|cyclicbarrier)/i,
    generic: [
      "volatile делает любую составную операцию атомарной, включая i++.",
      "synchronized нужен только для взаимного исключения и не влияет на видимость данных.",
      "parallelStream всегда быстрее последовательного stream на многоядерной машине.",
      "Deadlock можно полностью исключить, если заменить все synchronized на volatile.",
      "ThreadLocal безопасно переиспользовать в пулах потоков без очистки.",
    ],
  },
  {
    id: "spring",
    label: "Spring Boot",
    match: /(spring|\bbean\b|ioc|di|dependency|autowired|qualifier|component|\bservice\b|\brepository\b|\bcontroller\b|transactional|propagation|self-invocation|aop|proxy|springbootapplication|\bstarter\b|autoconfiguration|\bscope\b|\brest\b|exceptionhandler|\basync\b)/i,
    generic: [
      "@Transactional работает на private-методах так же, как на public, потому что аннотация читается reflection.",
      "Spring создаёт новый singleton-бин на каждый HTTP-запрос, если включён Spring Boot.",
      "Constructor injection хуже field injection, потому что усложняет unit-тесты.",
      "Self-invocation всегда проходит через proxy и открывает новую транзакцию.",
      "@SpringBootApplication отвечает только за запуск embedded Tomcat.",
    ],
  },
  {
    id: "hibernate",
    label: "Hibernate / JPA",
    match: /(hibernate|jpa|orm|entity|n\+1|persistence|dirty checking|optimistic|pessimistic|spring data|\brepository\b|jooq|jdbctemplate|cascade|lazyinitialization|fetch type|fetch strategy)/i,
    generic: [
      "Lazy-загрузка всегда лучше eager-загрузки, потому что не делает SQL-запросов.",
      "N+1 решается только увеличением connection pool.",
      "Entity безопасно использовать как ключ HashMap, даже если id появляется после persist.",
      "Dirty checking работает только при ручном вызове save для каждой сущности.",
      "Кэш второго уровня включён по умолчанию во всех Spring Boot приложениях.",
    ],
  },
  {
    id: "sql",
    label: "SQL / PostgreSQL",
    match: /(\bsql\b|postgres|postgresql|\bacid\b|isolation|mvcc|\bjoin\b|group by|\bhaving\b|\bwhere\b|\bindex\b|\bexplain\b|\banalyze\b|\bwindow\b|\bdelete\b|\btruncate\b|\buuid\b|primary key|read committed|repeatable read|serializable|\bquery\b|\bselect\b|oracle|бд|индекс|транзакц)/i,
    generic: [
      "Индекс всегда ускоряет запрос и никогда не замедляет запись.",
      "WHERE и HAVING взаимозаменяемы, если запрос использует GROUP BY.",
      "Read Uncommitted в PostgreSQL позволяет читать грязные данные.",
      "EXPLAIN ANALYZE не выполняет запрос, а только строит примерный план.",
      "TRUNCATE и DELETE полностью одинаковы по транзакционности, блокировкам и триггерам.",
    ],
  },
  {
    id: "kafka",
    label: "Kafka / Microservices",
    match: /(kafka|rabbitmq|\bconsumer\b|\bproducer\b|\btopic\b|partition|offset|\bbroker\b|consumer group|delivery|at-least-once|exactly-once|idempot|outbox|saga|circuit breaker|microservice|микросервис|kraft|zookeeper|\bretry\b)/i,
    generic: [
      "Consumer group нужен, чтобы одно сообщение гарантированно обработал каждый consumer.",
      "Exactly-once в Kafka автоматически делает весь бизнес-процесс идемпотентным.",
      "Retry без ограничений безопасен, если брокер сообщений надёжный.",
      "Saga заменяет транзакции БД и гарантирует мгновенный rollback всех сервисов.",
      "Offset всегда коммитится до обработки сообщения, чтобы не было дублей.",
    ],
  },
  {
    id: "devops",
    label: "Docker / Kubernetes / CI/CD",
    match: /(docker|kubernetes|k8s|\bpod\b|deployment|\bservice\b|probe|liveness|readiness|startup|configmap|secret|\bci\b|\bcd\b|ci\/cd|pipeline|jenkins|gitlab|github actions|dockerfile|compose|\bimage\b|container|multi-stage|linux|elk|allure)/i,
    generic: [
      "Контейнер — это неизменяемый шаблон, а image — запущенный процесс.",
      "Readiness probe перезапускает контейнер, если приложение временно не готово принимать трафик.",
      "Multi-stage build нужен только для ускорения docker pull.",
      "CI и CD означают одно и то же: запуск unit-тестов после коммита.",
      "Secret в Kubernetes автоматически шифрует данные end-to-end без дополнительных настроек.",
    ],
  },
  {
    id: "testing-aqa",
    label: "Testing / AQA",
    match: /(test|qa|aqa|junit|mockito|wiremock|testcontainers|rest assured|postman|allure|tdd|mock|spy|argumentcaptor|пирамид|тест|валидац|верификац|severity|priority|pairwise|state transition|owasp|xss|csrf|idor|bug)/i,
    generic: [
      "E2E-тесты должны покрывать большинство сценариев, потому что они ближе всего к пользователю.",
      "Mock и spy отличаются только названием, поведение у них одинаковое.",
      "Severity всегда выставляет разработчик, а Priority всегда выставляет тестировщик.",
      "Testcontainers нужен только для unit-тестов без внешних зависимостей.",
      "WireMock используется для запуска настоящего внешнего сервиса в тестовой среде.",
    ],
  },
  {
    id: "algorithms",
    label: "Algorithms / Live coding",
    match: /(алгоритм|live|coding|задача|two sum|palindrome|палиндром|fizzbuzz|binary search|бинарн|sliding window|two pointers|bfs|dfs|array|строк|анаграм|дубликат|сложност|big-o|leetcode|очеред|дерев|граф|sort)/i,
    generic: [
      "На live-coding важен только финальный код; ход рассуждений обычно не оценивают.",
      "Для любой задачи со строками достаточно отсортировать символы, это всегда оптимально.",
      "Binary search безопасно писать как (left + right) / 2 для любых int-границ.",
      "Big-O можно не обсуждать, если решение проходит на маленьком примере.",
      "HashMap всегда делает алгоритм O(1), независимо от числа операций и коллизий.",
    ],
  },
  {
    id: "system-design",
    label: "System Design",
    match: /(system design|архитектур|rate limiter|load balancer|балансировщик|коротк|short url|booking|такси|metrics|capacity estimate|оценка нагрузки|cap-|slo|high-load|дата-центр|отказоустойчив)/i,
    generic: [
      "В System Design достаточно перечислить технологии, детали нагрузки обычно вторичны.",
      "CAP-теорема означает, что можно одновременно получить сильную консистентность, доступность и устойчивость к разделению сети.",
      "Rate limiter всегда лучше хранить в локальной памяти каждого инстанса.",
      "Балансировщик не должен учитывать health checks, если сервисы работают в Kubernetes.",
      "Оценка нагрузки не нужна, если архитектура строится на микросервисах.",
    ],
  },
  {
    id: "security",
    label: "Security",
    match: /(security|oauth|openid|oidc|jwt|keycloak|token|access token|refresh token|auth|csrf|xss|sql-инъек|idor|hmac|owasp|безопасн)/i,
    generic: [
      "JWT всегда безопасен сам по себе, даже если не проверять подпись.",
      "OAuth 2.0 отвечает за аутентификацию пользователя и заменяет OpenID Connect.",
      "Refresh token можно свободно хранить в localStorage без дополнительных рисков.",
      "CSRF невозможен в REST API, если используется JSON.",
      "Keycloak нужен только для генерации паролей и не связан с OAuth/OIDC.",
    ],
  },
];

const curatedQuestions = [
  {
    id: "curated-java-core-equals-hashcode-contract",
    type: "single",
    level: "middle",
    topics: ["java-core", "collections"],
    companies: ["sber", "alfa-bank", "liga", "vk", "yandex-travel"],
    sourceRefs: [{ path: "guides/sber.md", line: 78, title: "Сбер · Java Core" }],
    prompt: "Что сломается в HashMap/HashSet, если equals переопределён, а hashCode оставлен от Object?",
    choices: [
      { id: "a", text: "Объекты могут считаться равными через equals, но попадать в разные bucket и не находиться при поиске." },
      { id: "b", text: "Код не скомпилируется, потому что Java требует переопределять оба метода одновременно." },
      { id: "c", text: "HashMap автоматически перейдёт в TreeMap и сохранит корректность поиска без деградации." },
      { id: "d", text: "Проблема возникнет только при сериализации, а коллекции продолжат работать корректно." },
    ],
    correct: ["a"],
    explanation: "Контракт требует: если a.equals(b), то hashCode должен совпадать. Иначе hash-коллекции ищут объект не в том bucket.",
    reviewLinks: [{ label: "Повторить Java Core", href: "../guides/sber/" }],
  },
  {
    id: "curated-concurrency-volatile-i-plus-plus",
    type: "single",
    level: "middle",
    topics: ["concurrency"],
    companies: ["sber", "alfa-bank", "t1-innotech", "vk"],
    sourceRefs: [{ path: "guides/alfa-bank.md", line: 190, title: "Альфа-Банк · Многопоточность" }],
    prompt: "Почему volatile не делает операцию i++ потокобезопасной?",
    choices: [
      { id: "a", text: "volatile даёт видимость и порядок вокруг volatile-доступа, но i++ остаётся последовательностью read-increment-write." },
      { id: "b", text: "volatile работает только для boolean, а для int JVM игнорирует этот модификатор." },
      { id: "c", text: "volatile гарантирует атомарность, но только если переменная объявлена внутри synchronized-блока." },
      { id: "d", text: "i++ потокобезопасен всегда, если значение переменной помещается в один машинный word." },
    ],
    correct: ["a"],
    explanation: "i++ состоит из нескольких операций. Для атомарного счётчика используют AtomicInteger или LongAdder.",
    reviewLinks: [{ label: "Повторить JMM", href: "../guides/alfa-bank/" }],
  },
  {
    id: "curated-spring-transactional-self-invocation",
    type: "scenario",
    level: "middle",
    topics: ["spring"],
    companies: ["sber", "alfa-bank", "t1-innotech", "liga"],
    sourceRefs: [{ path: "guides/liga.md", line: 254, title: "Лига · Spring" }],
    prompt: "Сервис вызывает свой метод с @Transactional через this.save(). Что произойдёт с транзакцией?",
    choices: [
      { id: "a", text: "Вызов обойдёт Spring proxy, поэтому transactional advice не применится к внутреннему вызову." },
      { id: "b", text: "Spring создаст новый proxy на каждый self-call и откроет независимую транзакцию." },
      { id: "c", text: "Транзакция откроется только если метод private; для public методов self-call не работает." },
      { id: "d", text: "Поведение зависит только от базы данных, Spring proxy на это не влияет." },
    ],
    correct: ["a"],
    explanation: "@Transactional обычно работает через proxy. Внутренний вызов this.method() не проходит через proxy.",
    reviewLinks: [{ label: "Повторить @Transactional", href: "../guides/liga/" }],
  },
  {
    id: "curated-sql-index-multi",
    type: "multi",
    level: "middle",
    topics: ["sql"],
    companies: ["alfa-bank", "vk", "yandex-travel", "liga"],
    sourceRefs: [{ path: "guides/alfa-bank.md", line: 284, title: "Альфа-Банк · SQL" }],
    prompt: "Выберите все верные утверждения про индексы PostgreSQL.",
    choices: [
      { id: "a", text: "Индекс ускоряет часть чтений, но обычно замедляет вставки и обновления." },
      { id: "b", text: "Составной индекс полезен только с учётом порядка колонок и условий запроса." },
      { id: "c", text: "Индекс всегда используется оптимизатором, если колонка есть в WHERE." },
      { id: "d", text: "EXPLAIN ANALYZE помогает увидеть фактический план и время выполнения запроса." },
      { id: "e", text: "Hash-индекс в PostgreSQL универсально лучше B-tree для сортировки и range-запросов." },
    ],
    correct: ["a", "b", "d"],
    explanation: "Индексы имеют цену записи и хранения. Планировщик выбирает индекс не всегда, а EXPLAIN ANALYZE выполняет запрос и показывает фактический план.",
    reviewLinks: [{ label: "Повторить SQL", href: "../guides/alfa-bank/" }],
  },
  {
    id: "curated-code-output-integer-cache",
    type: "code_output",
    level: "junior",
    topics: ["java-core"],
    companies: ["alfa-bank", "sberseasons"],
    sourceRefs: [{ path: "guides/alfa-bank.md", line: 127, title: "Альфа-Банк · Что выведет" }],
    prompt: "Что выведет код?\n\n```java\nInteger a = Integer.valueOf(127);\nInteger b = Integer.valueOf(127);\nInteger c = Integer.valueOf(128);\nInteger d = Integer.valueOf(128);\nSystem.out.println(a == b);\nSystem.out.println(c == d);\n```",
    choices: [
      { id: "a", text: "true и false: значения от -128 до 127 обычно берутся из IntegerCache." },
      { id: "b", text: "false и false: оператор == всегда сравнивает значения wrapper-типов." },
      { id: "c", text: "true и true: Integer.valueOf всегда возвращает один и тот же объект." },
      { id: "d", text: "false и true: кэш работает только для значений больше 127." },
    ],
    correct: ["a"],
    explanation: "IntegerCache кеширует небольшой диапазон, обычно -128..127. Для сравнения значений wrapper-типов используют equals.",
    reviewLinks: [{ label: "Повторить Java Core", href: "../guides/alfa-bank/" }],
  },
  {
    id: "curated-kafka-delivery",
    type: "single",
    level: "middle",
    topics: ["kafka"],
    companies: ["alfa-bank", "t1-innotech", "vk"],
    sourceRefs: [{ path: "guides/alfa-bank.md", line: 318, title: "Альфа-Банк · Kafka" }],
    prompt: "Consumer обработал сообщение, но упал до commit offset. Что вероятнее всего произойдёт при at-least-once?",
    choices: [
      { id: "a", text: "Сообщение может быть обработано повторно, поэтому бизнес-операция должна быть идемпотентной." },
      { id: "b", text: "Kafka удалит сообщение из partition, потому что обработка уже началась." },
      { id: "c", text: "Consumer group потеряет partition до ручного reset offset." },
      { id: "d", text: "Exactly-once автоматически отменит изменения во внешней базе данных." },
    ],
    correct: ["a"],
    explanation: "At-least-once допускает повторную доставку. Поэтому важны идемпотентность, транзакционная запись результата и аккуратный commit offset.",
    reviewLinks: [{ label: "Повторить Kafka", href: "../guides/alfa-bank/" }],
  },
  {
    id: "curated-code-review-random",
    type: "code_review",
    level: "senior",
    topics: ["concurrency", "algorithms"],
    companies: ["x5-tech"],
    sourceRefs: [{ path: "tasks/x5-blackfriday-code-review.md", line: 90, title: "X5 Tech · shared Random" }],
    prompt: "На code review найден shared java.util.Random внутри parallelStream. Какой комментарий наиболее полезен?",
    choices: [
      { id: "a", text: "Random формально thread-safe, но общий seed создаёт contention; лучше ThreadLocalRandom или RandomGenerator." },
      { id: "b", text: "Random не thread-safe, поэтому код всегда будет падать с ConcurrentModificationException." },
      { id: "c", text: "parallelStream создаёт новый Random на каждый элемент, поэтому проблемы производительности нет." },
      { id: "d", text: "Нужно заменить Random на SecureRandom для любой бизнес-логики со скидками." },
    ],
    correct: ["a"],
    explanation: "У shared Random есть синхронизация/CAS на общем состоянии. В параллельной обработке это может убить выигрыш от parallelStream.",
    reviewLinks: [{ label: "Разбор X5 Tech", href: "../tasks/x5-blackfriday-code-review/" }],
  },
  {
    id: "curated-aqa-rest-assured",
    type: "scenario",
    level: "junior",
    topics: ["testing-aqa"],
    companies: ["mts-bank-aqa"],
    sourceRefs: [{ path: "guides/mts-bank-aqa.md", line: 222, title: "МТС Банк AQA · Rest Assured" }],
    prompt: "API-тесты на Rest Assured дублируют baseUrl, headers и auth в каждом тесте. Что лучше сделать?",
    choices: [
      { id: "a", text: "Вынести общую RequestSpecification и переиспользовать её в тестах." },
      { id: "b", text: "Оставить дублирование: так каждый тест становится полностью независимым." },
      { id: "c", text: "Заменить Rest Assured на Selenium, потому что headers относятся к UI." },
      { id: "d", text: "Перенести все проверки в Postman и убрать автотесты из CI." },
    ],
    correct: ["a"],
    explanation: "RequestSpecification убирает дубли, делает тесты читаемее и снижает риск несовпадения конфигурации.",
    reviewLinks: [{ label: "Повторить AQA", href: "../guides/mts-bank-aqa/" }],
  },
];

const quizzes = [
  { id: "all-java-interview", kind: "topic", title: "Все вопросы Java interview", description: "Полная самопроверка по всей базе JavaJub.", topics: [], companies: [] },
  ...topicDefs.map((topic) => ({
    id: topic.id,
    kind: "topic",
    title: topic.label,
    description: `Самопроверка по теме: ${topic.label}.`,
    topics: [topic.id],
    companies: [],
  })),
  { id: "sber-middle", kind: "company", title: "Сбер Java Middle readiness", description: "Готовность к Java Middle интервью в Сбер.", topics: [], companies: ["sber"] },
  { id: "sberseasons-trainee", kind: "company", title: "SberSeasons Java Trainee", description: "База для стажировки SberSeasons.", topics: [], companies: ["sberseasons"] },
  { id: "alfa-bank-middle", kind: "company", title: "Альфа-Банк Java Middle", description: "Spring Boot, Kafka, PostgreSQL, live-coding.", topics: [], companies: ["alfa-bank"] },
  { id: "t1-innotech-middle", kind: "company", title: "Т1 Иннотех Java Junior/Middle", description: "Enterprise backend, SQL, Kafka и code review.", topics: [], companies: ["t1-innotech"] },
  { id: "vk-middle", kind: "company", title: "VK Java Middle", description: "Java 21, алгоритмы, high-load и сети.", topics: [], companies: ["vk"] },
  { id: "yandex-travel-middle", kind: "company", title: "Яндекс Путешествия Java Middle", description: "Алгоритмы, backend и System Design.", topics: [], companies: ["yandex-travel"] },
  { id: "mts-bank-aqa-junior", kind: "company", title: "МТС Банк AQA Java Junior", description: "API-тесты, Rest Assured, SQL и очереди.", topics: [], companies: ["mts-bank-aqa"] },
  { id: "itk-academy-junior", kind: "company", title: "ITK Academy Java Junior", description: "Junior база, Spring basics и pet-проект.", topics: [], companies: ["itk-academy"] },
  { id: "liga-middle", kind: "company", title: "Лига Java Middle", description: "Java 11, Spring, Hibernate, SQL и тесты.", topics: [], companies: ["liga"] },
  { id: "x5-code-review-senior", kind: "company", title: "X5 Tech Senior code review", description: "Concurrency, Random, parallelStream и production-мышление.", topics: [], companies: ["x5-tech"] },
];

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^a-zа-я0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function hash(value) {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function normalizeQuestion(value) {
  return value
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[`"'«»().,!?—–:;]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanInline(value) {
  return value
    .replace(/^\s*[-*_`]+|[-*_`]+\s*$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function trimAnswer(value) {
  const cleaned = cleanInline(value)
    .replace(/^Ответ:\s*/i, "")
    .replace(/^_+|_+$/g, "")
    .trim();
  if (cleaned.length <= 230) return cleaned;
  const clipped = cleaned.slice(0, 220);
  const lastStop = Math.max(clipped.lastIndexOf("."), clipped.lastIndexOf(";"), clipped.lastIndexOf(","));
  return `${clipped.slice(0, lastStop > 120 ? lastStop : 220).trim()}...`;
}

function formatPrompt(raw) {
  const value = cleanInline(raw).replace(/[.。]+$/g, "").trim();
  if (/[?？]$/.test(value)) return value;
  if (/ vs\.? | против /i.test(value)) {
    return `В чём разница: ${value}?`;
  }
  if (/^(ACID|MVCC|TDD|JWT|OAuth|OIDC|JPA|ORM|CAS|JIT|GC|OOM|ThreadLocal|CompletableFuture|Circuit Breaker|Consumer Group)$/i.test(value)) {
    return `Что нужно знать про ${value}?`;
  }
  if (value.length < 64 && /^[\p{L}0-9@+./ -]+$/u.test(value)) {
    return `Что такое ${value}?`;
  }
  return `${value}?`;
}

function currentHeading(headings) {
  return headings.filter(Boolean).slice(-2).join(" · ");
}

function matchTopicIds(text) {
  return topicDefs.filter((topic) => topic.match.test(text)).map((topic) => topic.id);
}

function topicIdsFor(prompt, heading = "") {
  const promptMatched = matchTopicIds(prompt);
  if (promptMatched.length > 0) return prioritizeTopics([...new Set(promptMatched)], prompt);

  const headingMatched = matchTopicIds(heading);
  if (headingMatched.length > 0) return prioritizeTopics([...new Set(headingMatched)], heading);

  const matched = matchTopicIds(`${prompt} ${heading}`);
  if (matched.length > 0) return prioritizeTopics([...new Set(matched)], `${prompt} ${heading}`);
  return ["java-core"];
}

function prioritizeTopics(topics, text) {
  const priority = [
    [/rest assured|wiremock|junit|mockito|testcontainers|тест-дизайн|severity|priority|aqa|qa/i, "testing-aqa"],
    [/oauth|openid|oidc|jwt|keycloak|csrf|xss|owasp|security|безопасн/i, "security"],
    [/kafka|rabbitmq|consumer|producer|partition|offset|broker|outbox|saga|circuit breaker/i, "kafka"],
    [/hibernate|jpa|entity|n\+1|persistence|dirty checking|optimistic|pessimistic|cascade|orm|jooq|jdbctemplate|fetch type|fetch strategy/i, "hibernate"],
    [/spring|bean|transactional|autowired|qualifier|aop|proxy|springbootapplication/i, "spring"],
    [/\bsql\b|postgres|\bjoin\b|group by|\bhaving\b|\bwhere\b|\bindex\b|\bexplain\b|mvcc|\bacid\b|isolation/i, "sql"],
    [/docker|kubernetes|k8s|pod|deployment|service|probe|pipeline|ci\/cd/i, "devops"],
    [/thread|volatile|synchronized|happens-before|atomic|executor|completablefuture|deadlock|threadlocal|parallelstream/i, "concurrency"],
    [/hashmap|arraylist|linkedlist|treemap|hashset|collection|iterator|priorityqueue/i, "collections"],
    [/heap|stack|metaspace|gc|classloader|jit|oom|zgc|jvm/i, "jvm"],
    [/system design|rate limiter|load balancer|capacity|архитектур/i, "system-design"],
    [/алгоритм|live|coding|palindrome|fizzbuzz|binary search|bfs|dfs|leetcode/i, "algorithms"],
  ];
  const ordered = [];
  for (const [pattern, topic] of priority) {
    if (topics.includes(topic) && pattern.test(text)) ordered.push(topic);
  }
  for (const topic of topics) {
    if (!ordered.includes(topic)) ordered.push(topic);
  }
  return ordered;
}

function inferType(prompt, sourcePath, heading) {
  const text = `${prompt} ${sourcePath} ${heading}`.toLowerCase();
  if (/code review|найти проблем|баг|review|x5|parallelstream/.test(text)) return "code_review";
  if (/что выведет|выведет код|integer cache|stream api — ленивость/.test(text)) return "code_output";
  if (/кейс|что делать|чем опас|как исправ|что случ|почему|когда использовать|как обеспечить/.test(text)) return "scenario";
  return "single";
}

function extractAnswer(lines, startIndex) {
  for (let offset = 1; offset <= 4; offset += 1) {
    const line = lines[startIndex + offset];
    if (!line) continue;
    const trimmed = line.trim();
    if (trimmed === "") continue;
    if (/^_.*_$/.test(trimmed) || /^Ответ:/i.test(trimmed)) {
      return trimAnswer(trimmed);
    }
    if (/^```/.test(trimmed) || /^[-#|>]/.test(trimmed)) break;
    if (trimmed.length > 20 && trimmed.length < 260) {
      return trimAnswer(trimmed);
    }
    break;
  }
  return "";
}

function extractCandidates() {
  const byKey = new Map();
  for (const sourcePath of sourceFiles) {
    const abs = path.join(root, sourcePath);
    const text = fs.readFileSync(abs, "utf8");
    const lines = text.split(/\r?\n/);
    const headings = [];
    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      const headingMatch = /^(#{2,3})\s+(.+?)\s*$/.exec(line);
      if (headingMatch) {
        const level = headingMatch[1].length;
        headings[level - 2] = cleanInline(headingMatch[2]);
        headings.length = level - 1;
      }

      const questionMatch = /^-\s+\*\*(.+?)\*\*/.exec(line);
      if (!questionMatch) continue;

      const rawPrompt = cleanInline(questionMatch[1]);
      if (rawPrompt.length < 4 || /javajub pro/i.test(rawPrompt)) continue;
      const answer = extractAnswer(lines, i);
      if (answer.length < 12) continue;

      const meta = sourceMeta[sourcePath];
      const heading = currentHeading(headings);
      const key = normalizeQuestion(rawPrompt);
      const topics = topicIdsFor(rawPrompt, heading);
      const existing = byKey.get(key);
      const sourceRef = {
        path: sourcePath,
        line: i + 1,
        title: `${meta.companyLabel} · ${heading || "гайд"}`,
      };

      if (existing) {
        existing.sourceRefs.push(sourceRef);
        existing.companies = [...new Set([...existing.companies, meta.company])];
        existing.topics = [...new Set([...existing.topics, ...topics])];
        if (answer.length > existing.correctAnswer.length && answer.length < 220) {
          existing.correctAnswer = answer;
        }
        continue;
      }

      byKey.set(key, {
        rawPrompt,
        prompt: formatPrompt(rawPrompt),
        correctAnswer: answer,
        topics,
        companies: [meta.company],
        sourceRefs: [sourceRef],
        level: meta.level,
        type: inferType(rawPrompt, sourcePath, heading),
        reviewLinks: [{ label: meta.companyLabel, href: meta.page }],
      });
    }
  }
  return [...byKey.values()];
}

function questionSubject(item) {
  return item.rawPrompt
    .replace(/[?。.!]+$/g, "")
    .replace(/^(что такое|зачем нужен|зачем нужна|как работает|как устроен|чем отличается|почему|когда использовать)\s+/i, "")
    .trim();
}

// (template-based distractor generation removed — answers come from tools/quiz-answers.json)


function withChoices(item, index) {
  const key = normalizeQuestion(item.rawPrompt);
  const entry = answerBank[key];
  if (!entry) missingAnswerKeys.add(key);
  const distractors = entry ? entry.distractors : ["", "", ""];
  const explanation = entry && entry.explanation ? entry.explanation : item.correctAnswer;

  const correctId = ["a", "b", "c", "d"][hash(item.prompt) % 4];
  const ids = ["a", "b", "c", "d"];
  const choices = [];
  let distractorIndex = 0;
  for (const id of ids) {
    choices.push({
      id,
      text: id === correctId ? item.correctAnswer : distractors[distractorIndex++],
    });
  }

  const slug = slugify(item.rawPrompt) || `q-${index + 1}`;
  return {
    id: `auto-${slug}-${String(index + 1).padStart(3, "0")}`,
    type: item.type,
    level: item.level,
    topics: item.topics,
    companies: item.companies,
    sourceRefs: item.sourceRefs,
    prompt: item.prompt,
    choices,
    correct: [correctId],
    explanation,
    reviewLinks: item.reviewLinks,
  };
}

function uniqueById(questions) {
  const seen = new Map();
  for (const question of questions) {
    if (!seen.has(question.id)) {
      seen.set(question.id, question);
      continue;
    }
    let suffix = 2;
    while (seen.has(`${question.id}-${suffix}`)) suffix += 1;
    seen.set(`${question.id}-${suffix}`, { ...question, id: `${question.id}-${suffix}` });
  }
  return [...seen.values()];
}

function writeJson(name, value) {
  fs.writeFileSync(path.join(outDir, name), `${JSON.stringify(value, null, 2)}\n`);
}

function selectForQuiz(allQuestions, quiz) {
  if (quiz.id === "all-java-interview") return allQuestions;
  return allQuestions.filter((question) => {
    const topicMatch = quiz.topics.length === 0 || quiz.topics.some((topic) => question.topics.includes(topic));
    const companyMatch = quiz.companies.length === 0 || quiz.companies.some((company) => question.companies.includes(company));
    return topicMatch && companyMatch;
  });
}

function build() {
  fs.mkdirSync(outDir, { recursive: true });
  const extracted = extractCandidates();
  const generated = extracted.map((item, index) => withChoices(item, index));

  if (missingAnswerKeys.size > 0) {
    console.error(`\n${missingAnswerKeys.size} вопрос(ов) без авторских вариантов ответа в tools/quiz-answers.json:`);
    for (const key of missingAnswerKeys) console.error(`  - ${key}`);
    console.error("\nСгенерируйте их: node tools/dump-questions.mjs → workflow → node tools/merge-answers.mjs <result>.\n");
    process.exit(1);
  }

  const allQuestions = uniqueById([...curatedQuestions, ...generated]).sort((a, b) => a.id.localeCompare(b.id));

  writeJson("full-bank.json", {
    id: "full-bank",
    title: "Канонический банк вопросов JavaJub",
    generatedFrom: sourceFiles,
    telegramUrl,
    questionCount: allQuestions.length,
    questions: allQuestions,
  });

  const catalog = {
    title: "JavaJub self-check quizzes",
    telegramUrl,
    modes: [
      { id: "express", title: "Express", questionCount: 15, description: "Быстрая проверка перед повторением." },
      { id: "standard", title: "Standard", questionCount: 30, description: "Сбалансированный тест по теме или компании." },
      { id: "interview", title: "Interview simulation", questionCount: 60, description: "Длинный прогон перед собеседованием." },
      { id: "weak", title: "Weak areas retry", questionCount: 20, description: "Повтор вопросов из слабых тем последнего теста." },
    ],
    quizzes: [],
  };

  for (const quiz of quizzes) {
    const questions = selectForQuiz(allQuestions, quiz);
    const file = `${quiz.id}.json`;
    writeJson(file, {
      id: quiz.id,
      title: quiz.title,
      kind: quiz.kind,
      description: quiz.description,
      telegramUrl,
      questionCount: questions.length,
      questions,
    });
    catalog.quizzes.push({
      id: quiz.id,
      kind: quiz.kind,
      title: quiz.title,
      description: quiz.description,
      file,
      questionCount: questions.length,
      topics: quiz.topics,
      companies: quiz.companies,
    });
  }

  writeJson("catalog.json", catalog);
  console.log(`Generated ${allQuestions.length} canonical questions and ${catalog.quizzes.length} quizzes.`);
}

export { extractCandidates, normalizeQuestion, formatPrompt, questionSubject };

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  build();
}
