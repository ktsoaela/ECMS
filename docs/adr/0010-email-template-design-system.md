# ADR-0010: Email Template Design System

**Status:** Proposed
**Date:** 2026-10-08
**Confidence:** High
**Supersedes:** none
**Superseded by:** none

## Context

The technology section of the brief mentions composing an email from Header, Text, Image, and Button blocks, with Storybook. Tasks 1–11 require a plain campaign `body` string, a form, a list, and a detail view. They do not require a block editor.

## Options Considered

### Option 1 — Keep `body` as a string and defer the block editor

Selected while this record stays Proposed. The API contract in [ADR-0004](0004-validation-and-api-contract.md) stays a string. Angular validates and submits that string.

### Option 2 — Build the block editor and Storybook in Phase 1

Rejected for the current scope. It replaces the required body field with a second product and consumes the time set aside for the queue and the campaign screens.

### Option 3 — Store blocks and also accept a plain body

Rejected until a new record defines the storage and the API. Doing both now would change the contract without an assessment requirement.

## Decision

Proposed and deferred: do not build content-block components or Storybook unless this record is explicitly accepted after the phase gate. Plain `body` remains the contract.

Confidence is high that the deferral is correct for the numbered tasks. Confidence would drop only if the submission is later judged on the unnumbered block-editor paragraph.

## Consequences

### Positive

- Phase 1 stays on create, validate, store, queue, process, and view.
- The API does not gain a block schema that Angular and PHPUnit would both have to carry.

### Negative

- The block-editor paragraph in the brief is unmet unless this record is later accepted and implemented.
- Storybook is absent from the first submission.

## Tradeoffs

The numbered tasks and the 8–12 hour limit outweigh the unnumbered design-system paragraph. Reopen this record only after the phase gate, and only with a new decision that says how blocks map to `body`.
