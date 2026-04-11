import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Package, Ticket, DollarSign, TrendingUp, Clock } from "lucide-react";
import { getDashboardStats, getTransactions } from "@/lib/db";
import type { Transaction } from "@/lib/types";

const AdminDashboard = () => {
  const [stats, setStats] = useState({ total: 0, sold: 0, remaining: 0, revenue: 0, salesToday: 0 });
  const [recentSales, setRecentSales] = useState<Transaction[]>([]);

  useEffect(() => {
    setStats(getDashboardStats());
    setRecentSales(getTransactions().filter((t) => t.status === "success").slice(0, 10));
  }, []);

  const statCards = [
    { label: "Total Vouchers", value: String(stats.total), icon: Ticket, color: "text-primary" },
    { label: "Sold", value: String(stats.sold), icon: TrendingUp, color: "text-success" },
    { label: "Remaining", value: String(stats.remaining), icon: Package, color: "text-accent-foreground" },
    { label: "Revenue", value: `GH₵ ${stats.revenue}`, icon: DollarSign, color: "text-primary" },
  ];

  return (
    <AdminLayout activeTab="dashboard">
      <h2 className="font-heading text-xl font-bold text-foreground mb-6">Dashboard</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <p className="text-xl font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      <h3 className="font-heading font-semibold text-foreground mb-3">Recent Sales</h3>
      <div className="bg-card border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Phone</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Amount</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Reference</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentSales.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                    No sales yet. Upload vouchers and make your first sale!
                  </td>
                </tr>
              ) : (
                recentSales.map((sale) => (
                  <tr key={sale.id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-mono text-foreground">{sale.phone}</td>
                    <td className="px-4 py-3 text-foreground">GH₵ {sale.amount}</td>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{sale.paystack_reference}</td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(sale.created_at).toLocaleString()}</td>
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

export default AdminDashboard;
