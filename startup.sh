#!/usr/bin/env bash
# Local startup helper for Email Campaign Management.
# Preferred path: Docker Compose. Optional: Herd + host Node against Compose MySQL.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

MODE="${1:-docker}"

info() { printf '==> %s\n' "$*"; }
warn() { printf '!!  %s\n' "$*" >&2; }
die() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || die "Missing required command: $1"
}

ensure_env_files() {
  if [[ ! -f .env ]]; then
    cp .env.example .env
    warn "Created .env from .env.example — set DB_USERNAME, DB_PASSWORD, MYSQL_ROOT_PASSWORD."
  fi
  if [[ ! -f backend/.env ]]; then
    cp backend/.env.example backend/.env
    warn "Created backend/.env from backend/.env.example — set DB credentials and APP_KEY."
  fi
}

docker_ready() {
  need_cmd docker
  docker info >/dev/null 2>&1 || die "Docker is installed but not running. Start Docker Desktop and retry."
  docker compose version >/dev/null 2>&1 || die "Docker Compose v2 is required (docker compose)."
}

start_docker() {
  docker_ready
  ensure_env_files

  if ! grep -q '^APP_KEY=base64:' backend/.env 2>/dev/null; then
    info "Generating APP_KEY"
    docker compose run --rm backend php artisan key:generate
  fi

  info "Building and starting Compose stack (mysql, backend, queue, frontend)"
  docker compose up -d --build

  info "Waiting for API health"
  for _ in $(seq 1 60); do
    if curl -sf http://localhost:8000/up >/dev/null 2>&1; then
      info "API is up: http://localhost:8000/up"
      break
    fi
    sleep 3
  done

  info "Services"
  docker compose ps
  cat <<EOF

App:      http://localhost:4200
API:      http://localhost:8000/api
Health:   http://localhost:8000/up
Queue:    docker compose logs -f queue
Migrate:  docker compose exec backend php artisan migrate
Tests:    docker compose exec backend php artisan test
EOF
}

check_host_deps() {
  info "Checking host dependencies (Herd / PHP / Node / MySQL client optional)"
  local missing=0
  for cmd in php composer node npm; do
    if command -v "$cmd" >/dev/null 2>&1; then
      info "found $cmd: $($cmd --version 2>/dev/null | head -n1)"
    else
      warn "missing $cmd"
      missing=1
    fi
  done
  if command -v mysql >/dev/null 2>&1; then
    info "found mysql client: $(mysql --version 2>/dev/null | head -n1)"
  else
    warn "mysql CLI not found (Workbench GUI alone is fine for inspection)"
  fi
  if command -v herd >/dev/null 2>&1; then
    info "found herd"
  else
    warn "Herd CLI not on PATH — link backend/ in Herd UI if you use host PHP"
  fi
  return "$missing"
}

start_host() {
  ensure_env_files
  if ! check_host_deps; then
    warn "Install missing tools, then re-run: ./startup.sh host"
  fi

  docker_ready
  info "Starting MySQL via Compose (host PHP/Node talk to localhost:3306)"
  docker compose up -d mysql

  if grep -qE '^DB_HOST=mysql' backend/.env; then
    warn "For Herd/host PHP set DB_HOST=127.0.0.1 in backend/.env (Compose containers use mysql)."
  fi

  info "Install PHP deps and migrate"
  (cd backend && composer install --no-interaction)
  if ! grep -q '^APP_KEY=base64:' backend/.env; then
    (cd backend && php artisan key:generate)
  fi
  (cd backend && php artisan migrate --force)

  info "Install frontend deps"
  (cd frontend && npm ci)

  cat <<EOF

MySQL is running in Docker on localhost:3306.

In separate terminals:

  cd backend && php artisan serve --host=127.0.0.1 --port=8000
  cd backend && php artisan queue:work --sleep=1 --tries=3 --timeout=90
  cd frontend && npx ng serve --host 0.0.0.0 --port 4200

Or use Herd for the API and only run queue:work + ng serve yourself.
EOF
}

usage() {
  cat <<EOF
Usage: ./startup.sh [docker|host|check]

  docker  (default) Ensure Docker is running, then compose up --build
  host    Check PHP/Composer/Node/Herd; start MySQL via Compose; print serve commands
  check   Only verify Docker / host toolchain presence

Production deploys are out of scope for this assessment (see docs/guardrails.md).
EOF
}

case "$MODE" in
  docker) start_docker ;;
  host) start_host ;;
  check)
    docker_ready && info "Docker OK"
    check_host_deps || true
    ;;
  -h|--help|help) usage ;;
  *) usage; die "Unknown mode: $MODE" ;;
esac
