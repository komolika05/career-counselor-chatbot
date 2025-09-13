// src/components/ChatWindow.tsx
"use client";

import type React from "react";
import { trpc } from "@/utils/trpc";
import { useState, useRef, useEffect } from "react";
import TypewriterMessage from "./TypeWriterMessage";
import type { AppRouter } from "@/server/routers/_app"; // Import AppRouter type
import type { inferRouterOutputs } from "@trpc/server";

// Infer the type for a single conversation
type RouterOutput = inferRouterOutputs<AppRouter>;
type ConversationWithMessages = RouterOutput["conversation"]["get"];

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

  const startConversation = trpc.conversation.startAndSendMessage.useMutation({
    onSuccess: (data) => {
      utils.conversation.list.invalidate();
      setSelectedConversationId(data.conversationId);
      utils.conversation.get.invalidate({ id: data.conversationId });
    },
    onError: (error) => {
      console.error("Failed to start conversation:", error);
      // Optional: Add user feedback for the error
    },
  });

  const addMessage = trpc.conversation.addMessage.useMutation({
    onMutate: async (newMessage) => {
      await utils.conversation.get.cancel({ id: newMessage.conversationId });
      // Corrected: use .getData()
      const previousConversation = utils.conversation.get.getData({
        id: newMessage.conversationId,
      });

      // Corrected: use .setData()
      utils.conversation.get.setData(
        { id: newMessage.conversationId },
        // Add explicit type to the updater function's parameter
        (oldQueryData: ConversationWithMessages | null | undefined) => {
          if (!oldQueryData) return null;
          const optimisticMessage = {
            id: Math.random(),
            role: "user" as const,
            content: newMessage.content,
            conversationId: newMessage.conversationId,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          return {
            ...oldQueryData,
            messages: [...oldQueryData.messages, optimisticMessage],
          };
        }
      );
      return { previousConversation };
    },
    onError: (err, newMessage, context) => {
      if (context?.previousConversation) {
        // Corrected: use .setData()
        utils.conversation.get.setData(
          { id: newMessage.conversationId },
          context.previousConversation
        );
      }
    },
    onSettled: (data, error, variables) => {
      if (variables?.conversationId) {
        utils.conversation.get.invalidate({ id: variables.conversationId });
        utils.conversation.list.invalidate();
      }
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedContent = content.trim();
    if (!trimmedContent) return;

    if (selectedConversationId) {
      addMessage.mutate({
        conversationId: selectedConversationId,
        content: trimmedContent,
      });
    } else {
      startConversation.mutate({ content: trimmedContent });
    }
    setContent("");
  };

  const isSending = addMessage.isPending || startConversation.isPending;

  return (
    <div className="flex-1 flex flex-col bg-background">
      <div className="flex-grow p-6 overflow-y-auto">
        {/* ... (rest of the JSX is the same as before) ... */}
        {!selectedConversationId && (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <p>Select a conversation or start a new one.</p>
          </div>
        )}
        {isLoading && selectedConversationId && <p>Loading messages...</p>}
        {conversation?.messages.map((msg, index) => (
          <div
            key={msg.id}
            className={`mb-4 flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`rounded-lg px-4 py-2 max-w-lg ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {msg.role === "assistant" &&
              index === conversation.messages.length - 1 ? (
                <TypewriterMessage message={msg.content} />
              ) : (
                <p style={{ whiteSpace: "pre-wrap" }}>{msg.content}</p>
              )}
            </div>
          </div>
        ))}
        {isSending && selectedConversationId && (
          <div className="mb-4 flex justify-start">
            <div className="rounded-lg px-4 py-2 max-w-lg bg-muted text-muted-foreground">
              <p>Thinking...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-border">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={content}
            // Corrected Typo: e.g -> e.target.value
            onChange={(e) => setContent(e.target.value)}
            placeholder="Ask me about your career..."
            className="border rounded px-3 py-2 flex-1 bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={isSending}
          />
          <button
            type="submit"
            disabled={isSending || !content.trim()}
            className="bg-primary text-primary-foreground px-4 py-2 rounded disabled:bg-primary/50"
          >
            {isSending ? "Sending..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}
