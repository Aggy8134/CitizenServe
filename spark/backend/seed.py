"""Optional: fill the database with demo data so the dashboard has something to show.

Run with:  python seed.py
Creates citizen jane@example.com / password123 with a handful of requests.
"""
import secrets
import sqlite3

from werkzeug.security import generate_password_hash

import config
from db import init_db

DEMO_REQUESTS = [
    ("Streetlight", "Moi Avenue, near Hilton", "Streetlight has been off for over a week, the area is very dark at night.", "Pending"),
    ("Water Supply", "Kilimani, Argwings Kodhek Rd", "Burst pipe leaking clean water onto the road since Monday.", "In Progress"),
    ("Garbage Collection", "Westlands Market", "Garbage has not been collected for two weeks and is overflowing.", "Resolved"),
    ("Roads & Potholes", "Ngong Road, Prestige Plaza", "Large pothole causing traffic and damaging cars.", "In Progress"),
    ("Drainage & Sewage", "South B, Mchumbi Rd", "Blocked drainage causes flooding whenever it rains.", "Pending"),
    ("Garbage Collection", "Kasarani, Mwiki Rd", "Missed collection on our street this week.", "Resolved"),
]


def seed():
    init_db()
    conn = sqlite3.connect(config.DATABASE_PATH)
    conn.execute("PRAGMA foreign_keys = ON")

    if conn.execute("SELECT 1 FROM users WHERE email = 'jane@example.com'").fetchone():
        print("Demo data already present, nothing to do.")
        return

    user_id = conn.execute(
        "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
        ("Jane Wanjiku", "jane@example.com", generate_password_hash("password123")),
    ).lastrowid

    for category, location, description, status in DEMO_REQUESTS:
        req_id = conn.execute(
            """INSERT INTO requests (ref_code, user_id, category, location, description, status)
               VALUES (?, ?, ?, ?, ?, ?)""",
            ("SR-" + secrets.token_hex(3).upper(), user_id, category, location, description, status),
        ).lastrowid
        conn.execute(
            "INSERT INTO status_history (request_id, status, note, changed_by) VALUES (?, 'Pending', 'Request submitted', ?)",
            (req_id, user_id),
        )
        if status != "Pending":
            conn.execute(
                "INSERT INTO status_history (request_id, status, note) VALUES (?, ?, ?)",
                (req_id, status, "Updated by city staff"),
            )

    conn.commit()
    conn.close()
    print("Seeded demo citizen jane@example.com / password123 with", len(DEMO_REQUESTS), "requests.")


if __name__ == "__main__":
    seed()
