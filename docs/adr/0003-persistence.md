# ADR-0003: Persistence

**Status:** Accepted
**Date:** 2026-10-08
**Confidence:** High
**Supersedes:** none
**Superseded by:** none

## Context

The assessment requires a `campaigns` table and an `email_jobs` table, a relationship between them, and closed sets of statuses. Queries must use Laravel's parameterised database access. Untrusted input must not be concatenated into SQL.

## Options Considered

### Option 1 — Eloquent models, migrations, and backed enums

`campaigns` has many `email_jobs` through `campaign_id`. Status values are PHP backed enums.

Selected. This is Laravel's normal persistence path and keeps status values out of free-form strings.

### Option 2 — Raw SQL built from request input

Rejected. It misses the required SQL-injection protection and Laravel conventions.

### Option 3 — A separate repository layer over Eloquent

Rejected for this workload. Eloquent already provides the data access. A second repository would add types without a second storage engine.

## Decision

Persist with Eloquent migrations and models.

`campaigns` contains at least `id`, `name`, `subject`, `body`, `recipient_count`, `status`, `created_at`, and `updated_at`.

`email_jobs` contains at least `id`, `campaign_id`, `recipient_email`, `status`, `created_at`, and `updated_at`, with a foreign key to `campaigns`.

Campaign status is `queued`, `processing`, or `done`. Email job status is `pending`, `sent`, or `failed`. Both sets are PHP backed enums.

## Consequences

### Positive

- The schema matches the assessment.
- Status values are checked by the type system.
- Eloquent parameter binding is the SQL-injection control.

### Negative

- Enum changes need a code change and, if stored values change, a migration.
- The schema does not store a mail-provider message id, because sending is simulated.

## Tradeoffs

Enums add a small amount of PHP for a closed set the API and worker both depend on. String columns without enums were rejected because a typo would silently create a new status.
