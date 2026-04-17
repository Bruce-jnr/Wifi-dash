import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import PackageCard from "@/components/PackageCard";
import { Wifi, Shield, Smartphone, ChevronLeft } from "lucide-react";

interface Props {
  community: 'town' | 'school';
}

const NetworkCommunity = ({ community }: Props) => {
  const navigate = useNavigate();
  const [packages, setPackages] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/client/packages")
      .then(r => r.json())
      .then(data => {
        // Filter packages based on the active property and community
        const filtered = data.filter((p: any) => p.active && p.community === community);
        setPackages(filtered);
      })
      .catch(() => {});
  }, [community]);

  const handleBuy = (pkg: any) => {
    navigate(`/checkout/${pkg.id}`);
  };

  const title = community === 'town' ? 'Town Network Packages' : 'School Network Packages';
  const subtitle = community === 'town' ? 'Get connected around town instantly.' : 'Get connected on campus instantly.';

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-b from-accent to-background py-10 px-4">
        <div className="container max-w-lg mx-auto text-center">
          <div className="flex justify-start mb-6">
            <button 
              onClick={() => navigate('/')} 
              className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Home
            </button>
          </div>
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary font-semibold px-4 py-1.5 rounded-full text-sm mb-4">
            <Wifi className="h-4 w-4" />
            High-Speed Internet
          </div>
          <h2 className="font-heading text-3xl font-bold text-foreground mb-2">
            {title}
          </h2>
          <p className="text-muted-foreground">
            {subtitle} Purchase a WiFi voucher and connect in seconds. No registration needed — just your phone number.
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
            {packages.length === 0 ? (
              <p className="text-muted-foreground text-center">No packages available for this community right now.</p>
            ) : (
              packages.map((pkg: any) => (
                <PackageCard key={pkg.id} pkg={pkg} onBuy={handleBuy} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <p>© <span className="copyright-year">2026</span> JOEMENS WIFI. All rights reserved.</p>
        <p className="mt-1">Connect to <strong>JOEMENS WIFI</strong></p>
      </footer>
    </div>
  );
};

export default NetworkCommunity;
