'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoggedIn, isLoading, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.replace('/login');
    }
  }, [isLoggedIn, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Todo App</h1>
            <nav className="flex gap-4">
              <Link
                href="/tasks"
                className={`text-sm font-medium transition-colors ${
                  pathname === '/tasks'
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                }`}
              >
                Tasks
              </Link>
              <Link
                href="/chat"
                className={`text-sm font-medium transition-colors ${
                  pathname === '/chat'
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                }`}
              >
                AI Chat
              </Link>
            </nav>
          </div>
          <button
            onClick={logout}
            className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
          >
            Sign Out
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
