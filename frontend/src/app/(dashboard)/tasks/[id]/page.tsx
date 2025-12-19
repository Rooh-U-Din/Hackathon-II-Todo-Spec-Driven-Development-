'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useTasks } from '@/hooks/useTasks';
import TaskForm from '@/components/TaskForm';
import type { Task, TaskUpdate } from '@/lib/types';

export default function TaskDetailPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params.id as string;
  const { getTask, updateTask, toggleTask, deleteTask, error, clearError } = useTasks();

  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const loadTask = async () => {
      setIsLoading(true);
      const fetchedTask = await getTask(taskId);
      setTask(fetchedTask);
      setIsLoading(false);
    };
    loadTask();
  }, [taskId, getTask]);

  const handleUpdate = async (data: TaskUpdate) => {
    setIsUpdating(true);
    const updatedTask = await updateTask(taskId, data);
    setIsUpdating(false);
    if (updatedTask) {
      setTask(updatedTask);
      setIsEditing(false);
    }
  };

  const handleToggle = async () => {
    const toggled = await toggleTask(taskId);
    if (toggled) {
      setTask(toggled);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this task?')) {
      const success = await deleteTask(taskId);
      if (success) {
        router.push('/tasks');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="py-12 text-center text-gray-500">Loading task...</div>
    );
  }

  if (!task) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-xl font-medium text-gray-900 dark:text-white">Task not found</h2>
        <p className="mt-2 text-gray-500">The task you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.</p>
        <Link
          href="/tasks"
          className="mt-4 inline-block text-primary-600 hover:text-primary-500"
        >
          Back to tasks
        </Link>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/tasks"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to tasks
        </Link>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4">
          <div className="flex">
            <p className="text-sm text-red-700">{error}</p>
            <button onClick={clearError} className="ml-auto text-red-700 hover:text-red-900">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        {isEditing ? (
          <div>
            <h2 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">Edit Task</h2>
            <TaskForm
              initialData={task}
              onSubmit={handleUpdate}
              onCancel={() => setIsEditing(false)}
              isLoading={isUpdating}
            />
          </div>
        ) : (
          <div>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <button
                  onClick={handleToggle}
                  className={`mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded border-2 ${
                    task.is_completed
                      ? 'border-green-500 bg-green-500 text-white'
                      : 'border-gray-300 hover:border-primary-500 dark:border-gray-600'
                  }`}
                  aria-label={task.is_completed ? 'Mark as incomplete' : 'Mark as complete'}
                >
                  {task.is_completed && (
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
                <div>
                  <h2
                    className={`text-xl font-semibold ${
                      task.is_completed
                        ? 'text-gray-500 line-through dark:text-gray-400'
                        : 'text-gray-900 dark:text-white'
                    }`}
                  >
                    {task.title}
                  </h2>
                  <span
                    className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      task.is_completed
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}
                  >
                    {task.is_completed ? 'Completed' : 'In Progress'}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="rounded-md border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-700 shadow-sm hover:bg-red-50 dark:border-red-900 dark:bg-gray-700 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  Delete
                </button>
              </div>
            </div>

            {task.description && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</h3>
                <p className="mt-2 whitespace-pre-wrap text-gray-600 dark:text-gray-400">
                  {task.description}
                </p>
              </div>
            )}

            <div className="mt-6 border-t border-gray-200 pt-4 dark:border-gray-700">
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Created</dt>
                  <dd className="mt-1 text-gray-900 dark:text-white">{formatDate(task.created_at)}</dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Last Updated</dt>
                  <dd className="mt-1 text-gray-900 dark:text-white">{formatDate(task.updated_at)}</dd>
                </div>
              </dl>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
