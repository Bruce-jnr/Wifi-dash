import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export default function AdminStaff() {
  const [staff, setStaff] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ username: "", email: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);

  const fetchStaff = async () => {
    try {
      const res = await fetch("/api/admin/staff");
      if (res.ok) {
        const data = await res.json();
        setStaff(data);
      }
    } catch {
      toast.error("Failed to load staff");
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleSave = async () => {
    if (!form.username || !form.phone || !form.password) {
      toast.error("Username, Phone, and Password are required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Admin created successfully!");
        setShowForm(false);
        setForm({ username: "", email: "", phone: "", password: "" });
        fetchStaff();
      } else {
        toast.error(data.error || "Failed to create staff");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout activeTab="staff">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-xl font-bold text-foreground">Admin Staff</h2>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-1" />
          Add Admin
        </Button>
      </div>

      {showForm && (
        <div className="bg-card border rounded-lg p-5 mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-medium block mb-1">Username</label>
            <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-medium block mb-1">Phone Number</label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-medium block mb-1">Email <span className="text-muted-foreground">(Optional)</span></label>
            <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-medium block mb-1">Password</label>
            <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <div className="col-span-1 md:col-span-2 lg:col-span-4 flex justify-end">
             <Button onClick={handleSave} disabled={loading}>{loading ? "Saving..." : "Create Admin"}</Button>
          </div>
        </div>
      )}

      <div className="bg-card border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Username</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Phone Number</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Email</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Joined</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((s: any) => (
                <tr key={s.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground">{s.username}</td>
                  <td className="px-4 py-3 text-foreground">{s.phone || '-'}</td>
                  <td className="px-4 py-3 text-foreground">{s.email || '-'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(s.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
