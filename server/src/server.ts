import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import helmet from 'helmet';
import compression from 'compression';
import config from './config/config';
import rateLimiter from './helpers/rateLimiter';
import authRoutes from './routes/auth.routes';
import profileRoutes from './routes/profile.routes';
import timesheetRoutes from './routes/timesheet.routes';
import logger from './helpers/logger';

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../view'));
app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(compression());
app.use(helmet()); 

const whitelist = config.WHITELIST;
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); 
    if (whitelist.includes(origin)) return callback(null, true);

    console.warn(`🚫 CORS blocked origin: ${origin}`);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
};
app.use(cors(corsOptions));

app.use(rateLimiter(15 * 60 * 1000, 300));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/timesheet', timesheetRoutes);
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads'), { maxAge: '1d', etag: true }));

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.path,
  });
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error('❌ Error:', err.message);
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ success: false, message: 'CORS policy violation' });
  }
  res.status(500).json({
    success: false,
    message: config.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

const connectWithRetry = async (retries = 5, delay = 5000) => {
  logger.info('Connecting to MongoDB: %s', config.MONGODB_URI);
  for (let i = 0; i < retries; i++) {
    try {
      await mongoose.connect(config.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
      logger.info('✅ MongoDB connected successfully');
      return;
    } catch (err: any) {
      logger.error(`❌ MongoDB connection attempt ${i + 1} failed: %O`, err);
      if (i < retries - 1) {
        logger.info(`⏳ Retrying in ${delay / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw err;
      }
    }
  }
};

const gracefulShutdown = async (signal: string) => {
  logger.info(`\n${signal} received. Starting graceful shutdown...`);
  try {
    await mongoose.connection.close();
    logger.info('✅ MongoDB connection closed');
    process.exit(0);
  } catch (err: any) {
    logger.error('❌ Error during shutdown: %O', err);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

const startServer = async () => {
  try {
    await connectWithRetry();
    const server = app.listen(config.PORT, '0.0.0.0', () => {
      logger.info(`✅ Server running at ${config.BASE_URL} on port ${config.PORT}`);
    });
    server.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        logger.error(`❌ Port ${config.PORT} is already in use`);
      } else {
        logger.error('❌ Server error: %O', err);
      }
      process.exit(1);
    });
  } catch (err: any) {
    logger.error('❌ Failed to start server: %O', err);
    process.exit(1);
  }
};

startServer();