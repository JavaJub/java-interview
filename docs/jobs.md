---
title: "Java вакансии: вопросы на собеседовании и подготовка"
description: "Java вакансии и подготовка к собеседованию: какие вопросы спрашивают у Java Junior, Middle, Senior и AQA, как разбирать стек вакансии и где пройти тесты."
---

# Java вакансии: что спрашивают и как готовиться

Эта страница помогает не просто искать Java вакансии, а быстро понять, что именно повторять под конкретную позицию и грейд. JavaJub не агрегатор вакансий — здесь собраны реальные вопросы с собеседований, тесты и маршруты подготовки, которые помогают пройти интервью после того, как вы нашли подходящую вакансию.

Если в описании вакансии указаны Java Core, Spring Boot, SQL, Kafka, Docker, Kubernetes или микросервисы — используйте страницу как переводчик требований в план подготовки.

Если вам нужна общая подготовка к интервью, начните со страницы [Java собеседование: вопросы, гайды и тесты](java-sobesedovanie.md). Если уже есть конкретная вакансия, двигайтесь по таблице ниже: стек из описания вакансии превращается в темы, вопросы и тесты.

## Как читать описание вакансии

| В вакансии написано | Что обычно проверяют на собеседовании | Где повторить |
|---|---|---|
| Java Core, Collections, Stream API | `equals/hashCode`, `HashMap`, immutable collections, Stream pitfalls | [Темы Java Core](TOPICS.md) · [Java Core тест](quizzes/topics/java-core.md) |
| Spring Boot, REST, AOP | IoC/DI, bean lifecycle, autoconfiguration, exception handling, AOP | [Spring тест](quizzes/topics/spring.md) · [Middle roadmap](roadmaps/java-middle.md) |
| `@Transactional`, PostgreSQL, SQL | propagation, isolation, indexes, `JOIN`, `EXPLAIN`, N+1 | [SQL тест](quizzes/topics/sql.md) · [Hibernate тест](quizzes/topics/hibernate.md) |
| Kafka, микросервисы | partitions, consumer groups, offsets, retries, idempotency, outbox | [Kafka тест](quizzes/topics/kafka.md) |
| Docker, Kubernetes, CI/CD | image/container, Dockerfile, Deployment, Service, probes, pipeline | [DevOps тест](quizzes/topics/devops.md) |
| Live coding, algorithms | строки, массивы, `HashMap`, two pointers, sliding window, code output | [Algorithms тест](quizzes/topics/algorithms.md) |
| System Design | rate limiter, booking/taxi service, metrics, capacity estimate | [System Design тест](quizzes/topics/system-design.md) |

## Java Junior вакансии: что спрашивают

На junior-вакансиях проверяют базу и умение учиться. Чаще всего спрашивают Java Core и ООП, коллекции (`ArrayList`, `HashMap`, `equals/hashCode`), исключения, базовый SQL (`SELECT`, `JOIN`), основы Git и простой Spring. Часто просят рассказать про pet-проект и решить лёгкую алгоритмическую задачу.

- Маршрут: [Java Junior](roadmaps/java-junior.md)
- Похожие собесы: [ITK Academy](guides/itk-academy.md) · [SberSeasons (стажировка)](guides/sber-internship.md)
- Проверка: [Java Core тест](quizzes/topics/java-core.md) · [Collections тест](quizzes/topics/collections.md)

## Java Middle вакансии: что спрашивают

На middle-вакансиях ждут уверенный backend: Spring Boot и DI, транзакции и `@Transactional`, JPA/Hibernate (lazy/eager, N+1), SQL и индексы, многопоточность и JMM, основы Kafka, Docker и иногда System Design. Почти всегда есть live-coding и вопросы «что выведет код».

- Маршрут: [Java Middle](roadmaps/java-middle.md)
- Похожие собесы: [Сбер](guides/sber.md) · [Альфа-Банк](guides/alfa-bank.md) · [Т1 Иннотех](guides/t1-innotech.md) · [Лига](guides/liga.md)
- Проверка: [Spring тест](quizzes/topics/spring.md) · [SQL тест](quizzes/topics/sql.md) · [Concurrency тест](quizzes/topics/concurrency.md)

## Java Senior вакансии: что спрашивают

