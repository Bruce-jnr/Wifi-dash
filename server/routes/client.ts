import express, { Request, Response } from 'express';
import { Package, VoucherRequest } from '../models/index.js';

const router = express.Router();

router.get('/packages', async (req: Request, res: Response) => {
  try {
    const packages = await Package.findAll();
    res.json(packages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch packages' });
  }
});

router.post('/request', async (req: Request, res: Response) => {
  const { phone, packageId } = req.body;
  if (!phone || !packageId) {
    res.status(400).json({ error: 'Phone and package ID are required' });
    return;
  }
  
  try {
    const voucherRequest = await (VoucherRequest as any).create({
      client_phone: phone,
      package_id: packageId,
      status: 'pending',
      payment_status: 'pending'
    });
    
    res.json({ message: 'Request created successfully', request: voucherRequest });
  } catch (error) {
    res.status(500).json({ error: 'Error processing request' });
  }
});

export default router;
