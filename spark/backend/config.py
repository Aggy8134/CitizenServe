"""Central configuration. Values can be overridden with environment variables."""
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-change-me")
DATABASE_PATH = os.environ.get("DATABASE_PATH", os.path.join(BASE_DIR, "service_requests.db"))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
FRONTEND_ORIGIN = os.environ.get("FRONTEND_ORIGIN", "http://localhost:3000")

MAX_UPLOAD_BYTES = 5 * 1024 * 1024  # 5 MB
ALLOWED_IMAGE_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}
TOKEN_MAX_AGE_SECONDS = 7 * 24 * 60 * 60  # tokens are valid for 7 days

CATEGORIES = [
    "Streetlight",
    "Water Supply",
    "Garbage Collection",
    "Roads & Potholes",
    "Drainage & Sewage",
    "Public Safety",
    "Other",
]
STATUSES = ["Pending", "In Progress", "Resolved"]

# Default admin account created on first run.
DEFAULT_ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@city.gov")
DEFAULT_ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "admin123")
