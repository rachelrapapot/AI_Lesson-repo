import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AppError } from '../utils/AppError';
import { config } from '../config/env';

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
  } else if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = 'Invalid ID format';
  } else if ((err as NodeJS.ErrnoException).code === '11000') {
    statusCode = 409;
    message = 'Duplicate entry';
  }

  const isOperational = err.isOperational === true;
  const clientMessage =
    statusCode >= 500 && !isOperational && config.nodeEnv === 'production'
      ? 'Internal Server Error'
      : message;

  if (statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    error: clientMessage,
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  });
};
