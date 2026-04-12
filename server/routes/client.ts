import express, { Request, Response } from 'express';
import { Package, VoucherRequest } from '../models/index.js';
import { initializeTransaction } from '../services/paystack.js';
import { rateLimit } from 'express-rate-limit';

const router = express.Router();

router.get('/packages', async (req: Request, res: Response) => {
  try {
    const packages = await Package.findAll();
    res.json(packages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch packages' });
  }
});

// Rate limit for payment requests: 3 per 15 minutes per IP
const requestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 3,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' }
});

router.post('/request', requestLimiter, async (req: Request, res: Response) => {
  const { phone, packageId } = req.body;
  if (!phone || !packageId) {
    res.status(400).json({ error: 'Phone and package ID are required' });
    return;
  }
  try {
    const pkg: any = await Package.findByPk(Number(packageId));
    if (!pkg) {
      res.status(404).json({ error: 'Package not found' });
      return;
    }

    const voucherRequest: any = await (VoucherRequest as any).create({
      client_phone: phone,
      package_id: packageId,
      status: 'pending',
      payment_status: 'pending'
    });

    const email = `${phone}@customer.com`;
    const callbackUrl = `${req.protocol}://${req.get('host')}/payment/success`;
    const paystackData = await initializeTransaction(email, pkg.price, {
      requestId: voucherRequest.id,
      phone: phone
    }, callbackUrl);

    res.json({
      message: 'Payment initialized',
      authorization_url: paystackData.authorization_url,
      reference: paystackData.reference
    });
  } catch (error: any) {
    console.error('Request Error:', error);
    res.status(500).json({ error: error.message || 'Error processing request' });
  }
});

export default router;
