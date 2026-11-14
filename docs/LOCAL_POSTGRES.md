# PostgreSQL local setup

1. Install PostgreSQL locally.
2. Create a database:
   createdb yemen_accounting
3. Add DATABASE_URL in .env.local, for example:
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/yemen_accounting?schema=public"
   AUTH_SECRET="replace_with_a_long_random_secret"
4. Run the Prisma migration:
   npx prisma migrate dev --name init
5. Generate Prisma client if needed:
   npx prisma generate
6. Open Prisma Studio:
   npx prisma studio

This is the next concrete runtime setup required before production data can be stored.
