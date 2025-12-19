'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Something went wrong</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={reset}
          className="mt-4 rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
