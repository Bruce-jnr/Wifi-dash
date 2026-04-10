import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface VoucherRow {
  id: string;
  code: string;
  package: string;
  status: "unused" | "sold";
  sold_to_phone: string | null;
  sold_at: string | null;
}

const demoVouchers: VoucherRow[] = [
  { id: "1", code: "8GH2-KL9P-22SD", package: "Daily Pass", status: "sold", sold_to_phone: "024****567", sold_at: "2026-04-10" },
  { id: "2", code: "FJ4K-MN7R-88QW", package: "1 Hour Pass", status: "sold", sold_to_phone: "020****890", sold_at: "2026-04-10" },
  { id: "3", code: "ZX9V-BT3L-55PO", package: "Weekly Pass", status: "unused", sold_to_phone: null, sold_at: null },
  { id: "4", code: "WE6U-YH2C-44NM", package: "Daily Pass", status: "unused", sold_to_phone: null, sold_at: null },
  { id: "5", code: "RT1I-OP8D-77JK", package: "Monthly Pass", status: "unused", sold_to_phone: null, sold_at: null },
];

const AdminVouchers = () => {
  const [vouchers, setVouchers] = useState<VoucherRow[]>(demoVouchers);
  const [bulkText, setBulkText] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [filter, setFilter] = useState<"all" | "unused" | "sold">("all");

  const handleBulkAdd = () => {
    const lines = bulkText.trim().split("\n").filter(Boolean);
    if (lines.length === 0) {
      toast.error("Please enter voucher codes");
      return;
    }
    const newVouchers: VoucherRow[] = lines.map((line, i) => {
      const parts = line.split(",");
      return {
        id: String(Date.now() + i),
        code: parts[0]?.trim() || "",
        package: parts[1]?.trim() || "Unassigned",
        status: "unused",
        sold_to_phone: null,
        sold_at: null,
      };
    });
    setVouchers((prev) => [...newVouchers, ...prev]);
    setBulkText("");
    setShowUpload(false);
    toast.success(`${newVouchers.length} voucher(s) added`);
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split("\n").slice(1).filter(Boolean); // skip header
      setBulkText(lines.join("\n"));
      toast.info(`${lines.length} rows loaded from CSV. Click "Add Vouchers" to save.`);
    };
    reader.readAsText(file);
  };

  const filtered = filter === "all" ? vouchers : vouchers.filter((v) => v.status === filter);

  return (
    <AdminLayout activeTab="vouchers">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h2 className="font-heading text-xl font-bold text-foreground">Vouchers</h2>
        <Button size="sm" onClick={() => setShowUpload(!showUpload)}>
          <Upload className="h-4 w-4 mr-1" />
          Upload Vouchers
        </Button>
      </div>

      {showUpload && (
        <div className="bg-card border rounded-lg p-4 mb-6 space-y-3">
          <p className="text-sm text-muted-foreground">
            Paste voucher codes (one per line, format: <code>CODE,PACKAGE</code>) or upload a CSV.
          </p>
          <textarea
            className="w-full h-32 border rounded-md p-3 text-sm font-mono bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder={"ABC123,1GB\nXYZ456,1GB\nDEF789,Daily Pass"}
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
          />
          <div className="flex items-center gap-3">
            <Button onClick={handleBulkAdd}>Add Vouchers</Button>
            <label className="cursor-pointer">
              <input type="file" accept=".csv" className="hidden" onChange={handleCSVUpload} />
              <span className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                <FileText className="h-4 w-4" />
                Upload CSV
              </span>
            </label>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {(["all", "unused", "sold"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f === "all" && ` (${vouchers.length})`}
            {f === "unused" && ` (${vouchers.filter(v => v.status === "unused").length})`}
            {f === "sold" && ` (${vouchers.filter(v => v.status === "sold").length})`}
          </button>
        ))}
      </div>

      <div className="bg-card border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Code</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Package</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Sold To</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => (
                <tr key={v.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-mono font-medium text-foreground">{v.code}</td>
                  <td className="px-4 py-3 text-foreground">{v.package}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      v.status === "unused" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                    }`}>
                      {v.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground font-mono">{v.sold_to_phone || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{v.sold_at || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminVouchers;
