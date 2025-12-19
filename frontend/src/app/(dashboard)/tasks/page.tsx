'use client';

import { useEffect, useState } from 'react';
import { useTasks } from '@/hooks/useTasks';
import TaskList from '@/components/TaskList';
import TaskForm from '@/components/TaskForm';
import type { TaskCreate } from '@/lib/types';

export default function TasksPage() {
  const { tasks, isLoading, error, fetchTasks, createTask, toggleTask, deleteTask, clearError } =
    useTasks();
  const [showForm, setShowForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleCreateTask = async (data: TaskCreate) => {
    setIsCreating(true);
    const task = await createTask(data);
    setIsCreating(false);
    if (task) {
      setShowForm(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Tasks</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
          >
            New Task
          </button>
        )}
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

      {showForm && (
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">Create New Task</h3>
          <TaskForm
            onSubmit={handleCreateTask}
            onCancel={() => setShowForm(false)}
            isLoading={isCreating}
          />
        </div>
      )}

      {isLoading && tasks.length === 0 ? (
        <div className="py-12 text-center text-gray-500">Loading tasks...</div>
      ) : (
        <TaskList tasks={tasks} onToggle={toggleTask} onDelete={deleteTask} />
      )}
    </div>
  );
}
