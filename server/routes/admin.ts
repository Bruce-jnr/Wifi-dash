import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { Package, VoucherRequest, Voucher, Admin } from '../models/index.js';
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

router.post('/packages', async (req: Request, res: Response) => {
  try {
    const pkg = await Package.create(req.body);
    res.json(pkg);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create package' });
  }
});

router.put('/packages/:id', async (req: Request, res: Response) => {
  try {
    const pkg: any = await Package.findByPk(req.params.id as string);
    if (!pkg) {
      res.status(404).json({ error: 'Package not found' });
      return;
    }
    await pkg.update(req.body);
    res.json(pkg);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update package' });
  }
});

router.patch('/packages/:id/toggle', async (req: Request, res: Response) => {
  try {
    const pkg: any = await Package.findByPk(req.params.id as string);
    if (!pkg) {
      res.status(404).json({ error: 'Package not found' });
      return;
    }
    pkg.active = !pkg.active;
    await pkg.save();
    res.json(pkg);
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle package state' });
  }
});

// Admin Staff Management
router.get('/staff', async (req: Request, res: Response) => {
  try {
    const staff = await Admin.findAll({
      attributes: ['id', 'username', 'email', 'phone', 'createdAt']
    });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch staff' });
  }
});

router.post('/staff', async (req: Request, res: Response) => {
  const { username, email, phone, password } = req.body;
  try {
    const hp = await bcrypt.hash(password, 10);
    const newAdmin = await Admin.create({
      username,
      email,
      phone,
      password: hp
    });
    res.json(newAdmin);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Failed to construct Admin account' });
  }
});

export default router;
