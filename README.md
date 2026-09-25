# Fablab Components & Machines API

A single-deployable REST API built with Node.js, Express, SQLite, JWT, and bcrypt.

## Setup

1. Install Node.js 18 or newer.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env` and set a long random `JWT_SECRET`.
4. Start the server:

   ```bash
   npm run dev
   ```

The SQLite database is created automatically at `./data/fablab.sqlite`. The server binds to `0.0.0.0`, so it is reachable from other machines on the network, not only `localhost`.

## Endpoints

- `POST /auth/register`, `POST /auth/login`
- `GET /components`, `POST/PATCH/DELETE /components[/:id]`
- `GET /machines`, `POST/PATCH/DELETE /machines[/:id]`
- `GET /availability`, `POST /availability`, `PATCH /availability/:id`
- `GET/POST /bookings`
- `PATCH /bookings/:id/approve`, `/reject`, `/return`
- `GET /health`

Send the JWT as `Authorization: Bearer <token>`.

Booking creation uses a SQLite write transaction (`BEGIN IMMEDIATE` through better-sqlite3), checks overlapping pending/approved/active bookings, and inserts only when the target is available and conflict-free. A five-minute interval marks expired active bookings as overdue.

For a production deployment, use a process manager and configure a strong secret outside source control. Role assignment is intentionally accepted during registration for this self-contained deployment; restrict or replace that behavior when connecting it to a trusted administrative onboarding flow.