На senior-вакансиях фокус смещается к архитектуре, production-мышлению и code review: trade-offs в System Design, отказоустойчивость и нагрузка, тонкости concurrency, диагностика JVM и инцидентов, умение находить баги в чужом коде и объяснять решения.

- Маршрут: [Java Middle](roadmaps/java-middle.md) (как база) + System Design
- Похожие задачи: [X5 Tech · code review (8 багов)](tasks/x5-blackfriday-code-review.md)
- Проверка: [System Design тест](quizzes/topics/system-design.md) · [X5 code review тест](quizzes/companies/x5-code-review-senior.md)

## AQA Java вакансии: что спрашивают

На вакансиях AQA Java проверяют тест-дизайн и автоматизацию API: Rest Assured, JUnit 5, Mockito, WireMock, Testcontainers, SQL для проверки данных и работу с очередями. JMM и глубокий Spring обычно не нужны.

- Маршрут: [AQA Java](roadmaps/java-aqa.md)
- Похожий собес: [МТС Банк AQA](guides/mts-bank-aqa.md)
- Проверка: [Testing / AQA тест](quizzes/topics/testing-aqa.md)

## Стажировки и Trainee

Для стажировок (например, SberSeasons) важны база Java, алгоритмы Easy, SQL, Git и рассказ о проекте. Подготовку удобно вести по [маршруту Junior](roadmaps/java-junior.md).

## Быстрый план под вакансию

1. Выпишите стек из вакансии: версия Java, Spring, база данных, messaging, cloud/devops, тестирование.
2. Определите грейд: Junior, Middle, Senior, AQA или стажировка.
3. Пройдите релевантный маршрут: [Junior](roadmaps/java-junior.md), [Middle](roadmaps/java-middle.md), [AQA](roadmaps/java-aqa.md).
4. Откройте 1–2 похожих гайда по компаниям и сравните реальные вопросы с требованиями вакансии.
5. Пройдите Express-тест на 15 вопросов по ключевой теме, затем Standard на 30 вопросов.

## Самопроверка перед откликом

Перед откликом на вакансию пройдите короткую проверку:

- [Все вопросы Java interview](quizzes/index.md?quiz=all-java-interview&mode=express)
- [Java Core Express](quizzes/index.md?quiz=java-core&mode=express)
- [Spring Boot Express](quizzes/index.md?quiz=spring&mode=express)
- [SQL Express](quizzes/index.md?quiz=sql&mode=express)
- [Kafka Express](quizzes/index.md?quiz=kafka&mode=express)

## Частые вопросы про подготовку к Java вакансиям

- **Какие вопросы задают на собеседовании Java Middle?** _Чаще всего спрашивают Java Core (`equals/hashCode`, `HashMap`, Stream API), Spring Boot и DI, `@Transactional`, JPA/Hibernate и N+1, SQL и индексы, многопоточность и JMM, основы Kafka и Docker. Почти всегда есть live-coding и задачи «что выведет код»._
- **Сколько времени нужно на подготовку к Java-собеседованию?** _При работающей базе хватает 1–2 недель: за 3 дня — повторить ключевые темы и пройти Express-тесты, за 7 дней — добавить live-coding и слабые темы, за 14 дней — пройти маршрут по грейду и mock interview._
- **Чем отличается собеседование Junior от Middle?** _На Junior проверяют базу Java, ООП, коллекции и простой SQL, часто с рассказом о pet-проекте. На Middle добавляются Spring Boot, транзакции, Hibernate, многопоточность, Kafka и System Design, а задачи становятся сложнее._
- **Как готовиться к Java-вакансии по описанию?** _Выпишите стек из вакансии, определите грейд, пройдите соответствующий маршрут и похожие гайды по компаниям, затем проверьте слабые темы тестами JavaJub._
- **Где взять реальные вопросы с собеседований?** _В гайдах по компаниям на JavaJub и в Telegram-канале [@java_jub](https://t.me/+vDYjUmPrBYZmMTAy), где разборы собеседований выходят первыми._

## Что спросить в канале

Если вакансия выглядит интересно, но непонятно, что именно повторять, принесите стек и грейд в Telegram-канал JavaJub. Новые вопросы и разборы собеседований выходят здесь: [получать свежие вопросы](https://t.me/+vDYjUmPrBYZmMTAy).
