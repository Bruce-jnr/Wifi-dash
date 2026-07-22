import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface TermsAndConditionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: () => void;
}

interface TermsSection {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  footer?: string;
}

const sections: TermsSection[] = [
  {
    title: '1. The Service',
    paragraphs: [
      'JOEMENS WIFI provides prepaid access to its town and school Wi-Fi networks. Each voucher applies only to the network, package, data allowance, and validity period displayed at checkout.',
      'Coverage, connection speed, and availability may vary because of signal strength, network congestion, maintenance, power supply, device capability, location, or circumstances outside our reasonable control. We do not guarantee uninterrupted service or a particular speed at all times.',
    ],
  },
  {
    title: '2. Eligibility',
    paragraphs: [
      'You must be at least 18 years old or have permission from a parent or legal guardian to make a purchase. You must be legally capable of entering into an agreement and must provide accurate purchase information.',
      'JOEMENS WIFI does not require customers to create an account to purchase a voucher.',
    ],
  },
  {
    title: '3. Phone Number and Voucher Delivery',
    paragraphs: [
      'You must provide a valid Ghanaian phone number that you control. We use this number to associate the purchase with your request, send the voucher by SMS, and provide transaction support.',
      'After successful payment, the voucher may be displayed on the confirmation page and sent by SMS. You are responsible for checking that the phone number is correct before paying. JOEMENS WIFI is not responsible for delivery to an incorrect number supplied by you.',
    ],
  },
  {
    title: '4. Packages and Vouchers',
    paragraphs: [
      'Before payment, the checkout page displays the package name, community network, price, data allowance, and validity period.',
      'A voucher:',
    ],
    bullets: [
      'Can be used only for the package and network for which it was issued.',
      "Becomes active according to the network's voucher rules.",
      'Must be kept confidential and must not be publicly shared.',
      'May not be replaced after it has been redeemed, shared, or used by another person.',
      'Cannot be exchanged for cash.',
    ],
    footer:
      'You are responsible for entering the voucher on the correct JOEMENS WIFI network and compatible login page.',
  },
  {
    title: '5. Payments',
    paragraphs: [
      'Payments are processed by Paystack using the payment methods offered at checkout, including supported mobile-money services. JOEMENS WIFI does not store your complete card or mobile-money credentials.',
      'A purchase is complete only after Paystack confirms payment. A pending, abandoned, reversed, or failed payment does not entitle you to a voucher.',
      'The price displayed at checkout applies to that transaction. Prices and available packages may change for future purchases.',
    ],
  },
  {
    title: '6. Delivery Problems and Refunds',
    paragraphs: [
      'If payment is confirmed but no valid voucher is displayed or delivered, contact JOEMENS WIFI and provide the phone number used for the purchase and the Paystack payment reference.',
      'We will investigate confirmed cases involving:',
    ],
    bullets: [
      'Duplicate charges for the same intended purchase.',
      'A successful charge for which no voucher was allocated.',
      'A voucher that was invalid when first delivered.',
      'A system error attributable to JOEMENS WIFI.',
    ],
    footer:
      'Refunds are not normally provided for a voucher that has already been redeemed or used; an incorrect phone number, package, or network selected by the customer; a voucher disclosed to or used by another person; a change of mind after successful delivery; or device, signal, or coverage limitations not caused by a fault in the voucher. Approved refunds will be processed through an appropriate payment method and may take time to appear, depending on Paystack and the relevant financial provider.',
  },
  {
    title: '7. Acceptable Use',
    paragraphs: [
      'You must use JOEMENS WIFI lawfully and responsibly. You must not use the service to:',
    ],
    bullets: [
      'Commit fraud or any other unlawful act.',
      'Access systems, accounts, or networks without authorization.',
      'Distribute malware or interfere with network security.',
      'Send spam, threats, harassment, or harmful content.',
      'Infringe intellectual-property or privacy rights.',
      'Disrupt the service or negatively affect other customers.',
      'Bypass package restrictions or attempt to resell unauthorized access.',
    ],
    footer:
      'We may restrict or terminate access where we reasonably suspect misuse, fraud, a security threat, or a legal violation.',
  },
  {
    title: '8. Privacy',
    paragraphs: [
      'We process your phone number, selected package, payment reference, transaction status, voucher-delivery status, IP address, and related technical information where necessary to:',
    ],
    bullets: [
      'Process and verify the purchase.',
      'Allocate and deliver the voucher.',
      'Prevent fraud and abuse.',
      'Investigate payment or delivery problems.',
      'Maintain business and audit records.',
      'Meet legal obligations.',
    ],
    footer:
      'Paystack independently processes payment information under its own privacy practices. SMS delivery providers receive the phone number and message necessary to deliver your voucher. Further information is available in the JOEMENS WIFI Privacy Policy.',
  },
  {
    title: '9. Service Availability and Maintenance',
    paragraphs: [
      'JOEMENS WIFI may temporarily interrupt or restrict service for maintenance, upgrades, safety, security, congestion management, power interruptions, or events beyond our reasonable control.',
      'We may change network infrastructure, package availability, prices, or technical features. Changes do not reduce a voucher that has already been validly purchased, except where necessary for security, legal compliance, or circumstances beyond our control.',
    ],
  },
  {
    title: '10. Limitation of Liability',
    paragraphs: [
      'To the extent permitted by Ghanaian law, JOEMENS WIFI is not responsible for indirect or consequential loss, lost data, lost profits, third-party service failure, device incompatibility, or temporary network interruption.',
      'Where liability cannot legally be excluded, our total liability relating to a voucher purchase will not exceed the amount paid for the affected voucher. Nothing in these Terms excludes rights or remedies that cannot be excluded under applicable consumer-protection law.',
    ],
  },
  {
    title: '11. Changes to These Terms',
    paragraphs: [
      'We may update these Terms for future purchases. The version shown and accepted at checkout applies to that transaction. Material updates will be identified by a new version number and revised date.',
    ],
  },
  {
    title: '12. Governing Law',
    paragraphs: [
      'These Terms are governed by the laws of the Republic of Ghana. Disputes are subject to the jurisdiction of the courts of Ghana, without limiting any consumer right to seek help from an appropriate regulator or dispute-resolution body.',
    ],
  },
  {
    title: '13. Contact JOEMENS WIFI',
    paragraphs: [
      'For payment, voucher-delivery, privacy, or Terms questions, contact:',
    ],
    bullets: ['Email: support@joemenswifi.com', 'Phone: +233 244 664 073'],
    footer:
      'When requesting transaction support, include your Paystack reference and the phone number used at checkout. Never send us your mobile-money PIN, card PIN, OTP, or complete card details.',
  },
  {
    title: '14. Entire Agreement',
    paragraphs: [
      'These Terms and the JOEMENS WIFI Privacy Policy form the agreement governing your purchase and use of a JOEMENS WIFI voucher. If any provision is found unenforceable, the remaining provisions continue to apply.',
    ],
  },
];

