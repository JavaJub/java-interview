# Собес в VK (группа балансеров, One-cloud) · Java Middle

Вопросы, задачи и подготовка к live-coding и техническому интервью.

**Темы:** Java 21 · Spring Boot 3 · Kafka · PostgreSQL · Kubernetes · gRPC · HAProxy · Docker

[← Ко всем гайдам](../README.md) · [Канал JavaJub в Telegram](https://t.me/java_jub)

---

## 1. Про VK и группу балансеров

VK — одна из крупнейших IT-компаний России (15 000+ сотрудников, 200+ продуктов, 95% аудитории рунета). Центр Технологий VK отвечает за IT-инфраструктуру всех продуктов: ВКонтакте, ОК, Дзен, Mail.ru, RuStore, VK Play. One-cloud — технологический фундамент VK: единая среда запуска приложений, хранилищ, баз данных и сервисов. Группа балансеров занимается управлением и администрированием L3- и L4- балансеров облака. Через них идёт ВЕСЬ сервисный и пользовательский трафик — это tier 1 уровень стабильности.

### Чем занимается группа балансеров

- Разработка Java-бэкенда инфраструктурного сервиса для регулирования трафика в дата-центрах

- Написание Java-клиентов для взаимодействия с другими инфраструктурными сервисами

- Создание API с авторизацией для взаимодействия пользователей через UI

- Управление L3- и L4-балансеров: чтобы другие разработчики не думали о тонкостях балансировки

- Поддержание высочайшего уровня стабильности (tier 1) — любой сбой = падение всех продуктов VK

### Как устроен процесс найма

По отзывам кандидатов (DreamJob, Habr 879068, Habr 1006022): VK проводит единое техническое интервью для всех Java-вакансий, после которого распределяет по командам. Процесс похож на Яндекс, но обычно быстрее.

| Этап | Формат | Длительность |
| --- | --- | --- |
| HR-скрининг | Zoom/Telegram, мотивация, ЗП, | 20–30 мин |

стек

| Техническое интервью | Теория + live-coding + SQL | 60–90 мин |
| --- | --- | --- |
| Алгоритмическая секция | Live-coding, 2–3 задачи | 45–60 мин |
| Архитектурная секция | System Design, Miro + Zoom | 45–60 мин |
| Финал с командой | Знакомство с тимлидом и | 30–60 мин |

командой

> **ФИШКА.** Единое интервью В VK техническое интервью общее для всех Java-вакансий. HR предлагает 2–3 команды на выбор, но тех-собес один. Это значит: готовиться нужно к общей Java-базе, а не к специфике балансеров. Специфика обсуждается на финале с командой.

ВНИМАНИЕ · Что бросается в глаза

По отзывам на Habr: VK спрашивает алгоритмы и структуры данных даже у Middle. Бинарный поиск, хэш-таблицы, деревья, очереди с приоритетом — будьте готовы. На этапе SQL всё обычно проходит хорошо, а вот алгоритмы — главный фильтр.

## 2. Стек по вакансии

Группа балансеров — часть One-cloud, разработка ведётся на современном стеке без устаревшего кода.

### Основной стек

- Java 21 — последняя LTS-версия, Virtual Threads, Records, Pattern Matching

- Spring / Spring Boot 3 — основной фреймворк

- Kafka — брокер сообщений для межсервисного взаимодействия

- PostgreSQL — основная СУБД

- Kubernetes — оркестрация контейнеров (One-cloud построен поверх K8s)

- Docker / Docker Compose — контейнеризация

- gRPC — внутренний RPC между инфраструктурными сервисами

- Prometheus + Grafana — мониторинг и метрики

- HAProxy / Nginx / Envoy — L3/L4/L7 балансеры (предметная область команды)

### Будет плюсом

- Понимание сетевых протоколов: TCP/IP, UDP, HTTP/2, VRRP

- Опыт с L3/L4/L7 балансировкой (HAProxy, Nginx, Envoy, IPVS)

- Опыт работы с OpenStack, облачными платформами

- Ant, Gradle — системы сборки (указаны в вакансии)

- Навыки автоматизации тестирования

- Опыт разработки и интеграции сложных внутренних продуктов

> **СОВЕТ.** Про Java 21 VK использует Java 21 — это важно. Готовьтесь к вопросам про Virtual Threads (Project Loom), Records, Sealed Classes, Pattern Matching for switch. Это не «будет плюсом», а рабочий стек.

## 3. Java Core — что точно спросят

equals/hashCode, HashMap, Stream API, многопоточность — must-have. VK спрашивает глубже среднего: устройство JVM, GC, ссылочные типы.

### Базовые вопросы

- **JDK, JRE, JVM.**
  _JVM — виртуальная машина (исполняет байт-код). JRE = JVM + библиотеки. JDK = JRE + инструменты. С Java 9 JRE отдельно не поставляется. Java 21: Virtual Threads, Records, Sealed Classes, Pattern Matching._

- **Области памяти JVM.**
  _Heap (Eden/Survivor/Old), Stack (фреймы), Metaspace (метаданные классов, раньше PermGen), PC Register, Native Method Stack, CodeCache (JIT). GC работает только с Heap._

- **Контракт equals/hashCode.**
  _a.equals(b) → hashCode одинаков. Обратное необязательно. Переопределяешь один — переопределяй оба. Нарушение ломает HashMap/HashSet: объект «теряется» при изменении поля в hashCode._

- **Что сломается, если hashCode() — константа?**
  _Все в одном bucket. Java 8+: при 8 коллизиях И capacity ≥ 64 → red-black tree O(log n) вместо O(1)._

- **String Pool и immutability.**
  _Pool в heap — уникальные литералы. new String() — вне пула. intern() добавляет. Immutability: безопасность, потокобезопасность, кэширование hashCode, пул._

- **Generics: type erasure, PECS.**
  _Type erasure: в рантайме нет типового параметра. PECS: Producer Extends (читать), Consumer Super (писать). Wildcard <?> — только чтение как Object._

- **WeakReference / SoftReference / PhantomReference.**
  _Weak — GC собирает при первой сборке (WeakHashMap). Soft — при нехватке памяти (кэши). Phantom — постфинализационная очистка. ReferenceQueue для уведомлений._

- **Функциональные интерфейсы.**
  _Один абстрактный метод. Function<T,R>, Predicate<T>, Consumer<T>, Supplier<T>, UnaryOperator<T>, BiFunction, Comparator, Runnable, Callable._

- **Stream API.**
  _Промежуточные (ленивые): filter, map, flatMap, sorted, distinct. Терминальные: collect, forEach, count, reduce, toList. Обработка вертикальная. Стрим одноразовый._

- **Virtual Threads (Java 21).**
  _Лёгкие потоки, управляемые JVM (не ОС). Thread.ofVirtual().start(). Миллионы потоков без проблем. НЕ подходят для CPU-bound задач (нет preemption). Идеальны для I/O-bound (сетевые запросы, БД). Executors.newVirtualThreadPerTaskExecutor()._

- **Records (Java 16+).**
  _Иммутабельные data-классы: record Point(int x, int y) {}. Автоматически: конструктор, getters, equals, hashCode, toString. Нельзя наследовать (implicitly final). Можно реализовывать интерфейсы._

- **Sealed Classes (Java 17+).**
  _Ограничение иерархии наследования: sealed class Shape permits Circle, Square. Компилятор гарантирует exhaustive switch. Связка с Pattern Matching for switch (Java 21)._

- final: класс, метод, поле.

_Класс — нельзя наследовать. Метод — нельзя переопределить. Поле — нельзя переприсвоить (мутабельное содержимое можно менять). effectively final — для лямбд._

### Задачи «Что выведет?»

Тест 1. Integer cache

```java
Integer a = 127, b = 127;
System.out.println(a == b); // true

Integer c = 128, d = 128;
System.out.println(c == d); // false
```

IntegerCache: -128..127. Для 127 — один объект. Для 128 — два разных. Мораль: для объектов — equals().

Тест 2. String Pool

```java
String s1 = "hello";
String s2 = "hello";
String s3 = new String("hello");

System.out.println(s1 == s2);    // true (оба из пула)
System.out.println(s1 == s3);    // false (s3 — новый объект)
System.out.println(s1.equals(s3)); // true (содержимое одинаковое)
```

Тест 3. Stream — ленивость List.of(1,2,3,4,5).stream() .peek(x -> System.out.print("A" + x + " ")) .filter(x -> x % 2 == 0) .peek(x -> System.out.print("B" + x + " "))

```java
  .toList();
// A1 A2 B2 A3 A4 B4 A5
```

Вертикальная обработка: каждый элемент проходит всю цепочку. Нечётные не проходят filter → B не печатается.

> **СОВЕТ.** Про Java 21 VK использует Java 21. Готовьтесь к вопросам про Virtual Threads, Records, Sealed Classes, Pattern Matching for switch. Пример: «Чем Virtual Thread отличается от Platform Thread? Когда НЕ стоит использовать Virtual Threads?» — CPU-bound задачи, synchronized блоки (pinning).

## 4. Коллекции

HashMap — абсолютный чемпион вопросов. В VK спрашивают глубоко: treeify threshold, resize, null-ключи, ConcurrentHashMap внутренности.

- **HashMap — устройство.**
  _Node<K,V>[]. Размер — степень двойки (default 16). Индекс: (n-1) & hash(key). Коллизии — список. Java 8+: TREEIFY_THRESHOLD=8 И capacity ≥ 64 → red-black tree._

- **load factor и resize.**
  _0.75 по умолчанию. size >= capacity * loadFactor → resize (вдвое + перехеширование всех). Совет: initialCapacity = expectedSize / 0.75 + 1._

- **HashMap vs ConcurrentHashMap.**
  _HashMap: не потокобезопасен, null-ключ. ConcurrentHashMap: Java 8+ CAS + synchronized на головах бакетов. null запрещён. computeIfAbsent атомарен._

- **ArrayList vs LinkedList.**
  _ArrayList: O(1) доступ, CPU-кэш. LinkedList: O(1) вставка в начало. На практике ArrayList всегда лучше._

- **TreeMap vs LinkedHashMap.**
  _TreeMap: red-black tree, O(log n), отсортирован. LinkedHashMap: порядок вставки / accessOrder=true для LRU._

- **PriorityQueue.**
  _Min-heap по умолчанию. O(log n) offer/poll, O(1) peek. Для Top-K задач. Comparator для кастомного порядка._

- **Почему Tree индекс в БД, а не Hash?**
  _Хотя Hash = O(1), Tree (B-tree) поддерживает диапазонные запросы, сортировку, BETWEEN, LIKE 'abc%'. Hash — только точное совпадение._

## 5. Многопоточность и JMM

В VK многопоточность критична — балансеры обрабатывают весь трафик. volatile vs synchronized спрашивают на каждом собесе. ThreadPoolExecutor, CAS, пулы потоков — обязательно.

- **synchronized.**
  _Захват монитора. Instance → this. Static → Class. Reentrant (счётчик). Mutual exclusion + happens-before._

- **volatile.**
  _Видимость + запрет reordering. НЕ атомарность i++. Для атомарных — AtomicInteger/LongAdder._

- **happens-before.**
  _unlock → lock. volatile write → read. Thread.start() → первая инструкция. join(). final-поля после конструктора._

- **ConcurrentHashMap Java 8.**
  _CAS + synchronized на головах бакетов. Treeify при 8 коллизиях. null запрещён. computeIfAbsent атомарен._

- **ThreadPoolExecutor.**
  _corePoolSize, maxPoolSize, keepAliveTime, workQueue, threadFactory, rejectedExecutionHandler. newCachedThreadPool опасен — OOM._

- **Deadlock.**
  _Два+ потока ждут друг друга. Условия Коффмана. Решение: упорядочить захват мониторов, tryLock с таймаутом. Обнаружение: jstack._

- **CompletableFuture.**
  _thenApply (map), thenCompose (flatMap), thenCombine (join двух). exceptionally. Async-варианты в ForkJoinPool._

- **Virtual Threads и synchronized.**
  _Virtual Thread на synchronized → pinning (привязка к platform thread). Решение: ReentrantLock вместо synchronized. Это частый вопрос для Java 21._

ЛОВУШКА · volatile counter++ volatile long counter; counter++ — НЕВЕРНО (три операции). Три корректных варианта: synchronized, AtomicLong.incrementAndGet(), LongAdder.increment(). LongAdder лучше при высоком contention.

## 6. Spring и Spring Boot

Spring Boot 3 — основной фреймворк VK для Java-сервисов. Спрашивают: прокси, жизненный цикл, автоконфигурация, транзакции.

- **IoC и DI.**
  _IoC — контейнер управляет. DI — зависимости внедряются. Constructor injection лучший: final, явные зависимости, тестируемость._

- **Жизненный цикл бина.**
  _BeanDefinition → инстанцирование → DI → Aware → BPP.before → @PostConstruct → InitializingBean init-method → BPP.after → ГОТОВ → @PreDestroy → destroy._

- **@Transactional.**
  _Прокси (JDK/CGLIB). Открывает транзакцию, commit/rollback. self-call минует прокси. Rollback на RuntimeException/Error; checked — нужен rollbackFor._

- **Propagation.**
  _REQUIRED (default), REQUIRES_NEW, NESTED, SUPPORTS, MANDATORY, NOT_SUPPORTED, NEVER._

- **@SpringBootApplication.**
  _@Configuration + @EnableAutoConfiguration + @ComponentScan._

- **Scope: prototype в singleton.**
  _Prototype-бин создастся один раз при инжекте. Решение: Provider<T>, ObjectFactory<T>, @Lookup._

- **Spring Boot 3 + Java 21.**
  _GraalVM native image, Virtual Threads support (spring.threads.virtual.enabled=true), Jakarta EE вместо javax._

## 7. Базы данных и SQL

PostgreSQL — основная БД в VK для Java-сервисов. SQL спрашивают отдельно: JOIN, GROUP BY, HAVING, индексы, транзакции.

- **ACID.**
  _Atomicity, Consistency, Isolation, Durability. WAL в PostgreSQL для Durability._

- **Уровни изоляции.**
  _READ_UNCOMMITTED, READ_COMMITTED (default PG), REPEATABLE_READ, SERIALIZABLE. Аномалии: dirty/non-repeatable/phantom read._

- **Индексы PostgreSQL.**
  _B-tree (default), Hash, GIN (JSONB, full-text), GiST (геометрия), BRIN (большие таблицы). Покрывающий (INCLUDE)._

- **Почему B-tree, а не Hash?**
  _Hash: O(1) только =. B-tree: O(log n) но поддерживает <, >, BETWEEN, ORDER BY, LIKE 'abc%'. Поэтому B-tree — default._

- **Порядок колонок в составном индексе.**
  _Leftmost prefix rule. INDEX (a, b, c) используется для WHERE a=, WHERE a= AND b=, но НЕ для WHERE b= или WHERE c=._

- **EXPLAIN ANALYZE.**
  _Seq Scan, Index Scan, Bitmap Heap Scan. Nested Loop vs Hash Join. Rows Removed by Filter. estimated vs actual rows._

- **Оконные функции.**
  _ROW_NUMBER(), RANK(), LAG/LEAD, SUM OVER (PARTITION BY ... ORDER BY ...). Агрегация без сворачивания строк._

### SQL-задачи

Вторая по величине зарплата

```java
SELECT DISTINCT salary FROM employees
ORDER BY salary DESC LIMIT 1 OFFSET 1;
```

Идемпотентное зачисление через Kafka Из собесов на Java Middle: поручения на зачисление денег приходят по Kafka. Kafka гарантирует доставку, но НЕ единственность. Как обеспечить, что деньги зачислятся ровно один раз?

-- Таблица идемпотентности

```sql
CREATE TABLE processed_events (
    event_id UUID PRIMARY KEY,
    processed_at TIMESTAMP DEFAULT NOW()
)
;

-- В транзакции с бизнес-логикой:
INSERT INTO processed_events (event_id)
VALUES (:eventId)
ON CONFLICT (event_id) DO NOTHING;
-- Если вставка прошла — обработать
-- Если конфликт — skip (уже обработано)
```

## 8. Kafka и микросервисы

Kafka указана в стеке VK для Java-сервисов. Для группы балансеров это межсервисная коммуникация между инфраструктурными компонентами.

- **Kafka — зачем?**
  _Распределённый лог-ориентированный брокер. Topic → Partition → Offset. Данные не удаляются после прочтения (retention). Асинхронность, буферизация, аудит._

- **Consumer Group.**
  _Каждая партиция — ровно один consumer из группы. Больше партиций → больше параллелизма. Rebalancing при изменении состава._

- **Гарантии доставки.**
  _at-most-once, at-least-once (default), exactly-once (idempotent producer + transactional). В проде: at-least-once + идемпотентность consumer._

- **Идемпотентный consumer.**
  _processed_events(event_id UUID PK). INSERT ON CONFLICT DO NOTHING. В транзакции с бизнес-логикой. Или upsert по бизнес-ключу._

- **Circuit Breaker.**
  _Защита от каскадных сбоев. CLOSED → OPEN → HALF_OPEN. Resilience4j. fallback-ответ при недоступности downstream._

- **Saga-паттерн.**
  _Распределённые транзакции через цепочку локальных + компенсации. Choreography vs Orchestration._

## 9. Сети и балансировка

Группа балансеров — это про сети. Даже если глубокие сетевые вопросы будут на финале с командой, базовое понимание L3/L4/L7 балансировки ожидается.

- **L3 vs L4 vs L7 балансировка.**
  _L3 (сетевой): IP-маршрутизация, ECMP. L4 (транспортный): TCP/UDP, NAT, по IP:port без разбора содержимого. L7 (прикладной): HTTP-заголовки, URL, cookies. L4 быстрее (меньше overhead), L7 гибче._

- **HAProxy vs Nginx vs Envoy.**
  _HAProxy: L4/L7, production-proven, простая конфигурация. Nginx: L7, статика + reverse proxy. Envoy: L4/L7, gRPC, service mesh (Istio). В VK — все три в разных сценариях._

- **Health checks.**
  _Active: балансер периодически проверяет backend (HTTP GET /health, TCP connect). Passive: считает ошибки от реальных запросов. Комбинация — best practice._

- **VRRP.**
  _Virtual Router Redundancy Protocol. active-standby пара балансеров. При падении primary — мгновенное переключение, IP не меняется. Используется в VK Cloud._

- **Sticky sessions.**
  _Привязка клиента к конкретному backend. По cookie, IP, header. Проблема: неравномерная нагрузка при скейлинге. Решение: shared session storage (Redis) или stateless (JWT)._

- **Connection draining.**
  _При выводе backend из ротации — дождаться завершения активных соединений, а не обрывать. Graceful shutdown._

> **ФИШКА.** Почему это важно Через балансеры группы идёт ВЕСЬ трафик VK — ВКонтакте, ОК, Дзен, Mail.ru. Это tier 1: любой сбой = даунтайм всех продуктов. На финале с командой точно спросят про L3/L4 разницу и как вы думаете о стабильности.

## 10. Docker, Kubernetes, CI/CD

One-cloud VK построен поверх Kubernetes. Docker и K8s — рабочие инструменты группы балансеров.

- **Образ vs контейнер.**
  _Образ — неизменяемый шаблон из слоёв. Контейнер — запущенный экземпляр с writable-слоем._

- **Multi-stage build.**
  _Сборка → финальный образ только JAR. ~200 MB вместо ~800 MB. Безопаснее (меньше attack surface)._

- **Kubernetes: Pod, Deployment, Service.**
  _Pod — 1+ контейнер. Deployment — реплики, rolling update. Service — стабильный endpoint. Ingress — L7 маршрутизация._

- **Service типы в K8s.**
  _ClusterIP (внутренний), NodePort (внешний на каждой ноде), LoadBalancer (облачный LB — именно это делает группа балансеров в VK)._

- **Liveness vs Readiness probe.**
  _Liveness: жив ли → перезапуск. Readiness: готов ли → убирается из балансировки. Spring Boot Actuator: /health/liveness, /health/readiness._

- **ConfigMap vs Secret.**
  _ConfigMap — не-секретная конфигурация. Secret — base64-encoded чувствительные данные. Оба монтируются как volumes или env vars._

## 11. Практические задачи (live-coding)

По отзывам кандидатов в VK: задачи на алгоритмы, Stream API, многопоточность. Пишете код в онлайн-редакторе. Рассуждайте вслух!

### Задача 1. Найти дубликаты

```java
public Set<Integer> findDuplicates(List<Integer> list) {
    Set<Integer> seen = new HashSet<>();
    Set<Integer> dups = new HashSet<>();
    for (Integer n : list) {
        if (!seen.add(n)) dups.add(n);
    }
    return dups;
}
```

O(n) время, O(n) память. seen.add() → false если элемент уже есть.

### Задача 2. Являются ли строки перестановками

Из реальных собесов: определить, являются ли две строки перестановкой символов (a..z) друг друга.

```java
public boolean isPermutation(String a, String b) {
    if (a.length() != b.length()) return false;
    int[] counts = new int[26];
    for (char c : a.toCharArray()) counts[c - 'a']++;
    for (char c : b.toCharArray()) counts[c - 'a']--;
    for (int count : counts) {
        if (count != 0) return false;
    }
    return true;
}
```

O(n) через counting sort. Альтернатива: отсортировать обе строки O(n log n). Counting быстрее для маленького алфавита.

### Задача 3. REST-контроллер

```java
@RestController
@RequestMapping("/api/balancers")
public class BalancerController {

     private final BalancerService service;

     public BalancerController(BalancerService service) {
         this.service = service;
     }

     @PostMapping
     @ResponseStatus(HttpStatus.CREATED)
     public BalancerDto create(@RequestBody @Valid CreateBalancerRequest req) {
         return service.create(req);
     }

     @GetMapping("/{id}")
```

```java
     public BalancerDto getById(@PathVariable Long id) {
         return service.findById(id);
     }
}
```

### Задача 4. Потокобезопасный кэш

```java
public class SimpleCache<K, V> {
    private final Map<K, V> cache = new ConcurrentHashMap<>();

     public V get(K key, Function<K, V> loader) {
         return cache.computeIfAbsent(key, loader);
     }
}
```

ConcurrentHashMap (не HashMap). computeIfAbsent (не containsKey+put — гонка). Ограничение размера: Caffeine с maxSize и TTL.

### Задача 5. Code Review

```java
public class UserCache {
    private static Map<Long, User> cache = new HashMap<>();

     public static User getUser(Long id) {
         if (cache.containsKey(id)) {
             return cache.get(id);
         }
         User user = loadFromDb(id);
         cache.put(id, user);
         return user;
     }
}
```

Проблемы: 1) HashMap не потокобезопасен → ConcurrentHashMap. 2) containsKey+get → computeIfAbsent. 3) Кэш бесконечный → memory leak. 4) static → тяжело тестировать. 5) null от loadFromDb.

