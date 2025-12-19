'use client';

import { useState } from 'react';

interface AuthFormProps {
  mode: 'login' | 'register';
  onSubmit: (email: string, password: string) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

export default function AuthForm({ mode, onSubmit, isLoading, error }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): { valid: boolean; message: string } => {
    if (password.length < 8) {
      return { valid: false, message: 'Password must be at least 8 characters' };
    }
    if (mode === 'register') {
      const hasUppercase = /[A-Z]/.test(password);
      const hasLowercase = /[a-z]/.test(password);
      const hasDigit = /\d/.test(password);
      if (!hasUppercase || !hasLowercase || !hasDigit) {
        return {
          valid: false,
          message: 'Password must contain uppercase, lowercase, and a number',
        };
      }
    }
    return { valid: true, message: '' };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!validateEmail(email)) {
      setValidationError('Please enter a valid email address');
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      setValidationError(passwordValidation.message);
      return;
    }

    await onSubmit(email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {(error || validationError) && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-700">{error || validationError}</p>
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
          placeholder={mode === 'register' ? 'Min 8 chars, uppercase, lowercase, number' : 'Enter your password'}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="flex w-full justify-center rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? 'Loading...' : mode === 'login' ? 'Sign In' : 'Create Account'}
      </button>
    </form>
  );
}
