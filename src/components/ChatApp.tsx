"use client";
import { trpc } from "@/utils/trpc";
import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import ChatWindow from "./ChatWindow";

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
      setIsInitialLoad(false); // Prevent this from running again
    }
  }, [conversations, isInitialLoad]);

  useEffect(() => {
    if (conversations && selectedConversationId) {
      const selectedExists = conversations.some(
        (c) => c.id === selectedConversationId
      );
      if (!selectedExists) {
        setSelectedConversationId(
          conversations.length > 0 ? conversations[0].id : null
        );
      }
    }
  }, [conversations, selectedConversationId]);

  const deleteConversation = trpc.conversation.delete.useMutation({
    onSuccess: () => {
      utils.conversation.list.invalidate();
    },
    onError: (error) => {
      console.error("❌ [Client] Failed to delete conversation:", error);
    },
  });

  const handleDeleteConversation = (id: number) => {
    deleteConversation.mutate({ id });
  };

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
        setSelectedConversationId={setSelectedConversationId}
      />
    </div>
  );
}
