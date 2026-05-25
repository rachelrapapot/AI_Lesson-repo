import dotenv from 'dotenv';

dotenv.config();

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret || jwtSecret === 'CHANGE_ME_TO_A_RANDOM_SECRET') {
  console.error('FATAL: JWT_SECRET is not set or still has the placeholder value. Set a strong secret in .env');
  process.exit(1);
}

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/lesson-builder',
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
};
