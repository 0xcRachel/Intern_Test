# Exam Platform

Fullstack Laravel 11 exam platform (IELTS) with MySQL + MongoDB, Sanctum
authentication (including public student registration and Google/GitHub OAuth),
admin exam management, student attempts, autosave, analytics, an IELTS package
storefront with cart/checkout/orders/enrollments, signed document previews and
an admin preview report. The React Router frontend is server-rendered, uses
Lenis for smooth scrolling and GSAP for light reveal motion.

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

The PHP container disables OPcache timestamp checks and caches config, routes
and views on startup for fast API responses. After editing backend PHP code,
run `docker compose restart php` (or rebuild) so the new files are loaded.

### Demo accounts

| Role    | Email               | Password    |
|---------|---------------------|-------------|
| Admin   | admin@example.com   | password123 |
| Student | student@example.com | password123 |

### Demo flows

1. Sign in as the student, open **Tài liệu IELTS**, add one or two packages to
   the cart and choose **Thanh toán**. The demo payment creates a paid order
   and enrollments immediately; no card data or real charge is involved.
2. Use coupon `IELTS10` (10%) or `BAND8` (15%) to verify server-side totals.
3. Open the user menu to see profile details, selected courses and purchased
   courses, then open **Khóa học của tôi**, **Đơn hàng** or **Hồ sơ**.
4. Sign in as the admin and open **Quản trị → Đơn hàng** for revenue and order
   management, **Đề luyện tập** for CRUD/search, or **Lượt xem thử** for the
   preview report. The dashboard also exposes the AI question assistant.

### Optional Google / GitHub OAuth

The app works without OAuth credentials; the login page reports each provider
as unavailable instead of failing. To enable one, set these values in `.env`
(the Compose file passes them into the PHP container):

```dotenv
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:8080/api/auth/google/callback

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_REDIRECT_URI=http://localhost:8080/api/auth/github/callback

FRONTEND_URL=http://localhost:8080
```

Register the exact callback URLs in Google Cloud Console / GitHub OAuth Apps.
The callback exchanges the provider code for a short-lived, one-time login code
and sends the browser back to `/login`; the API token is never placed in the
callback URL. Admins land in `/admin`, learners in `/exams`.

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

### Storefront, checkout and enrollments

- MySQL owns the commerce schema: `coupons`, `orders`, `order_items` and
  `enrollments`, with foreign keys and a unique `(user_id, package_id)` index on
  enrollments. Package catalog fields (`slug`, `level`, `duration_hours`,
  `rating`, `students_count`, `is_featured`, `outcomes`) live on `packages`.
- The browser keeps only product IDs and display data in `localStorage` for the
  cart. `POST /api/checkout/quote` and `POST /api/checkout` re-read every price,
  validate coupons and check existing enrollments on the server, so a client
  cannot submit its own total. Checkout writes the paid order, order items and
  enrollments inside one transaction; the demo payment is labelled everywhere.
- `GET /api/my/courses` is backed by enrollments, not by client state. The user
  menu fetches the learner's courses and selected cart items separately.

### OAuth flow

Laravel Socialite redirects to the provider and handles the callback. The
callback stores a random one-time code in the cache for three minutes together
with the Sanctum token, then redirects to the React login page. The login page
posts the code to `POST /api/auth/oauth/exchange`, consumes it and stores the
session under `examplatform.auth`. Provider availability is checked before the
button is enabled.

### AI question assistant

`frontend/app/lib/ai-question-bank.js` contains a curated local IELTS question
bank at three difficulties. The admin assistant generates drafts, displays the
correct answer, and inserts each accepted draft through the existing
`POST /api/admin/questions` endpoint. It does not call an external model or send
student data outside the application. Partial insert failures leave only the
unfinished drafts in the UI so retrying cannot silently duplicate questions.

### Preview report

The React reader renders the `preview_content` returned by the signed preview
endpoint. Each preview request is logged to `preview_logs`; the admin screen at
`/admin/previews` ranks documents and packages by views and shows recent
activity. The signed stream route remains available for embed/backward
compatibility and also logs when accessed.

### Notifications and loading feedback

