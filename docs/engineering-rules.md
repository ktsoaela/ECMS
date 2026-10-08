# Development and Engineering Rules

Never commit unverified work. Every meaningful change must be demonstrable, explainable, and traceable.

The application is built in small slices. Each slice is implemented, run, checked, and only then committed. The history should show the order of the work, not one dump of the finished tree.

Architecture limits are in [guardrails.md](guardrails.md). Why a choice was made is in [adr/README.md](adr/README.md).

## Working application

The application stays runnable once it exists. A `feat`, `fix`, API change, or queue change is committed only after the affected behaviour has been exercised.

```text
Implement
    ↓
Run the application
    ↓
Use the affected behaviour
    ↓
Run the automated checks that exist
    ↓
Review the diff
    ↓
Commit
```

Do not commit a feature that has not been run. Incomplete work stays uncommitted. Do not label unfinished behaviour as a completed `feat`.

`docs` and `refactor` commits are verified by reading the change and by any test, build, or lint that applies. They do not need a full walkthrough of the UI.

The run-the-app rule starts when there is an application to run. A documentation-only change is verified by review.

## Checks before commit

When the Laravel tests exist:

```bash
php artisan test
```

When the Angular app exists, run the check that matches the change:

```bash
npm test
```

```bash
ng build
```

API changes are also exercised from Angular or an API client. Queue changes are exercised like this:

```text
Create a campaign
    ↓
Campaign and email jobs are stored
    ↓
Start the queue worker
    ↓
Jobs are processed and statuses change
    ↓
Angular shows the result
```

Scramble and the Postman collection become part of this check only after [ADR-0008](adr/0008-openapi-via-scramble.md) and the Postman deliverable are accepted. They are not a Phase 1 blocker.

## Conventional Commits

Commits follow [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/).

```text
<type>[optional scope]: <description>
```

Types used here: `feat`, `fix`, `docs`, `test`, `refactor`, `ci`, `chore`.

Scopes when they help: `api`, `queue`, `validation`, `db`, `ui`, `adr`.

```text
feat(api): add campaign creation endpoint
feat(queue): process campaign email jobs
fix(validation): reject duplicate recipient emails
test(api): add campaign submission tests
test(queue): verify failed email jobs
refactor(campaign): move creation logic into service
docs(adr): document queue architecture decision
ci: add Laravel and Angular test pipeline
chore: update development dependencies
```

A breaking contract uses `!` after the type or scope, or a `BREAKING CHANGE` footer. Do not mark a commit breaking unless the JSON or behaviour contract actually changes.

One logical change per commit. Prefer a `feat` commit and a following `test` commit over `feat: add everything`. Do not mix an unrelated refactor into a feature commit.

Preferred order once implementation starts:

```text
feat(db): create campaign and email job migrations
test(db): verify campaign relationships
feat(api): add campaign creation endpoint
test(api): validate campaign submission
feat(queue): dispatch individual email jobs
test(queue): verify email job processing
feat(api): add campaign listing endpoint
feat(api): add campaign details endpoint
feat(ui): add campaign creation form
test(ui): validate campaign form
feat(ui): add campaign list
feat(ui): add campaign details
```

OpenAPI and CI commits come after the phase gate in [guardrails.md](guardrails.md).

## Explain the decision

For every accepted architectural choice, the ADR must answer:

- What was implemented.
- What problem it solves.
- Why this option was selected.
- What it improves and what complexity it adds.
- What would need to change if volume or requirements grew.

That explanation stays in the ADR. Do not repeat it as a long comment in code. An accepted ADR is not edited into a different decision. A new direction is a new record.

## Definition of done

A change is done when:

- The implementation exists and the application runs.
- The affected path was manually verified when the change is user-facing, an API behaviour, a queue change, or a bug fix.
- Automated tests for the important behaviour pass, and existing tests still pass.
- An ADR was added or superseded when the change is architectural.
- The diff was reviewed for extra complexity.
- The commit message matches Conventional Commits.

API documentation is updated when Scramble is in scope. It is not required to call a Phase 1 slice done.

No green check, no completed feature, no commit. The check is the test command when tests exist, and the manual run of the affected flow for behaviour changes.
