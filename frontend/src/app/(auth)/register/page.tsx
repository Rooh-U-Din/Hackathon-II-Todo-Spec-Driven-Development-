'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthForm from '@/components/AuthForm';
import { api, ApiError } from '@/lib/api';
import { setToken } from '@/lib/auth';
import type { AuthResponse, UserCreate } from '@/lib/types';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const data: UserCreate = { email, password };
      const response = await api.post<AuthResponse>('/api/auth/register', data);
      setToken(response.token, response.expires_at);
      router.push('/tasks');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.detail);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-primary-600 hover:text-primary-500">
              Sign in
            </Link>
          </p>
        </div>

        <AuthForm mode="register" onSubmit={handleRegister} isLoading={isLoading} error={error} />
      </div>
    </div>
  );
}
