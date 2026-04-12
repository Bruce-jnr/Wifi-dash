import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { CheckCircle, Wifi, MessageSquare, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [voucherCode, setVoucherCode] = useState<string | null>(null);
  
  const reference = searchParams.get("reference") || searchParams.get("trs_ref");

  useEffect(() => {
    if (!reference) {
      setLoading(false);
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/payments/verify/${reference}`);
        const data = await res.json();
        if (res.ok) {
          setVoucherCode(data.voucher.code);
          toast.success("Payment verified! Your voucher is below.");
        } else {
          setError(data.error || "Verification failed");
          toast.error(data.error || "Failed to verify payment");
        }
      } catch (err) {
        setError("Network error during verification");
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [reference]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container max-w-md mx-auto py-16 px-4 text-center">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
            <p className="text-lg font-medium text-foreground">Verifying Payment...</p>
            <p className="text-sm text-muted-foreground mt-2">Checking with Paystack. Please wait.</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center py-12">
            <div className="bg-destructive/10 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <AlertCircle className="h-10 w-10 text-destructive" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-2">Verification Failed</h2>
            <p className="text-muted-foreground mb-8">{error}</p>
            <Button variant="outline" onClick={() => navigate("/")} className="w-full">
              Back to Home
            </Button>
          </div>
        ) : (
          <>
            <div className="bg-success/10 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center animate-fade-in">
              <CheckCircle className="h-10 w-10 text-success" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-2 animate-fade-in">
              Payment Successful!
            </h2>
            <p className="text-muted-foreground mb-8 animate-fade-in">
              Your voucher code is ready. Connect and enjoy!
            </p>

            <div className="bg-card border rounded-lg p-5 mb-8 animate-fade-in text-left">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm text-foreground">Your WiFi Voucher:</span>
              </div>
              <div className="bg-muted rounded-md p-4 text-sm font-mono text-foreground">
                <p>Your WiFi Voucher Code: <strong className="text-primary text-lg">{voucherCode || "XXXX-XXXX-XXXX"}</strong></p>
                <p className="mt-1">Connect to <strong>ASUOGYA WIFI</strong></p>
                <p>Login at: <strong>192.168.88.1</strong></p>
                {reference && <p className="mt-2 text-xs text-muted-foreground">Reference: {reference}</p>}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button variant="hero" size="lg" onClick={() => navigate("/")} className="w-full">
                <Wifi className="h-4 w-4 mr-2" />
                Buy Another Voucher
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;
