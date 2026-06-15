---
title: "Java собеседование: вопросы с собеседований, гайды и тесты"
description: "Java собеседование: реальные вопросы с собеседований Java-разработчиков, подготовка Junior и Middle, Spring Boot, SQL, Kafka, JVM, live coding и тесты JavaJub."
---

# Java собеседование: вопросы, гайды и тесты

Эта страница собрана под частые запросы: **Java собеседование**, **Java вопросы с собеседований**, **Java собеседования вопросы** и подготовка к Java backend-интервью. Здесь не абстрактная теория, а навигация по реальным вопросам, которые спрашивали у Java Junior, Middle, AQA и Senior-кандидатов.

Если у вас скоро интервью, начните с маршрута по грейду, затем откройте похожий гайд по компании и проверьте слабые темы в тестах JavaJub.

## Быстрый старт

| Цель | Что открыть |
|---|---|
| Готовлюсь к первому Java собеседованию | [Java Junior roadmap](roadmaps/java-junior.md) · [ITK Academy](guides/itk-academy.md) · [SberSeasons](guides/sber-internship.md) |
| Иду на Java Middle интервью | [Java Middle roadmap](roadmaps/java-middle.md) · [Сбер](guides/sber.md) · [Альфа-Банк](guides/alfa-bank.md) |
| Нужно повторить вопросы по Spring Boot | [Spring Boot тест](quizzes/topics/spring.md) · [Темы JavaJub](TOPICS.md) |
| Нужно проверить SQL и PostgreSQL | [SQL тест](quizzes/topics/sql.md) · [Альфа-Банк](guides/alfa-bank.md) |
| В вакансии есть Kafka и микросервисы | [Kafka тест](quizzes/topics/kafka.md) · [VK](guides/vk.md) · [Т1 Иннотех](guides/t1-innotech.md) |
| Нужно потренировать live coding | [Algorithms тест](quizzes/topics/algorithms.md) · [X5 code review](tasks/x5-blackfriday-code-review.md) |

## Какие Java вопросы чаще всего спрашивают

На Java собеседованиях чаще всего проверяют не один “правильный ответ”, а способность объяснить решение, увидеть ограничения и не попасться на типовые ловушки.

- **Java Core:** ООП, `equals/hashCode`, `String`, `final`, исключения, generics, Stream API.
- **Collections:** `ArrayList`, `LinkedList`, `HashMap`, `HashSet`, `ConcurrentHashMap`, fail-fast, immutable collections.
- **JVM:** heap, stack, metaspace, GC, classloading, JIT, OOM, диагностика.
- **Multithreading:** `synchronized`, `volatile`, happens-before, atomics, executors, deadlock, ThreadLocal.
- **Spring Boot:** DI, bean lifecycle, autoconfiguration, REST, AOP, `@Transactional`, propagation.
- **Hibernate/JPA:** entity states, persistence context, lazy/eager, N+1, dirty checking, locks.
- **SQL:** ACID, isolation, MVCC, JOIN, indexes, `EXPLAIN`, window functions.
- **Kafka:** topics, partitions, consumer groups, offsets, retries, idempotency, outbox.
- **System Design:** rate limiter, booking/taxi service, metrics, capacity estimate.

## Подготовка по грейду

### Java Junior

Для Junior собеседования важны база Java, коллекции, ООП, простой SQL, Git и умение рассказать о pet-проекте. Начните с [маршрута Java Junior](roadmaps/java-junior.md), затем пройдите [Java Core тест](quizzes/topics/java-core.md).

### Java Middle

На Java Middle интервью обычно ждут уверенный backend: Spring Boot, транзакции, Hibernate, SQL, многопоточность, Kafka и live coding. Начните с [маршрута Java Middle](roadmaps/java-middle.md), затем проверьте себя в [общем тесте Java interview](quizzes/index.md?quiz=all-java-interview&mode=express).

### AQA Java

Для AQA Java собеседования важны тест-дизайн, HTTP/REST, Postman, Rest Assured, JUnit 5, Mockito, WireMock, Testcontainers и SQL. Начните с [AQA Java roadmap](roadmaps/java-aqa.md).

### Senior и code review

Для Senior-интервью нужен фокус на архитектуру, production-мышление, диагностику, concurrency и умение делать code review. Начните с [X5 Tech code review](tasks/x5-blackfriday-code-review.md) и [System Design теста](quizzes/topics/system-design.md).

## Вопросы по компаниям

Если вы ищете вопросы Java собеседований по конкретным компаниям, откройте [матрицу компаний](companies.md). Там собраны грейды, стек и фокус интервью.

- [Сбер Java Middle](guides/sber.md)
- [Альфа-Банк Java Middle](guides/alfa-bank.md)
- [VK Java Middle](guides/vk.md)
- [Т1 Иннотех Java Junior/Middle](guides/t1-innotech.md)
- [Яндекс Путешествия Java Middle](guides/yandex-travel.md)
- [МТС Банк AQA Java Junior](guides/mts-bank-aqa.md)

## Если вы пришли из Java вакансии

Если вы нашли вакансию и хотите понять, какие вопросы могут задать, откройте [Java вакансии: что спрашивают и как готовиться](jobs.md). Там показано, как переводить стек из описания вакансии в конкретные темы подготовки: Spring Boot, SQL, Kafka, Docker, Kubernetes, System Design и live coding.

## Частые вопросы

- **Какие вопросы задают на Java собеседовании?** _Чаще всего спрашивают Java Core, Collections, JVM, многопоточность, Spring Boot, Hibernate, SQL, Kafka и live coding. На Middle добавляют транзакции, JPA, System Design и production-сценарии._
- **Где найти реальные Java вопросы с собеседований?** _В гайдах JavaJub по компаниям: Сбер, Альфа-Банк, VK, Т1, Яндекс Путешествия, МТС Банк, ITK Academy и Лига Цифровой Экономики._
- **Как быстро подготовиться к Java собеседованию?** _Если осталось 3 дня, повторите ключевые темы вакансии и пройдите Express-тесты. Если есть 7–14 дней, идите по маршруту грейда, добавьте live coding и mock interview._
- **Что важнее перед Java Middle интервью: Spring или алгоритмы?** _Обычно важнее уверенный backend: Spring Boot, транзакции, SQL, Hibernate, многопоточность и Kafka. Алгоритмы нужны, но чаще как live coding на базовые структуры данных._
- **Как понять, что я готов к Java собеседованию?** _Вы готовы, если можете объяснить ответы вслух, решить простую задачу без подсказок, пройти тесты по слабым темам и связать решения с реальным production-кодом._

## Получать свежие вопросы

Новые вопросы с Java собеседований и разборы выходят первыми в Telegram-канале JavaJub: [получать свежие вопросы](https://t.me/+vDYjUmPrBYZmMTAy).
