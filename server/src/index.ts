import './config/env';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { authRoutes } from './routes/auth.routes';
import { jobRoutes } from './routes/job.routes';
import { candidateRoutes } from './routes/candidate.routes';
import { employerRoutes } from './routes/employer.routes';
import { aiRoutes } from './routes/ai.routes';
import { notificationRoutes } from './routes/notification.routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ─────────────────────────────────────────
app.get('/', (_req, res) => {
  res.send(`
    <div style="font-family: sans-serif; text-align: center; padding: 50px; background: #09090b; color: #fafafa; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; margin: 0;">
      <h1 style="color: #6366f1; margin-bottom: 10px;">VELIZO API Server</h1>
      <p style="color: #a1a1aa; margin-bottom: 20px;">The backend service is running successfully.</p>
      <a href="/api/health" style="color: #14b8a6; text-decoration: none; font-weight: bold; border: 1px solid #27272a; padding: 10px 20px; rounded: 8px; background: #18181b; border-radius: 8px;">Check API Health</a>
    </div>
  `);
});

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    platform: 'VELIZO',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ───────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/employers', employerRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);

// ─── Error Handler ────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 VELIZO API Server running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}\n`);
});

export default app;
