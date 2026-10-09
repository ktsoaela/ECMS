# Patterns

A pattern is used only where a current problem needs it. The list is a map, not a requirement to implement every row.

## In use

| Pattern | Where it shows up |
| --- | --- |
| Layered HTTP to application | Controller calls `CampaignService` and returns a resource. [ADR-0007](adr/0007-http-versus-application-boundary.md). |
| Form request | Input validation and the 422 contract. [ADR-0004](adr/0004-validation-and-api-contract.md). |
| API resource | Response allow-list so internal columns stay off the wire. |
| Eloquent active record | Models and relationships. No repository interface. [ADR-0003](adr/0003-persistence.md). |
| Transaction | Campaign and email-job inserts commit or roll back together. [ADR-0005](adr/0005-atomic-campaign-creation.md). |
| Queued job | One job per recipient, processed by the Laravel worker. [ADR-0002](adr/0002-asynchronous-email-processing.md). |
| Angular components and a campaign service | Standalone screens, reactive forms, and one service that calls the API. Signals or that service hold view state. |
| OpenAPI via Scramble | Generated docs at `/docs/api` and `/docs/api.json`. [ADR-0008](adr/0008-openapi-via-scramble.md). |
| CI workflow | GitHub Actions runs PHPUnit and `ng build`. [ADR-0009](adr/0009-ci.md). |
| Email block composer + Storybook | Reusable Header/Text/Image/Button blocks; serialize to `body`. [ADR-0011](adr/0011-email-block-composer.md). |

## Not introduced

| Pattern | Why it stays out |
| --- | --- |
| Repository abstraction | Eloquent is the only data access. |
| Strategy for mail providers | Sending is simulated. There is no second provider. |
| Structured block persistence | Front-end composer serializes to `body` only. [ADR-0011](adr/0011-email-block-composer.md). |
| ETL or ELT pipeline | This workload is an asynchronous processing pipeline. [ADR-0006](adr/0006-processing-pipeline-not-etl.md). |

Add a row here only after an ADR accepts the pattern. Do not add the pattern first and document it afterwards.
