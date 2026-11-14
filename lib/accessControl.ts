export type AppRole = "owner" | "accountant" | "cashier" | "sales" | "auditor";
export type Permission = "dashboard.read" | "invoice.read" | "invoice.write" | "expense.read" | "expense.write" | "journal.read" | "journal.write" | "report.read" | "report.export" | "contacts.manage" | "users.manage";

export const rolePermissions: Record<AppRole, Permission[]> = {
  owner: ["dashboard.read", "invoice.read", "invoice.write", "expense.read", "expense.write", "journal.read", "journal.write", "report.read", "report.export", "contacts.manage", "users.manage"],
  accountant: ["dashboard.read", "invoice.read", "invoice.write", "expense.read", "expense.write", "journal.read", "journal.write", "report.read", "report.export", "contacts.manage"],
  cashier: ["dashboard.read", "invoice.read", "expense.read", "expense.write", "journal.read"],
  sales: ["dashboard.read", "invoice.read", "invoice.write", "report.read"],
  auditor: ["dashboard.read", "invoice.read", "expense.read", "journal.read", "report.read", "report.export"],
};

export function hasPermission(role: AppRole, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) ?? false;
}

