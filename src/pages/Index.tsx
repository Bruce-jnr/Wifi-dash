import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Building2, GraduationCap, HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How do I buy a Wi-Fi voucher?",
    answer: "Choose the Town or School network, select a package, accept the Terms and Conditions, enter your Ghana phone number, and complete payment through Paystack.",
  },
  {
    question: "How will I receive my voucher code?",
    answer: "After Paystack confirms your payment, your voucher appears on the success page and is also sent by SMS to the phone number entered at checkout.",
  },
  {
    question: "How do I use my voucher?",
    answer: "Connect your device to the correct JOEMENS WIFI network, open the network login page, and enter the voucher code you received. A Town voucher must be used on the Town network and a School voucher on the School network.",
  },
  {
    question: "When does my package validity begin?",
    answer: "Your package validity begins according to the network's voucher rules, normally when the voucher is first activated. The duration and data allowance are displayed before you pay.",
  },
  {
    question: "What if I paid but did not receive a voucher?",
    answer: "Keep your Paystack payment reference and contact JOEMENS WIFI using the phone number entered at checkout. We will verify the payment and investigate delivery.",
  },
  {
    question: "Can I get a refund?",
    answer: "Confirmed duplicate charges, delivery failures, and vouchers that were invalid when first delivered can be investigated. Used vouchers, incorrect customer selections, and changes of mind are generally not refundable.",
  },
  {
    question: "Who can I contact for help?",
    answer: "Contact JOEMENS WIFI at +233 244 664 073 or support@joemenswifi.com. For payment support, include your Paystack reference but never share your mobile-money PIN or OTP.",
  },
];

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1">
        <section className="px-4 py-14 sm:py-20">
          <div className="max-w-md w-full mx-auto text-center space-y-8">
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
        </section>

        <section className="border-t bg-muted/30 px-4 py-12 sm:py-16" aria-labelledby="faq-heading">
          <div className="mx-auto max-w-2xl">
            <div className="mb-8 text-center">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                <HelpCircle className="h-4 w-4" />
                Need help?
              </div>
              <h2 id="faq-heading" className="text-3xl font-bold tracking-tight text-foreground">
                Frequently Asked Questions
              </h2>
              <p className="mt-2 text-muted-foreground">
                Quick answers about purchasing and using your JOEMENS WIFI voucher.
              </p>
            </div>

            <Accordion type="single" collapsible className="rounded-xl border bg-card px-5 shadow-sm">
              {faqs.map((faq, index) => (
                <AccordionItem key={faq.question} value={`faq-${index}`}>
                  <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                  <AccordionContent className="leading-6 text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <p>© 2026 JOEMENS WIFI. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Index;
