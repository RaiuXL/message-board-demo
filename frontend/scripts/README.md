# Integration scripts

- `start-all.js` boots the backend (`../api`) and the Next.js frontend at the same time. It exports the server processes so `Ctrl+C` tears down both. During integration tests the backend runs in SQLite mode via `DB_DIALECT=sqlite` and `DB_STORAGE=:memory:` so the suite stays isolated.
- `run-integration-tests.js` simply launches `start-all.js`, waits for `http://localhost:3000` and `http://localhost:4000` using `wait-on`, and then runs `npx playwright test` before shutting everything down.

Use `npm run integration:test` (defined in `package.json`) to run the full flow end-to-end.