### Задача 6. SQL: идемпотентное зачисление

Из Пикабу (реальный вопрос на Java Middle): система зачисления денег через Kafka. Как гарантировать, что деньги зачислятся ровно один раз?

```java
@Transactional
public void processPayment(PaymentEvent event) {
    try {
        processedEventRepo.save(
            new ProcessedEvent(event.getId()));
    } catch (DataIntegrityViolationException e) {
        log.info("Duplicate event: {}", event.getId());
        return; // уже обработано
    }
    accountRepo.credit(event.getAccountId(), event.getAmount());
}
```

INSERT + бизнес-логика в одной транзакции. PK conflict = дубль = skip. Kafka at-least-once + идемпотентность = exactly-once семантика.

## 12. System Design

Для Middle архитектурная секция может быть опциональной, но для Middle+ — обязательна. В контексте балансеров: ожидайте задачи про распределённые системы и высокую нагрузку.

- **Спроектируй балансировщик нагрузки.**
  _Компоненты: health checker, routing table, connection pool. Алгоритмы: round-robin, weighted, least-connections, consistent hashing. Отказоустойчивость: active-standby (VRRP), hot reload конфигурации._

- **Сервис коротких ссылок.**
  _base62 (62^7 ≈ 3.5 трлн). Redis-кэш популярных. Шардирование по хэшу. Расчёт: чтения/записи 100:1._

