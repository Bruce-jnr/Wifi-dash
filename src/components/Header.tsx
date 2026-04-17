import { Wifi, Signal } from "lucide-react";

const Header = () => {
  return (
    <header className="border-b bg-card sticky top-0 z-50">
      <div className="container flex items-center justify-between py-3">
        <div className="flex items-center gap-2">
          <div className="bg-primary rounded-lg p-2">
            <Wifi className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-heading font-bold text-lg leading-tight text-foreground">JOEMENS WIFI</h1>
            <p className="text-xs text-muted-foreground">Fast & Reliable Internet</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-success">
          <Signal className="h-4 w-4" />
          <span className="text-xs font-medium">Online</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