`frontend/app/components/notifications.jsx` provides a global
`NotificationProvider` and `useNotifications()` helper. Action feedback (login
errors, OAuth availability, coupon results, checkout, profile saves) appears in
a stack that slides in from the right, supports four tones, closes manually and
auto-dismisses. Error toasts stay longer than success toasts. The animation
respects `prefers-reduced-motion`, and inline alerts remain only for persistent
page-load failures.

Filtering or paging the catalogue keeps the previous cards visible with a dimmed
busy state instead of replacing the page with a full skeleton. Checkout reuses
the quote returned by coupon validation, so applying a coupon does not trigger
a second identical API request.

### Catalogue query performance

Package list responses expose summary counts (`units_count`, `documents_count`,
`pdf_count`, `audio_count`) and omit the full unit/document tree; package detail
still includes the curriculum. `Document` hides `preview_content` from every
ordinary serialization and serves it only from the signed preview endpoint.
Package responses are browser-cacheable for 30 seconds. Together with OPcache
and optimized Laravel caches, warm `/api/packages` requests complete in roughly
20–40 ms locally instead of the earlier 130 ms+ (and multi-second cold spikes).

## API overview

| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/register` | public (always creates a student) |
| POST | `/api/login` | public |
| GET | `/api/auth/providers` | public |
| GET | `/api/auth/{provider}/redirect` | public (Google/GitHub) |
| POST | `/api/auth/oauth/exchange` | public, one-time code |
| GET | `/api/user` | authenticated |
| PATCH | `/api/profile` | authenticated |
| GET | `/api/exams` | authenticated |
| POST | `/api/exams/{exam}/attempts` | student |
| GET | `/api/attempts/{attempt}` | student (owner) |
| GET | `/api/attempts/{attempt}/resume` | student (owner) |
| POST/PATCH | `/api/attempts/{attempt}/save` | student (owner) |
| POST | `/api/attempts/{attempt}/submit` | student (owner) |
| GET | `/api/packages` | public (search, level filter, pagination) |
| GET | `/api/packages/{package}` | public |
| GET | `/api/my/courses` | authenticated |
| GET | `/api/orders` | authenticated |
| GET | `/api/orders/{order}` | authenticated, owner or admin |
| POST | `/api/checkout/quote` | authenticated, rate-limited |
| POST | `/api/checkout` | authenticated, rate-limited demo payment |
| GET | `/api/admin/dashboard` | admin |
| GET | `/api/admin/orders` | admin |
| GET | `/api/admin/preview-statistics` | admin |
| GET | `/api/admin/exams` | admin |
| POST/PUT/DELETE | `/api/admin/exams/...` | admin |
| GET | `/api/admin/exams/{exam}/statistics` | admin |
| POST | `/api/documents/{document}/preview` | authenticated, rate-limited |
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
analytics, activity logs, document previews, OAuth exchange, checkout/coupons,
enrollments, profile updates and the preview report. It runs against SQLite in
memory with `MONGO_ENABLED=false` and does not require MySQL or MongoDB.

Current result: **68 feature tests, 345 assertions** (69 tests / 346 assertions
including the unit example).

Frontend checks:

```powershell
cd frontend
npm run build
```

Docker uses Node 24. A local Node 22.12 installation builds successfully but
React Router 8 prints a warning recommending Node >= 22.22.0.

## What is not finished, and why

- **Real payments**: checkout is intentionally a demo. It creates a paid order
  only to exercise orders and enrollments; no card gateway or webhook exists.
- **Production course files and PDF.js**: documents store generated preview
  pages and metadata in the database. The reader implements paginated text/audio
  previews from `preview_content`; it does not ship scanned PDFs or drive pdf.js
  over private files. The signed stream URL remains for compatibility.
- **External AI model**: the admin assistant is deterministic and uses the local
  IELTS bank, so it works offline and sends no data to a third-party service.
- **Email verification / password reset**: not implemented. Registration
  creates a student account immediately and returns a Sanctum token; admin
  accounts are provisioned by the seeder or directly in the database.
- **OAuth without credentials**: the code path is complete, but Google/GitHub
  end-to-end login cannot be exercised until client IDs and secrets are added.
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
