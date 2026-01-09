'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTasks, TaskFilters } from '@/hooks/useTasks';
import TaskList from '@/components/TaskList';
import TaskForm from '@/components/TaskForm';
import TaskFiltersComponent, { TaskFilterState } from '@/components/TaskFilters';
import type { TaskCreate } from '../../../lib/types';

export default function TasksPage() {
  const { tasks, isLoading, error, fetchTasks, createTask, toggleTask, deleteTask, clearError } =
    useTasks();
  const [showForm, setShowForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [filters, setFilters] = useState<TaskFilterState>({});

  // Convert UI filter state to API filter format
  const buildApiFilters = useCallback((uiFilters: TaskFilterState): TaskFilters => {
    const apiFilters: TaskFilters = {};

    if (uiFilters.completed !== undefined) apiFilters.completed = uiFilters.completed;
    if (uiFilters.priority) apiFilters.priority = uiFilters.priority;
    if (uiFilters.search) apiFilters.search = uiFilters.search;
    if (uiFilters.sortBy) apiFilters.sort_by = uiFilters.sortBy;
    if (uiFilters.sortOrder) apiFilters.sort_order = uiFilters.sortOrder;

    return apiFilters;
  }, []);

  useEffect(() => {
    fetchTasks(buildApiFilters(filters));
  }, [fetchTasks, filters, buildApiFilters]);

  const handleCreateTask = async (data: TaskCreate) => {
    setIsCreating(true);
    const task = await createTask(data);
    setIsCreating(false);
    if (task) {
      setShowForm(false);
      // Refresh tasks to ensure proper sorting/filtering
      fetchTasks(buildApiFilters(filters));
    }
  };

  const handleFilterChange = (newFilters: TaskFilterState) => {
    setFilters(newFilters);
  };

  const handleToggleTask = async (id: string) => {
    await toggleTask(id);
    // Optionally refresh if filtering by completed status
    if (filters.completed !== undefined) {
      fetchTasks(buildApiFilters(filters));
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

      {/* Phase V: Task Filters */}
      <div className="mb-4">
        <TaskFiltersComponent filters={filters} onFilterChange={handleFilterChange} />
      </div>

      {isLoading && tasks.length === 0 ? (
        <div className="py-12 text-center text-gray-500">Loading tasks...</div>
      ) : (
        <TaskList tasks={tasks} onToggle={handleToggleTask} onDelete={deleteTask} />
      )}
    </div>
  );
}
