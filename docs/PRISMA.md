# Prisma

After setting `DATABASE_URL`:

- Development: `npx prisma migrate dev` (applies migrations and generates the client)
- Production / CI: `npx prisma migrate deploy`
- Regenerate the client only: `npx prisma generate`

Migrations live in `prisma/migrations/`. Do not edit an applied migration; add a new one.
