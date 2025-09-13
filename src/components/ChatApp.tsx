// src/components/ChatApp.tsx
"use client";
import { trpc } from "@/utils/trpc";
import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import ChatWindow from "./ChatWindow";

export default function ChatApp() {
  const [selectedConversationId, setSelectedConversationId] = useState<
    number | null
  >(null);

  const utils = trpc.useUtils();
  const {
    data: conversations,
    isLoading,
    isError,
  } = trpc.conversation.list.useQuery();

  // Set the first conversation as selected on initial load
  useEffect(() => {
    if (!selectedConversationId && conversations && conversations.length > 0) {
      setSelectedConversationId(conversations[0].id);
    }
  }, [conversations, selectedConversationId]);

  const deleteConversation = trpc.conversation.delete.useMutation({
    onSuccess: (deletedConv) => {
      utils.conversation.list.invalidate();
      // If the deleted chat was the one being viewed, clear the window
      if (selectedConversationId === deletedConv.id) {
        setSelectedConversationId(null);
      }
    },
    onError: (error) => {
      console.error("❌ [Client] Failed to delete conversation:", error);
    },
  });

  const handleDeleteConversation = (id: number) => {
    deleteConversation.mutate({ id });
  };

  // This function just clears the selection, ChatWindow will handle the creation
  const handleNewChat = () => {
    setSelectedConversationId(null);
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Failed to load conversations.</div>;

  return (
    <div className="flex h-[calc(100vh-150px)] border border-gray-300 rounded-lg shadow-lg">
      <Sidebar
        conversations={conversations ?? []}
        selectedConversationId={selectedConversationId}
        onSelectConversation={setSelectedConversationId}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
      />
      <ChatWindow
        selectedConversationId={selectedConversationId}
        setSelectedConversationId={setSelectedConversationId} // Pass setter to update on creation
      />
    </div>
  );
}
