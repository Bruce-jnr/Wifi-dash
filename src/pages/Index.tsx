import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import PackageCard from "@/components/PackageCard";
import { mockPackages, type Package } from "@/lib/types";
import { Wifi, Shield, Smartphone } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const handleBuy = (pkg: Package) => {
    navigate(`/checkout/${pkg.id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-b from-accent to-background py-10 px-4">
        <div className="container text-center max-w-lg mx-auto">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary font-semibold px-4 py-1.5 rounded-full text-sm mb-4">
            <Wifi className="h-4 w-4" />
            High-Speed Internet
          </div>
          <h2 className="font-heading text-3xl font-bold text-foreground mb-2">
            Get Online Instantly
          </h2>
          <p className="text-muted-foreground">
            Purchase a WiFi voucher and connect in seconds. No registration needed — just your phone number.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="container py-6">
        <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto">
          {[
            { icon: Smartphone, label: "Mobile Money" },
            { icon: Shield, label: "Secure Payment" },
            { icon: Wifi, label: "Instant Access" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-1.5 text-center">
              <div className="bg-accent rounded-full p-2.5">
                <Icon className="h-4 w-4 text-accent-foreground" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Packages */}
      <section className="container pb-10">
        <div className="max-w-lg mx-auto">
          <h3 className="font-heading font-bold text-xl text-foreground mb-4">Choose a Package</h3>
          <div className="flex flex-col gap-4">
            {mockPackages.filter(p => p.active).map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} onBuy={handleBuy} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <p>© 2026 ASUOGYA WIFI. All rights reserved.</p>
        <p className="mt-1">Connect to <strong>ASUOGYA WIFI</strong> • Login at 192.168.88.1</p>
        <button
          onClick={() => navigate("/admin")}
          className="mt-3 text-xs text-muted-foreground/50 hover:text-primary transition-colors"
        >
          Admin
        </button>
      </footer>
    </div>
  );
};

export default Index;
