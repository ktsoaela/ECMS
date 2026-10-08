# ADR-0007: HTTP versus Application Boundary

**Status:** Accepted
**Date:** 2026-10-08
**Confidence:** High
**Supersedes:** none
**Superseded by:** none

## Context

The assessment scores separation of responsibilities and asks for a simple structure. Campaign creation must validate input, write rows atomically, and dispatch work. Putting all of that in the controller mixes HTTP with the campaign rule.

These boundaries are part of the first implementation because Task 4 requires atomic writes, statuses are a closed set ([ADR-0003](0003-persistence.md)), and responses must not leak internal columns ([ADR-0004](0004-validation-and-api-contract.md)). They are not extra demonstration layers.

## Options Considered

### Option 1 — Controller, form request, one campaign service, API resources

The controller accepts the form request and returns a resource. `CampaignService` creates the campaign inside the transaction from [ADR-0005](0005-atomic-campaign-creation.md) and dispatches after commit. Eloquent remains the data access.

Selected.

### Option 2 — All campaign rules in the controller

Rejected. The controller would own validation, persistence, and dispatch, which the assessment calls out as poor separation.

### Option 3 — Domain repositories plus a mail-provider strategy

Rejected. There is one database and one simulated sender. Those abstractions have nothing to vary.

## Decision

Use one `CampaignService` for campaign creation and status updates that belong to the application. Keep validation in a form request. Return API resources that expose only the contract in [ADR-0004](0004-validation-and-api-contract.md). Use Eloquent from the service. Do not add a repository interface or a second email-provider strategy.

## Consequences

### Positive

- HTTP status codes and JSON stay in the HTTP layer.
- The transaction and dispatch rule have one home.
- Response fields stay on the allow-list.

### Negative

- There is a service class even while the application has only a few use cases.
- API resources are a thin mapping. They still need to be kept in step with the contract.

## Tradeoffs

A single service is enough structure for the scored separation. Further layering waits for a second persistence mechanism or a second sender, which this assessment does not have.
