# Assessment follow-ups

Tracking polish and deferred work for submission. Phase 1 (Tasks 1–11) is implemented.

## Must fix before submit

| # | Item | Status |
| --- | --- | --- |
| 1 | Commit `app.config.ts` HttpClient fix (no `withFetch` / no client hydration under `ng serve`) | Done |
| 2 | README: Assumptions, Not completed, database/migrate, queue worker, ADR links | Done |
| 3 | Smoke happy path: create → worker → detail statuses → `php artisan test` green | In progress |

## Deferred (intentional)

| # | Item | Status | Notes |
| --- | --- | --- | --- |
| 4 | Block editor design system (Header / Text / Image / Button, sidebar, live preview, Storybook) | Not completed | [ADR-0010](docs/adr/0010-email-template-design-system.md) stays Proposed. Tasks 1–11 use a plain `body` string. Deferred under the 8–12h budget so queue and campaign screens ship first. |

## Nice-to-have (optional)

| # | Item | Status |
| --- | --- | --- |
| 5 | Angular tests (create form validation / service error mapping) | Not started |
| 6 | Phase 2: Scramble OpenAPI, Postman collection, GitHub Actions CI | Not started — wait for [phase gate](docs/guardrails.md) |

## README gaps closed

- Database setup / migrate section
- How to run and watch the queue worker
- Link to ADRs and decisions
- Assumptions and functionality not completed (block editor / Storybook)

## Practical path

- **~10 with Priorities 1–3:** items 1–3 + clear README rationale for item 4.
- **Feature-complete 10 on the brief’s editor paragraph:** also accept and build ADR-0010 (largest time sink).
