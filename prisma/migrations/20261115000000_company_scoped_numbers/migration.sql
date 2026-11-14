-- Document numbers become unique per company instead of globally.
DROP INDEX "Invoice_invoiceNumber_key";
DROP INDEX "Expense_expenseNumber_key";
DROP INDEX "JournalEntry_entryNumber_key";

-- A reversing journal entry points at the entry it reverses (one reversal per entry).
ALTER TABLE "JournalEntry" ADD COLUMN "reversalOfId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_companyId_invoiceNumber_key" ON "Invoice"("companyId", "invoiceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Expense_companyId_expenseNumber_key" ON "Expense"("companyId", "expenseNumber");

-- CreateIndex
CREATE UNIQUE INDEX "JournalEntry_companyId_entryNumber_key" ON "JournalEntry"("companyId", "entryNumber");

-- CreateIndex
CREATE UNIQUE INDEX "JournalEntry_reversalOfId_key" ON "JournalEntry"("reversalOfId");
