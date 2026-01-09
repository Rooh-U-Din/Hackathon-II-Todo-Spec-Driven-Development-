/**
 * TypeScript types matching the API schemas.
 */

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  expires_at: string;
}

// Phase V: Enumerations
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'custom';
export type Priority = 'low' | 'medium' | 'high';
export type ReminderStatus = 'pending' | 'sent' | 'cancelled' | 'failed';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
  // Phase V: Extended fields
  recurrence_type: RecurrenceType;
  recurrence_interval: number | null;
  next_occurrence_at: string | null;
  due_at: string | null;
  priority: Priority;
  parent_task_id: string | null;
  tags?: Tag[];
}

export interface TaskListResponse {
  tasks: Task[];
  total: number;
}

export type TaskResponse = Task;

export interface TaskCreate {
  title: string;
  description?: string | null;
  // Phase V: Extended fields (optional)
  recurrence_type?: RecurrenceType;
  recurrence_interval?: number;
  due_at?: string;
  priority?: Priority;
  tag_ids?: string[];
  remind_at?: string;
}

export interface TaskUpdate {
  title?: string;
  description?: string | null;
  is_completed?: boolean;
  // Phase V: Extended fields
  recurrence_type?: RecurrenceType;
  recurrence_interval?: number;
  due_at?: string;
  priority?: Priority;
}

export interface UserCreate {
  email: string;
  password: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface ErrorResponse {
  detail: string;
}

// Phase III: Chat Types
export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
}

export interface ChatRequest {
  message: string;
  conversation_id?: string;
}

export interface ChatResponse {
  message: string;
  conversation_id: string;
}

export interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface ConversationListResponse {
  conversations: Conversation[];
  total: number;
}

export interface MessageListResponse {
  messages: ChatMessage[];
  total: number;
}

// Phase V: Tag Types
export interface Tag {
  id: string;
  name: string;
  color: string | null;
  created_at: string;
}

export interface TagCreate {
  name: string;
  color?: string;
}

export interface TagUpdate {
  name?: string;
  color?: string;
}

export interface TagListResponse {
  tags: Tag[];
  total: number;
}

// Phase V: Reminder Types
export interface Reminder {
  id: string;
  task_id: string;
  remind_at: string;
  status: ReminderStatus;
  created_at: string;
  sent_at: string | null;
}

export interface ReminderCreate {
  remind_at: string;
}