- **Распределённый rate limiter.**
  _Token Bucket vs Sliding Window. Redis + Lua. Точность vs производительность._

- **Сервис метрик (Prometheus-like).**
  _Time-series DB. Ingestion: push (StatsD) vs pull (Prometheus). Downsampling для старых данных. Retention policy._

## 13. План подготовки + чек-лист

### За 2–3 недели

- 30–40 задач LeetCode Easy+Medium: hash-table, two-pointers, sliding-window, BFS/DFS

- Повторить Java 21: Virtual Threads, Records, Sealed Classes, Pattern Matching

- Spring Boot 3 + PostgreSQL + Kafka — поднять pet-проект

- Повторить HashMap устройство, ConcurrentHashMap, ThreadPoolExecutor

- Почитать про L3/L4 балансировку, HAProxy, Kubernetes Service types

### За неделю

- 2–3 мок-интервью: pramp.com, interviewing.io, друзья

- Все вопросы из гайда ВСЛУХ — мысли в голове ≠ слова

- 2–3 проекта по STAR: проблема → что сделал → результат

- Повторить SQL: JOIN, GROUP BY, HAVING, оконные функции, EXPLAIN

- Почитать про One-cloud VK, роль группы балансеров

### В день собеса

- Камера, микрофон, интернет — за 30 минут

