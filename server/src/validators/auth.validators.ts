import { Request } from 'express';
import { validateEmail, validateName, validatePassword } from '../utils/validation';

export function validateRegister(req: Request): string | null {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return 'Email, password, and name are required';
  }

  return validateEmail(email) || validatePassword(password) || validateName(name);
}

export function validateLogin(req: Request): string | null {
  const { email, password } = req.body;

  if (!email || !password) {
    return 'Email and password are required';
  }

  return validateEmail(email);
}
