import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mockPackages, type Package } from "@/lib/types";
import { Plus, Pencil, ToggleLeft, ToggleRight } from "lucide-react";
import { toast } from "sonner";

const AdminPackages = () => {
  const [packages, setPackages] = useState<Package[]>(mockPackages);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", price: "", description: "", validity: "", speed: "" });

  const toggleActive = (id: string) => {
    setPackages((prev) =>
      prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p))
    );
    toast.success("Package updated");
  };

  const handleAdd = () => {
    if (!form.name || !form.price) {
      toast.error("Name and price are required");
      return;
    }
    const newPkg: Package = {
      id: String(Date.now()),
      name: form.name,
      price: Number(form.price),
      description: form.description,
      validity: form.validity,
      speed: form.speed,
      active: true,
    };
    setPackages((prev) => [...prev, newPkg]);
    setForm({ name: "", price: "", description: "", validity: "", speed: "" });
    setShowForm(false);
    toast.success("Package added");
  };

  return (
    <AdminLayout activeTab="packages">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-xl font-bold text-foreground">Packages</h2>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-1" />
          Add Package
        </Button>
      </div>

      {showForm && (
        <div className="bg-card border rounded-lg p-4 mb-6 grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input placeholder="Package name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input placeholder="Price (GH₵)" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          <Input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Input placeholder="Validity (e.g. 24 Hours)" value={form.validity} onChange={(e) => setForm({ ...form, validity: e.target.value })} />
          <Input placeholder="Speed (e.g. 10 Mbps)" value={form.speed} onChange={(e) => setForm({ ...form, speed: e.target.value })} />
          <Button onClick={handleAdd}>Save Package</Button>
        </div>
      )}

      <div className="bg-card border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Price</th>
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
                  <td className="px-4 py-3 text-foreground">{pkg.validity}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${pkg.active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                      {pkg.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="icon" onClick={() => toggleActive(pkg.id)}>
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
