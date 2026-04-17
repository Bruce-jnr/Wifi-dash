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
