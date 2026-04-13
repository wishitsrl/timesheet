import dotenv from 'dotenv';
dotenv.config();

interface Config {
  PORT: number;
  NODE_ENV: 'production' | 'test';
  API_SECRET: string;
  MONGODB_URI: string;
  BASE_URL: string;
  FRONTEND_URL: string;
  WHITELIST: string[];
  LOG_LEVEL: string;
  ENABLE_CONSOLE_LOG: boolean;
}

const nodeEnv = (process.env.NODE_ENV || 'test') as Config['NODE_ENV'];

const mongoUri =
  nodeEnv === 'production'
    ? process.env.MONGODB_URI_PROD || ''
    : process.env.MONGODB_URI || '';

const whitelist = (process.env.CORS_WHITELIST || '')
  .split(',')
  .map(url => url.trim())
  .filter(Boolean);

const config: Config = {
  PORT: parseInt(process.env.PORT || '3000', 10),
  NODE_ENV: nodeEnv,
  BASE_URL: process.env.BASE_URL || 'http://localhost:3000',
  FRONTEND_URL: 'http://192.168.0.10:3001',
  MONGODB_URI: mongoUri,
  WHITELIST: whitelist,
  API_SECRET: process.env.API_SECRET || 'defaultsecret',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  ENABLE_CONSOLE_LOG: process.env.ENABLE_CONSOLE_LOG === 'true',
};

export default config;