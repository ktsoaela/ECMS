# ADR-0002: Asynchronous Email Processing

**Status:** Accepted
**Date:** 2026-10-08
**Confidence:** High
**Supersedes:** none
**Superseded by:** none

## Context

A campaign can contain many recipients. Sending every email inside the HTTP request would make submission slow and would couple one recipient failure to the whole request. The assessment requires individual emails to be queued and processed asynchronously, in FIFO order where practical, without a real email provider.

## Options Considered

### Option 1 — Send during the create request

Rejected. Large lists would hold the request open, and one failure could fail submission.

### Option 2 — Laravel Queue, one job per recipient

Create one `email_jobs` row and dispatch one queued job per recipient. A worker simulates the send and updates that row.

Selected. It matches the required queue, isolates failures, and needs no extra broker.

### Option 3 — RabbitMQ, Kafka, or another external broker

Rejected. No volume requirement justifies another piece of infrastructure.

## Decision

Use Laravel Queue with `QUEUE_CONNECTION=database` for local running.

- One `email_jobs` row and one queued job per recipient.
- Dispatch only after the campaign transaction commits. See [ADR-0005](0005-atomic-campaign-creation.md).
- Process jobs in FIFO order.
- Simulate sending. Do not call an external mail provider.
- A job that is no longer `pending` is skipped, so a retry cannot send twice.
- A failed recipient is marked `failed` and does not stop the worker.
- Campaign status moves `queued` → `processing` → `done`.
- `done` means every recipient job is terminal (`sent` or `failed`). It does not mean every send succeeded.

## Consequences

### Positive

- Submission stays a short request.
- One bad recipient does not discard the campaign.
- The database queue runs with MySQL and needs no Redis.

### Negative

- Nothing sends until a worker is running.
- The database queue is enough for this assessment and is not a high-throughput broker.

## Tradeoffs

The database driver is accepted over Redis because the assessment does not require a separate queue server. Revisit only if a later workload shows the database queue cannot keep up.
