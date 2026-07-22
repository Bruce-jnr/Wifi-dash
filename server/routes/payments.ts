import express, { Request, Response } from 'express';
import { issueVoucher } from '../services/voucherService.js';
import { verifyTransaction } from '../services/paystack.js';
import crypto from 'crypto';
import { Package, VoucherRequest } from '../models/index.js';

const router = express.Router();

router.post('/webhook', async (req: Request, res: Response) => {
  const secret = process.env.PAYSTACK_TEST_SECRET_KEY || process.env.PAYSTACK_SECRET_KEY;
  if (!secret || !Buffer.isBuffer(req.body)) {
    res.status(500).send('Webhook is not configured correctly');
    return;
  }
  const hash = crypto.createHmac('sha512', secret).update(req.body).digest('hex');
  const signature = String(req.headers['x-paystack-signature'] || '');

  if (signature.length !== hash.length || !crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature))) {
    res.status(400).send('Invalid signature');
    return;
  }

  const event = JSON.parse(req.body.toString('utf8'));
  if (event.event === 'charge.success') {
    const { requestId } = event.data.metadata;
    
    try {
      const voucherRequest: any = await VoucherRequest.findByPk(Number(requestId), { include: [Package] });
      if (!voucherRequest || Number(event.data.amount) !== Math.round(Number(voucherRequest.Package.price) * 100)) {
        res.status(400).send('Payment does not match voucher request');
        return;
      }
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
      const requestId = Number(data.metadata?.requestId);
      const voucherRequest: any = await VoucherRequest.findByPk(requestId, { include: [Package] });
      if (!voucherRequest) {
        res.status(404).json({ error: 'Voucher request not found' });
        return;
      }
      const expectedAmount = Math.round(Number(voucherRequest.Package.price) * 100);
      if (Number(data.amount) !== expectedAmount) {
        res.status(400).json({ error: 'Payment amount does not match the selected package' });
        return;
      }
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
