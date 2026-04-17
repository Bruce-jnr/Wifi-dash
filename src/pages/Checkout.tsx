import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Phone, CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";

const Checkout = () => {
  const { packageId } = useParams();
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [pkg, setPkg] = useState<any>(null);

  useEffect(() => {
    fetch("/api/client/packages")
      .then(r => r.json())
      .then((data: any[]) => {
        const found = data.find((p: any) => String(p.id) === String(packageId));
        if (!found) { navigate("/"); return; }
        setPkg(found);
      })
      .catch(() => navigate("/"));
  }, [packageId]);

  if (!pkg) return null;

  const isValidPhone = /^0[235]\d{8}$/.test(phone);

  const handlePayment = async () => {
    if (!isValidPhone) {
      toast.error("Please enter a valid Ghana phone number");
      return;
    }
    setLoading(true);

    try {
      const res = await fetch('/api/client/request', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, packageId: pkg.id })
      });
      
      const data = await res.json();
      
      if (data.authorization_url) {
        toast.info("Redirecting to Paystack...");
        window.location.href = data.authorization_url;
      } else {
        toast.success("Request received! An admin will process your voucher shortly via SMS.");
        setTimeout(() => {
          navigate('/');
        }, 1500);
      }

    } catch (error) {
      toast.error("Network Error: Could not reach the backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container max-w-md mx-auto py-8 px-4">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to packages
        </button>

        <h2 className="font-heading text-2xl font-bold text-foreground mb-6">Checkout</h2>

        {/* Order Summary */}
        <div className="bg-card border rounded-lg p-5 mb-6">
          <h3 className="font-semibold text-foreground mb-3">Order Summary</h3>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Package</span>
            <span className="font-medium text-foreground">{pkg.name}</span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Validity</span>
            <span className="text-foreground">{pkg.duration}</span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Data Limit</span>
            <span className="text-foreground">{pkg.data_limit}</span>
          </div>
          <hr className="my-3" />
          <div className="flex justify-between">
            <span className="font-semibold text-foreground">Total</span>
            <span className="text-xl font-bold text-primary">GH₵ {pkg.price}</span>
          </div>
        </div>

        {/* Phone Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-2">
            <Phone className="h-4 w-4 inline mr-1" />
            Phone Number
          </label>
          <Input
            type="tel"
            placeholder="0241234567"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
            className="text-lg h-12"
            maxLength={10}
          />
          <p className="text-xs text-muted-foreground mt-1.5">
            Your voucher code will be sent via SMS to this number
          </p>
        </div>

        {/* Pay Button */}
        <Button
          variant="hero"
          size="lg"
          className="w-full h-14 text-lg"
          onClick={handlePayment}
          disabled={!isValidPhone || loading}
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
          ) : (
            <CreditCard className="h-5 w-5 mr-2" />
          )}
          {loading ? "Processing..." : `Pay GH₵ ${pkg.price} with Mobile Money`}
        </Button>

        <p className="text-xs text-center text-muted-foreground mt-4">
          Secured by Paystack • Mobile Money Ghana
        </p>
      </div>
    </div>
  );
};

export default Checkout;
