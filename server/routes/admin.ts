import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import { Package, VoucherRequest, Voucher, Admin, AuditLog } from '../models/index.js';
import { sendVoucherSms } from '../services/sms.js';
import { issueVoucher } from '../services/voucherService.js';
import { verifyAuth } from './auth.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(verifyAuth);

const createAuditLog = async (req: Request, type: string, description: string) => {
  try {
    const adminUser = (req as any).user?.username || 'Unknown';
    await AuditLog.create({ admin_username: adminUser, action_type: type, description });
  } catch (e) {
    console.error('Failed to append audit log', e);
  }
};

// ─------------------ Voucher Requests ───────────────────────────────────────

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

// Auto-pick available voucher from pool and issue it
router.post('/generate', async (req: Request, res: Response) => {
  const { requestId } = req.body;

  if (!requestId) {
    res.status(400).json({ error: 'Request ID is required' });
    return;
  }

  try {
    const { voucher, vr } = await issueVoucher(Number(requestId));
    await createAuditLog(req, 'ISSUE_VOUCHER', `Voucher '${voucher.code}' issued to ${vr.client_phone} for package '${vr.Package?.name}'`);
    res.json({ message: 'Voucher issued and SMS sent successfully.', code: voucher.code });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error issuing voucher' });
  }
});

// ----------------------- CSV Upload ---------------------------------

router.post('/vouchers/upload', upload.single('file'), async (req: Request, res: Response) => {
  const { package_id } = req.body;
  if (!req.file || !package_id) {
    res.status(400).json({ error: 'CSV file and package_id are required' });
    return;
  }

  try {
    const pkg = await Package.findByPk(Number(package_id));
    if (!pkg) { res.status(404).json({ error: 'Package not found' }); return; }

    const text = req.file.buffer.toString('utf8');
    let codes = text
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(l => l.length > 0);

    // Skip header if present
    if (codes.length > 0 && (codes[0].toLowerCase() === 'code' || codes[0].toLowerCase() === 'voucher')) {
      codes = codes.slice(1);
    }

    if (codes.length === 0) {
      res.status(400).json({ error: 'CSV file is empty or has no valid codes' });
      return;
    }

    let inserted = 0;
    let skipped = 0;
    for (const code of codes) {
      const [, created] = await (Voucher as any).findOrCreate({
        where: { code },
        defaults: { code, package_id: Number(package_id), status: 'available' }
      });
      created ? inserted++ : skipped++;
    }

    await createAuditLog(req, 'UPLOAD_VOUCHERS', `Uploaded ${inserted} voucher(s) for package '${(pkg as any).name}' (${skipped} duplicates skipped)`);
    res.json({ message: `Uploaded ${inserted} voucher(s). ${skipped} duplicate(s) skipped.`, inserted, skipped });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: 'Failed to process CSV upload' });
  }
});

// ─── Voucher Pool Stats ────────────────────────────────────────────────────────

router.get('/vouchers', async (req: Request, res: Response) => {
  try {
    const packages: any[] = await Package.findAll() as any[];
    console.log(`[AdminVouchers] Found ${packages.length} packages for pool stats`);
    
    const stats = await Promise.all(
      packages.map(async (pkg: any) => {
        try {
          const available = await Voucher.count({ where: { package_id: pkg.id, status: 'available' } });
          const issued = await Voucher.count({ where: { package_id: pkg.id, status: 'issued' } });
          return { id: pkg.id, name: pkg.name, duration: pkg.duration, price: pkg.price, available, issued, community: pkg.community };
        } catch (err) {
          console.error(`[AdminVouchers] Error counting vouchers for package ${pkg.id}:`, err);
          return { id: pkg.id, name: pkg.name, duration: pkg.duration, price: pkg.price, available: 0, issued: 0, community: pkg.community, error: true };
        }
      })
    );
    res.json(stats);
  } catch (error) {
    console.error('[AdminVouchers] Global error:', error);
    res.status(500).json({ error: 'Failed to fetch voucher pool stats' });
  }
});

