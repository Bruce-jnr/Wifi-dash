import express, { Request, Response } from 'express';
import { issueVoucher } from '../services/voucherService.js';
import { verifyTransaction } from '../services/paystack.js';
import crypto from 'crypto';

const router = express.Router();

router.post('/webhook', async (req: Request, res: Response) => {
  const secret = process.env.PAYSTACK_TEST_SECRET_KEY || process.env.PAYSTACK_SECRET_KEY;
  const hash = crypto.createHmac('sha512', secret!).update(JSON.stringify(req.body)).digest('hex');

  if (hash !== req.headers['x-paystack-signature']) {
    res.status(400).send('Invalid signature');
    return;
  }

  const event = req.body;
  if (event.event === 'charge.success') {
    const { requestId } = event.data.metadata;
    
    try {
      console.log(`Payment successful for request ${requestId}. Issuing voucher...`);
      await issueVoucher(Number(requestId));
      res.status(200).send('OK');
    } catch (error: any) {
      console.error('Webhook issue error:', error.message);
      // Even if issuance fails (e.g. no vouchers), we acknowledge the webhook
      res.status(200).send('Payment received but voucher issuance delayed');
    }
  } else {
    res.status(200).send('Event not handled');
  }
});

router.get('/verify/:reference', async (req: Request, res: Response) => {
  const reference = String(req.params.reference);
  try {
    const data = await verifyTransaction(reference);
    if (data.status === 'success') {
      const requestId = data.metadata.requestId;
      console.log(`Manual verification successful for request ${requestId}. Issuing voucher...`);
      const result = await issueVoucher(Number(requestId));
      res.json({ message: 'Payment verified and voucher issued', ...result });
    } else {
      res.status(400).json({ error: 'Transaction not successful', status: data.status });
    }
  } catch (error: any) {
    console.error('Verify error:', error.message);
    res.status(500).json({ error: error.message || 'Failed to verify transaction' });
  }
});

export default router;
