import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Package, Ticket, DollarSign, TrendingUp, Lock, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const AdminDashboard = () => {
  const [stats, setStats] = useState({ total: 0, fulfilled: 0, pending: 0, revenue: 0 });
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [resetStep, setResetStep] = useState<'idle' | 'otp'>('idle');
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    const headers = { "Authorization": `Bearer ${token}` };

    // Fetch live dashboard stats
    fetch("/api/admin/stats", { headers, cache: "no-store" })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`);
        return r.json();
      })
      .then((data) => {
        console.log('Dashboard stats received:', data);
        setStats({
          total: data.totalPackages,
          pending: data.pendingRequests,
          fulfilled: data.fulfilledRequests,
          revenue: data.revenue
        });
      })
      .catch((err) => {
        console.error('Failed to fetch stats:', err);
        toast.error('Failed to load dashboard metrics');
      });

    // Fetch recent pending requests for the table
    fetch("/api/admin/requests", { headers, cache: "no-store" })
      .then(r => r.json())
      .then((data: any[]) => {
        setRecentRequests(data.slice(0, 10));
      })
      .catch(() => {});
  }, []);

  const handleRequestOtp = async () => {
    if (!phone) {
      toast.error('Enter your registered admin phone number');
      return;
    }
    setSubmitLoading(true);
    try {
      const res = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
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
    if (!phone || !otpCode || !newPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    setSubmitLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp: otpCode, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'Password reset successfully!');
        setResetStep('idle');
        setOtpCode('');
        setNewPassword('');
        setPhone('');
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
    { label: "Total Packages", value: String(stats.total), icon: Package, color: "text-primary" },
    { label: "Pending Requests", value: String(stats.pending), icon: Ticket, color: "text-destructive" },
    { label: "Fulfilled", value: String(stats.fulfilled), icon: TrendingUp, color: "text-success" },
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

      <h3 className="font-heading font-semibold text-foreground mb-3">Recent Voucher Requests</h3>
      <div className="bg-card border rounded-lg overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Phone</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Package</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentRequests.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                    No requests yet.
                  </td>
                </tr>
              ) : (
                recentRequests.map((req: any) => (
                  <tr key={req.id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-mono text-foreground">{req.client_phone}</td>
                    <td className="px-4 py-3 text-foreground">{req.Package?.name || '-'}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-warning/10 text-warning">
                        {req.status}
                      </span>
                    </td>
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
          Reset your admin password securely. Enter your registered phone number to receive a 6-digit OTP via SMS.
        </p>

        {resetStep === 'idle' && (
          <div className="space-y-3 max-w-sm">
            <div>
              <label className="text-xs font-medium block mb-1">Registered Phone Number</label>
              <Input
                placeholder="e.g. 0550000000"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
            </div>
            <Button onClick={handleRequestOtp} disabled={submitLoading} variant="outline">
              <Smartphone className="w-4 h-4 mr-2" />
              {submitLoading ? "Requesting..." : "Request Reset OTP"}
            </Button>
          </div>
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
