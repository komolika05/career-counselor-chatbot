"use client";

import dynamic from "next/dynamic";
const ChatApp = dynamic(() => import("@/components/ChatApp"), { ssr: false });

export default function Page() {
  return (
    <main style={{ padding: 20, fontFamily: "Inter, system-ui, sans-serif" }}>
      <h1>AI Career Counsellor</h1>
      <p>
        Ask about career paths, project ideas, interview prep and next steps.
      </p>
      <ChatApp />
    </main>
  );
}