const TermsAndConditionsModal = ({
  open,
  onOpenChange,
  onAccept,
}: TermsAndConditionsModalProps) => {
  const handleAccept = () => {
    onAccept();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col overflow-hidden p-0">
        <DialogHeader className="shrink-0 border-b px-6 pb-4 pt-6">
          <DialogTitle>JOEMENS WIFI Terms and Conditions</DialogTitle>

          <DialogDescription>
            Version 1.0 · Last updated July 22, 2026
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 text-sm leading-6 text-muted-foreground">
          <div className="mb-6 space-y-3">
            <p>
              These Terms and Conditions (&quot;Terms&quot;) govern purchases
              and use of prepaid Wi-Fi vouchers supplied by{' '}
              <strong className="font-semibold text-foreground">
                JOEMENS WIFI
              </strong>{' '}
              in Ghana. Please read them before purchasing a voucher.
            </p>

            <p>
              By checking the acceptance box and continuing to payment, you
              confirm that you have read, understood, and accepted these Terms.
              If you do not agree, do not continue with the purchase.
            </p>
          </div>

          {sections.map((section) => (
            <section key={section.title} className="mb-6">
              <h3 className="mb-2 font-semibold text-foreground">
                {section.title}
              </h3>

              {section.paragraphs?.map((paragraph, index) => (
                <p key={`${section.title}-paragraph-${index}`} className="mb-3">
                  {paragraph}
                </p>
              ))}

              {section.bullets && (
                <ul className="mb-3 list-disc space-y-1 pl-6">
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              )}

              {section.footer && <p>{section.footer}</p>}
            </section>
          ))}
        </div>

        <DialogFooter className="shrink-0 border-t bg-background px-6 py-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>

          <Button onClick={handleAccept}>I Accept</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TermsAndConditionsModal;
