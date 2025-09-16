"use client";

import type React from "react";
import { trpc } from "@/utils/trpc";
import { useState, useRef, useEffect } from "react";
import TypewriterMessage from "./TypeWriterMessage";
import type { AppRouter } from "@/server/routers/_app";
import type { inferRouterOutputs } from "@trpc/server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type RouterOutput = inferRouterOutputs<AppRouter>;
type ConversationWithMessages = RouterOutput["conversation"]["get"];

interface ChatWindowProps {
  selectedConversationId: number | null;
  setSelectedConversationId: (id: number) => void;
}

// ✨ NEW: Typing Indicator component
const TypingIndicator = () => (
  <div className="flex items-center gap-1.5">
    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/70 [animation-delay:-0.3s]"></span>
    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/70 [animation-delay:-0.15s]"></span>
    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/70"></span>
  </div>
);

export default function ChatWindow({
  selectedConversationId,
  setSelectedConversationId,
}: ChatWindowProps) {
  const [content, setContent] = useState("");
  // ✨ NEW: State to hold the user's first message optimistically
  const [optimisticMessage, setOptimisticMessage] = useState<string | null>(
    null
  );
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
      // Clear the optimistic message on error
      setOptimisticMessage(null);
    },
    // ✨ NEW: Clear the optimistic message once the mutation is settled
    onSettled: () => {
      setOptimisticMessage(null);
    },
  });

  const addMessage = trpc.conversation.addMessage.useMutation({
    onMutate: async (newMessage) => {
      await utils.conversation.get.cancel({ id: newMessage.conversationId });
      const previousConversation = utils.conversation.get.getData({
        id: newMessage.conversationId,
      });

      utils.conversation.get.setData(
        { id: newMessage.conversationId },
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
  }, [conversation?.messages, optimisticMessage]); // Also trigger on optimistic message

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
      // ✨ NEW: Set the optimistic message before sending
      setOptimisticMessage(trimmedContent);
      startConversation.mutate({ content: trimmedContent });
    }
    setContent("");
  };

  const isSending = addMessage.isPending || startConversation.isPending;

  return (
    <div className="flex-1 flex flex-col bg-background h-full overflow-hidden">
      {/* Chat Messages Area */}
      <ScrollArea className="flex-1 mt-6 h-0 p-6">
        {!selectedConversationId && !optimisticMessage && (
          <div className="flex h-full items-center justify-center">
            <Card className="p-8 text-center max-w-md">
              <Bot className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Welcome to AI Chat</h3>
              <p className="text-muted-foreground mb-4">
                Start a new conversation to begin chatting.
              </p>
            </Card>
          </div>
        )}

        {isLoading && selectedConversationId && (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {conversation?.messages.map((msg, index) => (
          <div
            key={msg.id}
            className={cn(
              "mb-4 flex gap-3",
              msg.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-primary-foreground" />
              </div>
            )}
            <div
              className={cn(
                "rounded-2xl px-4 py-3 max-w-[70%] shadow-sm",
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-secondary-foreground"
              )}
            >
              {msg.role === "assistant" &&
              index === conversation.messages.length - 1 &&
              !addMessage.isPending ? ( // Only typewrite when not waiting for user message to process
                <TypewriterMessage message={msg.content} />
              ) : (
                <p
                  className="leading-relaxed"
                  style={{ whiteSpace: "pre-wrap" }}
                >
                  {msg.content}
                </p>
              )}
            </div>
            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
          </div>
        ))}

        {/* ✨ NEW: Render the optimistic user message for a new chat */}
        {optimisticMessage && (
          <div className="mb-4 flex gap-3 justify-end">
            <div className="rounded-2xl px-4 py-3 max-w-[70%] shadow-sm bg-primary text-primary-foreground">
              <p className="leading-relaxed" style={{ whiteSpace: "pre-wrap" }}>
                {optimisticMessage}
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
              <User className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        )}

        {/* ✨ UPDATED: Show typing indicator while waiting for a response */}
        {isSending && (
          <div className="mb-4 flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <Bot className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="rounded-2xl px-4 py-3 bg-muted text-muted-foreground shadow-sm">
              <TypingIndicator />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="p-4">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <Input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Ask me about your career..."
              className="flex-1 bg-background border-input focus:ring-2 focus:ring-primary/20"
              disabled={isSending}
            />
            <Button
              type="submit"
              disabled={isSending || !content.trim()}
              size="icon"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
