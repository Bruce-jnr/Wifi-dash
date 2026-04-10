import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { CheckCircle, Wifi, MessageSquare } from "lucide-react";

const PaymentSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container max-w-md mx-auto py-16 px-4 text-center">
        <div className="bg-success/10 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center animate-fade-in">
          <CheckCircle className="h-10 w-10 text-success" />
        </div>
        <h2 className="font-heading text-2xl font-bold text-foreground mb-2 animate-fade-in">
          Payment Successful!
        </h2>
        <p className="text-muted-foreground mb-8 animate-fade-in">
          Your voucher code has been sent via SMS to your phone number.
        </p>

        <div className="bg-card border rounded-lg p-5 mb-8 animate-fade-in text-left">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="h-4 w-4 text-primary" />
            <span className="font-medium text-sm text-foreground">Check your SMS for:</span>
          </div>
          <div className="bg-muted rounded-md p-4 text-sm font-mono text-foreground">
            <p>Your WiFi Voucher Code: <strong>XXXX-XXXX-XXXX</strong></p>
            <p className="mt-1">Connect to <strong>ASUOGYA WIFI</strong></p>
            <p>Login at: <strong>192.168.88.1</strong></p>
            <p className="mt-1 text-muted-foreground">Thank you!</p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button variant="hero" size="lg" onClick={() => navigate("/")} className="w-full">
            <Wifi className="h-4 w-4 mr-2" />
            Buy Another Voucher
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
