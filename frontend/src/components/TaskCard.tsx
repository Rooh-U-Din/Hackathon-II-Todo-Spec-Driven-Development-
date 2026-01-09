'use client';

import Link from 'next/link';
import type { Task } from '../lib/types';

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

  // Phase V: Due date formatting and overdue check
  const isOverdue = task.due_at && !task.is_completed && new Date(task.due_at) < new Date();
  const formattedDueDate = task.due_at
    ? new Date(task.due_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : null;

  // Phase V: Priority colors
  const priorityConfig = {
    low: { bg: 'bg-green-100', text: 'text-green-700', label: 'Low' },
    medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Med' },
    high: { bg: 'bg-red-100', text: 'text-red-700', label: 'High' },
  };

  // Phase V: Recurrence labels
  const recurrenceLabels = {
    none: null,
    daily: 'Daily',
    weekly: 'Weekly',
    custom: task.recurrence_interval ? `Every ${task.recurrence_interval}d` : 'Custom',
  };

  return (
    <Link
      href={`/tasks/${task.id}`}
      className={`block rounded-lg border bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:bg-gray-800 ${
        isOverdue
          ? 'border-red-300 dark:border-red-700'
          : 'border-gray-200 dark:border-gray-700'
      }`}
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
          <div className="flex items-center gap-2 flex-wrap">
            <h3
              className={`text-sm font-medium ${
                task.is_completed
                  ? 'text-gray-500 line-through dark:text-gray-400'
                  : 'text-gray-900 dark:text-white'
              }`}
            >
              {task.title}
            </h3>

            {/* Phase V: Priority badge */}
            {task.priority && task.priority !== 'medium' && (
              <span
                className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${priorityConfig[task.priority].bg} ${priorityConfig[task.priority].text}`}
              >
                {priorityConfig[task.priority].label}
              </span>
            )}

            {/* Phase V: Recurrence badge */}
            {task.recurrence_type && task.recurrence_type !== 'none' && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                <svg className="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {recurrenceLabels[task.recurrence_type]}
              </span>
            )}

            {/* Phase V: Tags */}
            {task.tags && task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {task.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium"
                    style={{
                      backgroundColor: tag.color ? `${tag.color}20` : '#e5e7eb',
                      color: tag.color || '#374151',
                    }}
                  >
                    {tag.name}
                  </span>
                ))}
                {task.tags.length > 3 && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                    +{task.tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>

          {task.description && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="mt-2 flex items-center gap-3 text-xs">
            {/* Phase V: Due date with overdue indicator */}
            {formattedDueDate && (
              <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {isOverdue ? 'Overdue: ' : 'Due: '}{formattedDueDate}
              </span>
            )}

            {/* Created date */}
            <span className="text-gray-400 dark:text-gray-500">
              Created {formattedDate}
            </span>
          </div>
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
