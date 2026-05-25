import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { connectDB, isDbConnected } from './config/db';
import { getCorsOptions } from './config/cors';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFound';
import { authRoutes } from './routes/auth.routes';
import { lessonRoutes } from './routes/lesson.routes';
import { quizRoutes } from './routes/quiz.routes';
import { config } from './config/env';
import { generalLimiter } from './middleware/rateLimiter';

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors(getCorsOptions()));
app.use(generalLimiter);
app.use(morgan('dev'));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/quiz', quizRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: isDbConnected ? 'ok' : 'degraded', db: isDbConnected, timestamp: new Date().toISOString() });
});

app.use(notFoundHandler);
app.use(errorHandler);

const start = async () => {
  await connectDB();
  app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
  });
};

start();
