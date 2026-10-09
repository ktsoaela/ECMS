# ADR-0008: OpenAPI via Scramble

**Status:** Accepted
**Date:** 2026-10-08
**Accepted:** 2026-10-09
**Confidence:** Medium
**Supersedes:** none
**Superseded by:** none

## Context

Reviewers need a readable description of `POST /api/campaigns`, `GET /api/campaigns`, and `GET /api/campaigns/{id}`. The core flow does not depend on generated documentation. The [phase gate](../guardrails.md) has passed, so documentation of the working API is now in scope.

## Options Considered

### Option 1 — Scramble generates OpenAPI from Laravel routes, form requests, and API resources

Selected. One generator stays aligned with the code.

### Option 2 — A hand-written OpenAPI file plus Scramble

Rejected. Two sources will drift.

### Option 3 — No API documentation beyond the README

Rejected after the phase gate. The API is stable enough for an interactive reference.

## Decision

Adopt Scramble (`dedoc/scramble`) as the only OpenAPI source. Do not add a second hand-written Swagger YAML document. Docs UI: `/docs/api`. Spec JSON: `/docs/api.json`.

## Consequences

### Positive

- The published contract can be regenerated from the code that already enforces it.
- Angular and a Postman collection can be checked against one description.

### Negative

- Scramble is another PHP dependency and must stay compatible with the installed Laravel version.
- Generated docs still need a human check against [ADR-0004](0004-validation-and-api-contract.md).

## Tradeoffs

Waiting until after Phase 1 kept the first implementation on the required flow. Scramble documents a working API; it is not a second implementation of validation.