- Рассуждать вслух — молчание хуже «дай подумать»

- Не знаешь — честно: «не сталкивался, но предположу...»

- 2–3 вопроса в конце: про One-cloud, команду, стек, процессы

ВНИМАНИЕ · Главный фильтр По отзывам кандидатов VK: алгоритмы и структуры данных — главный фильтр. Хэш-таблицы, деревья, очереди с приоритетом. Это спрашивают даже у Middle. SQL обычно проходит хорошо. Готовьтесь к алгоритмам!

### Финальный чек-лист

| Блок | Готов, если можешь... |
| --- | --- |
| Java Core | equals/hashCode + Integer cache + Virtual Threads |

(Java 21) + Records

Коллекции                                        HashMap: treeify, resize, ConcurrentHashMap Java 8, PriorityQueue

Многопоточность                                  volatile vs synchronized + CAS + ThreadPoolExecutor + Virtual Threads pinning

Spring                                           @Transactional прокси + self-call + scope prototype в singleton + Spring Boot 3

SQL                                              JOIN + GROUP BY + составной индекс + оконные функции + EXPLAIN ANALYZE

Kafka                        Consumer Group + at-least-once + идемпотентность + exactly-once

Сети                         L3 vs L4 vs L7 балансировка + HAProxy + VRRP + health checks

Docker/K8s                   Dockerfile multi-stage + Pod/Deployment/Service + probes + Service types

System Design                Load Balancer design + rate limiter + back-of-envelope расчёты

Live-coding                  3 задачи за 1 час: перестановки строк, дубликаты, code review

---

**Удачи на собесе!**

`// git push origin offer`

---

Гайд из канала **JavaJub** — свежие разборы собесов выходят там первыми: [@java_jub](https://t.me/java_jub).

[← Ко всем гайдам](../README.md)
