"use client";
import { trpc } from "@/utils/trpc";
import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import ChatWindow from "./ChatWindow";
import { ThemeToggle } from "./ThemeToggle";
import { Loader2 } from "lucide-react";
import { Card } from "./ui/card";

export default function ChatApp() {
  const [selectedConversationId, setSelectedConversationId] = useState<
    number | null
  >(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const utils = trpc.useUtils();
  const {
    data: conversations,
    isLoading,
    isError,
  } = trpc.conversation.list.useQuery();

  useEffect(() => {
    if (isInitialLoad && conversations && conversations.length > 0) {
      setSelectedConversationId(conversations[0].id);
      setIsInitialLoad(false);
    }
  }, [conversations, isInitialLoad]);

  // ❌ This problematic useEffect has been removed.
  // It was causing the new chat to switch to the last conversation.

  const deleteConversation = trpc.conversation.delete.useMutation({
    onSuccess: () => {
      utils.conversation.list.invalidate();
    },
    onError: (error) => {
      console.error("❌ [Client] Failed to delete conversation:", error);
    },
  });

  // ✨ UPDATED: Logic to gracefully select another chat if the active one is deleted.
  const handleDeleteConversation = (id: number) => {
    const currentConversations = conversations ?? [];
    if (selectedConversationId === id) {
      const index = currentConversations.findIndex((c) => c.id === id);
      if (index !== -1) {
        // Prefer selecting the item before, fallback to the one after
        const nextSelection =
          currentConversations[index - 1] || currentConversations[index + 1];
        setSelectedConversationId(nextSelection ? nextSelection.id : null);
      }
    }
    deleteConversation.mutate({ id });
  };

  const handleNewChat = () => {
    setSelectedConversationId(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading conversations...</p>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center border-destructive">
          <p className="text-destructive font-medium mb-2">
            Failed to load conversations
          </p>
          <p className="text-muted-foreground text-sm">
            Please try refreshing the page
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              AI Chat Assistant
            </h1>
            <p className="text-sm text-muted-foreground">
              Your intelligent career conversation partner
            </p>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Chat Interface */}
      <div className="flex h-[calc(100vh-80px)]">
        <Sidebar
          conversations={conversations ?? []}
          selectedConversationId={selectedConversationId}
          onSelectConversation={setSelectedConversationId}
          onNewChat={handleNewChat}
          onDeleteConversation={handleDeleteConversation}
        />
        <ChatWindow
          selectedConversationId={selectedConversationId}
          setSelectedConversationId={setSelectedConversationId}
        />
      </div>
    </div>
  );
}
