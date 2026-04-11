import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Ticket } from "lucide-react";

interface RequestRow {
  id: number;
  client_phone: string;
  package_id: number;
  status: string;
  createdAt: string;
  Package: {
    name: string;
    price: number;
  };
}

const AdminVouchers = () => {
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [generationLoading, setGenerationLoading] = useState<number | null>(null);

  const [codes, setCodes] = useState<Record<number, string>>({});

  const token = localStorage.getItem("admin_token");

  const fetchRequests = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/requests', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (err) {
      toast.error("Error fetching requests from backend");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchRequests();
  }, [token]);

  const handleGenerate = async (requestId: number) => {
    const code = codes[requestId];
    if (!code) {
      toast.error("Please enter the manually generated voucher code.");
      return;
    }

    setGenerationLoading(requestId);
    try {
      const res = await fetch(`http://localhost:5000/api/admin/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ requestId, code })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Voucher Generated and SMS Sent!");
        fetchRequests(); // Refresh list
      } else {
        toast.error(data.error || "Failed to generate");
      }
    } catch (err) {
      toast.error("Network Error configuring voucher");
    } finally {
      setGenerationLoading(null);
    }
  };

  return (
    <AdminLayout activeTab="vouchers">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h2 className="font-heading text-xl font-bold text-foreground">Pending Client Requests</h2>
        <Button size="sm" onClick={fetchRequests} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh Requests"}
        </Button>
      </div>

      <div className="bg-card border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">ID</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Phone</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Package</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Price</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    {loading ? "Loading..." : "No pending requests found."}
                  </td>
                </tr>
              ) : (
                requests.map((r) => (
                  <tr key={r.id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-mono font-medium text-foreground">#{r.id}</td>
                    <td className="px-4 py-3 text-foreground">{r.client_phone}</td>
                    <td className="px-4 py-3 font-medium">{r.Package?.name}</td>
                    <td className="px-4 py-3 text-primary font-bold">GH₵ {r.Package?.price}</td>
                    <td className="px-4 py-2 flex items-center space-x-2 w-72">
                      <Input 
                        placeholder="Manual Voucher Code..." 
                        className="h-8 text-xs font-mono"
                        value={codes[r.id] || ''}
                        onChange={(e) => setCodes({...codes, [r.id]: e.target.value})}
                      />
                      <Button 
                        size="sm" 
                        variant="default"
                        disabled={generationLoading === r.id || !codes[r.id]}
                        onClick={() => handleGenerate(r.id)}
                      >
                       {generationLoading === r.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <Ticket className="h-4 w-4"/>}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminVouchers;
