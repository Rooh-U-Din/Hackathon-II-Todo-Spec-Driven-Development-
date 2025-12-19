'use client';

import Link from 'next/link';
import type { Task } from '../../lib/types';

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function TaskCard({ task, onToggle, onDelete }: TaskCardProps) {
  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggle(task.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this task?')) {
      onDelete(task.id);
    }
  };

  const formattedDate = new Date(task.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Link
      href={`/tasks/${task.id}`}
      className="block rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
    >
      <div className="flex items-start gap-3">
        <button
          onClick={handleToggle}
          className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 ${
            task.is_completed
              ? 'border-green-500 bg-green-500 text-white'
              : 'border-gray-300 hover:border-primary-500 dark:border-gray-600'
          }`}
          aria-label={task.is_completed ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {task.is_completed && (
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <h3
            className={`text-sm font-medium ${
              task.is_completed
                ? 'text-gray-500 line-through dark:text-gray-400'
                : 'text-gray-900 dark:text-white'
            }`}
          >
            {task.title}
          </h3>
          {task.description && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
              {task.description}
            </p>
          )}
          <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">{formattedDate}</p>
        </div>

        <button
          onClick={handleDelete}
          className="flex-shrink-0 rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
          aria-label="Delete task"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </Link>
  );
}
