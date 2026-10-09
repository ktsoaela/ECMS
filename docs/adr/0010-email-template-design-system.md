# ADR-0010: Email Template Design System

**Status:** Accepted
**Date:** 2026-10-08
**Accepted:** 2026-10-09
**Confidence:** High
**Supersedes:** none
**Superseded by:** none

## Context

The technology section of the brief mentions composing an email from Header, Text, Image, and Button blocks, with Storybook. Tasks 1–11 require a plain campaign `body` string, a form, a list, and a detail view. They do not require a block editor.

The [phase gate](../guardrails.md) has passed. This record is accepted to lock the submission scope: the design-system paragraph stays unmet on purpose.

## Options Considered

### Option 1 — Keep `body` as a string and do not ship a block editor

Selected. The API contract in [ADR-0004](0004-validation-and-api-contract.md) stays a string. Angular validates and submits that string. No Storybook.

### Option 2 — Build the block editor and Storybook for this submission

Rejected. It replaces the required body field with a second product and would consume the time already spent on the queue and campaign screens.

### Option 3 — Store blocks and also accept a plain body

Rejected. Doing both would change the contract without an assessment requirement for Tasks 1–11.

## Decision

Do not build content-block components or Storybook in this assessment submission. Plain `body` remains the contract. A future product that needs blocks must open a **new** ADR that defines storage and the API mapping; this record does not authorise that work.

## Consequences

### Positive

- Phase 1 deliverables stay the scored create / queue / list / detail flow.
- The API does not gain a block schema that Angular and PHPUnit would both have to carry.
- Reviewers see an explicit, accepted deferral rather than an unfinished feature.

### Negative

- The block-editor paragraph in the brief is unmet.
- Storybook is absent from the submission.

## Tradeoffs

The numbered tasks and the 8–12 hour limit outweigh the unnumbered design-system paragraph. Accepting the deferral closes ADR-0010 without pretending the editor was built.
