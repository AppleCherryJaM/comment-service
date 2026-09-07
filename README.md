# 🚀 SPA Приложение: Система комментариев (NestJS + React + BullMQ + Redis + PostgreSQL)

Полнофункциональное SPA-приложение для публикации и каскадного (древовидного) отображения комментариев, выполненное по требованиям ТЗ DZENcode.

---

## 🌟 Основные возможности

1. **Древовидная (каскадная) система комментариев**:
   - Бесконечная вложенность ответов на комментарии.
   - Загрузка комментариев за 1 SQL-запрос (0% проблема N+1).

2. **Форма отправки комментариев**:
   - Валидация латинских букв и цифр для `User Name`.
   - Защита формы графической SVG-капчей (`svg-captcha`).
   - Панель быстрой вставки XHTML-тегов (`[i]`, `[strong]`, `[code]`, `[a]`).
   - Окно мгновенного предпросмотра (Preview) форматирования перед отправкой.

3. **Загрузка и обработка файлов (Attachments)**:
   - Поддержка изображений (JPG, PNG, GIF) и текстовых документов (TXT до 100 КБ).
   - Асинхронная обработка и ресайзинг изображений до 320х240 через **BullMQ воркер** и **Sharp**.
   - Лайтбокс просмотрщик картинок и текстовых файлов (`AttachmentViewer`).

4. **Сортировка и Пагинация**:
   - Пагинация по 25 корневых сообщений на страницу.
   - Сортировка LIFO по умолчанию (новые сверху).
   - Переключение сортировки по полях: **User Name**, **Email**, **Дата создания** (ASC/DESC).

5. **Безопасность и Валидация**:
   - Экранирование тегов и строгое XHTML-валидирование для защиты от **XSS**.
   - Параметризованные запросы TypeORM для защиты от **SQL-инъекций**.
   - Throttler rate-limiting (ограничение частых запросов).

6. **Real-time & Кэширование**:
   - **WebSockets (Socket.io)**: мгновенные тост-уведомления о новых комментариях.
   - **Redis Cache**: мгновенная отдача 1-й страницы комментариев с автоматической инвалидацией.
   - **BullMQ Queue**: асинхронный воркер для обработки тяжелогрузных файлов.

---

## 🛠️ Стек технологий

- **Backend**: NestJS (v11), TypeORM, PostgreSQL, Redis, BullMQ, Socket.io, Sharp, SVG-Captcha, JWT.
- **Frontend**: React (v19), TypeScript, Vite, SCSS Modules, Lucide Icons.
- **DevOps & Infrastructure**: Docker, Docker Compose, Nginx, PostgreSQL 15, Redis 7.

---

## 🚀 Быстрый запуск (одной командой)

### Вариант 1: Через Docker Compose (Рекомендуемый)

Убедитесь, что у вас установлен Docker и запустите:

```bash
docker-compose up --build
```

- **Frontend**: [http://localhost](http://localhost)
- **Backend API**: [http://localhost:3000](http://localhost:3000)

---

### Вариант 2: Локальный запуск (Development)

1. **Запустите PostgreSQL и Redis**:
   ```bash
   docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres_password -e POSTGRES_DB=comments_db postgres:15-alpine
   docker run -d -p 6379:6379 redis:alpine
   ```

2. **Запустите Бэкенд**:
   ```bash
   cd server
   npm install --legacy-peer-deps
   npm run start:dev
   ```

3. **Запустите Фронтенд**:
   ```bash
   cd client
   npm install
   npm run dev
   ```

---

## 📐 Схема базы данных

Файл схемы БД доступен в корне проекта: [`schema.sql`](./schema.sql).  
Его можно открыть в **MySQL Workbench**, **DBeaver** или **pgAdmin** для анализа структуры таблиц `users`, `comments` и `refresh_tokens`.

---

## ⚡ Нагрузочное тестирование (Middle+)

Для проверки производительности системы под высокой нагрузкой запустите скрипт:

```bash
node load-test.js
```

Скрипт эмулирует параллельную отправку комментариев с проверкой throughput (RPS).
