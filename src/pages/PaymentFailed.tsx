import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { XCircle, RotateCcw } from "lucide-react";

const PaymentFailed = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container max-w-md mx-auto py-16 px-4 text-center">
        <div className="bg-destructive/10 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center animate-fade-in">
          <XCircle className="h-10 w-10 text-destructive" />
        </div>
        <h2 className="font-heading text-2xl font-bold text-foreground mb-2 animate-fade-in">
          Payment Failed
        </h2>
        <p className="text-muted-foreground mb-8 animate-fade-in">
          Something went wrong with your payment. No charge was made. Please try again.
        </p>
        <Button variant="hero" size="lg" onClick={() => navigate("/")} className="w-full">
          <RotateCcw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    </div>
  );
};

export default PaymentFailed;
