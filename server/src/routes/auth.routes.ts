import { Router } from 'express';
import { register, login, logout, getMe } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { validateRegister, validateLogin } from '../validators/auth.validators';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/register', authLimiter, validate(validateRegister), register);
router.post('/login', authLimiter, validate(validateLogin), login);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);

export const authRoutes = router;
