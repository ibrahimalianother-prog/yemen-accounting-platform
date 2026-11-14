import type { Prisma, PrismaClient } from "@prisma/client";

type Db = Prisma.TransactionClient;

export const ACCOUNT_TYPES = ["asset", "liability", "equity", "income", "expense"] as const;

/** Account codes used by automatic posting. They are created for every company on first use. */
export const ACCOUNT = {
  CASH: "1100",
  RECEIVABLE: "1200",
  TAX_PAYABLE: "2200",
  SALES: "4100",
  GENERAL_EXPENSE: "5100",
} as const;

export const DEFAULT_ACCOUNTS: { code: string; name: string; type: (typeof ACCOUNT_TYPES)[number] }[] = [
  { code: "1100", name: "الصندوق / النقدية", type: "asset" },
  { code: "1200", name: "الذمم المدينة", type: "asset" },
  { code: "2100", name: "الذمم الدائنة", type: "liability" },
  { code: "2200", name: "ضريبة مستحقة", type: "liability" },
  { code: "3100", name: "رأس المال", type: "equity" },
  { code: "4100", name: "إيرادات المبيعات", type: "income" },
  { code: "5100", name: "المصروفات العامة", type: "expense" },
  { code: "5200", name: "الرواتب", type: "expense" },
  { code: "5300", name: "الإيجار", type: "expense" },
];

/** Idempotent: inserts any missing default account for the company and leaves existing ones alone. */
export async function ensureDefaultAccounts(db: Db, companyId: string) {
  await db.account.createMany({
    data: DEFAULT_ACCOUNTS.map((account) => ({ ...account, companyId })),
    skipDuplicates: true,
  });
}

/** True when `code` is an active expense account in the company's chart of accounts. */
export async function isExpenseAccount(db: Db, companyId: string, code: string) {
  const account = await db.account.findFirst({
    where: { companyId, code, type: "expense", isActive: true },
    select: { id: true },
  });
  return Boolean(account);
}

/** The expense account an expense posts to: its category's mapped account, else general expenses. */
async function resolveExpenseAccount(db: Db, companyId: string, categoryId: string | null | undefined) {
  if (!categoryId) return ACCOUNT.GENERAL_EXPENSE;

  const category = await db.expenseCategory.findFirst({
    where: { id: categoryId, OR: [{ companyId }, { companyId: null }] },
    select: { accountCode: true },
  });
  if (!category?.accountCode) return ACCOUNT.GENERAL_EXPENSE;

  return (await isExpenseAccount(db, companyId, category.accountCode)) ? category.accountCode : ACCOUNT.GENERAL_EXPENSE;
}

type EntryLine = { code: string; debit?: number; credit?: number };

type SourceEntry = {
  companyId: string;
  sourceType: "invoice" | "expense";
  sourceId: string;
  sourceEvent: string;
  entryNumber: string;
  entryDate: Date;
  description: string;
  lines: EntryLine[];
};

/** Creates one posted, balanced journal entry per source event. Returns false when it already exists. */
async function postSourceEntry(db: Db, input: SourceEntry): Promise<boolean> {
  const lines = input.lines.filter((line) => (line.debit ?? 0) > 0 || (line.credit ?? 0) > 0);
  const debit = lines.reduce((sum, line) => sum + (line.debit ?? 0), 0);
  const credit = lines.reduce((sum, line) => sum + (line.credit ?? 0), 0);

  if (lines.length < 2 || debit !== credit) {
    throw new Error("Unbalanced automatic journal entry.");
  }

  const existing = await db.journalEntry.findFirst({
    where: {
      companyId: input.companyId,
      sourceType: input.sourceType,
      sourceId: input.sourceId,
      sourceEvent: input.sourceEvent,
    },
    select: { id: true },
  });
  if (existing) return false;

  await ensureDefaultAccounts(db, input.companyId);
  const accounts = await db.account.findMany({
    where: { companyId: input.companyId, code: { in: lines.map((line) => line.code) } },
    select: { code: true, name: true },
  });
  const names = new Map(accounts.map((account) => [account.code, account.name]));

  await db.journalEntry.create({
    data: {
      companyId: input.companyId,
      entryNumber: input.entryNumber,
      entryDate: input.entryDate,
      description: input.description,
      status: "posted",
      sourceType: input.sourceType,
      sourceId: input.sourceId,
      sourceEvent: input.sourceEvent,
      lines: {
        create: lines.map((line) => ({
          accountCode: line.code,
          accountName: names.get(line.code) ?? line.code,
          debit: line.debit ?? 0,
          credit: line.credit ?? 0,
        })),
      },
    },
  });

  return true;
}

type InvoiceSource = {
  id: string;
  companyId: string;
  invoiceNumber: string;
  issueDate: Date;
  subtotal: number;
  taxAmount: number;
  status: string;
};

/**
 * Issued (pending) invoice: Dr receivables / Cr sales and tax payable.
 * Paid invoice: additionally Dr cash / Cr receivables. Safe to call repeatedly.
 * Returns how many entries were created.
 */
