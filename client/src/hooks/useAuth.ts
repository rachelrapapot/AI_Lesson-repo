import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../types';

function getHomeRoute(role: UserRole): string {
  return role === UserRole.TEACHER ? '/dashboard' : '/student';
}

export const useLogin = () => {
  const setUser = useAuthStore((s) => s.setUser);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      setUser(data.user);
      navigate(getHomeRoute(data.user.role));
    },
  });
};

export const useRegister = () => {
  const setUser = useAuthStore((s) => s.setUser);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      setUser(data.user);
      navigate(getHomeRoute(data.user.role));
    },
  });
};

export const useLogout = () => {
  const clearUser = useAuthStore((s) => s.clearUser);
  const navigate = useNavigate();

  return async () => {
    try {
      await authService.logout();
    } finally {
      clearUser();
      navigate('/login');
    }
  };
};
