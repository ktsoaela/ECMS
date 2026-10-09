# ADR-0011: Minimal email block composer

**Status:** Accepted
**Date:** 2026-10-09
**Confidence:** Medium
**Supersedes:** [ADR-0010](0010-email-template-design-system.md)
**Superseded by:** none

## Context

ADR-0010 deferred the brief’s Header / Text / Image / Button design system and Storybook so Tasks 1–11 could ship first. The phase gate has passed. The assessment brief still names that design system explicitly. We need the smallest implementation that meets the brief without changing the Laravel API or database.

## Options Considered

### Option 1 — Angular block composer that serializes to the existing `body` string

Selected. Reusable block components, a sidebar editor, live preview, and Storybook stories. The create form submits the serialized HTML as `body` (max 10,000 characters). Detail view shows the stored body after Angular’s normal HTML sanitization — never `bypassSecurityTrustHtml`.

### Option 2 — Keep ADR-0010 deferral and submit without an editor

Rejected now that time remains to close the brief gap with a minimal composer.

### Option 3 — New block schema in MySQL / API

Rejected. Extra persistence is out of scope for the time box and would rewrite [ADR-0004](0004-validation-and-api-contract.md).

## Decision

Build a front-end-only email block composer under `frontend/src/app/email-blocks/`. Support Header, Text, Image, and Button blocks. Selecting a block opens a sidebar form; the preview updates live. Serialize escaped HTML into the existing campaign `body` field. Document the components in Storybook. Do not change the API contract.

## Consequences

### Positive

- The brief’s design-system paragraph is addressed without Phase 2 backend work.
- Block UI stays decoupled from campaign submit logic.
- Unsafe HTML is mitigated by escaping on serialize and sanitizing on display.

### Negative

- Body becomes HTML rather than free-form plain text for composer-created campaigns.
- Storybook adds frontend tooling and a separate start command.
- Medium confidence: a fuller template product would still need a future ADR for structured storage.

## Tradeoffs

A string-serialized template is enough for the assessment. Structured block storage waits for a product requirement that cannot fit the current `body` field.
