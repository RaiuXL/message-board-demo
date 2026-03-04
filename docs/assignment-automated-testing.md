# SDEV 372 – Automated Testing Sprint

## Objective
Add automated tests across the full stack to prevent regressions.

---

## Required Test Types

### 1. Backend Unit Tests
- Test isolated functions
- Mock DB / external dependencies

### 2. Frontend Unit Tests
- Test individual React components
- Mock API calls

### 3. Integration Tests
- Send real HTTP requests
- Use real DB interactions

### 4. End-to-End (E2E) Tests
- Automate real browser
- Simulate full user flows

## Current Project Stack

- **Frontend:** Next.js 16 (app router + Turbopack) with React 19 + Tailwind CSS
- **Backend:** Node 20 + Express, using `mysql2` + Sequelize for the data layer
- **Database:** Targets MySQL by default but falls back to SQLite (in-memory) for Jest/Playwright suites; migrations are handled via Sequelize models
- **Containerization:** Not required (no Docker files tracked)
- **Auth:** None (open staff message board)
