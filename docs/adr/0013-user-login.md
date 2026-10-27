# ADR-0013: Login and registration with Sanctum tokens

**Status:** Accepted
**Date:** 2026-10-27
**Confidence:** High
**Supersedes:** none
**Superseded by:** none

## Context

The campaign screens need a person to register and log in. The API and Angular app run on different local ports, so a cookie session is unreliable. Campaign JSON must still omit secrets. Laravel Sanctum is already installed for personal access tokens.

## Options Considered

### Option 1 — Sanctum bearer token

`POST /api/register` and `POST /api/login` return a token. Angular stores it and sends `Authorization: Bearer` on campaign requests. Logout deletes the current token. Campaign routes require `auth:sanctum`.

Selected. It uses the package already in the application and works across `localhost:4200` and `localhost:8000`.

### Option 2 — Cookie session

Rejected. The browser treats the two ports as different origins, so the session cookie is easy to drop.

### Option 3 — Leave the API open

Rejected. The screens would show a login form that does not protect the campaigns.

## Decision

Register and login issue a Sanctum personal access token. The token is returned only from those two responses. Campaign list, create, and detail require it. Validation failures stay on the existing 422 `{ error, details }` body. A missing or rejected token is HTTP 401.

## Consequences

### Positive

- Each campaign request is tied to a logged-in user.
- The campaign payload still does not include the token.

### Negative

- Existing API clients must log in before creating or reading campaigns.
- The token in the browser can be read by script on this origin. That is acceptable for this local app.

## Tradeoffs

A bearer token is chosen over a cookie so the two local ports keep working. Passwords are hashed by the `User` model. Password reset and email verification stay out until a later record needs them.
