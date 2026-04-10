export interface Package {
  id: string;
  name: string;
  price: number;
  description: string;
  validity: string;
  speed: string;
  active: boolean;
}

export interface Voucher {
  id: string;
  code: string;
  package_id: string;
  status: "unused" | "sold";
  sold_to_phone: string | null;
  sold_at: string | null;
}

export interface Transaction {
  id: string;
  phone: string;
  paystack_reference: string;
  amount: number;
  status: "pending" | "success" | "failed";
  voucher_id: string | null;
  created_at: string;
}

// Mock data for MVP frontend
export const mockPackages: Package[] = [
  {
    id: "1",
    name: "1 Hour Pass",
    price: 2,
    description: "Quick browsing session",
    validity: "1 Hour",
    speed: "5 Mbps",
    active: true,
  },
  {
    id: "2",
    name: "Daily Pass",
    price: 5,
    description: "Full day unlimited access",
    validity: "24 Hours",
    speed: "10 Mbps",
    active: true,
  },
  {
    id: "3",
    name: "Weekly Pass",
    price: 20,
    description: "Stay connected all week",
    validity: "7 Days",
    speed: "10 Mbps",
    active: true,
  },
  {
    id: "4",
    name: "Monthly Pass",
    price: 60,
    description: "Best value for regular users",
    validity: "30 Days",
    speed: "15 Mbps",
    active: true,
  },
];
