"""Entry point for the Public Service Request API.

Run with:  python app.py   (serves on http://localhost:5001)
"""
import os

from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS

import config
from db import close_db, init_db
from routes import auth_routes, request_routes


def create_app():
    app = Flask(__name__)
    app.config["SECRET_KEY"] = config.SECRET_KEY
    app.config["MAX_CONTENT_LENGTH"] = config.MAX_UPLOAD_BYTES

    CORS(app, origins=[config.FRONTEND_ORIGIN])
    os.makedirs(config.UPLOAD_FOLDER, exist_ok=True)
    init_db()

    app.teardown_appcontext(close_db)
    app.register_blueprint(auth_routes.bp)
    app.register_blueprint(request_routes.bp)

    @app.get("/uploads/<path:filename>")
    def uploaded_file(filename):
        return send_from_directory(config.UPLOAD_FOLDER, filename)

    @app.get("/api/health")
    def health():
        return jsonify(status="ok")

    @app.errorhandler(413)
    def too_large(_e):
        return jsonify(error="Image is too large (max 5 MB)"), 413

    @app.errorhandler(404)
    def not_found(_e):
        return jsonify(error="Not found"), 404

    return app


if __name__ == "__main__":
    create_app().run(debug=True, port=5001)
