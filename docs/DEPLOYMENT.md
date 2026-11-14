# Deployment readiness

## Current state

This repository is a working prototype backed by PostgreSQL through Prisma. Pages read company-scoped data on the server (`lib/session.ts`), authentication uses a signed HTTP-only JWT cookie, and API routes enforce roles with `lib/server-auth.ts`. Document numbers are unique per company, posted journal entries are immutable (reversal only), and create/status-change operations are recorded in the `AuditLog` table. The role matrix in `lib/accessControl.ts` is descriptive; the enforced roles live in each route and page.

## Local run

- Node.js 20 LTS recommended
- Copy `.env.example` to `.env` and set `DATABASE_URL` and `AUTH_SECRET`
- `npm install`, then `npx prisma migrate deploy`
- `npm run dev`, then open http://localhost:3000 and register at `/register`

## Before any real financial use

1. Take tested database backups and restore drills; run `npx prisma migrate deploy` as a release step.
2. Replace the in-memory rate limiter (`lib/rateLimit.ts`) with a shared store when running more than one instance, and add CSRF protection for cookie-authenticated mutations if the API is ever called cross-site.
3. Support partial payments and payment methods, review the back-filled entries with your accountant, and add period closing.
4. Add attachment storage controls, password reset / email verification, session revocation, and secrets management.
5. Review Yemeni tax, accounting, employment, privacy, and record-retention requirements with qualified local professionals before enabling compliance claims.
6. Add automated unit/integration/e2e tests and CI checks; verify the production build before deployment.

## Deployment

The included Dockerfile builds a Next.js standalone image. `AUTH_SECRET` is mandatory in production (the app refuses to verify tokens without it). Configure `DATABASE_URL`, TLS, monitoring, and apply migrations before starting the container. No real credentials or secret values belong in this repository.
