import { Request, Response, CookieOptions } from 'express';
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { User, UserRole, AuthProvider } from '../models/User';
import { config } from '../config/env';
import { asyncHandler } from '../middleware/asyncHandler';
import { AuthRequest, JwtPayload } from '../types';

const SALT_ROUNDS = 10;
const COOKIE_NAME = 'token';

/** Parses durations like "7d", "1h", "30m" into milliseconds */
function parseDurationMs(duration: string): number {
  const match = duration.match(/^(\d+)\s*(d|h|m|s)$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000;
  const value = parseInt(match[1], 10);
  const unit = match[2];
  const multipliers: Record<string, number> = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  return value * (multipliers[unit] ?? 86_400_000);
}

function generateToken(userId: string, role: UserRole): string {
  const payload: JwtPayload = { userId, role };
  const options: SignOptions = {
    expiresIn: config.jwtExpiresIn as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, config.jwtSecret, options);
}

function getCookieOptions(): CookieOptions {
  const isProduction = config.nodeEnv === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: parseDurationMs(config.jwtExpiresIn),
    path: '/',
  };
}

function sanitizeUser(user: { _id: unknown; email: string; name: string; role: UserRole; authProvider: AuthProvider; createdAt: Date }) {
  return {
    _id: user._id,
    email: user.email,
    name: user.name,
    role: user.role,
    authProvider: user.authProvider,
    createdAt: user.createdAt,
  };
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, name } = req.body;

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    res.status(409).json({ success: false, error: 'Email already registered' });
    return;
  }

  const passwordHash = await bcrypt.hash(password.trim(), SALT_ROUNDS);

  const user = await User.create({
    email: email.toLowerCase(),
    name: name.trim(),
    passwordHash,
    role: UserRole.STUDENT,
    authProvider: AuthProvider.LOCAL,
  });

  const token = generateToken(user._id.toString(), user.role);

  res.cookie(COOKIE_NAME, token, getCookieOptions());
  res.status(201).json({
    success: true,
    data: { user: sanitizeUser(user) },
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const trimmedPassword = typeof password === 'string' ? password.trim() : password;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    res.status(401).json({ success: false, error: 'Invalid credentials' });
    return;
  }

  const isMatch = await bcrypt.compare(trimmedPassword, user.passwordHash);
  if (!isMatch) {
    res.status(401).json({ success: false, error: 'Invalid credentials' });
    return;
  }

  const token = generateToken(user._id.toString(), user.role);

  res.cookie(COOKIE_NAME, token, getCookieOptions());
  res.json({
    success: true,
    data: { user: sanitizeUser(user) },
  });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'strict',
    path: '/',
  });
  res.json({ success: true });
});

export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Not authenticated' });
    return;
  }

  res.json({
    success: true,
    data: req.user,
  });
});
