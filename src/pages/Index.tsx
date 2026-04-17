import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Building2, GraduationCap } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="space-y-3">
            <h1 className="text-4xl font-extrabold tracking-tight">Select Your Network</h1>
            <p className="text-muted-foreground text-lg">
              Choose your community to view available WiFi packages.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <button
              onClick={() => navigate('/town')}
              className="flex flex-col items-center justify-center gap-4 p-8 rounded-2xl border-2 border-border bg-card hover:border-primary hover:bg-accent/50 transition-all duration-200 group"
            >
              <div className="p-4 rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                <Building2 className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-xl">Town Network</h3>
                <p className="text-sm text-muted-foreground">For local residents</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/school')}
              className="flex flex-col items-center justify-center gap-4 p-8 rounded-2xl border-2 border-border bg-card hover:border-primary hover:bg-accent/50 transition-all duration-200 group"
            >
              <div className="p-4 rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                <GraduationCap className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-xl">School Network</h3>
                <p className="text-sm text-muted-foreground">For students & staff</p>
              </div>
            </button>
          </div>
        </div>
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <p>© 2026 JOEMENS WIFI. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Index;
