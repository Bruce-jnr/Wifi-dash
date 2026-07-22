export interface Package {
  id: number;
  name: string;
  price: number;
  community: "town" | "school";
  data_limit: string;
  duration: string;
  active: boolean;
}

export interface Voucher {
  id: number;
  code: string;
  package_id: number;
  request_id: number | null;
  status: "available" | "issued";
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
