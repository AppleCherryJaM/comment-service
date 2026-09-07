-- ============================================================
-- Database Schema for SPA Comments Application
-- Can be opened/imported into MySQL Workbench, DBeaver, or pgAdmin
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    home_page VARCHAR(255) NULL,
    password_hash VARCHAR(255) NULL,
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
-- ============================================================

INSERT INTO users (id, name, email, is_guest) 
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'Anonym', 'anonym@example.com', true),
    ('22222222-2222-2222-2222-222222222222', 'Rum_8', 'rum8@example.com', true),
    ('33333333-3333-3333-3333-333333333333', 'Alice_W', 'alice@example.com', false)
ON CONFLICT (email) DO NOTHING;

INSERT INTO comments (id, text, user_id, parent_comment_id, root_comment_id)
VALUES
    ('a1111111-1111-1111-1111-111111111111', 'Каждый из нас понимает очевидную вещь: <strong>семантический разбор</strong> внешних противодействий предоставляет широкие возможности.', '11111111-1111-1111-1111-111111111111', NULL, NULL),
    ('b2222222-2222-2222-2222-222222222222', 'Внезапно, тщательные исследования конкурентов, которые представляют собой <i>яркий пример</i> политической культуры.', '22222222-2222-2222-2222-222222222222', 'a1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111'),
    ('c3333333-3333-3333-3333-333333333333', 'Идейные соображения высшего порядка, а также понимание сути ресурсосберегающих технологий! <code>console.log("XHTML Valid")</code>', '33333333-3333-3333-3333-333333333333', 'b2222222-2222-2222-2222-222222222222', 'a1111111-1111-1111-1111-111111111111')
ON CONFLICT (id) DO NOTHING;
