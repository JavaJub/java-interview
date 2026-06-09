# Маршрут подготовки Java Middle

План для Java Middle backend-интервью: системно повторить Java Core, Spring, SQL, Kafka, многопоточность, code review и архитектурное мышление.

[← На главную](../README.md) · [Индекс тем](../TOPICS.md) · [Канал JavaJub](https://t.me/+6GwSVWu9VIxlN2Yy)

## Кому подходит

- Java Middle / Middle+.
- Backend-интервью в банки, fintech, enterprise и BigTech-команды.
- Подготовка к вопросам по Java interview questions, Spring Boot interview, SQL interview и Kafka interview.

## План на 14 дней

| Дни | Фокус | Что пройти |
|---|---|---|
| 1–2 | Java Core | equals/hashCode, String Pool, exceptions, generics, Optional, Stream API |
| 3–4 | Collections и JVM | HashMap, ConcurrentHashMap, GC, heap/stack, classloader, JIT |
| 5–6 | Многопоточность | synchronized, volatile, happens-before, Executors, CompletableFuture, ThreadLocal |
| 7–8 | Spring Boot | DI, bean lifecycle, proxies, @Transactional, REST, validation, error handling |
| 9 | Hibernate/JPA | N+1, fetch types, persistence context, dirty checking, optimistic locking |
| 10 | SQL и PostgreSQL | индексы, EXPLAIN, транзакции, isolation levels, MVCC, оконные функции |
| 11 | Kafka и микросервисы | consumer groups, retry, idempotency, outbox, saga, circuit breaker |
| 12 | Code review | найти баги в сервисе, объяснить production-последствия, предложить фикс |
| 13 | System Design | спроектировать сервис, API, хранилище, очереди, отказоустойчивость |
| 14 | Mock interview | прогнать 60–90 минут: теория + задача + архитектурный кейс |

## Минимум перед интервью

- На любой вопрос про HashMap объяснять не только “как”, но и “что сломается в проде”.
- Уметь рассказать, как работает `@Transactional` через proxy и где оно не сработает.
- Знать разницу `volatile` и `AtomicInteger`, `thenApply` и `thenCompose`, `HashMap` и `ConcurrentHashMap`.
- Уметь читать `EXPLAIN`, объяснить индекс и уровень изоляции.
- Для Kafka: partition, offset, consumer group, retry, idempotency.
- На code review сначала искать корректность, concurrency, транзакции, N+1, null/error handling, потом стиль.

## Гайды для маршрута

- [Сбер](../guides/sber.md)
- [Альфа-Банк](../guides/alfa-bank.md)
- [Т1 Иннотех](../guides/t1-innotech.md)
- [Лига Цифровой Экономики](../guides/liga.md)
- [VK](../guides/vk.md) и [Яндекс Путешествия](../guides/yandex-travel.md), если есть алгоритмы или BigTech-фокус
- [X5 Tech code review](../tasks/x5-blackfriday-code-review.md)

Свежие Middle-вопросы и новые разборы выходят в [@java_jub](https://t.me/+6GwSVWu9VIxlN2Yy).
