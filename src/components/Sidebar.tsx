// src/components/Sidebar.tsx
"use client";

import type { Conversation } from "@prisma/client";

interface SidebarProps {
  conversations: Conversation[];
  selectedConversationId: number | null;
  onSelectConversation: (id: number) => void;
  onCreateConversation: () => void;
  isCreating: boolean;
}

export default function Sidebar({
  conversations,
  selectedConversationId,
  onSelectConversation,
  onCreateConversation,
  isCreating,
}: SidebarProps) {
  return (
    <div className="w-1/4 bg-gray-800 p-4 border-r border-gray-300 flex flex-col">
      <h2 className="text-xl font-bold mb-4">History</h2>
      <button
        onClick={onCreateConversation}
        disabled={isCreating}
        className="w-full bg-blue-500 text-white px-3 py-2 rounded mb-4 hover:bg-blue-600 disabled:bg-blue-300"
      >
        {isCreating ? "Starting..." : "+ New Chat"}
      </button>
      <div className="flex-grow overflow-y-auto">
        {conversations.length > 0 ? (
          <ul>
            {conversations.map((c) => (
              <li key={c.id} className="mb-2">
                <button
                  onClick={() => onSelectConversation(c.id)}
                  className={`w-full text-left p-2 rounded ${
                    c.id === selectedConversationId
                      ? "bg-blue-800"
                      : "hover:bg-gray-700"
                  }`}
                >
                  {c.title ?? "Untitled"}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-sm">No conversations yet.</p>
        )}
      </div>
    </div>
  );
}
