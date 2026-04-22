import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import clientRoutes from './routes/client.js';
import adminRoutes from './routes/admin.js';
import paymentRoutes from './routes/payments.js';
import { initDb } from './models/index.js';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the root .env file
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for production environments (required by express-rate-limit)
app.set('trust proxy', 1);

// Security Middleware
app.use(helmet());

// Prevent intermediary/proxy/browser caching of API responses.
// This is important behind shared hosting/proxies (e.g., cPanel/LiteSpeed/Cloudflare),
// where GET requests may be cached unless explicitly disabled.
app.use('/api', (req: Request, res: Response, next) => {
  res.setHeader(
    'Cache-Control',
    'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0'
  );
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  next();
});

// Restrict CORS to specific origins in production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL || ''] 
    : true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(express.json());

// General rate limiting: max 100 requests per 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);

// Serve React Static Files
app.use(express.static(path.join(__dirname, '../dist')));

// SPA Catch-all
app.use((req: Request, res: Response) => {
  // Avoid caching the HTML shell so new deployments propagate quickly.
  res.setHeader('Cache-Control', 'no-cache, max-age=0, must-revalidate');
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

initDb().then(() => {
  console.log('Database initialized. Starting server...');
  const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

  server.on('error', (err) => {
    console.error('Server error:', err);
  });

  server.on('close', () => {
    console.log('Server closed');
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
});
