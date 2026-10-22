import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDatabase, disconnectDatabase, getDatabaseStatus } from './config/database.js';
import { seedSuperAdmin } from './seeds/seedSuperAdmin.js';
import Role from './models/Role.js';
import User from './models/User.js';
import authRoutes from './routes/authRoutes.js';

const app = express();
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

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/auth', authRoutes);

import userRoutes from './routes/userRoutes.js';
app.use('/api/v1/users', userRoutes);
app.use('/users', userRoutes);

import emailRoutes from './routes/emailRoutes.js';
app.use('/api/v1/email', emailRoutes);
app.use('/email', emailRoutes);

import eventRoutes from './routes/eventRoutes.js';
app.use('/api/v1/events', eventRoutes);
app.use('/events', eventRoutes);

import gpApplicationRoutes from './routes/gpApplicationRoutes.js';
app.use('/api/v1/gp-applications', gpApplicationRoutes);
app.use('/gp-applications', gpApplicationRoutes);

app.get(['/api/v1/health', '/health'], (_req, res) => {
  const dbStatus = getDatabaseStatus();
  res.status(dbStatus.isConnected ? 200 : 503).json({
    success: dbStatus.isConnected,
    message: 'RAISE API is running',
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatus.status,
      isConnected: dbStatus.isConnected,
      host: dbStatus.host,
      name: dbStatus.name,
    },
  });
});

app.get(['/api/v1/applications', '/applications'], (_req, res) => {
  res.json({ success: true, data: [], message: 'Applications endpoint ready' });
});

app.get(['/api/v1/roles', '/roles'], async (_req, res) => {
  try {
    const roles = await Role.find().sort({ createdAt: 1 });
    res.json({ success: true, count: roles.length, data: roles });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Failed to fetch roles' });
  }
});

// Global Error Handler (CORS validation and unhandled exceptions)
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
    // Connect to MongoDB before starting server
    await connectDatabase();

    // Ensure default Super Admin exists in database
    await seedSuperAdmin();

    const server = app.listen(PORT, () => {
      console.log(`RAISE API running on http://localhost:${PORT}`);
    });

    // Graceful shutdown handling
    const gracefulShutdown = async (signal: string) => {
      console.log(`\nReceived ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        console.log('HTTP server closed.');
        await disconnectDatabase();
        process.exit(0);
      });
    };

    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  } catch (error) {
    console.error('Failed to start server due to database connection error:', error);
    process.exit(1);
  }
}

startServer();
