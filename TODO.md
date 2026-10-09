# Assessment follow-ups

Phase 1 (Tasks 1–11) and Phase 2 ADR close-out are done. The [phase gate](docs/guardrails.md) passed on 2026-10-09.

## Must fix before submit

| # | Item | Status |
| --- | --- | --- |
| 1 | Commit `app.config.ts` HttpClient fix | Done |
| 2 | README: Assumptions, Not completed, database/migrate, queue worker, ADR links | Done |
| 3 | Smoke happy path: create → worker → detail → `php artisan test` | Done |

## ADRs

| ADR | Status | Notes |
| --- | --- | --- |
| 0001–0007 | Accepted | Phase 1 architecture — implemented |
| 0008 | Accepted | Scramble OpenAPI at `/docs/api` |
| 0009 | Accepted | GitHub Actions CI (PHPUnit + `ng build`) |
| 0010 | Accepted | **Deferral** — no block editor / Storybook; plain `body` |

## Deferred product work (by ADR-0010)

| Item | Status |
| --- | --- |
| Block editor (Header / Text / Image / Button), sidebar, live preview, Storybook | Not built — accepted deferral |

## Optional polish

| # | Item | Status |
| --- | --- | --- |
| 5 | Angular unit tests (form validation / service errors) | Not started — optional |

## How to run docs / Postman / CI locally

```bash
# OpenAPI UI (Docker stack running, APP_ENV=local)
open http://localhost:8000/docs/api

# Import postman/Email_Campaigns_API.postman_collection.json
# CI runs on push/PR to main|master|dev via .github/workflows/ci.yml
```
