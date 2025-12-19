'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, clearToken, getToken } from '../lib/auth';
import { api } from '../lib/api';

interface UseAuthReturn {
  isLoggedIn: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
    setIsLoading(false);
  }, []);

  const logout = useCallback(async () => {
    try {
      const token = getToken();
      if (token) {
        await api.post('/api/auth/logout');
      }
    } catch {
      // Ignore logout API errors, still clear token
    } finally {
      clearToken();
      setIsLoggedIn(false);
      router.push('/login');
    }
  }, [router]);

  return { isLoggedIn, isLoading, logout };
}
