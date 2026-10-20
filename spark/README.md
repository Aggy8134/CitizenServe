# CitizenServe — Public Service Request System

A mini eCitizen-style app where citizens report public service issues (broken streetlights,
water problems, garbage collection…) and city admins track and resolve them.

- **Backend:** Python 3 + Flask, SQLite (built-in `sqlite3`, no ORM)
- **Frontend:** Next.js 15 (App Router) + React 19, plain CSS

## Quick start

Requires **Python 3.10+** and **Node.js 18.18+**. Use two terminals from the project folder.

**Terminal 1 — backend**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python seed.py                  # optional demo data
python app.py                   # http://localhost:5001
```

**Terminal 2 — frontend**
```bash
cd frontend
cp .env.example .env.local      # Windows: copy .env.example .env.local
npm install
npm run dev                     # http://localhost:3000
```

Open **http://localhost:3000** and log in as admin `admin@city.gov` / `admin123`,
or as citizen `jane@example.com` / `password123` (after `seed.py`), or register a new account.

## Features

**Core**
- Citizen registration and login (hashed passwords, signed bearer tokens)
- Submit a request: category, location, description, optional photo (PNG/JPG/GIF/WEBP, max 5 MB)
- Admin dashboard listing every request
- Status tracking: **Pending → In Progress → Resolved**
- Analytics: total / open / resolved counts

**Bonus**
- Unique reference numbers (e.g. `SR-4F9A2C`) for each request
- Status history timeline, with optional admin notes visible to the citizen
- Visual progress stepper on the request page
- Search plus status and category filters (citizen and admin views)
- Charts: open vs resolved split, requests per category, resolution rate
- Role-based access: citizens only see their own requests, only admins can change status
- Image preview before upload
- Demo data seed script
- Responsive layout for mobile

## Project structure

```
backend/
  app.py              Flask app factory and entry point
  config.py           Settings (categories, statuses, upload limits, admin login)
  db.py               SQLite connection, schema setup, admin seeding
  auth.py             Token creation and @login_required / @admin_required decorators
  schema.sql          Tables: users, requests, status_history
  seed.py             Optional demo data
  routes/
    auth_routes.py    /api/auth/*
    request_routes.py /api/requests, /api/stats, /api/categories
  uploads/            Uploaded images
frontend/
  app/                Pages (landing, login, register, dashboard, admin, requests/new, requests/[id])
  components/         Navbar, AuthProvider, RequestList, RequestTable, StatCards, Analytics…
  lib/api.js          fetch wrapper and helpers
```

## Setup

You need **Python 3.10+** and **Node.js 18.18+**.

### 1. Backend (runs on http://localhost:5001)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python seed.py                  # optional: adds demo data
python app.py
```

The database file `service_requests.db` is created on first run.

### 2. Frontend (runs on http://localhost:3000)

In a second terminal:

```bash
cd frontend
cp .env.example .env.local      # points the app at http://localhost:5001
npm install
npm run dev
```

Open http://localhost:3000.

### Demo accounts

| Role    | Email              | Password      |
|---------|--------------------|---------------|
| Admin   | `admin@city.gov`   | `admin123`    |
| Citizen | `jane@example.com` | `password123` (only after running `seed.py`) |

You can also register a new citizen account from the UI.

## API reference

All endpoints return JSON. Protected endpoints need `Authorization: Bearer <token>`.

| Method | Endpoint                     | Access  | Description |
|--------|------------------------------|---------|-------------|
| POST   | `/api/auth/register`         | Public  | `{name, email, password}` → `{token, user}` |
| POST   | `/api/auth/login`            | Public  | `{email, password}` → `{token, user}` |
| GET    | `/api/auth/me`               | User    | Current user |
| GET    | `/api/categories`            | Public  | Available categories and statuses |
| POST   | `/api/requests`              | User    | Multipart form: `category, location, description, image?` |
| GET    | `/api/requests`              | User    | Own requests (admin: all). Query: `status`, `category`, `q` |
| GET    | `/api/requests/<id>`         | Owner / Admin | Request with status history |
| PATCH  | `/api/requests/<id>/status`  | Admin   | `{status, note?}` |
| GET    | `/api/stats`                 | User    | Counts by status and category (admin: system-wide) |
| GET    | `/uploads/<filename>`        | Public  | Uploaded images |

## Configuration

Backend settings can be overridden with environment variables: `SECRET_KEY`, `DATABASE_PATH`,
`FRONTEND_ORIGIN` (for CORS, default `http://localhost:3000`), `ADMIN_EMAIL`, `ADMIN_PASSWORD`.
Set your own `SECRET_KEY` before deploying anywhere.

The frontend reads `NEXT_PUBLIC_API_URL` (default `http://localhost:5001`).

> Port 5001 is used because macOS reserves port 5000 for AirPlay.
