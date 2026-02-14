CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username            VARCHAR(20) NOT NULL UNIQUE,
    password_hash       VARCHAR(255) NOT NULL,
    nickname            VARCHAR(10) NOT NULL UNIQUE,
    rank_tier           VARCHAR(10) NOT NULL DEFAULT '재야',
    rank_level          SMALLINT NOT NULL DEFAULT 1,
    points              INTEGER NOT NULL DEFAULT 50,
    refresh_token       VARCHAR(512),
    is_deleted          BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at          TIMESTAMPTZ,
    last_login_at       TIMESTAMPTZ,
    nickname_changed_at TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_username ON users(username) WHERE is_deleted = FALSE;
CREATE INDEX idx_users_nickname ON users(nickname) WHERE is_deleted = FALSE;
CREATE INDEX idx_users_rank ON users(rank_tier, rank_level);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
