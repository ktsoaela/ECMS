# Email Campaign Management System

Angular frontend, Laravel API, MySQL, and Laravel queue. Local development runs with Docker Compose.

## Requirements

- Docker Desktop (or Docker Engine + Compose v2)
- Git

## Quick start (Docker)

### 1. Clone and configure environment

```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

Edit **both** files and set database credentials (leave them blank in the examples; do not commit real secrets):

```env
DB_DATABASE=email_campaigns
DB_USERNAME=
DB_PASSWORD=
MYSQL_ROOT_PASSWORD=
```

Use the same `DB_USERNAME` and `DB_PASSWORD` in root `.env` and `backend/.env`.

Generate an application key:

```bash
docker compose run --rm backend php artisan key:generate
```

Or, if PHP is available on the host:

```bash
cd backend
php artisan key:generate
cd ..
```

### 2. Start the stack

```bash
docker compose up -d --build
```

Only the `backend` service runs migrations. The `queue` worker waits until the API container has started.


Services:

| Service   | URL / port              | Role                          |
|-----------|-------------------------|-------------------------------|
| frontend  | http://localhost:4200   | Angular app                   |
| backend   | http://localhost:8000   | Laravel API                   |
| mysql     | localhost:3306          | MySQL 8                       |
| queue     | (worker)                | Processes queued email jobs   |

### 3. Verify

```bash
curl http://localhost:8000/up
```

Open http://localhost:4200 in a browser.

API base URL used by Angular: `http://localhost:8000/api`.

### 4. Stop

```bash
docker compose down
```

To also remove the MySQL data volume:

```bash
docker compose down -v
```

## Useful commands

```bash
# Follow logs
docker compose logs -f backend
docker compose logs -f queue
docker compose logs -f frontend

# Run migrations manually
docker compose exec backend php artisan migrate

# Run Laravel tests
docker compose exec backend php artisan test

# Shell into the API container
docker compose exec backend sh
```

## Project layout

```text
backend/     Laravel API and queue worker
frontend/    Angular 17+ app
docs/        ADRs, guardrails, engineering rules
docker-compose.yml
```

## Notes

- Root `.env` feeds Docker Compose (MySQL user/password and published ports).
- `backend/.env` is used by Laravel; Compose overrides `DB_HOST` to `mysql` inside containers.
- CORS allows `http://localhost:4200` only.
- Do not commit `.env` or `backend/.env`.

## Optional: Herd instead of Docker for PHP

You can still link `backend/` in Laravel Herd. Set `DB_HOST=127.0.0.1` in `backend/.env` so PHP on the host reaches the published MySQL port. With the default Docker workflow, keep `DB_HOST=mysql` and use:

- App: http://localhost:4200
- API: http://localhost:8000 (health: http://localhost:8000/up)
