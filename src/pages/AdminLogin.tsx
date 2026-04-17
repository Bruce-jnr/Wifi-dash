import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Wifi, Lock, Loader2, Smartphone, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'login' | 'request_otp' | 'reset_password'>('login');
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem("admin_token", data.token);
        toast.success("Welcome back, Admin!");
        navigate("/admin/dashboard");
      } else {
        toast.error(data.message || "Invalid credentials");
      }
    } catch (err) {
      toast.error("Failed to connect to backend server");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      toast.error("Please enter your registered admin phone number first");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone })
      });
      const data = await res.json();
      if (res.ok) {
        setView('reset_password');
        toast.success(data.message || 'OTP sent successfully!');
      } else {
        toast.error(data.error || 'Failed to send OTP');
      }
    } catch {
      toast.error('Network Error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !otpCode || !newPassword) {
      toast.error("Complete all fields");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp: otpCode, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
         toast.success("Password reset securely. You can now log in.");
         setView('login');
         setOtpCode('');
         setPassword('');
      } else {
         toast.error(data.error || 'Failed to reset password');
      }
    } catch {
      toast.error('Network Error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="bg-primary rounded-xl p-3 w-14 h-14 mx-auto mb-4 flex items-center justify-center">
            <Wifi className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Admin Panel</h1>
          <p className="text-sm text-muted-foreground mt-1">JOEMENS WIFI Management</p>
        </div>

        <form onSubmit={handleLogin} className="bg-card border rounded-lg p-6 space-y-4">
          {view === 'login' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Username</label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  autoComplete="username"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Lock className="h-4 w-4 mr-2" />}
                {loading ? "Signing in..." : "Sign In"}
              </Button>
              <div className="text-center mt-2">
                <button type="button" onClick={() => setView('request_otp')} className="text-sm text-primary hover:underline">
                  Forgot Password?
                </button>
              </div>
            </div>
          )}

          {view === 'request_otp' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Enter your registered admin phone number to receive a 6-digit confirmation code via SMS.
              </p>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Registered Phone</label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 0550000000"
                />
              </div>
              <Button type="button" onClick={handleRequestOtp} className="w-full" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Smartphone className="h-4 w-4 mr-2" />}
                {loading ? "Sending..." : "Send Reset Code"}
              </Button>
              <div className="text-center mt-2">
                <button type="button" onClick={() => setView('login')} className="text-sm text-muted-foreground hover:text-foreground flex items-center justify-center mx-auto gap-1">
                  <ArrowLeft className="w-4 h-4"/> Back to Login
                </button>
              </div>
            </div>
          )}

          {view === 'reset_password' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Enter the 6-digit code sent to your phone and your new password.
              </p>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">OTP Code</label>
                <Input
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="123456"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">New Password</label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <Button type="button" onClick={handleResetPassword} className="w-full" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Lock className="h-4 w-4 mr-2" />}
                {loading ? "Updating..." : "Update Password"}
              </Button>
               <div className="text-center mt-2">
                <button type="button" onClick={() => setView('login')} className="text-sm text-muted-foreground hover:text-foreground flex items-center justify-center mx-auto gap-1">
                  <ArrowLeft className="w-4 h-4"/> Cancel
                </button>
              </div>
            </div>
          )}

        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
