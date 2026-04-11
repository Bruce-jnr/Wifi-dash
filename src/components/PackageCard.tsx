import { Clock, Zap, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Package {
  id: string | number;
  name: string;
  price: number;
  data_limit: string;
  duration: string;
  active: boolean;
  [key: string]: any;
}

interface PackageCardProps {
  pkg: Package;
  onBuy: (pkg: Package) => void;
}

const PackageCard = ({ pkg, onBuy }: PackageCardProps) => {
  return (
    <div className="bg-card rounded-lg border p-5 flex flex-col gap-3 animate-fade-in hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-bold text-lg text-foreground">{pkg.name}</h3>
        <span className="bg-accent text-accent-foreground text-xs font-semibold px-2 py-1 rounded-full">
          {pkg.duration}
        </span>
      </div>
      <p className="text-muted-foreground text-sm">{pkg.data_limit}</p>
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5 text-primary" />
          {pkg.duration}
        </span>
      </div>
      <div className="flex items-center justify-between mt-2">
        <div>
          <span className="text-2xl font-bold text-foreground">GH₵ {pkg.price}</span>
        </div>
        <Button variant="hero" size="lg" onClick={() => onBuy(pkg)} className="animate-pulse-glow">
          <Wifi className="h-4 w-4 mr-1" />
          Buy Now
        </Button>
      </div>
    </div>
  );
};

export default PackageCard;
