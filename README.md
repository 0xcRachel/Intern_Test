# Exam Platform

Fullstack Laravel 11 exam platform (IELTS) with MySQL + MongoDB, Sanctum
authentication (including public student registration), admin exam management,
student attempts, autosave, analytics and document previews.

## Requirements

- Docker Desktop (WSL 2 backend) — installed at `D:\Docker` on this machine
- PHP 8.4 + Composer (only needed for local commands outside Docker)
- Node.js 22.22+ (only needed for the `frontend/` app)

## Quick start (Docker)

```powershell
copy .env.example .env
docker compose up -d --build
docker compose exec php php artisan app:check-connections
docker compose exec php php artisan test
```

Open **http://localhost:8080**.

`docker compose up` builds the PHP 8.4 image, waits for MySQL/MongoDB, runs
`migrate`, seeds the demo data and creates the MongoDB indexes automatically.
Set `RUN_SEED=false` in `docker-compose.yml` if you do not want the seeder to
run on every start. The index command is idempotent and can also be run by hand:
`docker compose exec php php artisan app:ensure-mongo-indexes`. The entrypoint
generates `APP_KEY` only when `.env` does not already contain one, so restarts
do not rotate keys or invalidate signed preview URLs.

### Demo accounts

| Role    | Email               | Password    |
|---------|---------------------|-------------|
| Admin   | admin@example.com   | password123 |
| Student | student@example.com | password123 |

### Ports

| Service | Container    | Host port |
|---------|--------------|-----------|
| Nginx   | `exam_nginx` | 8080      |
| PHP-FPM | `exam_php`   | 9000      |
| MySQL 8 | `exam_mysql` | 3307      |
| Mongo 7 | `exam_mongo` | 27018     |

The PHP container receives `DB_HOST=mysql`, `DB_PASSWORD=secret`,
`MONGO_HOST=mongo` and `MONGO_ENABLED=true` from `docker-compose.yml`, so the
local `.env` values (`127.0.0.1`) are kept for running commands outside Docker.

## Local development (without Docker)

The machine already has:

- Laragon MySQL 8.0.30 on `127.0.0.1:3306`, database `exam_db`, user `root` (no password)
- MongoDB 7.0.45 at `D:\mongodb`, listening on `127.0.0.1:27017`, with the
  development credentials `mongo_user` / `mongo_pass` already in `.env.example`
- PHP 8.4.26 at `D:\php84` with the `mongodb` extension

Start MongoDB manually:

```powershell
D:\mongodb\start-mongod.cmd
```

Then run:

```powershell
D:\php84\php.exe artisan key:generate   # first run only, if APP_KEY is empty
D:\php84\php.exe artisan migrate --seed
D:\php84\php.exe artisan app:ensure-mongo-indexes
D:\php84\php.exe artisan app:check-connections
D:\php84\php.exe artisan serve
```

The API is then available at `http://127.0.0.1:8000/api`. When running locally
without Docker, set `APP_URL=http://127.0.0.1:8000` in `.env` so signed preview
URLs point at the local server; `.env.example` uses port 8080 for Docker.

## Technical decisions

### Why MySQL and MongoDB?

- **MySQL** stores relational, strongly validated data: users, exams, questions,
  options, IELTS packages, units and documents. Foreign keys and unique indexes
  keep the schema consistent.
- **MongoDB** stores high-volume, document-shaped data: `attempts`,
  `activity_logs` and `preview_logs`. An attempt contains a snapshot of the
  shuffled questions and the submitted answers, which fits a document store.
- The Eloquent models fall back to the default SQL connection when the
  `mongodb` extension is unavailable or `MONGO_ENABLED=false`. This keeps local
  SQLite tests fast and isolated; `MONGO_ENABLED=false` is set in `phpunit.xml`.
- On MongoDB, attempt fields are stored as native BSON structures (not JSON
  strings), so analytics can use `$unwind`/`$group` over `wrong_questions`
  directly. Keyed answer maps become BSON documents; the SQL fallback keeps
  JSON text via `App\Casts\NativeArray`.
- Indexes are created for the query paths used by analytics and history:
  `attempts(user_id, created_at)`, `attempts(exam_id, status, created_at)`,
  `activity_logs(user_id, created_at)`, `activity_logs(action, created_at)`,
  `activity_logs(metadata.exam_id, created_at)`,
  `preview_logs(document_id, created_at)` and `preview_logs(user_id, created_at)`.

