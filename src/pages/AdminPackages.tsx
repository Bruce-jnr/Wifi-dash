import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, ToggleLeft, ToggleRight, Pencil } from "lucide-react";
import { toast } from "sonner";

const AdminPackages = () => {
  const [packages, setPackages] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ id: "", name: "", price: "", data_limit: "", validity: "", community: "town" });

  const token = localStorage.getItem("admin_token");

  const fetchPackages = async () => {
    try {
      const res = await fetch("/api/admin/packages", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPackages(data);
      }
    } catch {
      toast.error("Failed to load packages");
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleToggle = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/packages/${id}/toggle`, {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success("Package updated");
        fetchPackages();
      } else {
        toast.error("Failed to toggle package");
      }
    } catch {
      toast.error("Network Error");
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.price) {
      toast.error("Name and price are required");
      return;
    }
    try {
      const url = form.id ? `/api/admin/packages/${form.id}` : `/api/admin/packages`;
      const method = form.id ? "PUT" : "POST";
      const payload = {
        name: form.name,
        price: Number(form.price),
        data_limit: form.data_limit || "Unlimited",
        duration: form.validity || "1 day",
        community: form.community || "town"
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success(form.id ? "Package updated" : "Package added");
        fetchPackages();
        setForm({ id: "", name: "", price: "", data_limit: "", validity: "", community: "town" });
        setShowForm(false);
      } else {
        toast.error("Failed to save package");
      }
    } catch {
      toast.error("Network Error");
    }
  };

  const handleEdit = (pkg: any) => {
    setForm({
      id: pkg.id,
      name: pkg.name,
      price: pkg.price,
      data_limit: pkg.data_limit,
      validity: pkg.duration,
      community: pkg.community || "town"
    });
    setShowForm(true);
  };

  return (
    <AdminLayout activeTab="packages">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-xl font-bold text-foreground">Packages</h2>
        <Button size="sm" onClick={() => {
          setForm({ id: "", name: "", price: "", data_limit: "", validity: "", community: "town" });
          setShowForm(!showForm);
        }}>
          <Plus className="h-4 w-4 mr-1" />
          Add Package
        </Button>
      </div>

      {showForm && (
        <div className="bg-card border rounded-lg p-4 mb-6 grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input placeholder="Package name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input placeholder="Price (GH₵)" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          <Input placeholder="Data Limit (e.g. 5GB)" value={form.data_limit} onChange={(e) => setForm({ ...form, data_limit: e.target.value })} />
          <Input placeholder="Validity Duration (e.g. 24 hours)" value={form.validity} onChange={(e) => setForm({ ...form, validity: e.target.value })} />
          <select 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={form.community} 
            onChange={(e) => setForm({ ...form, community: e.target.value })}
          >
            <option value="town">Town Network</option>
            <option value="school">School Network</option>
          </select>
          <div className="md:col-span-2">
            <Button onClick={handleSave}>{form.id ? "Update Package" : "Save Package"}</Button>
          </div>
        </div>
      )}

      <div className="bg-card border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Price</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Community</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Data Limit</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Validity</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {packages.map((pkg) => (
                <tr key={pkg.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground">{pkg.name}</td>
                  <td className="px-4 py-3 text-foreground">GH₵ {pkg.price}</td>
                  <td className="px-4 py-3 text-foreground capitalize">{pkg.community}</td>
                  <td className="px-4 py-3 text-foreground">{pkg.data_limit}</td>
                  <td className="px-4 py-3 text-foreground">{pkg.duration}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${pkg.active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                      {pkg.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(pkg)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleToggle(pkg.id)}>
                      {pkg.active ? <ToggleRight className="h-4 w-4 text-success" /> : <ToggleLeft className="h-4 w-4" />}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};
export default AdminPackages;
