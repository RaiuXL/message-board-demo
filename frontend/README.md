# Staff Message Board Frontend

This is a Next.js + Tailwind frontend that sits on top of the Express/MySQL message board backend.

## Structure

- `app/` contains the Next.js layout and the `page.tsx` that renders messages, replies, and the inline forms.
- `services/api.ts` centralizes every API call the UI needs (`getMessages`, `createMessage`, `createReply`, etc.).
- `tests/unit/` contains the Jest suite that exercises the page-level behavior (rendering, submit flow, reply toggle, delete, etc.).
- `tests/integration/` holds Playwright specs that drive a running frontend + backend and validate the CRUD + reply UX described in `docs/message-board-spec.md`.
- `scripts/` includes helpers to start both services (`start-all.js`) and to run Playwright once they are up (`run-integration-tests.js`).

## Local development

```bash
npm install
npm run dev               # run the Next.js app against your preferred backend
npm run integration:serve  # spins up the Next.js shell + local API (SQLite in-memory)
```

## Testing

| Script | Description |
| --- | --- |
| `npm test` | Jest unit tests covering `tests/unit/HomePage.test.tsx`. |
| `npm run integration:serve` | Manually start the frontend and backend servers for manual checks. |
| `npm run integration:test` | Starts both services, waits for localhost:3000 & 4000, and runs the Playwright spec in `tests/integration`. |
| `npm run e2e:test` | Boots the stack and runs the Playwright suite in `tests/e2e/` to drive the real UI end-to-end. |

Running `npm run integration:test` gives you a deterministic URL so Playwright always hits `http://localhost:3000` after the backend resolves to `http://localhost:4000`. This mirrors the real HTTP interaction requirements from the assignment doc.

## Notes

- The Playwright runner uses `wait-on` so the browser tests only run once both services have finished booting.
- The backend runs in `sqlite` mode during the integration tests so the suite is isolated and fast.
- If you want to add more shared UI, put it under a new `components/` directory and import it from `app/page.tsx`, which keeps that file focused on composition and makes both Jest and Playwright tests easier to reason about.
