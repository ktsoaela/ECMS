# ADR-0014: Campaign studio layout on the create screen

**Status:** Accepted
**Date:** 2026-10-27
**Confidence:** High
**Supersedes:** none
**Superseded by:** none

## Context

A standalone Campaign Studio page (`index.html`, `styles.css`, `app.js`) shows Header, Text, Image, and Button blocks in a library, a live canvas, and a settings pane. The create route is `http://localhost:4200/campaigns/new`. Loading that file with `file://`, or iframing it, would leave the Angular app.

[ADR-0011](0011-email-block-composer.md) already owns the blocks. They serialize to the campaign `body` string. The API and database do not store blocks.

## Options Considered

### Option 1 — Rebuild the studio layout in the Angular composer

The create screen uses the same three panes. Add, select, edit, desktop/mobile width, and reset stay in Angular. Submit still posts `name`, `subject`, `body`, and `recipient_emails`. Block fields stay the ADR-0011 model.

Selected.

### Option 2 — Open the downloaded HTML file

Rejected. `file://` is not the Angular route. The page loads Bootstrap and fonts from a CDN, writes templates to `localStorage`, opens a popup, and paints HTML with `innerHTML`. It has no recipients, no API submit, and no login.

### Option 3 — Store the studio’s extra fields (logo, kicker, emoji, button colour)

Rejected. Those fields are not in the serialized body contract. Adding them would change stored HTML without a persistence ADR.

## Decision

`/campaigns/new` renders the studio layout inside `EmailComposerComponent` and the create form. Do not serve `index.html`. Do not add a CDN, `localStorage` template, or preview popup. Reset restores the default Header and Text blocks and emits a new `body`. The canvas is the preview. Submit campaign remains the only save.

## Consequences

### Positive

- The create route shows the studio the prototype was drawn for.
- Serialization, validation, auth, and the API stay as they are.

### Negative

- The prototype’s brand, navigation, emoji image, and button colours are not editable. The existing headline, text, image URL, alt text, label, and link are.

## Tradeoffs

The layout is taken. The prototype’s extra content model is not. Structured block storage is still out of scope.
