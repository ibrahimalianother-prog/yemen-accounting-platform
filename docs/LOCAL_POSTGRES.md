# PostgreSQL local setup

1. Install PostgreSQL locally.
2. Create a database:
   createdb yemen_accounting
3. Add the variables to `.env.local`:
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/yemen_accounting?schema=public"
   AUTH_SECRET="replace_with_a_long_random_secret"
4. Run Prisma migration:
   npx prisma migrate dev --name init
5. Generate Prisma client:
   npx prisma generate
6. Open Prisma Studio:
   npx prisma studio

This is the exact local database setup needed before the app can store real accounting data.
