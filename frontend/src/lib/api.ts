/**
 * Base API client with fetch wrapper and auth header handling.
 */

import type { ErrorResponse } from './types';

// Remove trailing slash to prevent double slashes in URLs
const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_BASE_URL = rawApiUrl.replace(/\/+$/, '');

export class ApiError extends Error {
  constructor(
    public status: number,
    public detail: string
  ) {
    super(detail);
    this.name = 'ApiError';
  }
}

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let detail = 'An error occurred';
    try {
      const errorData: ErrorResponse = await response.json();
      detail = errorData.detail;
    } catch {
      detail = response.statusText;
    }
    throw new ApiError(response.status, detail);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  get: <T>(endpoint: string) => apiRequest<T>(endpoint, { method: 'GET' }),

  post: <T>(endpoint: string, data?: unknown) =>
    apiRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T>(endpoint: string, data: unknown) =>
    apiRequest<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: <T>(endpoint: string) => apiRequest<T>(endpoint, { method: 'DELETE' }),
};

// Phase III: Chat API functions
import type {
  ChatResponse,
  ConversationListResponse,
  MessageListResponse,
} from './types';

export async function sendChatMessage(
  userId: string,
  message: string,
  conversationId?: string | null
): Promise<ChatResponse> {
  return api.post<ChatResponse>(`/api/${userId}/chat`, {
    message,
    conversation_id: conversationId,
  });
}

export async function getConversations(
  userId: string,
  limit = 10,
  offset = 0
): Promise<ConversationListResponse> {
  return api.get<ConversationListResponse>(
    `/api/${userId}/conversations?limit=${limit}&offset=${offset}`
  );
}

export async function getConversationMessages(
  userId: string,
  conversationId: string,
  limit = 50,
  offset = 0
): Promise<MessageListResponse> {
  return api.get<MessageListResponse>(
    `/api/${userId}/conversations/${conversationId}/messages?limit=${limit}&offset=${offset}`
  );
}
