"use client";

import type { Conversation } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, MessageSquare, Trash2, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";
import { useState } from "react";

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
  const [deleteId, setDeleteId] = useState<number | null>(null);

  return (
    <div className="w-80 bg-sidebar border-r border-sidebar-border flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2 mb-4">
          <History className="h-5 w-5 text-sidebar-foreground" />
          <h2 className="text-lg font-semibold text-sidebar-foreground">
            Chat History
          </h2>
        </div>
        <Button
          onClick={onNewChat}
          className="w-full bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1 p-2">
        {conversations.length > 0 ? (
          <div className="space-y-1">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={cn(
                  "group relative flex items-center gap-3 rounded-lg p-3 cursor-pointer transition-all duration-200 hover:bg-sidebar-accent",
                  conversation.id === selectedConversationId &&
                    "bg-sidebar-accent"
                )}
                onClick={() => onSelectConversation(conversation.id)}
              >
                <MessageSquare className="h-4 w-4 text-sidebar-foreground/60 flex-shrink-0" />
                <div className="flex-1 flex row  justify-between min-w-0">
                  <div>
                    <p className="text-sm font-medium text-sidebar-foreground truncate">
                      {conversation.title || "Untitled Chat"}
                    </p>
                    <p className="text-xs text-sidebar-foreground/60 mt-1">
                      {new Date(conversation.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteId(conversation.id);
                      }}
                      className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <MessageSquare className="h-8 w-8 text-sidebar-foreground/40 mb-2" />
            <p className="text-sm text-sidebar-foreground/60">
              No conversations yet
            </p>
            <p className="text-xs text-sidebar-foreground/40 mt-1">
              Start a new chat to begin
            </p>
          </div>
        )}

        <ConfirmDeleteDialog
          open={deleteId !== null}
          onOpenChange={(open) => {
            if (!open) setDeleteId(null);
          }}
          onConfirm={() => {
            if (deleteId) {
              onDeleteConversation(deleteId);
              setDeleteId(null);
            }
          }}
        />
      </ScrollArea>
    </div>
  );
}