export async function postInvoiceAccounting(db: Db, invoice: InvoiceSource, options: { paymentDate?: Date } = {}) {
  if (invoice.status !== "pending" && invoice.status !== "paid") return 0;

  const total = invoice.subtotal + invoice.taxAmount;
  if (total <= 0) return 0;

  const base = {
    companyId: invoice.companyId,
    sourceType: "invoice" as const,
    sourceId: invoice.id,
  };

  let created = 0;

  const issued = await postSourceEntry(db, {
    ...base,
    sourceEvent: "issue",
    entryNumber: `AUTO-INV-${invoice.invoiceNumber}-ISS`,
    entryDate: invoice.issueDate,
    description: `إصدار الفاتورة ${invoice.invoiceNumber}`,
    lines: [
      { code: ACCOUNT.RECEIVABLE, debit: total },
      { code: ACCOUNT.SALES, credit: invoice.subtotal },
      { code: ACCOUNT.TAX_PAYABLE, credit: invoice.taxAmount },
    ],
  });
  if (issued) created += 1;

  if (invoice.status === "paid") {
    const paid = await postSourceEntry(db, {
      ...base,
      sourceEvent: "payment",
      entryNumber: `AUTO-INV-${invoice.invoiceNumber}-PAY`,
      entryDate: options.paymentDate ?? new Date(),
      description: `سداد الفاتورة ${invoice.invoiceNumber}`,
      lines: [
        { code: ACCOUNT.CASH, debit: total },
        { code: ACCOUNT.RECEIVABLE, credit: total },
      ],
    });
    if (paid) created += 1;
  }

  return created;
}

type ExpenseSource = {
  id: string;
  companyId: string;
  categoryId?: string | null;
  expenseNumber: string;
  expenseDate: Date;
  amount: number;
  status: string;
};

/**
 * Posted expense: Dr the category's expense account (general expenses when unmapped) / Cr cash.
 * Safe to call repeatedly. Returns how many entries were created.
 */
export async function postExpenseAccounting(db: Db, expense: ExpenseSource) {
  if (expense.status !== "posted" || expense.amount <= 0) return 0;

  const expenseAccount = await resolveExpenseAccount(db, expense.companyId, expense.categoryId);

  const created = await postSourceEntry(db, {
    companyId: expense.companyId,
    sourceType: "expense",
    sourceId: expense.id,
    sourceEvent: "post",
    entryNumber: `AUTO-EXP-${expense.expenseNumber}`,
    entryDate: expense.expenseDate,
    description: `مصروف ${expense.expenseNumber}`,
    lines: [
      { code: expenseAccount, debit: expense.amount },
      { code: ACCOUNT.CASH, credit: expense.amount },
    ],
  });

  return created ? 1 : 0;
}

/** Reverses every still-active automatic entry of a source (used when an invoice/expense is cancelled). */
export async function reverseSourceEntries(
  db: Db,
  source: { companyId: string; sourceType: "invoice" | "expense"; sourceId: string }
) {
  const entries = await db.journalEntry.findMany({
    where: { ...source, status: "posted", reversalOfId: null },
    include: { lines: true },
  });
  if (entries.length === 0) return;

  const reversed = await db.journalEntry.findMany({
    where: { reversalOfId: { in: entries.map((entry) => entry.id) } },
    select: { reversalOfId: true },
  });
  const done = new Set(reversed.map((entry) => entry.reversalOfId));

  for (const entry of entries) {
    if (done.has(entry.id)) continue;

    await db.journalEntry.create({
      data: {
        companyId: source.companyId,
        entryNumber: `${entry.entryNumber}-REV`,
        entryDate: new Date(),
        description: `عكس القيد ${entry.entryNumber}`,
        status: "posted",
        reversalOfId: entry.id,
        lines: {
          create: entry.lines.map((line) => ({
            accountCode: line.accountCode,
            accountName: line.accountName,
            debit: line.credit,
            credit: line.debit,
            description: line.description,
          })),
        },
      },
    });
  }
}

export type BackfillResult = {
  entries: number;
  alreadyPosted: number;
  failed: string[];
};

/**
 * Creates the missing journal entries for invoices (pending/paid) and expenses (posted) that existed
 * before automatic posting. Each record runs in its own transaction, so one failure (for example an
 * entry-number clash) never blocks the others. Cancelled and draft documents are skipped. Re-running
 * it is safe: documents that already have their entries are not touched.
 */
export async function backfillAccounting(client: PrismaClient, companyId: string): Promise<BackfillResult> {
  const existing = await client.journalEntry.findMany({
    where: { companyId, sourceType: { in: ["invoice", "expense"] } },
    select: { sourceType: true, sourceId: true, sourceEvent: true },
  });
  const done = new Set(existing.map((entry) => `${entry.sourceType}:${entry.sourceId}:${entry.sourceEvent}`));

  const [invoices, expenses] = await Promise.all([
    client.invoice.findMany({
      where: { companyId, status: { in: ["pending", "paid"] } },
      orderBy: { createdAt: "asc" },
    }),
    client.expense.findMany({
      where: { companyId, status: "posted" },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const result: BackfillResult = { entries: 0, alreadyPosted: 0, failed: [] };

  for (const invoice of invoices) {
    const events = invoice.status === "paid" ? ["issue", "payment"] : ["issue"];
    if (events.every((event) => done.has(`invoice:${invoice.id}:${event}`))) {
      result.alreadyPosted += 1;
      continue;
    }

    try {
      result.entries += await client.$transaction((tx) =>
        postInvoiceAccounting(tx, invoice, { paymentDate: invoice.updatedAt })
      );
    } catch {
      result.failed.push(`فاتورة ${invoice.invoiceNumber}`);
    }
  }

  for (const expense of expenses) {
    if (done.has(`expense:${expense.id}:post`)) {
      result.alreadyPosted += 1;
      continue;
    }

    try {
      result.entries += await client.$transaction((tx) => postExpenseAccounting(tx, expense));
    } catch {
      result.failed.push(`مصروف ${expense.expenseNumber}`);
    }
  }

  return result;
}
