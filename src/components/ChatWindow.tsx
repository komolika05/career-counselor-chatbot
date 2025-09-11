// src/components/ChatWindow.tsx
"use client";

import { trpc } from "@/utils/trpc";
import { useState, useRef, useEffect } from "react";

interface ChatWindowProps {
  selectedConversationId: number | null;
}

export default function ChatWindow({
  selectedConversationId,
}: ChatWindowProps) {
  const [content, setContent] = useState("");
  const utils = trpc.useUtils();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Query to get the messages for the selected conversation
  const { data: conversation, isLoading } = trpc.conversation.get.useQuery(
    { id: selectedConversationId! },
    { enabled: !!selectedConversationId } // only run query if an ID is selected
  );

  // Mutation to send a message
  const sendMessage = trpc.conversation.sendMessageAndGetReply.useMutation({
    onSuccess: () => {
      // When the AI replies, invalidate the query to refetch the messages
      utils.conversation.get.invalidate({ id: selectedConversationId! });
      // Also invalidate the list to update the `updatedAt` timestamp for sorting
      utils.conversation.list.invalidate();
    },
  });

  // Effect to auto-scroll to the bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim() && selectedConversationId) {
      sendMessage.mutate({
        conversationId: selectedConversationId,
        content,
      });
      setContent("");
    }
  };

  if (!selectedConversationId) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        <p>Select a conversation or start a new one.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p>Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Messages Area */}
      <div className="flex-grow p-6 overflow-y-auto">
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
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-4 border-t border-gray-300">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Ask me about your career..."
            className="border rounded px-3 py-2 flex-1"
            disabled={sendMessage.isPending}
          />
          <button
            type="submit"
            disabled={sendMessage.isPending || !content.trim()}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-blue-300"
          >
            {sendMessage.isPending ? "Sending..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}
