import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Link,
  Stack,
  CircularProgress,
} from '@mui/material';
import { useRegister } from '../hooks/useAuth';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;
const MAX_NAME_LENGTH = 100;

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
}

export function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const registerMutation = useRegister();

  const validateField = (field: string, value: string): string | undefined => {
    switch (field) {
      case 'name':
        if (!value.trim()) return 'Full name is required';
        if (value.trim().length > MAX_NAME_LENGTH) return `Name must be at most ${MAX_NAME_LENGTH} characters`;
        return undefined;
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!EMAIL_REGEX.test(value)) return 'Please enter a valid email address';
        return undefined;
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < MIN_PASSWORD_LENGTH) return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
        return undefined;
      default:
        return undefined;
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const value = field === 'name' ? name : field === 'email' ? email : password;
    setErrors((prev) => ({ ...prev, [field]: validateField(field, value) }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {
      name: validateField('name', name),
      email: validateField('email', email),
      password: validateField('password', password),
    };
    setErrors(newErrors);
    setTouched({ name: true, email: true, password: true });
    return !newErrors.name && !newErrors.email && !newErrors.password;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    registerMutation.mutate({ name, email, password });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 420, width: '100%', border: 'none' }}>
        <CardContent sx={{ p: 5 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #6366f1, #ec4899)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1,
              }}
            >
              Create Account
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create a student account to browse lessons
            </Typography>
          </Box>

          {registerMutation.isError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {registerMutation.error?.message || 'Registration failed. Please try again.'}
            </Alert>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <Stack spacing={2.5}>
              <TextField
                label="Full Name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (touched.name) setErrors((prev) => ({ ...prev, name: validateField('name', e.target.value) }));
                }}
                onBlur={() => handleBlur('name')}
                error={touched.name && !!errors.name}
                helperText={touched.name && errors.name}
                fullWidth
                autoComplete="name"
              />
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (touched.email) setErrors((prev) => ({ ...prev, email: validateField('email', e.target.value) }));
                }}
                onBlur={() => handleBlur('email')}
                error={touched.email && !!errors.email}
                helperText={touched.email && errors.email}
                fullWidth
                autoComplete="email"
              />
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (touched.password) setErrors((prev) => ({ ...prev, password: validateField('password', e.target.value) }));
                }}
                onBlur={() => handleBlur('password')}
                error={touched.password && !!errors.password}
                helperText={(touched.password && errors.password) || 'Minimum 6 characters'}
                fullWidth
                autoComplete="new-password"
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={registerMutation.isPending}
                startIcon={registerMutation.isPending ? <CircularProgress size={20} color="inherit" /> : undefined}
                sx={{
                  py: 1.5,
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                  },
                }}
              >
                {registerMutation.isPending ? 'Creating account...' : 'Create Account'}
              </Button>
            </Stack>
          </form>

          <Typography variant="body2" sx={{ textAlign: 'center', mt: 3, color: 'text.secondary' }}>
            Already have an account?{' '}
            <Link component={RouterLink} to="/login" sx={{ fontWeight: 600 }}>
              Sign in
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
