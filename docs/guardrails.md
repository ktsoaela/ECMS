# Guardrails

These are the constraints for implementation. Decisions and their rejected options live in [adr/README.md](adr/README.md). How to verify and commit lives in [engineering-rules.md](engineering-rules.md).

Phase 1 is the only work allowed until the gate below passes. Proposed ADRs stay unimplemented.

## Phase 1 must ship

Mapped to the assessment tasks:

1. `POST /api/campaigns` validates, stores, creates one email job per recipient, and returns `campaign_id`, `recipient_count`, and `status`.
2. Validation rules and the HTTP 422 body in [ADR-0004](adr/0004-validation-and-api-contract.md).
3. MySQL tables, foreign key, and status enums in [ADR-0003](adr/0003-persistence.md).
4. Campaign and email-job inserts in one transaction. Queue dispatch after commit. [ADR-0005](adr/0005-atomic-campaign-creation.md).
5. A queued job per recipient, simulated send, FIFO processing, isolated failure, and status updates. [ADR-0002](adr/0002-asynchronous-email-processing.md).
6. `GET /api/campaigns` for the list.
7. Angular form: name, subject, body, recipients, client validation, API submit, success message with campaign id and recipient count, and API validation errors.
8. Angular table: name, subject, recipient count, status, created time. Empty state when the list is empty.
9. `GET /api/campaigns/{id}` and an Angular detail view with body, recipient emails, and each email status.
10. Responsive layout, loading state, success feedback, validation messages, API error handling, and navigation between create and list.
11. PHPUnit for the cases in the testing rule: valid submit, persistence, missing fields, invalid email, duplicate email, one job per recipient, campaign association, processed job becomes `sent`, failed job stays isolated.

Laravel boundaries for this phase are fixed by [ADR-0007](adr/0007-http-versus-application-boundary.md): form request, one `CampaignService`, API resources, Eloquent. No repository interface.

## Phase gate

**Status: Passed (2026-10-09).**

Evidence:

- Campaign create from the API/UI stores one `email_jobs` row per recipient.
- The Compose `queue` worker processes jobs; detail shows recipient statuses (`sent` / isolated `failed` in PHPUnit).
- Task 11 PHPUnit suite is green (`php artisan test`, 13 tests).

Phase 2 may proceed. Accept and implement one proposed record at a time.

## Phase 2

Order after the gate:

1. [ADR-0008](adr/0008-openapi-via-scramble.md) — Scramble only. No hand-written Swagger YAML beside it.
2. A Postman collection under `postman/` for create, list, detail, and the validation failures. This has no ADR.
3. [ADR-0009](adr/0009-ci.md) — GitHub Actions runs PHPUnit and the Angular test or build. No deploy.
4. [ADR-0010](adr/0010-email-template-design-system.md) — Accepted as **deferral**: do not build the block editor/Storybook for this submission. Plain `body` stays the contract.

Move a record from `Proposed` to `Accepted` only when that work starts (or, for ADR-0010, when the deferral is confirmed). Do not edit an older record's decision to pretend it always included later work.

## Out of scope

Do not add these unless a new ADR accepts them because a requirement needs them:

- ETL or ELT tooling, or calling this workload ETL. [ADR-0006](adr/0006-processing-pipeline-not-etl.md).
- Kafka, RabbitMQ, Redis, Kubernetes, microservices, Elasticsearch, Terraform, or an AWS deploy.
- Authentication.
- A real mail provider.
- NgRx or another complex client state library.
- The Header, Text, Image, and Button editor, and Storybook. [ADR-0010](adr/0010-email-template-design-system.md). `body` stays a string.

## Status

Campaign: `queued` on create, `processing` when the first recipient job leaves `pending`, `done` when every recipient job is `sent` or `failed`.

Email job: `pending` on create, `sent` after a simulated send, `failed` when that recipient fails. A job that is not `pending` is not sent again.

## API

Success create is HTTP 201:

```json
{
  "campaign_id": 1,
  "recipient_count": 2,
  "status": "queued"
}
```

Validation failure is HTTP 422:

```json
{
  "error": "Invalid input",
  "details": {
    "subject": "Subject is required"
  }
}
```

List items expose only `id`, `name`, `subject`, `recipient_count`, `status`, and `created_at`.

Detail adds `body`, `updated_at` only if the screen needs it, and the recipient rows `recipient_email` plus `status`. Do not return hidden columns, tokens, or SQL errors.

Unknown campaign: HTTP 404. Unexpected failure: HTTP 500 with a generic message and a server log. No stack trace in the JSON.

## Assumptions

- Mail is simulated.
- There is no authentication.
- Local queue driver is `database`.
- Duplicate detection trims and lowercases emails.
- `done` includes campaigns that have one or more `failed` jobs.
- Pagination is omitted.
- Angular calls only the Laravel API. CORS allows the local Angular origin only.

## Secrets

Commit `.env.example` with empty or local-only values. Do not commit `.env`, passwords, or API keys. `poa.md` is research notes and is listed in `.gitignore`.
