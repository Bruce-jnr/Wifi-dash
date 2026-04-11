import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { toast } from "sonner";

export default function AdminLogs() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem("admin_token");
        const res = await fetch("http://localhost:5000/api/admin/logs", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setLogs(data);
        }
      } catch {
        toast.error("Failed to load logs");
      }
    };
    fetchLogs();
  }, []);

  return (
    <AdminLayout activeTab="logs">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-xl font-bold text-foreground">Audit Logs</h2>
      </div>

      <div className="bg-card border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Admin</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Action</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Description</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Time</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log: any) => (
                <tr key={log.id} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="px-4 py-3 font-medium text-foreground">{log.admin_username}</td>
                  <td className="px-4 py-3">
                    <span className="bg-accent text-accent-foreground px-2 py-0.5 rounded text-xs font-mono">
                      {log.action_type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-foreground">{log.description}</td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{new Date(log.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {logs.length === 0 && (
            <div className="text-center py-6 text-muted-foreground text-sm">
               No physical audit logs recorded.
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
