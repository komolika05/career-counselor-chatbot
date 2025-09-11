"use client";
import { trpc } from "@/utils/trpc";
import { useState } from "react";
import Sidebar from "./Sidebar";
import ChatWindow from "./ChatWindow";

export default function ChatApp() {
  const [selectedConversationId, setSelectedConversationId] = useState<
    number | null
  >(null);

  const {
    data: conversations,
    isLoading,
    isError,
  } = trpc.conversation.list.useQuery();

  const utils = trpc.useUtils();

  const createConversation = trpc.conversation.create.useMutation({
    onSuccess: (newConversation) => {
      console.log(
        "✅ [Client] Conversation created successfully:",
        newConversation
      );
      utils.conversation.list.invalidate();
      setSelectedConversationId(newConversation.id);
    },
    // ADD THIS BLOCK TO CATCH ERRORS
    onError: (error) => {
      console.error("❌ [Client] Failed to create conversation:", error);
      // The `error.data` object often contains the specific Zod validation errors
      if (error.data) {
        console.error("Zod validation errors:", error.data);
      }
    },
  });

  const handleCreateConversation = () => {
    const input = { title: "New Conversation" }; // Let's use a non-empty title
    console.log(
      "▶️ [Client] Attempting to create conversation with input:",
      input
    );
    createConversation.mutate(input);
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Failed to load conversations.</div>;

  return (
    <div className="flex h-[calc(100vh-150px)] border border-gray-300 rounded-lg shadow-lg">
      <Sidebar
        conversations={conversations ?? []}
        selectedConversationId={selectedConversationId}
        onSelectConversation={setSelectedConversationId}
        onCreateConversation={handleCreateConversation}
        isCreating={createConversation.isPending}
      />
      <ChatWindow selectedConversationId={selectedConversationId} />
    </div>
  );
}
