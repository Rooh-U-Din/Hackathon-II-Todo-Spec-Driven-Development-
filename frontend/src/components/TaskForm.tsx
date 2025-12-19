'use client';

import { useState } from 'react';
import type { Task, TaskCreate, TaskUpdate } from '@/lib/types';

interface TaskFormProps {
  initialData?: Task | null;
  onSubmit: (data: TaskCreate | TaskUpdate) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export default function TaskForm({ initialData, onSubmit, onCancel, isLoading }: TaskFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!initialData;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (title.length > 200) {
      setError('Title must be 200 characters or less');
      return;
    }

    if (description && description.length > 2000) {
      setError('Description must be 2000 characters or less');
      return;
    }

    const data: TaskCreate | TaskUpdate = {
      title: title.trim(),
      description: description.trim() || null,
    };

    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
          placeholder="What needs to be done?"
        />
        <p className="mt-1 text-xs text-gray-500">{title.length}/200</p>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={2000}
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
          placeholder="Add more details (optional)"
        />
        <p className="mt-1 text-xs text-gray-500">{description.length}/2000</p>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : isEditing ? 'Update Task' : 'Create Task'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
