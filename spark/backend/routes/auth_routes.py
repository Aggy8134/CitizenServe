"""Registration, login and current-user endpoints."""
import re
import sqlite3

from flask import Blueprint, g, jsonify, request
from werkzeug.security import check_password_hash, generate_password_hash

from auth import create_token, login_required
from db import get_db

bp = Blueprint("auth", __name__, url_prefix="/api/auth")

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def _public_user(row):
    return {"id": row["id"], "name": row["name"], "email": row["email"], "role": row["role"]}


@bp.post("/register")
def register():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not name:
        return jsonify(error="Name is required"), 400
    if not EMAIL_RE.match(email):
        return jsonify(error="A valid email is required"), 400
    if len(password) < 6:
        return jsonify(error="Password must be at least 6 characters"), 400

    db = get_db()
    try:
        cur = db.execute(
            "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
            (name, email, generate_password_hash(password)),
        )
        db.commit()
    except sqlite3.IntegrityError:
        return jsonify(error="An account with this email already exists"), 409

    user = db.execute("SELECT * FROM users WHERE id = ?", (cur.lastrowid,)).fetchone()
    return jsonify(token=create_token(user["id"]), user=_public_user(user)), 201


@bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    user = get_db().execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
    if user is None or not check_password_hash(user["password_hash"], password):
        return jsonify(error="Invalid email or password"), 401

    return jsonify(token=create_token(user["id"]), user=_public_user(user))


@bp.get("/me")
@login_required
def me():
    return jsonify(user=g.user)
