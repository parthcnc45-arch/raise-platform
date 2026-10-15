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

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1/auth', authRoutes);
import userRoutes from './routes/userRoutes.js';
app.use('/api/v1/users', userRoutes);
import emailRoutes from './routes/emailRoutes.js';
app.use('/api/v1/email', emailRoutes);
import eventRoutes from './routes/eventRoutes.js';
app.use('/api/v1/events', eventRoutes);
import gpApplicationRoutes from './routes/gpApplicationRoutes.js';
app.use('/api/v1/gp-applications', gpApplicationRoutes);

app.get('/api/v1/health', (_req, res) => {
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

app.get('/api/v1/applications', (_req, res) => {
  res.json({ success: true, data: [], message: 'Applications endpoint ready' });
});

app.get('/api/v1/roles', async (_req, res) => {
  try {
    const roles = await Role.find().sort({ createdAt: 1 });
    res.json({ success: true, count: roles.length, data: roles });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Failed to fetch roles' });
  }
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
