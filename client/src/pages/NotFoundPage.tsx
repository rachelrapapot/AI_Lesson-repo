import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Paper } from '@mui/material';
import { SearchOff as NotFoundIcon } from '@mui/icons-material';
import { useAuthStore } from '../store/authStore';
import { UserRole } from '../types';

export function NotFoundPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const homeRoute = user?.role === UserRole.TEACHER ? '/dashboard' : '/student';

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
      }}
    >
      <Paper sx={{ p: 4, maxWidth: 480, textAlign: 'center' }}>
        <NotFoundIcon color="disabled" sx={{ fontSize: 64, mb: 2 }} />
        <Typography variant="h4" gutterBottom>
          404 — Page Not Found
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </Typography>
        <Button variant="contained" onClick={() => navigate(homeRoute)}>
          Go to Home
        </Button>
      </Paper>
    </Box>
  );
}
