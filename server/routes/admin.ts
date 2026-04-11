import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { Package, VoucherRequest, Voucher, Admin, AuditLog } from '../models/index.js';
import { sendVoucherSms } from '../services/sms.js';
import { verifyAuth } from './auth.js';

const router = express.Router();

router.use(verifyAuth);

const createAuditLog = async (req: Request, type: string, description: string) => {
  try {
    const adminUser = (req as any).user?.username || 'Unknown';
    await AuditLog.create({
      admin_username: adminUser,
      action_type: type,
      description
    });
  } catch (e) {
    console.error("Failed to append audit log", e);
  }
};

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
    await createAuditLog(req, 'GENERATE_VOUCHER', `Automated generation for Code '${code}' to Request ID #${requestId} mapping Phone ${vr.client_phone}`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error generating voucher' });
  }
});

router.post('/packages', async (req: Request, res: Response) => {
  try {
    const pkg: any = await Package.create(req.body);
    await createAuditLog(req, 'CREATE_PACKAGE', `Drafted new WiFi Package '${pkg.name}'`);
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
    await createAuditLog(req, 'UPDATE_PACKAGE', `Updated fields inside Package '${pkg.name}'`);
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
    await createAuditLog(req, 'TOGGLE_PACKAGE', `Toggled Package '${pkg.name}' state to ${pkg.active ? 'ACTIVE' : 'INACTIVE'}`);
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
    await createAuditLog(req, 'CREATE_STAFF', `A new administrative staff access was created successfully under '${username}' targeting Email / Phone.`);
    res.json(newAdmin);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Failed to construct Admin account' });
  }
});

router.get('/logs', async (req: Request, res: Response) => {
  try {
    const logs = await AuditLog.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve Audit feeds' });
  }
});

export default router;
