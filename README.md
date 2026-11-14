# Yemen Accounting Platform

Arabic RTL accounting-platform prototype for invoices, expenses, journal entries and reports.

## Current scope

- Dashboard and screens for invoices, expenses, journals, reports, customers, vendors, and demo user-role administration.
- Static sample data and a read-only demo endpoint at `/api/demo`.
- Detail routes for invoices, expenses, and journal entries.
- Arabic RTL UI, Docker starter, CI build workflow, and product documentation under `docs/`.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Important limitations

This is **not production accounting software yet**. The login view is not real authentication; RBAC is a display/helper model, the demo API is public and read-only, and data is in-memory fixtures. No records persist, no accounting transactions are posted, and no legal/tax compliance is certified. See [deployment readiness](docs/DEPLOYMENT.md) before deployment.

## Next engineering milestones

1. PostgreSQL schema and migrations with tenant isolation.
2. Real authentication and server-side authorization.
3. Validated create/update workflows and transactional double-entry posting.
4. Automated tests, security review, production database/backups, and compliance review.
