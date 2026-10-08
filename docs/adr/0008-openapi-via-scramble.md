# ADR-0008: OpenAPI via Scramble

**Status:** Proposed
**Date:** 2026-10-08
**Confidence:** Medium
**Supersedes:** none
**Superseded by:** none

## Context

Reviewers need a readable description of `POST /api/campaigns`, `GET /api/campaigns`, and `GET /api/campaigns/{id}`. The core flow does not depend on generated documentation. This record is not implemented until the phase gate in [guardrails.md](../guardrails.md) has passed.

## Options Considered

### Option 1 — Scramble generates OpenAPI from Laravel routes, form requests, and API resources

Selected when this record is accepted. One generator stays aligned with the code.

### Option 2 — A hand-written OpenAPI file plus Scramble

Rejected. Two sources will drift.

### Option 3 — No API documentation beyond the README

Acceptable until the phase gate. It stops being enough once the API is stable and a reviewer needs an interactive reference.

## Decision

Proposed: adopt Scramble as the only OpenAPI source after Phase 1 works end to end. Do not add a second Swagger YAML document.

This record does not authorise implementing Scramble before the phase gate.

## Consequences

### Positive

- The published contract can be regenerated from the code that already enforces it.
- Angular and a Postman collection can be checked against one description.

### Negative

- Scramble is another PHP dependency and must be kept compatible with the installed Laravel version.
- Generated docs still need a human check against [ADR-0004](0004-validation-and-api-contract.md).

## Tradeoffs

Waiting keeps the first implementation on the required flow. Adopting Scramble later is justified only as documentation of a working API, not as a second implementation of validation.
