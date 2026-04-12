import { useState, useEffect, useRef } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Upload, Ticket, RefreshCw } from "lucide-react";

interface RequestRow {
  id: number;
  client_phone: string;
  package_id: number;
  status: string;
  createdAt: string;
  Package: { name: string; price: number };
}

interface PoolStat {
  id: number;
  name: string;
  duration: string;
  price: number;
  available: number;
  issued: number;
}

const AdminVouchers = () => {
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [pool, setPool] = useState<PoolStat[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [selectedPkgId, setSelectedPkgId] = useState<string>("");
  const [uploadLoading, setUploadLoading] = useState(false);
  const [issueLoading, setIssueLoading] = useState<number | null>(null);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [manualCode, setManualCode] = useState("");
  const [manualLoading, setManualLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const token = localStorage.getItem("admin_token");
  const headers = { Authorization: `Bearer ${token}` };

  const fetchAll = async () => {
    setRequestsLoading(true);
    try {
      const [reqRes, poolRes, pkgRes] = await Promise.all([
        fetch("http://localhost:5000/api/admin/requests", { headers }),
        fetch("http://localhost:5000/api/admin/vouchers", { headers }),
        fetch("http://localhost:5000/api/client/packages"),
      ]);
      if (reqRes.ok) setRequests(await reqRes.json());
      if (poolRes.ok) setPool(await poolRes.json());
      if (pkgRes.ok) {
        const pkgs = await pkgRes.json();
        setPackages(pkgs);
        if (pkgs.length > 0 && !selectedPkgId) setSelectedPkgId(String(pkgs[0].id));
      }
    } catch {
      toast.error("Failed to load data");
    } finally {
      setRequestsLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file || !selectedPkgId) {
      toast.error("Please select a package and a CSV file");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    formData.append("package_id", selectedPkgId);

    setUploadLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/admin/vouchers/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        if (fileRef.current) fileRef.current.value = "";
        fetchAll();
      } else {
        toast.error(data.error || "Upload failed");
      }
    } catch {
      toast.error("Network error during upload");
    } finally {
      setUploadLoading(false);
    }
  };

  const handleManualAdd = async () => {
    if (!manualCode.trim() || !selectedPkgId) {
      toast.error("Voucher code cannot be empty");
      return;
    }
    setManualLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/admin/vouchers/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ code: manualCode.trim(), package_id: selectedPkgId }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Voucher added manually");
        setManualCode("");
        fetchAll();
      } else {
        toast.error(data.error || "Failed to add voucher");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setManualLoading(false);
    }
  };

  const handleIssue = async (requestId: number, pkgName: string) => {
    setIssueLoading(requestId);
    try {
      const res = await fetch("http://localhost:5000/api/admin/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ requestId }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`✅ Voucher issued for ${pkgName} — SMS sent!`);
        fetchAll();
      } else {
        toast.error(data.error || "Failed to issue voucher");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setIssueLoading(null);
    }
  };

  return (
    <AdminLayout activeTab="vouchers">
      {/* CSV Upload Section */}
      <div className="mb-8">
        <h2 className="font-heading text-xl font-bold text-foreground mb-4">Upload Voucher CSV</h2>
        <div className="bg-card border rounded-lg p-5">
          <p className="text-sm text-muted-foreground mb-4">
            Upload a <strong>.csv</strong> file with one voucher code per line. Select which package these codes belong to.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <select
              value={selectedPkgId}
              onChange={(e) => setSelectedPkgId(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {packages.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.name} — GH₵ {p.price} ({p.duration})
                </option>
              ))}
            </select>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.txt"
              className="text-sm text-muted-foreground file:mr-3 file:rounded file:border-0 file:bg-primary file:px-3 file:py-1 file:text-xs file:font-medium file:text-primary-foreground cursor-pointer"
            />
            <Button onClick={handleUpload} disabled={uploadLoading} size="sm">
              {uploadLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
              {uploadLoading ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Manual Add Section */}
      <div className="mb-8">
        <h2 className="font-heading text-xl font-bold text-foreground mb-4">Add Single Voucher</h2>
        <div className="bg-card border rounded-lg p-5">
           <div className="flex flex-col sm:flex-row gap-3 items-end">
             <div className="flex-1 w-full">
               <label className="text-xs font-medium text-muted-foreground mb-1 block">Voucher Code</label>
               <input
                 type="text"
                 value={manualCode}
                 onChange={(e) => setManualCode(e.target.value)}
                 placeholder="Enter voucher code..."
                 className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                 onKeyDown={(e) => e.key === 'Enter' && handleManualAdd()}
               />
             </div>
             <div className="w-full sm:w-auto">
                <Button onClick={handleManualAdd} disabled={manualLoading || !manualCode.trim()} size="sm" className="w-full">
                  {manualLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Ticket className="h-4 w-4 mr-2" />}
                  Add Voucher
                </Button>
             </div>
           </div>
        </div>
      </div>

      {/* Pool Stats */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading text-xl font-bold text-foreground">Voucher Pool</h2>
          <Button variant="ghost" size="sm" onClick={fetchAll}>
            <RefreshCw className="h-4 w-4 mr-1" /> Refresh
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {pool.map((p) => (
            <div key={p.id} className="bg-card border rounded-lg p-4">
              <p className="font-heading font-bold text-foreground">{p.name}</p>
              <p className="text-xs text-muted-foreground mb-3">{p.duration} • GH₵ {p.price}</p>
              <div className="flex gap-4 text-sm">
                <div>
                  <p className="text-2xl font-bold text-primary">{p.available}</p>
                  <p className="text-xs text-muted-foreground">Available</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-muted-foreground">{p.issued}</p>
                  <p className="text-xs text-muted-foreground">Issued</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Requests */}
      <div>
        <h2 className="font-heading text-xl font-bold text-foreground mb-3">Pending Client Requests</h2>
        <div className="bg-card border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">ID</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Phone</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Package</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Price</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Requested</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      {requestsLoading ? "Loading..." : "No pending requests."}
                    </td>
                  </tr>
                ) : (
                  requests.map((r) => (
                    <tr key={r.id} className="border-b last:border-0">
                      <td className="px-4 py-3 font-mono font-medium text-foreground">#{r.id}</td>
                      <td className="px-4 py-3 text-foreground font-mono">{r.client_phone}</td>
                      <td className="px-4 py-3 font-medium text-foreground">{r.Package?.name}</td>
                      <td className="px-4 py-3 text-primary font-bold">GH₵ {r.Package?.price}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(r.createdAt).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <Button
                          size="sm"
                          onClick={() => handleIssue(r.id, r.Package?.name)}
                          disabled={issueLoading === r.id}
                        >
                          {issueLoading === r.id
                            ? <Loader2 className="h-4 w-4 animate-spin mr-1" />
                            : <Ticket className="h-4 w-4 mr-1" />}
                          {issueLoading === r.id ? "Issuing..." : "Issue Voucher"}
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminVouchers;
