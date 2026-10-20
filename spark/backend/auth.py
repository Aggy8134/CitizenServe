"""Token-based authentication helpers.

Tokens are signed with the app's SECRET_KEY (via itsdangerous, bundled with Flask),
so no session table is needed. The client sends them as `Authorization: Bearer <token>`.
"""
from functools import wraps

from flask import current_app, g, jsonify, request
from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer

import config
from db import get_db


def _serializer():
    return URLSafeTimedSerializer(current_app.config["SECRET_KEY"], salt="auth-token")


def create_token(user_id):
    return _serializer().dumps({"user_id": user_id})


def _load_user_from_request():
    header = request.headers.get("Authorization", "")
    if not header.startswith("Bearer "):
        return None
    try:
        data = _serializer().loads(header[7:], max_age=config.TOKEN_MAX_AGE_SECONDS)
    except (BadSignature, SignatureExpired):
        return None
    return get_db().execute(
        "SELECT id, name, email, role FROM users WHERE id = ?", (data["user_id"],)
    ).fetchone()


def login_required(view):
    """Reject the request with 401 unless a valid token is supplied. Sets g.user."""
    @wraps(view)
    def wrapped(*args, **kwargs):
        user = _load_user_from_request()
        if user is None:
            return jsonify(error="Authentication required"), 401
        g.user = dict(user)
        return view(*args, **kwargs)
    return wrapped


def admin_required(view):
    """Like login_required, but also requires the admin role."""
    @wraps(view)
    @login_required
    def wrapped(*args, **kwargs):
        if g.user["role"] != "admin":
            return jsonify(error="Admin access required"), 403
        return view(*args, **kwargs)
    return wrapped
