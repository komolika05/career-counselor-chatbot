// src/components/ChatApp.tsx
"use client";

import React, { useState } from "react";
import { trpc } from "@/utils/trpc";

export default function ChatApp() {
  const [selectedConvId, setSelectedConvId] = useState<number | null>(null);
  const [text, setText] = useState("");

  const listQuery = trpc.conversation.list.useQuery();
  const createConv = trpc.conversation.create.useMutation({
    onSuccess() {
      listQuery.refetch();
    },
  });

  const getConv = trpc.conversation.get.useQuery(
    { id: selectedConvId ?? -1 },
    { enabled: selectedConvId !== null }
  );

  const addMessage = trpc.conversation.addMessage.useMutation({
    onSuccess() {
      // refresh
      if (selectedConvId) getConv.refetch();
      listQuery.refetch();
      setText("");
    },
  });

  return (
    <div style={{ display: "flex", gap: 20, marginTop: 20 }}>
      <div style={{ width: 280 }}>
        <div style={{ marginBottom: 10 }}>
          <button
            onClick={() => createConv.mutate({ title: "New Conversation" })}
            style={{ padding: "8px 12px" }}
          >
            + New conversation
          </button>
        </div>

        <div>
          {listQuery.data?.map((c) => (
            <div
              key={c.id}
              onClick={() => setSelectedConvId(c.id)}
              style={{
                cursor: "pointer",
                padding: 8,
                border:
                  selectedConvId === c.id
                    ? "2px solid black"
                    : "1px solid #ddd",
                marginBottom: 8,
              }}
            >
              <div style={{ fontWeight: 600 }}>
                {c.title ?? `Conversation ${c.id}`}
              </div>
              <div style={{ fontSize: 12, color: "#666" }}>
                {c.messages?.length ?? 0} messages
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1 }}>
        {!selectedConvId ? (
          <div>Select a conversation to start chatting</div>
        ) : (
          <div>
            <h3>{getConv.data?.title ?? `Conversation ${selectedConvId}`}</h3>

            <div
              style={{ minHeight: 300, border: "1px solid #eee", padding: 12 }}
            >
              {getConv.data?.messages?.map((m) => (
                <div key={m.id} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, color: "#888" }}>{m.role}</div>
                  <div>{m.content}</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 12 }}>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={4}
                style={{ width: "100%", padding: 8 }}
                placeholder="Ask about careers, say your background..."
              />
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button
                  onClick={() =>
                    addMessage.mutate({
                      conversationId: selectedConvId,
                      role: "user",
                      content: text,
                    })
                  }
                >
                  Send
                </button>
                <button
                  onClick={() => {
                    setText("");
                  }}
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
