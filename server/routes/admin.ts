import express, { Request, Response } from 'express';
import { Package, VoucherRequest, Voucher } from '../models/index.js';
import { sendVoucherSms } from '../services/sms.js';
import { verifyAuth } from './auth.js';

const router = express.Router();

router.use(verifyAuth);

router.get('/requests', async (req: Request, res: Response) => {
  try {
    const requests = await VoucherRequest.findAll({
      where: { status: 'pending' },
      include: [Package]
    });
    res.json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

router.post('/generate', async (req: Request, res: Response) => {
  const { requestId, code } = req.body;
  
  if (!requestId || !code) {
    res.status(400).json({ error: 'Request ID and voucher code are required' });
    return;
  }

  try {
    const vr: any = await VoucherRequest.findByPk(requestId, { include: [Package] });
    if (!vr) {
      res.status(404).json({ error: 'Request not found' });
      return;
    }

    if (vr.status !== 'pending') {
      res.status(400).json({ error: 'Request is already fulfilled' });
      return;
    }

    const voucher = await (Voucher as any).create({
      code,
      request_id: vr.id,
      package_id: vr.package_id,
      status: 'active'
    });

    vr.status = 'fulfilled';
    await vr.save();

    try {
      await sendVoucherSms(vr.client_phone, code, vr.Package.name);
    } catch (smsError) {
      console.error('SMS Notification failed, but voucher was created.', smsError);
    }

    res.json({ message: 'Voucher generated successfully.', voucher });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error generating voucher' });
  }
});

export default router;
