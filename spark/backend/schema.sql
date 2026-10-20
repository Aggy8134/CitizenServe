-- Database schema for the Public Service Request System.

CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT    NOT NULL,
    email         TEXT    NOT NULL UNIQUE,
    password_hash TEXT    NOT NULL,
    role          TEXT    NOT NULL DEFAULT 'citizen' CHECK (role IN ('citizen', 'admin')),
    created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS requests (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    ref_code    TEXT    NOT NULL UNIQUE,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category    TEXT    NOT NULL,
    location    TEXT    NOT NULL,
    description TEXT    NOT NULL,
    image_path  TEXT,
    status      TEXT    NOT NULL DEFAULT 'Pending'
                CHECK (status IN ('Pending', 'In Progress', 'Resolved')),
    created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Every status change is logged so citizens can see a timeline of their request.
CREATE TABLE IF NOT EXISTS status_history (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    request_id  INTEGER NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
    status      TEXT    NOT NULL,
    note        TEXT,
    changed_by  INTEGER REFERENCES users(id),
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_requests_user   ON requests(user_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
