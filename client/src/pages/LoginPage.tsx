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
import { useLogin } from '../hooks/useAuth';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FormErrors {
  email?: string;
  password?: string;
}

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const loginMutation = useLogin();

  const validateField = (field: string, value: string): string | undefined => {
    switch (field) {
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!EMAIL_REGEX.test(value)) return 'Please enter a valid email address';
        return undefined;
      case 'password':
        if (!value) return 'Password is required';
        return undefined;
      default:
        return undefined;
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const value = field === 'email' ? email : password;
    setErrors((prev) => ({ ...prev, [field]: validateField(field, value) }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {
      email: validateField('email', email),
      password: validateField('password', password),
    };
    setErrors(newErrors);
    setTouched({ email: true, password: true });
    return !newErrors.email && !newErrors.password;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    loginMutation.mutate({ email, password });
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
              Welcome Back
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to manage your lessons
            </Typography>
          </Box>

          {loginMutation.isError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {loginMutation.error?.message || 'Login failed. Please check your credentials and try again.'}
            </Alert>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <Stack spacing={2.5}>
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
                helperText={touched.password && errors.password}
                fullWidth
                autoComplete="current-password"
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loginMutation.isPending}
                startIcon={loginMutation.isPending ? <CircularProgress size={20} color="inherit" /> : undefined}
                sx={{
                  py: 1.5,
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                  },
                }}
              >
                {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
              </Button>
            </Stack>
          </form>

          <Typography variant="body2" sx={{ textAlign: 'center', mt: 3, color: 'text.secondary' }}>
            Don&apos;t have an account?{' '}
            <Link component={RouterLink} to="/register" sx={{ fontWeight: 600 }}>
              Register
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
