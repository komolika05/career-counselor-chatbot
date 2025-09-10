"use client";

import { trpc } from "@/utils/trpc"; // adjust path if needed
import { useState } from "react";

export default function ChatApp() {
  const [title, setTitle] = useState("");

  // fetch all conversations
  const {
    data: conversations,
    isLoading,
    isError,
  } = trpc.conversation.list.useQuery();

  // mutation for creating new conversation
  const utils = trpc.useUtils(); // lets us refetch after mutation
  const createConversation = trpc.conversation.create.useMutation({
    onSuccess: () => {
      utils.conversation.list.invalidate(); // refresh list
      setTitle("");
    },
  });

  if (isLoading) return <div>Loading conversations...</div>;
  if (isError) return <div>Failed to load conversations.</div>;

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-2">Conversations</h2>

      {conversations && conversations.length > 0 ? (
        <ul className="list-disc pl-4">
          {conversations.map((c) => (
            <li key={c.id}>{c.title ?? "Untitled"}</li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No conversations yet.</p>
      )}

      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter conversation title"
          className="border rounded px-2 py-1 flex-1"
        />
        <button
          onClick={() => {
            if (title.trim().length > 0) {
              createConversation.mutate({ title });
            }
          }}
          disabled={createConversation.isPending}
          className="bg-blue-500 text-white px-3 py-1 rounded"
        >
          {createConversation.isPending ? "Creating..." : "Create"}
        </button>
      </div>
    </div>
  );
}
