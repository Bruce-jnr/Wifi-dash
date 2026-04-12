import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Admin } from '../models/index.js';
import { sendVoucherSms } from '../services/sms.js';
import crypto from 'crypto';
import { rateLimit } from 'express-rate-limit';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

// Stricter rate limiting for auth endpoints: 5 attempts per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many attempts. Please try again after 15 minutes.' }
});

router.post('/login', authLimiter, async (req: Request, res: Response) => {
  const { username, password } = req.body;
  
  try {
    const admin: any = await Admin.findOne({ where: { username } });
    if (!admin) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign({ username: admin.username, role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, message: 'Login successful' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/request-otp', async (req: Request, res: Response) => {
  const { phone } = req.body;
  try {
    const admin: any = await Admin.findOne({ where: { phone } });
    if (!admin) {
      res.status(400).json({ error: 'User not found or no phone registered matching this number' });
      return;
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    admin.otp_code = otp;
    admin.otp_expires = new Date(Date.now() + 10 * 60000); // Expiry in 10 minutes
    await admin.save();

    await sendVoucherSms(admin.phone, otp, 'Password Reset OTP');
    res.json({ message: 'OTP sent securely via SMS' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

router.post('/reset-password', async (req: Request, res: Response) => {
  const { phone, otp, newPassword } = req.body;
  try {
    const admin: any = await Admin.findOne({ where: { phone } });
    if (!admin) {
      res.status(400).json({ error: 'Invalid user' });
      return;
    }

    if (!admin.otp_code || admin.otp_code !== otp || new Date() > new Date(admin.otp_expires)) {
      res.status(400).json({ error: 'Invalid or expired OTP code' });
      return;
    }

    admin.password = await bcrypt.hash(newPassword, 10);
    admin.otp_code = null;
    admin.otp_expires = null;
    await admin.save();

    res.json({ message: 'Password reset completely successfully' });
  } catch(e) {
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Middleware for protecting routes
export const verifyAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    res.status(401).json({ message: 'Token missing' });
    return;
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    (req as any).user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

export default router;
