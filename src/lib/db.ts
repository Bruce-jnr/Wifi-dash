import { Package, Voucher, Transaction } from "./types";

const KEYS = {
  packages: "asuogya_packages",
  vouchers: "asuogya_vouchers",
  transactions: "asuogya_transactions",
};

const defaultPackages: Package[] = [
  { id: "1", name: "1 Hour Pass", price: 2, description: "Quick browsing session", validity: "1 Hour", speed: "5 Mbps", active: true },
  { id: "2", name: "Daily Pass", price: 5, description: "Full day unlimited access", validity: "24 Hours", speed: "10 Mbps", active: true },
  { id: "3", name: "Weekly Pass", price: 20, description: "Stay connected all week", validity: "7 Days", speed: "10 Mbps", active: true },
  { id: "4", name: "Monthly Pass", price: 60, description: "Best value for regular users", validity: "30 Days", speed: "15 Mbps", active: true },
];

function get<T>(key: string, fallback: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function set<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ── Packages ──
export function getPackages(): Package[] {
  return get<Package>(KEYS.packages, defaultPackages);
}

export function getPackageById(id: string): Package | undefined {
  return getPackages().find((p) => p.id === id);
}

export function savePackage(pkg: Package) {
  const all = getPackages();
  const idx = all.findIndex((p) => p.id === pkg.id);
  if (idx >= 0) all[idx] = pkg;
  else all.push(pkg);
  set(KEYS.packages, all);
}

export function togglePackageActive(id: string) {
  const all = getPackages();
  const pkg = all.find((p) => p.id === id);
  if (pkg) pkg.active = !pkg.active;
  set(KEYS.packages, all);
}

// ── Vouchers ──
export interface VoucherRow {
  id: string;
  code: string;
  package_id: string;
  package_name: string;
  status: "unused" | "sold";
  sold_to_phone: string | null;
  sold_at: string | null;
}

export function getVouchers(): VoucherRow[] {
  return get<VoucherRow>(KEYS.vouchers, []);
}

export function addVouchers(rows: VoucherRow[]) {
  const all = getVouchers();
  set(KEYS.vouchers, [...rows, ...all]);
}

export function claimVoucher(packageId: string, phone: string): VoucherRow | null {
  const all = getVouchers();
  const available = all.find((v) => v.package_id === packageId && v.status === "unused");
  if (!available) return null;
  available.status = "sold";
  available.sold_to_phone = phone;
  available.sold_at = new Date().toISOString();
  set(KEYS.vouchers, all);
  return available;
}

// ── Transactions ──
export function getTransactions(): Transaction[] {
  return get<Transaction>(KEYS.transactions, []);
}

export function addTransaction(tx: Transaction) {
  const all = getTransactions();
  all.unshift(tx);
  set(KEYS.transactions, all);
}

// ── Dashboard Stats ──
export function getDashboardStats() {
  const vouchers = getVouchers();
  const transactions = getTransactions();
  const today = new Date().toISOString().slice(0, 10);

  const total = vouchers.length;
  const sold = vouchers.filter((v) => v.status === "sold").length;
  const remaining = total - sold;
  const revenue = transactions
    .filter((t) => t.status === "success")
    .reduce((sum, t) => sum + t.amount, 0);
  const salesToday = transactions.filter(
    (t) => t.status === "success" && t.created_at.startsWith(today)
  ).length;

  return { total, sold, remaining, revenue, salesToday };
}
