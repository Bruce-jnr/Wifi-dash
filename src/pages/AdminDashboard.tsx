import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Package, Ticket, DollarSign, TrendingUp, Clock, Lock, Smartphone } from "lucide-react";
import { getDashboardStats, getTransactions } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import type { Transaction } from "@/lib/types";

const AdminDashboard = () => {
  const [stats, setStats] = useState({ total: 0, sold: 0, remaining: 0, revenue: 0, salesToday: 0 });
  const [recentSales, setRecentSales] = useState<Transaction[]>([]);
  const [resetStep, setResetStep] = useState<'idle'|'otp'>('idle');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    setStats(getDashboardStats());
    setRecentSales(getTransactions().filter((t) => t.status === "success").slice(0, 10));
  }, []);

  const handleRequestOtp = async () => {
    setSubmitLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin' })
      });
      const data = await res.json();
      if (res.ok) {
        setResetStep('otp');
        toast.success(data.message || 'OTP sent successfully!');
      } else {
        toast.error(data.error || 'Failed to send OTP');
      }
    } catch (e) {
      toast.error('Network error');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!otpCode || !newPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    setSubmitLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', otp: otpCode, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'Password reset successfully!');
        setResetStep('idle');
        setOtpCode('');
        setNewPassword('');
      } else {
        toast.error(data.error || 'Failed to reset password');
      }
    } catch (e) {
      toast.error('Network error');
    } finally {
      setSubmitLoading(false);
    }
  };

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

      <h3 className="font-heading font-semibold text-foreground mt-8 mb-3 flex items-center gap-2">
        <Lock className="w-5 h-5"/> Security Settings
      </h3>
      <div className="bg-card border rounded-lg p-5 mb-8">
        <p className="text-sm text-muted-foreground mb-4">
          Update your admin dashboard password securely. We will send a 6-digit confirmation OTP to your registered phone number via Arkesel.
        </p>
        
        {resetStep === 'idle' && (
           <Button onClick={handleRequestOtp} disabled={submitLoading} variant="outline">
             <Smartphone className="w-4 h-4 mr-2" />
             {submitLoading ? "Requesting..." : "Request Reset OTP"}
           </Button>
        )}

        {resetStep === 'otp' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium block mb-1">OTP Code</label>
              <Input type="text" placeholder="123456" value={otpCode} onChange={e => setOtpCode(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1">New Password</label>
              <Input type="password" placeholder="••••••••" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            </div>
            <div className="flex items-end">
              <Button className="w-full" onClick={handleResetPassword} disabled={submitLoading}>
                {submitLoading ? "Verifying..." : "Update Password"}
              </Button>
            </div>
          </div>
        )}
      </div>

    </AdminLayout>
  );
};

export default AdminDashboard;
