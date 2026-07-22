import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Admin } from '../models/index.js';
import { sendPasswordResetOtp } from '../services/sms.js';
import crypto from 'crypto';
import { rateLimit } from 'express-rate-limit';
import { Op } from 'sequelize';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

// Stricter rate limiting for auth endpoints: 5 attempts per 15 minutes
const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many attempts. Please try again after 15 minutes.' },
});

// Accept Ghana numbers stored/submitted as 54xxxxxxx, 054xxxxxxx, or 23354xxxxxxx.
const phoneVariants = (value: unknown) => {
  const digits = String(value ?? '').replace(/\D/g, '');
  let national = digits;
  if (digits.startsWith('233') && digits.length === 12) national = digits.slice(3);
  else if (digits.startsWith('0') && digits.length === 10) national = digits.slice(1);
  if (national.length !== 9) return [];
  return [national, `0${national}`, `233${national}`];
};

const findAdminByPhone = async (phone: unknown) => {
  const variants = phoneVariants(phone);
  if (variants.length === 0) return null;
  return Admin.findOne({ where: { phone: { [Op.in]: variants } } });
};

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

    const token = jwt.sign(
      { username: admin.username, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '1h' },
    );
    res.json({ token, message: 'Login successful' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post(
  '/request-otp',
  authLimiter,
  async (req: Request, res: Response) => {
    const { phone } = req.body;
    try {
      const admin: any = await findAdminByPhone(phone);
      if (!admin) {
        // Keep this indistinguishable from a known number to prevent account enumeration.
        res.json({
          message: 'If the number is registered, an OTP will be sent shortly',
        });
        return;
      }

      const otp = crypto.randomInt(100000, 999999).toString();
      admin.otp_code = otp;
      admin.otp_expires = new Date(Date.now() + 10 * 60000); // Expiry in 10 minutes
      await admin.save();

      await sendPasswordResetOtp(admin.phone, otp);
      res.json({ message: 'OTP sent securely via SMS' });
    } catch {
      console.error('[Auth] OTP request failed');
      res.status(500).json({ error: 'Failed to process request' });
    }
  },
);

router.post(
  '/reset-password',
  authLimiter,
  async (req: Request, res: Response) => {
    const { phone, otp, newPassword } = req.body;
    try {
      const admin: any = await findAdminByPhone(phone);
      if (!admin) {
        res.status(400).json({ error: 'Invalid or expired OTP code' });
        return;
      }

      const submittedOtp = String(otp ?? '').trim();
      const storedOtp = String(admin.otp_code ?? '').trim();
      const expiresAt = new Date(admin.otp_expires).getTime();
      if (
        !storedOtp ||
        storedOtp !== submittedOtp ||
        !Number.isFinite(expiresAt) ||
        Date.now() > expiresAt
      ) {
        res.status(400).json({ error: 'Invalid or expired OTP code' });
        return;
      }

      if (typeof newPassword !== 'string' || newPassword.length < 8) {
        res
          .status(400)
          .json({ error: 'Password must be at least 8 characters' });
        return;
      }
      admin.password = await bcrypt.hash(newPassword, 10);
      admin.otp_code = null;
      admin.otp_expires = null;
      await admin.save();

      res.json({ message: 'Password reset completely successfully' });
    } catch (e) {
      res.status(500).json({ error: 'Failed to reset password' });
    }
  },
);

// Middleware for protecting routes
export const verifyAuth = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
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
