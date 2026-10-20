"""Service request endpoints: submit, list, view, update status."""
import os
import secrets
import uuid

from flask import Blueprint, g, jsonify, request
from werkzeug.utils import secure_filename

import config
from auth import admin_required, login_required
from db import get_db, row_to_dict

bp = Blueprint("requests", __name__, url_prefix="/api")

# Shared SELECT that joins in the submitter's name for display.
REQUEST_SELECT = """
    SELECT r.*, u.name AS citizen_name, u.email AS citizen_email
    FROM requests r JOIN users u ON u.id = r.user_id
"""


def _generate_ref_code():
    """Short human-friendly reference number, e.g. SR-4F9A2C."""
    return "SR-" + secrets.token_hex(3).upper()


def _save_image(file):
    """Validate and store an uploaded image. Returns the stored filename or raises ValueError."""
    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if ext not in config.ALLOWED_IMAGE_EXTENSIONS:
        raise ValueError("Image must be one of: " + ", ".join(sorted(config.ALLOWED_IMAGE_EXTENSIONS)))
    filename = f"{uuid.uuid4().hex}_{secure_filename(file.filename)}"
    file.save(os.path.join(config.UPLOAD_FOLDER, filename))
    return filename


def _can_view(req):
    return g.user["role"] == "admin" or req["user_id"] == g.user["id"]


@bp.get("/categories")
def categories():
    return jsonify(categories=config.CATEGORIES, statuses=config.STATUSES)


@bp.post("/requests")
@login_required
def create_request():
    category = (request.form.get("category") or "").strip()
    location = (request.form.get("location") or "").strip()
    description = (request.form.get("description") or "").strip()

    if category not in config.CATEGORIES:
        return jsonify(error="Please choose a valid category"), 400
    if not location:
        return jsonify(error="Location is required"), 400
    if len(description) < 10:
        return jsonify(error="Description must be at least 10 characters"), 400

    image_path = None
    image = request.files.get("image")
    if image and image.filename:
        try:
            image_path = _save_image(image)
        except ValueError as e:
            return jsonify(error=str(e)), 400

    db = get_db()
    cur = db.execute(
        """INSERT INTO requests (ref_code, user_id, category, location, description, image_path)
           VALUES (?, ?, ?, ?, ?, ?)""",
        (_generate_ref_code(), g.user["id"], category, location, description, image_path),
    )
    db.execute(
        "INSERT INTO status_history (request_id, status, note, changed_by) VALUES (?, 'Pending', ?, ?)",
        (cur.lastrowid, "Request submitted", g.user["id"]),
    )
    db.commit()

    created = db.execute(REQUEST_SELECT + " WHERE r.id = ?", (cur.lastrowid,)).fetchone()
    return jsonify(request=row_to_dict(created)), 201


@bp.get("/requests")
@login_required
def list_requests():
    """Citizens get their own requests; admins get everything.

    Optional query params: status, category, q (searches ref code, location, description).
    """
    clauses, params = [], []

    if g.user["role"] != "admin":
        clauses.append("r.user_id = ?")
        params.append(g.user["id"])

    status = request.args.get("status")
    if status in config.STATUSES:
        clauses.append("r.status = ?")
        params.append(status)

    category = request.args.get("category")
    if category in config.CATEGORIES:
        clauses.append("r.category = ?")
        params.append(category)

    search = (request.args.get("q") or "").strip()
    if search:
        clauses.append("(r.ref_code LIKE ? OR r.location LIKE ? OR r.description LIKE ?)")
        params.extend([f"%{search}%"] * 3)

    sql = REQUEST_SELECT
    if clauses:
        sql += " WHERE " + " AND ".join(clauses)
    sql += " ORDER BY r.created_at DESC, r.id DESC"

    rows = get_db().execute(sql, params).fetchall()
    return jsonify(requests=[row_to_dict(r) for r in rows])


@bp.get("/requests/<int:request_id>")
@login_required
def get_request(request_id):
    db = get_db()
    req = db.execute(REQUEST_SELECT + " WHERE r.id = ?", (request_id,)).fetchone()
    if req is None or not _can_view(req):
        return jsonify(error="Request not found"), 404

    history = db.execute(
        """SELECT h.status, h.note, h.created_at, u.name AS changed_by_name
           FROM status_history h LEFT JOIN users u ON u.id = h.changed_by
           WHERE h.request_id = ? ORDER BY h.id""",
        (request_id,),
    ).fetchall()

    return jsonify(request=row_to_dict(req), history=[row_to_dict(h) for h in history])


@bp.patch("/requests/<int:request_id>/status")
@admin_required
def update_status(request_id):
    data = request.get_json(silent=True) or {}
    status = data.get("status")
    note = (data.get("note") or "").strip() or None

    if status not in config.STATUSES:
        return jsonify(error="Invalid status"), 400

    db = get_db()
    req = db.execute("SELECT id FROM requests WHERE id = ?", (request_id,)).fetchone()
    if req is None:
        return jsonify(error="Request not found"), 404

    db.execute(
        "UPDATE requests SET status = ?, updated_at = datetime('now') WHERE id = ?",
        (status, request_id),
    )
    db.execute(
        "INSERT INTO status_history (request_id, status, note, changed_by) VALUES (?, ?, ?, ?)",
        (request_id, status, note, g.user["id"]),
    )
    db.commit()
    return get_request(request_id)


@bp.get("/stats")
@login_required
def stats():
    """Counts by status and category. Admins see system-wide numbers, citizens their own."""
    db = get_db()
    where, params = ("", []) if g.user["role"] == "admin" else ("WHERE user_id = ?", [g.user["id"]])

    by_status = {s: 0 for s in config.STATUSES}
    for row in db.execute(f"SELECT status, COUNT(*) AS n FROM requests {where} GROUP BY status", params):
        by_status[row["status"]] = row["n"]

    by_category = [
        row_to_dict(r)
        for r in db.execute(
            f"SELECT category, COUNT(*) AS n FROM requests {where} GROUP BY category ORDER BY n DESC",
            params,
        )
    ]

    total = sum(by_status.values())
    return jsonify(
        total=total,
        open=by_status["Pending"] + by_status["In Progress"],
        resolved=by_status["Resolved"],
        by_status=by_status,
        by_category=by_category,
        resolution_rate=round(by_status["Resolved"] / total * 100) if total else 0,
    )
