'use client';

import { useRef, useEffect } from 'react';
import { ChatMessage } from './ChatMessage';
import type { ChatMessage as ChatMessageType } from '@/lib/types';

interface ChatMessagesProps {
  messages: ChatMessageType[];
  isLoading?: boolean;
  error?: string | null;
}

export function ChatMessages({ messages, isLoading = false, error = null }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0 && !isLoading && !error) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-center">
        <div className="max-w-md">
          <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
            Welcome to Todo AI Chat!
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            I can help you manage your tasks. Try saying:
          </p>
          <ul className="mt-4 space-y-2 text-left text-sm text-gray-500 dark:text-gray-400">
            <li>&quot;Add a task to buy groceries&quot;</li>
            <li>&quot;Show me my tasks&quot;</li>
            <li>&quot;Mark buy groceries as complete&quot;</li>
            <li>&quot;Delete the groceries task&quot;</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="space-y-4">
        {messages.map((message, index) => (
          <ChatMessage key={message.id || index} message={message} />
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg bg-gray-100 px-4 py-2 dark:bg-gray-700">
              <div className="flex space-x-2">
                <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 dark:bg-gray-500" style={{ animationDelay: '0ms' }} />
                <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 dark:bg-gray-500" style={{ animationDelay: '150ms' }} />
                <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 dark:bg-gray-500" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-center">
            <div className="rounded-lg bg-red-50 px-4 py-2 text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
