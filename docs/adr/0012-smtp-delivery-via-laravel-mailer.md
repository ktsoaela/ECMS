# ADR-0012: SMTP delivery through Laravel Mailer

**Status:** Accepted
**Date:** 2026-10-27
**Confidence:** High
**Supersedes:** [ADR-0002](0002-asynchronous-email-processing.md)
**Superseded by:** none

## Context

ADR-0002 put one queued job per recipient on the database queue and simulated the send. The application now has to deliver real email so a campaign can be checked in a Mailtrap sandbox inbox and sent through a company SMTP account. The queue shape in ADR-0002 still holds. Only the send step and its failure handling change. Kafka, RabbitMQ, and Redis stay out of scope.

## Options Considered

### Option 1 — Laravel Mailer, transport chosen by `MAIL_*` environment

The queued job sends a `Mailable` through Laravel's mailer. `MAIL_MAILER=log` writes the message to the log, `smtp` sends through Mailtrap or the company server, and `array` is used by PHPUnit. No code changes between environments.

Selected. It uses what the framework already ships and keeps credentials in `backend/.env`.

### Option 2 — A vendor HTTP API or SDK (Mailtrap API, SES, Mailgun)

Rejected. It adds a package and a provider-specific code path. A company mailbox is reachable over SMTP anyway.

### Option 3 — Keep the simulated send

Rejected. It cannot show that a message reaches an inbox.

## Decision

Keep everything ADR-0002 decided about the queue: `QUEUE_CONNECTION=database`, one `email_jobs` row and one `ProcessEmailJob` per recipient, dispatch after commit, FIFO with a single worker, and skip a job that is no longer `pending`.

Replace the simulated send with a real one:

- `ProcessEmailJob` sends `App\Mail\CampaignMail` to one recipient through the configured mailer. It does not queue the mailable again.
- The campaign `body` is sent as the HTML part. Plain-text bodies are escaped with line breaks kept. A text part is derived by stripping tags.
- A transport error is retried by the queue: 3 attempts with 10 s then 30 s back-off. The `email_jobs` row stays `pending` while a retry is due.
- After the last attempt, the job's `failed()` hook marks that row `failed` and updates the campaign status. Other recipients are unaffected.
- `MAIL_SEND_INTERVAL_MS` (default `0`) pauses the worker after each send for sandbox rate limits.
- `MAIL_MAILER=log` is the default in `.env.example`, so a fresh clone never sends real mail.

## Consequences

### Positive

- The same code path sends to the log, Mailtrap, or a company SMTP server.
- Temporary SMTP failures no longer turn into permanent `failed` rows.
- No new package, broker, or service.

### Negative

- A worker must be restarted after `MAIL_*` changes, because it caches configuration.
- If the SMTP server accepts a message and the status update then fails, a retry could send it twice. One worker and the `pending` check make this unlikely, but it can still happen.
- The SMTP account's sending limits now cap throughput.

## Tradeoffs

SMTP is chosen over provider APIs for portability. Bounce and open tracking are not handled. They would need a provider webhook and a new record. If volume grows, more workers and a provider API are the next step.
