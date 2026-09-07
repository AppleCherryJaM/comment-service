-- ============================================================
-- Database Schema for SPA Comments Application
-- Can be opened/imported into MySQL Workbench, DBeaver, or pgAdmin
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    home_page VARCHAR(255) NULL,
    password VARCHAR(255) NULL,
    is_guest BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    text TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_comment_id UUID NULL REFERENCES comments(id) ON DELETE CASCADE,
    root_comment_id UUID NULL REFERENCES comments(id) ON DELETE CASCADE,
    file_url VARCHAR(500) NULL,
    file_type VARCHAR(50) NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for maximum performance (1,000,000+ messages requirement)
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_comments_root_id ON comments(root_comment_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================================
-- Sample Data Seeding (Тестовые записи для проверки ТЗ)
-- 30+ сообщений для демонстрации пагинации (25 на страницу)
-- ============================================================

INSERT INTO users (id, name, email, is_guest) 
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'Anonym', 'anonym@example.com', true),
    ('22222222-2222-2222-2222-222222222222', 'Rum_8', 'rum8@example.com', true),
    ('33333333-3333-3333-3333-333333333333', 'Alice_W', 'alice@example.com', false),
    ('44444444-4444-4444-4444-444444444444', 'Bob_Dev', 'bob@example.com', false),
    ('55555555-5555-5555-5555-555555555555', 'Charlie', 'charlie@example.com', true)
ON CONFLICT (email) DO NOTHING;

