# ADR-0006: Processing Pipeline, Not ETL

**Status:** Accepted
**Date:** 2026-10-08
**Confidence:** High
**Supersedes:** none
**Superseded by:** none

## Context

The flow validates a request, writes campaign and email-job rows, and processes those jobs asynchronously. That can be mistaken for an ETL or ELT product. This workload is not a data-warehouse integration.

## Options Considered

### Option 1 — Describe and build it as an asynchronous processing pipeline

Request, validate, store, queue, worker, status update.

Selected. The name matches the required behaviour.

### Option 2 — Add an ETL or ELT tool and call the feature ETL

Rejected. There is no extract from an external source system, no warehouse load, and no transform stage beyond request validation. Adding a pipeline product would not satisfy a missing requirement.

## Decision

Document and implement this system as an asynchronous processing pipeline. Do not add an ETL or ELT product. Do not name this workload ETL or ELT in the README, code, or API.

## Consequences

### Positive

- The design stays on the required path from Angular to Laravel to MySQL to the queue.
- Reviewers are not asked to evaluate unused data-platform tooling.

### Negative

- Someone looking for a data-integration sample will not find one in this repository.

## Tradeoffs

A clearer name is chosen over a label that would suggest a different architecture. ETL remains a valid description for a different problem, not for this one.
