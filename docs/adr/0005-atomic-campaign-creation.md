# ADR-0005: Atomic Campaign Creation

**Status:** Accepted
**Date:** 2026-10-08
**Confidence:** High
**Supersedes:** none
**Superseded by:** none

## Context

Submitting a campaign creates one campaign row and one email-job row per recipient. The assessment requires that a failure must not leave a campaign without its jobs, or jobs without a campaign.

## Options Considered

### Option 1 — Insert campaign and jobs in one database transaction

Commit both writes together. Dispatch queue jobs only after commit.

Selected. A failure rolls the writes back, and a worker cannot see rows that are not committed.

### Option 2 — Insert rows independently and dispatch inside the transaction

Rejected. A crash after the campaign insert would leave a partial campaign. A worker that starts before commit could process a row that later disappears.

### Option 3 — Compensating delete after a later failure

Rejected. Cleanup after the fact can itself fail and still leave partial data.

## Decision

Create the campaign and all of its email-job rows inside one database transaction. If any insert fails, roll back the whole unit. Dispatch the queued jobs after the transaction commits.

## Consequences

### Positive

- The database never keeps a campaign that is missing recipient rows from the same request.
- Workers only observe committed rows.

### Negative

- A large recipient list holds one transaction until every job row is inserted.
- Dispatch after commit means a process crash in that window can leave `pending` rows that are not yet on the queue. Recovery for that window is a later concern, not part of this record.

## Tradeoffs

One transaction is the smallest control that meets the assessment. A two-phase outbox would cover the post-commit crash and is deferred because this workload does not require it yet.
