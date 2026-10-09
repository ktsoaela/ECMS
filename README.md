# Email Campaign Management System

Angular frontend, Laravel API, MySQL, and Laravel queue. Local development runs with Docker Compose (recommended) or Laravel Herd + local Node/MySQL.

## Requirements

**Docker path (default):**

- Docker Desktop (or Docker Engine + Compose v2)
- Git

**Host path (optional):**

- PHP 8.4+, Composer, Laravel Herd (or equivalent)
- Node 20+ and Angular CLI
- MySQL 8 (Docker MySQL or a local server; MySQL Workbench is optional for inspection)

## Architecture decisions

Accepted and proposed records live under [`docs/adr/`](docs/adr/README.md). Phase 1 implements **ADR-0001–0007** only. Constraints and the phase gate are in [`docs/guardrails.md`](docs/guardrails.md).

| ADR | Decision | Status |
| --- | --- | --- |
| [0001](docs/adr/0001-application-architecture.md) | Angular, Laravel API, MySQL, Laravel queue | Accepted |
| [0002](docs/adr/0002-asynchronous-email-processing.md) | One queued job per recipient (database queue) | Accepted |
| [0003](docs/adr/0003-persistence.md) | `campaigns` / `email_jobs` with status enums | Accepted |
| [0004](docs/adr/0004-validation-and-api-contract.md) | Form-request validation and fixed JSON contracts | Accepted |
| [0005](docs/adr/0005-atomic-campaign-creation.md) | Transaction, then dispatch after commit | Accepted |
| [0006](docs/adr/0006-processing-pipeline-not-etl.md) | Processing pipeline, not ETL | Accepted |
| [0007](docs/adr/0007-http-versus-application-boundary.md) | Thin controller, `CampaignService`, API resources | Accepted |
| [0008](docs/adr/0008-openapi-via-scramble.md) | OpenAPI via Scramble | Accepted |
| [0009](docs/adr/0009-ci.md) | GitHub Actions tests/build | Accepted |
| [0010](docs/adr/0010-email-template-design-system.md) | Block editor + Storybook deferred | Accepted |

## Assumptions

- Mail is **simulated** (no real mail provider).
- There is **no authentication**.
- Queue driver is `database`.
- Campaign `body` is a **plain string** (not a block document).
- Duplicate emails are detected after trim + lowercase.
- Pagination is omitted.
- Angular calls only the Laravel API; CORS allows `http://localhost:4200` only.
- Docker Compose is the supported one-command local run; Herd is optional for host PHP.

## Not completed / functionality deferred

These are intentional gaps, not accidental omissions. See [`TODO.md`](TODO.md).

| Item | Why |
| --- | --- |
| **Block editor** (Header / Text / Image / Button), sidebar edit, live preview | Brief technology note; Tasks 1–11 only require a string `body`. Deferred in [ADR-0010](docs/adr/0010-email-template-design-system.md) under the 8–12h budget so create/queue/list/detail ship first. |
| **Storybook** | Paired with the block editor; deferred with ADR-0010. |
| **Auth, real mail, Kafka/Redis/K8s, NgRx** | Out of scope per guardrails. |

Phase 2 after the gate: Scramble at http://localhost:8000/docs/api, Postman under [`postman/`](postman/Email_Campaigns_API.postman_collection.json), CI in [`.github/workflows/ci.yml`](.github/workflows/ci.yml).

## Quick start (Docker)

Or run `./startup.sh` (Git Bash / WSL / macOS/Linux) to check Docker and start the stack.

### 1. Clone and configure environment

```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

Edit **both** files and set database credentials (examples stay blank; do not commit secrets):

```env
DB_DATABASE=email_campaigns
DB_USERNAME=
DB_PASSWORD=
MYSQL_ROOT_PASSWORD=
```

Use the same `DB_USERNAME` and `DB_PASSWORD` in root `.env` and `backend/.env`. For Docker, keep `DB_HOST=mysql` in `backend/.env`.

Generate an application key:

```bash
docker compose run --rm backend php artisan key:generate
```

### 2. Database setup

Compose creates the MySQL database from `DB_DATABASE` / `MYSQL_*` on first start and stores data in the `mysql_data` volume.

Migrations run automatically when the **backend** container starts (`php artisan migrate`). The **queue** service does not migrate (`RUN_MIGRATIONS=false`) to avoid a race.

Manual migrate / status:

```bash
docker compose exec backend php artisan migrate
docker compose exec backend php artisan migrate:status
```

Reset DB volume (destroys data):

```bash
docker compose down -v
docker compose up -d --build
```

### 3. Start the stack

```bash
docker compose up -d --build
```

| Service   | URL / port            | Role                        |
|-----------|-----------------------|-----------------------------|
| frontend  | http://localhost:4200 | Angular app                 |
| backend   | http://localhost:8000 | Laravel API                 |
| mysql     | localhost:3306        | MySQL 8                     |
| queue     | (worker)              | Processes queued email jobs |

### 4. Queue worker

The `queue` service runs:

```bash
php artisan queue:work --sleep=1 --tries=3 --timeout=90
```

It starts with Compose after MySQL is healthy and the backend container has started. Watch it:

```bash
docker compose logs -f queue
docker compose ps queue
```

Restart only the worker:

```bash
docker compose restart queue
```

Run a one-off worker on the host (Herd path) against the same database:

```bash
cd backend
php artisan queue:work --sleep=1 --tries=3 --timeout=90
```

### 5. Verify

```bash
curl http://localhost:8000/up
curl http://localhost:8000/api/campaigns
```

Open http://localhost:4200 — create a campaign, wait for the worker, open detail and confirm recipient statuses move to `sent` (or `failed` when isolated).

API base URL used by Angular: `http://localhost:8000/api`.

### 6. Stop

```bash
docker compose down
```

Remove MySQL data as well:

```bash
docker compose down -v
```

## Useful commands

```bash
# Follow logs
docker compose logs -f backend
docker compose logs -f queue
docker compose logs -f frontend

# Laravel tests (Task 11)
docker compose exec backend php artisan test

# Shell into the API container
docker compose exec backend sh
```

## Project layout

```text
backend/            Laravel API and queue worker
frontend/           Angular 17+ app
docs/               ADRs, guardrails, engineering rules
TODO.md             Submission follow-ups and deferred work
startup.sh          Local/Docker startup helper
docker-compose.yml
```

## Notes

- Root `.env` feeds Docker Compose (MySQL user/password and published ports).
- `backend/.env` is used by Laravel; Compose also sets `DB_HOST=mysql`, `SESSION_DRIVER=file`, and `CACHE_STORE=file` inside containers.
- Do not commit `.env` or `backend/.env`.

## Optional: Herd instead of Docker for PHP

1. Start MySQL (Compose MySQL-only is fine: `docker compose up -d mysql`).
2. Link `backend/` in Laravel Herd.
3. Set `DB_HOST=127.0.0.1` in `backend/.env` so host PHP reaches the published MySQL port.
4. Run `php artisan migrate` and `php artisan queue:work` in `backend/`.
5. Run `npm start` (or `ng serve`) in `frontend/` on port 4200.

Default Docker workflow keeps `DB_HOST=mysql` and:

- App: http://localhost:4200
- API: http://localhost:8000 (health: http://localhost:8000/up)
