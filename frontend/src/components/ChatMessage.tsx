'use client';

import type { ChatMessage as ChatMessageType } from '@/lib/types';

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-lg px-4 py-2 ${
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white'
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
        {message.created_at && (
          <p
            className={`mt-1 text-xs ${
              isUser ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {new Date(message.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        )}
      </div>
    </div>
  );
}
