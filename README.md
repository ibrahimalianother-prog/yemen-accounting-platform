# Yemen Accounting Platform

Arabic RTL accounting platform for invoices, expenses, journal entries and reports.

## Current scope

- Registration and login with bcrypt-hashed passwords and a signed HTTP-only JWT cookie; logout endpoint; in-memory rate limiting on login and registration.
- PostgreSQL via Prisma; every page and API route is scoped to the signed-in user's company.
- Dashboard, invoices, expenses, journal entries (balanced double-entry validation), customers, vendors, reports (income summary and trial balance from posted entries), settings and user listing.
- Document numbers (invoices, expenses, journal entries) are unique per company.
- Status workflows: invoices (draft, pending, paid, cancelled), expenses (draft, posted, cancelled) and journal entries (draft, posted, cancelled).
- Posted journal entries are immutable; they can only be reversed by a new, balanced, opposite entry.
- Audit log entries are written for create and status-change operations, with a viewer at `/admin/audit`.
- Owners can add team members, change their roles and deactivate accounts; roles are re-checked against the database on every API call, so changes apply immediately.
- Invoices support line items (the subtotal and total are computed on the server); expenses support per-company categories.
- Chart of accounts (`/accounts`, default accounts created per company on first use); manual journal lines must use accounts from it.
- Automatic double-entry posting (`lib/accounting.ts`): an issued invoice posts Dr receivables / Cr sales and tax payable, a paid invoice also posts Dr cash / Cr receivables, and a posted expense posts Dr its category's expense account (general expenses when the category is not mapped) / Cr cash. Cancelling an invoice or expense reverses its entries. The status change and its entries are committed in one transaction.
- Expense categories can be mapped to expense accounts from the chart (`/expenses`); the mapping applies to expenses posted afterwards.
- Documents that predate automatic posting can be back-filled from `/accounts` ("إنشاء القيود المفقودة"). It only creates missing entries for issued/paid invoices and posted expenses, and is safe to repeat.
- Role-based access (owner, accountant, cashier, sales, auditor) enforced on the server.
- Security headers, Docker standalone build, CI build workflow, and documentation under `docs/`.

## Run locally

```bash
cp .env.example .env   # then set DATABASE_URL and AUTH_SECRET
npm install
npx prisma migrate deploy
npm run dev
```

Open `http://localhost:3000`, create an account at `/register`, then sign in.

## Important limitations

This is **not certified production accounting software**. Automatic posting uses a fixed account mapping for invoices (cash settlement, a single sales account, no partial payments), back-filled payment entries are dated by the invoice's last update because the exact payment date was never stored, back-filling skips documents whose entry numbers clash with existing ones (they are listed in the result), changing a category's mapping does not rewrite entries already posted, there is no password reset or email verification, the rate limiter is per-process (use a shared store when running several instances), there are no automated tests, and no legal/tax compliance is certified. Existing JWTs remain valid for up to 7 days after logout (deactivated users are rejected immediately). See [deployment readiness](docs/DEPLOYMENT.md) before deployment.

## Next engineering milestones

1. Partial payments, payment methods and period closing.
2. Password reset, email verification and session revocation.
3. Automated tests, production database/backups, and compliance review.
