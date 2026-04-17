import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Wifi, LayoutDashboard, Package, Ticket, LogOut, Menu, X, Users, ClipboardList } from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: string;
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
  { id: "packages", label: "Packages", icon: Package, path: "/admin/packages" },
  { id: "vouchers", label: "Vouchers", icon: Ticket, path: "/admin/vouchers" },
  { id: "staff", label: "Staff", icon: Users, path: "/admin/staff" },
  { id: "logs", label: "Audit Logs", icon: ClipboardList, path: "/admin/logs" }
];

const AdminLayout = ({ children, activeTab }: AdminLayoutProps) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    navigate("/admin");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="bg-card border-b sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="bg-primary rounded-lg p-1.5">
              <Wifi className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-heading font-bold text-sm text-foreground">JOEMENS Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="hidden md:flex">
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </Button>
          </div>
        </div>

        {/* Mobile nav */}
        {menuOpen && (
          <div className="border-t px-4 py-2 md:hidden">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { navigate(item.path); setMenuOpen(false); }}
                className={`flex items-center gap-2 w-full px-3 py-2.5 rounded-md text-sm transition-colors ${
                  activeTab === item.id ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-3 py-2.5 rounded-md text-sm text-destructive"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        )}

        {/* Desktop nav */}
        <div className="hidden md:flex border-t px-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm border-b-2 transition-colors ${
                activeTab === item.id
                  ? "border-primary text-primary font-medium"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </div>
      </header>

      <main className="container py-6 px-4">{children}</main>
    </div>
  );
};

export default AdminLayout;
