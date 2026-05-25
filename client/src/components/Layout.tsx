import { ReactNode } from 'react';
import { AppBar, Toolbar, Typography, Container, Button, Box, Avatar } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import {
  Logout as LogoutIcon,
  AutoStories as LogoIcon,
} from '@mui/icons-material';
import { useAuthStore } from '../store/authStore';
import { useLogout } from '../hooks/useAuth';
import { UserRole } from '../types';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const isTeacher = user?.role === UserRole.TEACHER;
  const homeRoute = isTeacher ? '/dashboard' : '/student';

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <AppBar
        position="sticky"
        sx={{
          bgcolor: 'white',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
        elevation={0}
      >
        <Toolbar sx={{ gap: 1 }}>
          <LogoIcon sx={{ color: 'primary.main', marginInlineEnd: 0.5 }} />
          <Typography
            variant="h6"
            component={RouterLink}
            to={homeRoute}
            sx={{
              flexGrow: 1,
              color: 'text.primary',
              textDecoration: 'none',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #6366f1, #ec4899)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Lesson Builder
          </Typography>
          {isTeacher ? (
            <>
              <Button
                component={RouterLink}
                to="/dashboard"
                sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main', bgcolor: 'primary.50' } }}
              >
                My Lessons
              </Button>
              <Button
                component={RouterLink}
                to="/lessons/new"
                variant="contained"
                size="small"
              >
                New Lesson
              </Button>
            </>
          ) : (
            <Button
              component={RouterLink}
              to="/student"
              sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
            >
              Browse Lessons
            </Button>
          )}
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginInlineStart: 1 }}>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: 'primary.main',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
              >
                {user.name.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary' }}>
                {user.name}
              </Typography>
            </Box>
          )}
          <Button
            onClick={logout}
            startIcon={<LogoutIcon />}
            size="small"
            sx={{ color: 'text.secondary', marginInlineStart: 1 }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ flexGrow: 1, py: 4 }}>
        {children}
      </Container>
    </Box>
  );
};
