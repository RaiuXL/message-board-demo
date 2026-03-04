# Staff Message Board – Automated Testing Demo

## Purpose

Build a simplified staff message board inspired by my workplace EHR system.
This app will demonstrate all required automated testing layers.

---

## Stack

Frontend:
- Next.js 16 (app directory, Turbopack)
- React 19
- Tailwind CSS

Backend:
- Node.js
- Express
- mysql2 + Sequelize ORM
- SQLite (in-memory) used for local/integration runs via env configuration

Database:
- MySQL (primary target; mirrored via Sequelize models)
- SQLite (in-memory) for automated test suites

---

## Entities

Message:
- id
- title
- body
- author_name
- created_at

Reply:
- id
- message_id (foreign key)
- body
- author_name
- created_at

Relationship:
- One message has many replies.
- Replies are deleted if parent message is deleted.

---

## Behavior Rules

Messages:
- Sorted by newest created_at (descending).
- Display title, preview of body, author_name, created_at.
- Display reply count.
- Expands inline when clicked.

Replies:
- Sorted oldest to newest.
- Created via inline form under expanded message.

No authentication.
No archiving.
No real-time updates.

---

## Required Endpoints

POST   /messages
GET    /messages
GET    /messages/:id
DELETE /messages/:id

POST   /messages/:id/replies
GET    /messages/:id/replies

---

## Testing Requirements

Must implement:

1. Backend unit tests
2. Backend integration tests
3. Frontend unit tests
4. End-to-end tests

All tests must reflect this domain model.

## Testing coverage in this project

- **Backend unit tests** live under `api/tests/unit` and use Jest + Supertest against `createTestApp()`. Sequelize models (`Message`, `Reply`) are mocked so each route handler is verified in isolation (status codes, payload shape, error handling).
- **Backend integration test** (`api/tests/integration/message-board.integration.test.js`) boots the Express app with an in-memory SQLite database and drives real HTTP requests through the full Sequelize-backed stack (`POST`, `GET`, `DELETE`), confirming the request → DB → response cycle.
- **Frontend unit test** (`frontend/tests/unit/HomePage.test.tsx`) renders the `HomePage` component with React Testing Library, mocks `global.fetch`, and asserts component behavior (rendering fetched data, submitting forms, toggling replies) without starting a server.
- **Frontend integration test** (`frontend/tests/integration/message-board.spec.ts`) starts the API + frontend dev servers via `scripts/run-integration-tests.js` and uses Playwright to exercise the UI and API together: create a message, show replies, post a reply, refresh counts, and delete the card while touching the real SQLite-backed API.
- **Frontend end-to-end test** (`frontend/tests/e2e/message-board.e2e.ts`) is run with `scripts/run-e2e-tests.js`/`npm run e2e:test`, which also starts both servers and then launches Playwright against `tests/e2e`. It performs the full browser flow (fill forms, toggle replies, delete) exactly as a user would, validating the entire experience from UI to persistence.

Scripts:
- `npm run test` (backend/frontends) → Jest unit suites.
- `npm run integration:test` (frontend) → starts API + Next + runs Playwright integration spec.
- `npm run e2e:test` (frontend) → similar but points Playwright at `tests/e2e`.
