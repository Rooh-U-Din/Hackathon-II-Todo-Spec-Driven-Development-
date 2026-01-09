'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import type { ChatMessage, ChatResponse, MessageListResponse, ConversationListResponse } from '@/lib/types';

interface UseChatOptions {
  userId: string;
}

interface UseChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  conversationId: string | null;
  sendMessage: (message: string) => Promise<void>;
  loadHistory: () => Promise<void>;
  clearError: () => void;
}

export function useChat({ userId }: UseChatOptions): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Start with loading state
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const initialLoadDone = useRef(false);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const loadHistory = useCallback(async () => {
    if (!conversationId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<MessageListResponse>(
        `/api/${userId}/conversations/${conversationId}/messages`
      );
      setMessages(response.messages);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load chat history';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [userId, conversationId]);

  // Load most recent conversation on mount
  useEffect(() => {
    if (initialLoadDone.current) return;
    initialLoadDone.current = true;

    const loadInitialConversation = async () => {
      setIsLoading(true);
      try {
        // Get the most recent conversation
        const conversationsResponse = await api.get<ConversationListResponse>(
          `/api/${userId}/conversations?limit=1`
        );

        const recentConversation = conversationsResponse.conversations[0];
        if (recentConversation) {
          setConversationId(recentConversation.id);

          // Load messages for this conversation
          const messagesResponse = await api.get<MessageListResponse>(
            `/api/${userId}/conversations/${recentConversation.id}/messages`
          );
          setMessages(messagesResponse.messages);
        }
      } catch (err) {
        // Silently fail - user can start a new conversation
        console.error('Failed to load conversation history:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialConversation();
  }, [userId]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      setIsSending(true);
      setError(null);

      // Add user message to UI immediately
      const userMessage: ChatMessage = {
        role: 'user',
        content,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);

      try {
        const response = await api.post<ChatResponse>(`/api/${userId}/chat`, {
          message: content,
          conversation_id: conversationId,
        });

        // Update conversation ID if this is a new conversation
        if (!conversationId) {
          setConversationId(response.conversation_id);
        }

        // Add AI response to messages
        const aiMessage: ChatMessage = {
          role: 'assistant',
          content: response.message,
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to send message';
        setError(message);
        // Remove the user message on error
        setMessages((prev) => prev.slice(0, -1));
      } finally {
        setIsSending(false);
      }
    },
    [userId, conversationId]
  );

  // Load history when conversation ID changes
  useEffect(() => {
    if (conversationId && messages.length === 0) {
      loadHistory();
    }
  }, [conversationId, loadHistory, messages.length]);

  return {
    messages,
    isLoading,
    isSending,
    error,
    conversationId,
    sendMessage,
    loadHistory,
    clearError,
  };
}
