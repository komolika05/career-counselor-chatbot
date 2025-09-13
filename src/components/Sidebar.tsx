"use client";

import type { Conversation } from "@prisma/client";

interface SidebarProps {
  conversations: Conversation[];
  selectedConversationId: number | null;
  onSelectConversation: (id: number) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: number) => void;
}

export default function Sidebar({
  conversations,
  selectedConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
}: SidebarProps) {
  return (
    <div className="w-1/4 bg-gray-800 p-4 text-white border-r border-gray-600 flex flex-col">
      <h2 className="text-xl font-bold mb-4">History</h2>
      <button
        onClick={onNewChat}
        className="w-full bg-blue-500 text-white px-3 py-2 rounded mb-4 hover:bg-blue-600"
      >
        + New Chat
      </button>
      <div className="flex-grow overflow-y-auto pr-2">
        {conversations.length > 0 ? (
          <ul>
            {conversations.map((c) => (
              <li key={c.id} className="mb-2 group">
                <div
                  className={`w-full flex justify-between items-center text-left p-2 rounded cursor-pointer ${
                    c.id === selectedConversationId
                      ? "bg-blue-800"
                      : "hover:bg-gray-700"
                  }`}
                  onClick={() => onSelectConversation(c.id)}
                >
                  <span className="truncate pr-2">{c.title ?? "Untitled"}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent li's onClick from firing
                      onDeleteConversation(c.id);
                    }}
                    className="text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Delete conversation"
                  >
                    🗑️
                  </button>
                </div>
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
