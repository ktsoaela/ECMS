# ADR-0004: Validation and API Contract

**Status:** Accepted
**Date:** 2026-10-08
**Confidence:** High
**Supersedes:** none
**Superseded by:** none

## Context

Campaign data must be validated before it is stored. The assessment fixes the success and error JSON shapes. The API must not return columns the client does not need.

## Options Considered

### Option 1 — Laravel form request and explicit response fields

Validate with a form request. Return only the fields named below. Normalise recipient emails before the duplicate check.

Selected. It uses Laravel validation and keeps the JSON contract stable for Angular.

### Option 2 — Laravel's default 422 `errors` array

Rejected as the public contract. The assessment shows `error` and `details`, not the framework default.

### Option 3 — Validate only in Angular

Rejected. The API must reject invalid input even when the client is bypassed.

## Decision

Validate on the server:

- `name`: required, maximum 255 characters.
- `subject`: required, maximum 255 characters.
- `body`: required, maximum 10,000 characters.
- `recipient_emails`: required, at least one address, each a valid email. Trim and lowercase before comparison. Duplicates are rejected.

`POST /api/campaigns` returns HTTP 201:

```json
{
  "campaign_id": 1,
  "recipient_count": 2,
  "status": "queued"
}
```

Validation failure returns HTTP 422:

```json
{
  "error": "Invalid input",
  "details": {
    "subject": "Subject is required",
    "recipient_emails": "Must contain valid emails"
  }
}
```

`GET /api/campaigns` returns an array of `id`, `name`, `subject`, `recipient_count`, `status`, and `created_at`. Pagination is not part of this contract.

`GET /api/campaigns/{id}` returns the campaign fields needed for the detail view, including `body`, plus each recipient email and email-job status. Unknown ids return HTTP 404.

## Consequences

### Positive

- Angular and PHPUnit can rely on one JSON shape.
- Internal columns stay off the wire.

### Negative

- The error shape is custom, so a generic Laravel exception renderer must be aligned with it for validation failures.
- Case-insensitive duplicates mean `A@test.com` and `a@test.com` are the same recipient.

## Tradeoffs

Matching the assessment's error JSON is more important than returning Laravel's default validation payload. Clients must use `details`, not `errors`.
