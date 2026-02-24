# Staff Message Board – Automated Testing Demo

## Purpose

Build a simplified staff message board inspired by my workplace EHR system.
This app will demonstrate all required automated testing layers.

---

## Stack

Frontend:
- Next.js
- React
- Tailwind CSS

Backend:
- Node.js
- Express
- mysql2 (no ORM)

Database:
- MySQL (Docker)

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