router.post('/vouchers/manual', async (req: Request, res: Response) => {
  const { code, package_id } = req.body;
  if (!code || !package_id) {
    res.status(400).json({ error: 'Voucher code and package_id are required' });
    return;
  }

  try {
    const pkg = await Package.findByPk(Number(package_id));
    if (!pkg) { res.status(404).json({ error: 'Package not found' }); return; }

    const [voucher, created] = await (Voucher as any).findOrCreate({
      where: { code },
      defaults: { code, package_id: Number(package_id), status: 'available' }
    });

    if (!created) {
      res.status(400).json({ error: 'Voucher code already exists' });
      return;
    }

    await createAuditLog(req, 'ADD_VOUCHER_MANUAL', `Manually added voucher '${code}' for package '${(pkg as any).name}'`);
    res.json({ message: 'Voucher added successfully', voucher });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add voucher' });
  }
});

router.get('/stats', async (req: Request, res: Response) => {
  try {
    const totalPackages = await Package.count();
    const pendingRequests = await VoucherRequest.count({ where: { status: 'pending' } });
    const fulfilledRequests = await VoucherRequest.count({ where: { status: 'fulfilled' } });
    
    // Calculate total revenue from fulfilled requests
    const paidRequests: any[] = await VoucherRequest.findAll({
      where: { status: 'fulfilled' },
      include: [Package]
    }) as any[];
    
    const revenue = paidRequests.reduce((sum, req) => sum + Number(req.Package?.price || 0), 0);

    const result = {
      totalPackages,
      pendingRequests,
      fulfilledRequests,
      revenue
    };
    console.log('Stats being sent to client:', result);
    res.json(result);
  } catch (error) {
    console.error('Stats Error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// ─── Packages CRUD ─────────────────────────────────────────────────────────────

router.get('/packages', async (req: Request, res: Response) => {
  try {
    const packages = await Package.findAll();
    res.json(packages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch packages' });
  }
});

router.post('/packages', async (req: Request, res: Response) => {
  try {
    const pkg: any = await Package.create(req.body);
    await createAuditLog(req, 'CREATE_PACKAGE', `Created package '${pkg.name}'`);
    res.json(pkg);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create package' });
  }
});

router.put('/packages/:id', async (req: Request, res: Response) => {
  try {
    const pkg: any = await Package.findByPk(Number(req.params.id));
    if (!pkg) { res.status(404).json({ error: 'Package not found' }); return; }
    await pkg.update(req.body);
    await createAuditLog(req, 'UPDATE_PACKAGE', `Updated package '${pkg.name}'`);
    res.json(pkg);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update package' });
  }
});

router.patch('/packages/:id/toggle', async (req: Request, res: Response) => {
  try {
    const pkg: any = await Package.findByPk(Number(req.params.id));
    if (!pkg) { res.status(404).json({ error: 'Package not found' }); return; }
    pkg.active = !pkg.active;
    await pkg.save();
    await createAuditLog(req, 'TOGGLE_PACKAGE', `Toggled '${pkg.name}' to ${pkg.active ? 'ACTIVE' : 'INACTIVE'}`);
    res.json(pkg);
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle package' });
  }
});

// ─── Staff Management ──────────────────────────────────────────────────────────

router.get('/staff', async (req: Request, res: Response) => {
  try {
    const staff = await Admin.findAll({ attributes: ['id', 'username', 'email', 'phone', 'createdAt'] });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch staff' });
  }
});

router.post('/staff', async (req: Request, res: Response) => {
  const { username, email, phone, password } = req.body;
  try {
    const hp = await bcrypt.hash(password, 10);
    const newAdmin = await Admin.create({ username, email, phone, password: hp });
    await createAuditLog(req, 'CREATE_STAFF', `Created admin account '${username}'`);
    res.json(newAdmin);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Failed to create admin' });
  }
});

// ─── Audit Logs ────────────────────────────────────────────────────────────────

router.get('/logs', async (req: Request, res: Response) => {
  try {
    const logs = await AuditLog.findAll({ order: [['createdAt', 'DESC']] });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve logs' });
  }
});

export default router;