-- Insert 30 Root Comments to test pagination (25 per page limit)
INSERT INTO comments (id, text, user_id, created_at)
VALUES
    ('a0000001-0000-0000-0000-000000000001', 'Каждый из нас понимает очевидную вещь: <strong>семантический разбор</strong> внешних противодействий предоставляет широкие возможности.', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '60 minutes'),
    ('a0000002-0000-0000-0000-000000000002', 'Внезапно, тщательные исследования конкурентов, которые представляют собой <i>яркий пример</i> политической культуры.', '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '58 minutes'),
    ('a0000003-0000-0000-0000-000000000003', 'Привет всем! Как вам сборка <strong>NestJS + BullMQ + Redis</strong>? Насколько стабильно работает под нагрузкой?', '33333333-3333-3333-3333-333333333333', NOW() - INTERVAL '56 minutes'),
    ('a0000004-0000-0000-0000-000000000004', 'Кто-нибудь пробовал новую версию <i>React 19</i> с Server Actions? Поделитесь впечатлениями!', '44444444-4444-4444-4444-444444444444', NOW() - INTERVAL '54 minutes'),
    ('a0000005-0000-0000-0000-000000000005', 'Для отладки очереди в Docker очень пригодился <code>docker-compose logs -f server</code>, рекомендую!', '55555555-5555-5555-5555-555555555555', NOW() - INTERVAL '52 minutes'),
    ('a0000006-0000-0000-0000-000000000006', 'Отличная реализация защищенных маршрутов на JWT токенах. Подробности можно почитать на <a href="https://jwt.io" title="JWT Specification">JWT.io</a>.', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '50 minutes'),
    ('a0000007-0000-0000-0000-000000000007', 'Подскажите, как лучше оптимизировать индекс PostgreSQL по <code>created_at DESC</code> для каскадных запросов?', '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '48 minutes'),
    ('a0000008-0000-0000-0000-000000000008', 'Обработка ресайза картинок через <strong>Sharp</strong> в отдельном воркере BullMQ работает мгновенно!', '33333333-3333-3333-3333-333333333333', NOW() - INTERVAL '46 minutes'),
    ('a0000009-0000-0000-0000-000000000009', 'Всегда оборачивайте пользовательский ввод в <i>XHTML санитайзер</i> для полной защиты от XSS атак.', '44444444-4444-4444-4444-444444444444', NOW() - INTERVAL '44 minutes'),
    ('a0000010-0000-0000-0000-000000000010', 'Проверил пагинацию на 25 элементов — переключение по страницам работает без перезагрузки!', '55555555-5555-5555-5555-555555555555', NOW() - INTERVAL '42 minutes'),
    ('a0000011-0000-0000-0000-000000000011', 'Интересно, какая средняя задержка при передаче сообщений через <code>WebSockets (Socket.io)</code>?', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '40 minutes'),
    ('a0000012-0000-0000-0000-000000000012', 'Всем привет из мира Web3 и фронтенда! Пишу SPA приложения уже 5 лет.', '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '38 minutes'),
    ('a0000013-0000-0000-0000-000000000013', 'Не забудьте протестировать сидинг базы данных через <code>npm run seed</code>!', '33333333-3333-3333-3333-333333333333', NOW() - INTERVAL '36 minutes'),
    ('a0000014-0000-0000-0000-000000000014', 'Отличный UI! Оформление в стиле <strong>Glassmorphism</strong> и SCSS модули выглядят очень свежо.', '44444444-4444-4444-4444-444444444444', NOW() - INTERVAL '34 minutes'),
    ('a0000015-0000-0000-0000-000000000015', 'Кто использует <i>TypeScript 5.7</i> в продакшене? Есть какие-то подводные камни?', '55555555-5555-5555-5555-555555555555', NOW() - INTERVAL '32 minutes'),
    ('a0000016-0000-0000-0000-000000000016', 'При обработке больших объемов текстовых файлов (TXT до 100 КБ) валидация на стороне сервера обязательна.', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '30 minutes'),
    ('a0000017-0000-0000-0000-000000000017', 'Полезная ссылка по лучшим практикам безопасности в Web: <a href="https://owasp.org" title="OWASP Foundation">OWASP Top 10</a>.', '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '28 minutes'),
    ('a0000018-0000-0000-0000-000000000018', 'Кэширование первой страницы комментариев в <strong>Redis</strong> позволило снизить нагрузку на БД в разы.', '33333333-3333-3333-3333-333333333333', NOW() - INTERVAL '26 minutes'),
    ('a0000019-0000-0000-0000-000000000019', 'Масштабирование бэкенда до <i>1,000,000 сообщений</i> в сутки — отличная задача для Middle+ уровня.', '44444444-4444-4444-4444-444444444444', NOW() - INTERVAL '24 minutes'),
    ('a0000020-0000-0000-0000-000000000020', 'Для асинхронных воркеров используйте <code>@Processor("attachments")</code> в NestJS.', '55555555-5555-5555-5555-555555555555', NOW() - INTERVAL '22 minutes'),
    ('a0000021-0000-0000-0000-000000000021', 'Как вы проверяете капчу — SVG графикой или через интеграцию сторонних сервисов?', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '20 minutes'),
    ('a0000022-0000-0000-0000-000000000022', 'Заглавные комментарии выводятся таблицей с сортировкой LIFO по умолчанию.', '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '18 minutes'),
    ('a0000023-0000-0000-0000-000000000023', 'Архитектура проекта с разделением на <strong>client</strong> и <strong>server</strong> в Docker Compose супер удобна.', '33333333-3333-3333-3333-333333333333', NOW() - INTERVAL '16 minutes'),
    ('a0000024-0000-0000-0000-000000000024', 'Очень удобно, что можно прикрепить картинку формата JPG, PNG или GIF с автоматическим пропорциональным сжатием.', '44444444-4444-4444-4444-444444444444', NOW() - INTERVAL '14 minutes'),
    ('a0000025-0000-0000-0000-000000000025', 'Код проверен на валидность XHTML: <code>validateAndSanitizeXHTML()</code> работает четко!', '55555555-5555-5555-5555-555555555555', NOW() - INTERVAL '12 minutes'),
    ('a0000026-0000-0000-0000-000000000026', 'Превью форматирования перед отправкой сообщения действительно помогает избежать ошибок в тегах.', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '10 minutes'),
    ('a0000027-0000-0000-0000-000000000027', 'Если есть вопросы по настройке PostgreSQL в контейнере, пишите в этот тред!', '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '8 minutes'),
    ('a0000028-0000-0000-0000-000000000028', 'Защита от SQL-инъекций обеспечена за счет параметризованных запросов <i>TypeORM QueryBuilder</i>.', '33333333-3333-3333-3333-333333333333', NOW() - INTERVAL '6 minutes'),
    ('a0000029-0000-0000-0000-000000000029', 'Настройка CORS и безопасных печеней Refresh-токенов выполнены по стандартам Web Security.', '44444444-4444-4444-4444-444444444444', NOW() - INTERVAL '4 minutes'),
    ('a0000030-0000-0000-0000-000000000030', 'Желаю всем успешного прохождения чек-листа тестирования и удачной защиты проекта! <a href="https://dzencode.com" title="DZENcode">DZENcode Team</a>', '55555555-5555-5555-5555-555555555555', NOW() - INTERVAL '2 minutes')
ON CONFLICT (id) DO NOTHING;

-- Nested replies for thread #1
INSERT INTO comments (id, text, user_id, parent_comment_id, root_comment_id, created_at)
VALUES
    ('b2222222-2222-2222-2222-222222222222', 'Внезапно, тщательные исследования конкурентов, которые представляют собой <i>яркий пример</i> политической культуры.', '22222222-2222-2222-2222-222222222222', 'a0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', NOW() - INTERVAL '55 minutes'),
    ('c3333333-3333-3333-3333-333333333333', 'Идейные соображения высшего порядка, а также понимание сути ресурсосберегающих технологий! <code>console.log("XHTML Valid")</code>', '33333333-3333-3333-3333-333333333333', 'b2222222-2222-2222-2222-222222222222', 'a0000001-0000-0000-0000-000000000001', NOW() - INTERVAL '50 minutes')
ON CONFLICT (id) DO NOTHING;
