'use client';

import { useState, useEffect } from 'react';
import type { Task, TaskCreate, RecurrenceType, Priority, Tag, TagListResponse } from '../lib/types';
import { api } from '../lib/api';

interface TaskFormProps {
  initialData?: Task | null;
  onSubmit: (data: TaskCreate) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  onReminderSet?: (taskId: string, remindAt: string) => Promise<void>;
  onTagsAssign?: (taskId: string, tagIds: string[]) => Promise<void>;
}

export default function TaskForm({ initialData, onSubmit, onCancel, isLoading }: TaskFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [priority, setPriority] = useState<Priority>(initialData?.priority || 'medium');
  const [dueAt, setDueAt] = useState(initialData?.due_at ? initialData.due_at.slice(0, 16) : '');
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>(initialData?.recurrence_type || 'none');
  const [recurrenceInterval, setRecurrenceInterval] = useState(initialData?.recurrence_interval?.toString() || '');
  const [error, setError] = useState<string | null>(null);

  // Phase V: Reminder state
  const [enableReminder, setEnableReminder] = useState(false);
  const [reminderAt, setReminderAt] = useState('');

  // Phase V: Tags state
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [tagsLoading, setTagsLoading] = useState(false);

  const isEditing = !!initialData;

  // Fetch available tags on mount
  useEffect(() => {
    const fetchTags = async () => {
      setTagsLoading(true);
      try {
        const response = await api.get<TagListResponse>('/api/tags?limit=50');
        setAvailableTags(response.tags);
      } catch {
        // Silently fail - tags are optional
      } finally {
        setTagsLoading(false);
      }
    };
    fetchTags();
  }, []);

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

    if (recurrenceType === 'custom' && !recurrenceInterval) {
      setError('Custom recurrence requires an interval');
      return;
    }

    if (enableReminder && !reminderAt) {
      setError('Please set a reminder time or disable reminders');
      return;
    }

    if (enableReminder && reminderAt && new Date(reminderAt) <= new Date()) {
      setError('Reminder time must be in the future');
      return;
    }

    const data: TaskCreate = {
      title: title.trim(),
      description: description.trim() || null,
      priority,
      recurrence_type: recurrenceType,
      tag_ids: selectedTagIds.length > 0 ? selectedTagIds : undefined,
      remind_at: enableReminder && reminderAt ? new Date(reminderAt).toISOString() : undefined,
    };

    if (dueAt) {
      data.due_at = new Date(dueAt).toISOString();
    }

    if (recurrenceType === 'custom' && recurrenceInterval) {
      data.recurrence_interval = parseInt(recurrenceInterval, 10);
    }

    await onSubmit(data);
  };

  // Toggle tag selection
  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const priorityColors = {
    low: 'bg-green-100 text-green-800 border-green-300',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    high: 'bg-red-100 text-red-800 border-red-300',
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

      {/* Phase V: Priority */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Priority
        </label>
        <div className="flex gap-2">
          {(['low', 'medium', 'high'] as Priority[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPriority(p)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md border transition-colors ${
                priority === p
                  ? priorityColors[p]
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Phase V: Due Date */}
      <div>
        <label htmlFor="dueAt" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Due Date
        </label>
        <input
          id="dueAt"
          type="datetime-local"
          value={dueAt}
          onChange={(e) => setDueAt(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
        />
      </div>

      {/* Phase V: Recurrence */}
      <div>
        <label htmlFor="recurrence" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Repeat
        </label>
        <select
          id="recurrence"
          value={recurrenceType}
          onChange={(e) => setRecurrenceType(e.target.value as RecurrenceType)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
        >
          <option value="none">Does not repeat</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="custom">Custom interval</option>
        </select>
      </div>

      {/* Custom interval input */}
      {recurrenceType === 'custom' && (
        <div>
          <label htmlFor="interval" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Repeat every (days)
          </label>
          <input
            id="interval"
            type="number"
            min="1"
            max="365"
            value={recurrenceInterval}
            onChange={(e) => setRecurrenceInterval(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
            placeholder="Number of days"
          />
        </div>
      )}

      {/* Phase V: Reminder */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Reminder
          </label>
          <button
            type="button"
            onClick={() => setEnableReminder(!enableReminder)}
            className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
              enableReminder ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'
            }`}
            aria-pressed={enableReminder}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                enableReminder ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
        {enableReminder && (
          <input
            id="reminderAt"
            type="datetime-local"
            value={reminderAt}
            onChange={(e) => setReminderAt(e.target.value)}
            min={new Date().toISOString().slice(0, 16)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
          />
        )}
      </div>

      {/* Phase V: Tags Multi-Select */}
      {availableTags.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tags
          </label>
          <div className="flex flex-wrap gap-2">
            {tagsLoading ? (
              <span className="text-sm text-gray-500">Loading tags...</span>
            ) : (
              availableTags.map((tag) => {
                const isSelected = selectedTagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                      isSelected
                        ? 'ring-2 ring-primary-500 ring-offset-1'
                        : 'hover:ring-1 hover:ring-gray-300'
                    }`}
                    style={{
                      backgroundColor: tag.color ? `${tag.color}20` : '#e5e7eb',
                      color: tag.color || '#374151',
                      borderColor: tag.color || '#d1d5db',
                    }}
                  >
                    {isSelected && (
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    {tag.name}
                  </button>
                );
              })
            )}
          </div>
          {selectedTagIds.length > 0 && (
            <p className="mt-1 text-xs text-gray-500">
              {selectedTagIds.length} tag{selectedTagIds.length !== 1 ? 's' : ''} selected
            </p>
          )}
        </div>
      )}

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
