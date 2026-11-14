# Demo and deployment readiness

## Current state

This repository is a UI/API prototype. The dashboard, invoice, expense, journal, contact, and report screens use static fixtures in `lib/mockData.ts`. `GET /api/demo` returns those fixtures. The login form is not an authentication implementation; the role matrix in `lib/accessControl.ts` is illustrative only.

## Local run

- Node.js 20 LTS recommended
- `npm ci` (or `npm install` until a lockfile is committed)
- `npm run dev`
- Open http://localhost:3000

## Before any real financial use

1. Add PostgreSQL and migrations; scope every tenant-owned row by company ID and enforce isolation in server-side queries.
2. Add verified authentication (secure, HTTP-only cookies, session rotation, CSRF protections as appropriate) and server-side authorization on every page and API route. Do not rely on UI permissions.
3. Implement transactional posting with balanced debit/credit validation, idempotency, immutable posted entries, reversal workflows, and unique per-company document numbers.
4. Add input validation, rate limiting, security headers, secrets management, attachment scanning/storage controls, audit logs, and tested backup/restore.
5. Review Yemeni tax, accounting, employment, privacy, and record-retention requirements with qualified local professionals before enabling compliance claims.
6. Add automated unit/integration/e2e tests and CI checks; verify production build before deployment.

## Deployment

The included Dockerfile is a starter for a Next.js standalone build. Configure a deployment platform, TLS, environment variables, monitoring, database, backups, and access controls before exposing the service publicly. No real credentials or secret values belong in this repository.