### Authentication and authorization

- Laravel Sanctum personal access tokens.
- Two roles: `admin` and `student`, enforced by the `IsAdmin` and `IsStudent`
  middleware. Public registration always creates a `student`; the `role` input
  is ignored, so the admin role cannot be self-assigned.
- Document preview URLs are short-lived signed URLs bound to the requesting
  user (`user` is part of the signed parameters). Generating a preview requires
  a Sanctum token; streaming validates the signature and logs the user ID.
  A viewer with a bearer token for a different user is rejected.

### Application structure

- Controllers stay thin; grading, exam listing, questions and analytics live in
  `app/Services`.
- Validation is handled by Form Requests.
- API responses use `ExamResource`, `QuestionResource` and `OptionResource`
  where the resource layer exists.
- Exam list caching uses a version key (`exams_cache_version`) and a role
  segment (`admin`/`student`) so admin writes invalidate only exam list entries
  instead of flushing the whole cache store, and an admin payload can never be
  served to a student.

### Exam-list caching (case 19)

`GET /api/exams` caches paginated lists for 60 seconds. The key includes the
`admin`/`student` role segment, the search term, page, page size and the
`exams_cache_version`; responses expose `X-Cache` and `cache_status`. Exam,
question and option writes bump the version, so cached admin payloads cannot be
served to students and count changes do not stay stale. The Postman collection
exercises the cached student list, registration and the authenticated preview
flow.

### Activity log

`ExamObserver`, `AttemptObserver` and the `ExamCreated` / `AttemptSubmitted`
listeners write to `activity_logs`; controllers do not write log rows directly.

## API overview

| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/register` | public (always creates a student) |
| POST | `/api/login` | public |
| GET | `/api/user` | authenticated |
| GET | `/api/exams` | authenticated |
| POST | `/api/exams/{exam}/attempts` | student |
| GET | `/api/attempts/{attempt}` | student (owner) |
| GET | `/api/attempts/{attempt}/resume` | student (owner) |
| POST/PATCH | `/api/attempts/{attempt}/save` | student (owner) |
| POST | `/api/attempts/{attempt}/submit` | student (owner) |
| GET | `/api/packages` | public |
| GET | `/api/packages/{package}` | public |
| GET | `/api/admin/exams` | admin |
| POST/PUT/DELETE | `/api/admin/exams/...` | admin |
| GET | `/api/admin/exams/{exam}/statistics` | admin |
| POST | `/api/documents/{document}/preview` | authenticated |
| GET | `/api/documents/{document}/stream` | signed URL bound to the preview requester |

A Postman collection is available at `postman_collection.json`.

## Testing

```powershell
docker compose exec php php artisan test
# or locally
D:\php84\php.exe artisan test
```

The suite covers registration/login and roles, admin CRUD, role-aware exam-list
caching, student attempts, autosave, grading, duplicate/overtime submission,
analytics, activity logs, document previews and the IELTS package. It runs
against SQLite in memory and does not require MySQL or MongoDB.

Frontend checks:

```powershell
cd frontend
npm run typecheck
npm run build
```

Both commands pass on the installed Node 22.12.0, but React Router 8 prints a
warning that it recommends Node >= 22.22.0.

## What is not finished, and why

- **Email verification / password reset**: not implemented. Registration
  creates a student account immediately and returns a Sanctum token; admin
  accounts are still provisioned by the seeder or directly in the database.
- **Swagger**: not generated. A Postman collection is provided instead.
- **Figma / design files**: the design documents describe the intended screens,
  but the Figma frames could not be verified from this repository.

## Troubleshooting

- `'docker' is not recognized`: open a new terminal after installing Docker
  Desktop, or add `D:\Docker\resources\bin` to `PATH`.
- Docker engine not starting: open Docker Desktop and wait for
  **Engine running**. On this machine the WSL data disk lives at
  `D:\Docker\data\wsl` (junction from `%LOCALAPPDATA%\Docker\wsl`).
- MySQL port conflict: the container publishes `3307`; local Laragon MySQL uses
  `3306`, so both can run at the same time.
- MongoDB port conflict: the container publishes `27018`; local MongoDB uses
  `27017`.
