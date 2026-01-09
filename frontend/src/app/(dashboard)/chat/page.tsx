'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChatInput } from '@/components/ChatInput';
import { ChatMessages } from '@/components/ChatMessages';
import { useChat } from '@/hooks/useChat';
import { getUserIdFromToken, isAuthenticated } from '@/lib/auth';

export default function ChatPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login');
      return;
    }

    const id = getUserIdFromToken();
    if (!id) {
      router.replace('/login');
      return;
    }

    setUserId(id);
    setIsReady(true);
  }, [router]);

  if (!isReady || !userId) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return <ChatPageContent userId={userId} />;
}

function ChatPageContent({ userId }: { userId: string }) {
  const { messages, isLoading, isSending, error, sendMessage, clearError } = useChat({
    userId,
  });

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          AI Task Assistant
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Chat with AI to manage your tasks
        </p>
      </div>

      <ChatMessages
        messages={messages}
        isLoading={isLoading || isSending}
        error={error}
      />

      <ChatInput
        onSend={(message) => {
          clearError();
          sendMessage(message);
        }}
        disabled={isLoading}
        isLoading={isSending}
      />
    </div>
  );
}
