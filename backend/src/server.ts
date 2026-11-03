import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { supabase } from './config/supabase.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import emailRoutes from './routes/emailRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import gpApplicationRoutes from './routes/gpApplicationRoutes.js';
import { globalLimiter } from './middleware/rateLimiter.js';

const app = express();
app.set('trust proxy', 1);
const PORT = Number(process.env.PORT ?? 5000);
const allowedOrigin = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/+$/, '');

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow tools/clients with no Origin header (e.g. server-to-server, curl, Postman, health check)
    if (!origin) {
      return callback(null, true);
    }

    const normalizedOrigin = origin.replace(/\/+$/, '');
    if (normalizedOrigin === allowedOrigin) {
      return callback(null, true);
    }

    return callback(new Error(`CORS validation failed: Origin '${origin}' is not permitted`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
  ],
  exposedHeaders: ['Set-Cookie'],
  maxAge: 86400, // Preflight cache 24h
};

app.use(cors(corsOptions));
app.use(express.json());

// Global Rate Limiter: Protects against spam scripts, automated console loops, and DDoS
app.use(globalLimiter);

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/v1/users', userRoutes);
app.use('/users', userRoutes);

app.use('/api/v1/email', emailRoutes);
app.use('/email', emailRoutes);

app.use('/api/v1/events', eventRoutes);
app.use('/events', eventRoutes);

app.use('/api/v1/gp-applications', gpApplicationRoutes);
app.use('/gp-applications', gpApplicationRoutes);

import roleRoutes from './routes/roleRoutes.js';
app.use('/api/v1/roles', roleRoutes);
app.use('/roles', roleRoutes);

// Health Check
app.get(['/api/v1/health', '/health'], async (_req, res) => {
  try {
    const { error } = await supabase.from('roles').select('id').limit(1);
    const isConnected = !error;
    res.status(isConnected ? 200 : 503).json({
      success: isConnected,
      message: isConnected ? 'RAISE API is healthy (Supabase)' : 'Database unavailable',
      timestamp: new Date().toISOString(),
      status: isConnected ? 'healthy' : 'unhealthy',
    });
  } catch {
    res.status(503).json({
      success: false,
      message: 'Database unavailable',
      timestamp: new Date().toISOString(),
      status: 'unhealthy',
    });
  }
});


app.get(['/api/v1/applications', '/applications'], (_req, res) => {
  res.json({ success: true, data: [], message: 'Applications endpoint ready' });
});

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err && err.message && err.message.includes('CORS')) {
    return res.status(403).json({
      success: false,
      message: err.message,
    });
  }

  console.error('Unhandled server error:', err);
  return res.status(500).json({
    success: false,
    message: err?.message || 'Internal Server Error',
  });
});

async function startServer() {
  try {
    // Verify Supabase connection before accepting requests
    const { data, error } = await supabase.from('roles').select('id').limit(1);
    if (error) {
      console.error('⚠️ Supabase connection warning:', error.message);
    } else {
      console.log('✅ Connected to Supabase PostgreSQL database.');
    }

    const server = app.listen(PORT, () => {
      console.log(`🚀 RAISE API running on http://localhost:${PORT}`);
    });

    const gracefulShutdown = async (signal: string) => {
      console.log(`\nReceived ${signal}. Shutting down gracefully...`);
      server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
