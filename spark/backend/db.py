"""SQLite helpers: one connection per request, schema setup and seeding."""
import os
import sqlite3

from flask import g
from werkzeug.security import generate_password_hash

import config


def get_db():
    """Return the SQLite connection for the current request (created lazily)."""
    if "db" not in g:
        g.db = sqlite3.connect(config.DATABASE_PATH)
        g.db.row_factory = sqlite3.Row
        g.db.execute("PRAGMA foreign_keys = ON")
    return g.db


def close_db(_exc=None):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def row_to_dict(row):
    return dict(row) if row is not None else None


def init_db():
    """Create tables if they don't exist and make sure an admin account exists."""
    conn = sqlite3.connect(config.DATABASE_PATH)
    with open(os.path.join(config.BASE_DIR, "schema.sql")) as f:
        conn.executescript(f.read())

    has_admin = conn.execute("SELECT 1 FROM users WHERE role = 'admin'").fetchone()
    if not has_admin:
        conn.execute(
            "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'admin')",
            (
                "City Administrator",
                config.DEFAULT_ADMIN_EMAIL,
                generate_password_hash(config.DEFAULT_ADMIN_PASSWORD),
            ),
        )
        print(f"Created default admin: {config.DEFAULT_ADMIN_EMAIL} / {config.DEFAULT_ADMIN_PASSWORD}")

    conn.commit()
    conn.close()
