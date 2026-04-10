import AdminLayout from "@/components/AdminLayout";
import { Package, Ticket, DollarSign, TrendingUp } from "lucide-react";

const stats = [
  { label: "Total Vouchers", value: "500", icon: Ticket, color: "text-primary" },
  { label: "Sold", value: "342", icon: TrendingUp, color: "text-success" },
  { label: "Remaining", value: "158", icon: Package, color: "text-accent-foreground" },
  { label: "Revenue", value: "GH₵ 4,280", icon: DollarSign, color: "text-primary" },
];

const recentSales = [
  { phone: "024****567", package: "Daily Pass", amount: 5, time: "2 min ago" },
  { phone: "020****890", package: "Weekly Pass", amount: 20, time: "15 min ago" },
  { phone: "055****234", package: "1 Hour Pass", amount: 2, time: "1 hr ago" },
  { phone: "027****678", package: "Monthly Pass", amount: 60, time: "2 hrs ago" },
];

const AdminDashboard = () => {
  return (
    <AdminLayout activeTab="dashboard">
      <h2 className="font-heading text-xl font-bold text-foreground mb-6">Dashboard</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
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
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Package</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Amount</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Time</th>
              </tr>
            </thead>
            <tbody>
              {recentSales.map((sale, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="px-4 py-3 font-mono text-foreground">{sale.phone}</td>
                  <td className="px-4 py-3 text-foreground">{sale.package}</td>
                  <td className="px-4 py-3 text-foreground">GH₵ {sale.amount}</td>
                  <td className="px-4 py-3 text-muted-foreground">{sale.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
