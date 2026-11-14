export type AccountType = "asset" | "liability" | "equity" | "income" | "expense";
export type DocumentStatus = "draft" | "pending" | "posted" | "cancelled";

export interface CompanyRecord {
  id: string;
  name: string;
  currency: "YER";
  fiscalYearStart: string;
}

export interface InvoiceRecord {
  id: string;
  companyId: string;
  number: string;
  customerId: string;
  issueDate: string;
  dueDate?: string;
  status: DocumentStatus;
  subtotalMinor: number;
  taxMinor: number;
  totalMinor: number;
}

export interface JournalLineRecord {
  accountId: string;
  description?: string;
  debitMinor: number;
  creditMinor: number;
}

export interface JournalEntryRecord {
  id: string;
  companyId: string;
  number: string;
  entryDate: string;
  status: DocumentStatus;
  lines: JournalLineRecord[];
}

// Store money as integer minor units or use a decimal database type; avoid floating-point arithmetic for postings.
