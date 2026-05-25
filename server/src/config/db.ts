import mongoose from 'mongoose';
import { config } from './env';

export let isDbConnected = false;

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(config.mongodbUri);
    isDbConnected = true;
    console.log('MongoDB connected successfully');
  } catch (error) {
    isDbConnected = false;
    console.error('MongoDB connection error:', error);
    console.warn('Server will start without DB — requests requiring DB will fail.');
  }
};
