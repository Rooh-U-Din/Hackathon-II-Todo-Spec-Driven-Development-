'use client';

import { useState } from 'react';
import type { Priority } from '../lib/types';

export interface TaskFilterState {
  completed?: boolean;
  priority?: Priority;
  search?: string;
  sortBy?: 'created_at' | 'due_at' | 'priority';
  sortOrder?: 'asc' | 'desc';
}

interface TaskFiltersProps {
  filters: TaskFilterState;
  onFilterChange: (filters: TaskFilterState) => void;
}

export default function TaskFilters({ filters, onFilterChange }: TaskFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({ ...filters, search: searchInput || undefined });
  };

  const handleClearFilters = () => {
    setSearchInput('');
    onFilterChange({});
  };

  const hasActiveFilters = filters.completed !== undefined ||
    filters.priority !== undefined ||
    filters.search !== undefined ||
    filters.sortBy !== undefined;

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search tasks..."
            className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex items-center gap-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
            hasActiveFilters
              ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
          }`}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters
          {hasActiveFilters && (
            <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary-500 text-xs text-white">
              !
            </span>
          )}
        </button>
      </form>

      {/* Expanded filters */}
      {isExpanded && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Status filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={filters.completed === undefined ? 'all' : filters.completed ? 'completed' : 'active'}
                onChange={(e) => {
                  const value = e.target.value;
                  onFilterChange({
                    ...filters,
                    completed: value === 'all' ? undefined : value === 'completed',
                  });
                }}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All tasks</option>
                <option value="active">Active only</option>
                <option value="completed">Completed only</option>
              </select>
            </div>

            {/* Priority filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Priority
              </label>
              <select
                value={filters.priority || 'all'}
                onChange={(e) => {
                  const value = e.target.value;
                  onFilterChange({
                    ...filters,
                    priority: value === 'all' ? undefined : value as Priority,
                  });
                }}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* Sort by */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sort by
              </label>
              <select
                value={filters.sortBy ? `${filters.sortBy}-${filters.sortOrder || 'desc'}` : 'created_at-desc'}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-') as [TaskFilterState['sortBy'], TaskFilterState['sortOrder']];
                  onFilterChange({
                    ...filters,
                    sortBy: sortBy === 'created_at' ? undefined : sortBy,
                    sortOrder: sortOrder === 'desc' ? undefined : sortOrder,
                  });
                }}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="created_at-desc">Newest first</option>
                <option value="created_at-asc">Oldest first</option>
                <option value="due_at-asc">Due date (soonest)</option>
                <option value="due_at-desc">Due date (latest)</option>
                <option value="priority-desc">Priority (high to low)</option>
                <option value="priority-asc">Priority (low to high)</option>
              </select>
            </div>
          </div>

          {/* Clear filters */}
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="mt-3 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
