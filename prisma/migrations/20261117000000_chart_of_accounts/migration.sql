-- Journal entries posted automatically from an invoice or expense remember their source.
ALTER TABLE "JournalEntry" ADD COLUMN "sourceType" TEXT,
ADD COLUMN "sourceId" TEXT,
ADD COLUMN "sourceEvent" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "JournalEntry_companyId_sourceType_sourceId_sourceEvent_key" ON "JournalEntry"("companyId", "sourceType", "sourceId", "sourceEvent");

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_companyId_code_key" ON "Account"("companyId", "code");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
