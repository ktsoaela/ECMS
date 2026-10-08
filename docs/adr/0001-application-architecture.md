# ADR-0001: Application Architecture

**Status:** Accepted
**Date:** 2026-10-08
**Confidence:** High
**Supersedes:** none
**Superseded by:** none

## Context

Marketing users must create an email campaign, validate recipients, store the campaign, queue one email per recipient, process those emails asynchronously, and view campaign and email status. The assessment requires Laravel, MySQL, Laravel Queue, and Angular, inside an 8–12 hour window.

## Options Considered

### Option 1 — Laravel for API and UI

One Laravel application renders the pages and exposes the API.

Rejected. The assessment requires an Angular frontend, so a Blade UI would miss the full-stack requirement.

### Option 2 — Angular, Laravel API, MySQL, and Laravel Queue

Angular is the presentation layer. Laravel is the API and application layer. MySQL stores campaigns and email jobs. Laravel Queue processes each email asynchronously.

Selected. It matches the required stack, separates the frontend from the API, and fits the time box.

### Option 3 — Microservices

Split campaigns, email processing, and the UI into independently deployed services.

Rejected. The workload is one small application. Extra services would add operational cost without a scaling requirement.

## Decision

Use Angular 17+ standalone components, a Laravel REST API, MySQL, and Laravel Queue.

Repository layout:

```text
backend/     Laravel application
frontend/    Angular application
docs/        ADRs, guardrails, and engineering rules
```

## Consequences

### Positive

- The stack matches the assessment.
- The UI and API can change on their own contract.
- Later records can add documentation and CI without changing this shape.

### Negative

- Two applications must be installed and run.
- A queue worker must be running for emails to leave `pending`.

## Tradeoffs

Separate apps cost more setup than a single Laravel UI. That cost is accepted because the assessment requires both Angular and Laravel.
