"use client";

import type React from "react";
import { trpc } from "@/utils/trpc";
import { useState, useRef, useEffect } from "react";

interface ChatWindowProps {
  selectedConversationId: number | null;
  setSelectedConversationId: (id: number) => void;
}

export default function ChatWindow({
  selectedConversationId,
  setSelectedConversationId,
}: ChatWindowProps) {
  const [content, setContent] = useState("");
  const utils = trpc.useUtils();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversation, isLoading } = trpc.conversation.get.useQuery(
    { id: selectedConversationId! },
    { enabled: !!selectedConversationId }
  );

  const addMessage = trpc.conversation.addMessage.useMutation({
    onSuccess: () => {
      utils.conversation.get.invalidate({ id: selectedConversationId! });
      utils.conversation.list.invalidate();
    },
  });

  const startConversation = trpc.conversation.startAndSendMessage.useMutation({
    onSuccess: (data) => {
      utils.conversation.list.invalidate();
      setSelectedConversationId(data.conversationId);
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedContent = content.trim();
    if (!trimmedContent) return;

    // This is the key logic check
    if (selectedConversationId) {
      addMessage.mutate({
        conversationId: selectedConversationId,
        content: trimmedContent,
      });
    } else {
      // If no conversation is selected, start a new one
      startConversation.mutate({ content: trimmedContent });
    }
    setContent("");
  };

  const isSending = addMessage.isPending || startConversation.isPending;

  // Render a simplified input form if no chat is selected yet.
  if (!selectedConversationId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <p>Select a conversation or start a new one.</p>
        </div>
        <div className="p-4 border-t border-gray-300 w-full">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Ask me about your career..."
              className="border rounded px-3 py-2 flex-1"
              disabled={isSending}
            />
            <button
              type="submit"
              disabled={isSending || !content.trim()}
              className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-blue-300"
            >
              {isSending ? "Starting..." : "Send"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Standard chat window for an active conversation
  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-grow p-6 overflow-y-auto">
        {isLoading && <p>Loading messages...</p>}
        {conversation?.messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-4 flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`rounded-lg px-4 py-2 max-w-lg ${
                msg.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              <p style={{ whiteSpace: "pre-wrap" }}>{msg.content}</p>
            </div>
          </div>
        ))}
        {addMessage.isPending && (
          <div className="mb-4 flex justify-start">
            <div className="rounded-lg px-4 py-2 max-w-lg bg-gray-200 text-gray-800">
              <p>Thinking...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-gray-300">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Ask me about your career..."
            className="border rounded px-3 py-2 flex-1"
            disabled={isSending}
          />
          <button
            type="submit"
            disabled={isSending || !content.trim()}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-blue-300"
          >
            {isSending ? "Sending..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}
