-- An expense category can name the expense account its expenses are posted to.
ALTER TABLE "ExpenseCategory" ADD COLUMN "accountCode" TEXT;
