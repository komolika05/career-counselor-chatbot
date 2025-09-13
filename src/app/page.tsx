"use client";

import dynamic from "next/dynamic";
import { ThemeToggle } from "@/components/ThemeToggle";

const ChatApp = dynamic(() => import("@/components/ChatApp"), { ssr: false });

export default function Page() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="h-screen flex flex-col">
        <div className="p-4 md:p-6 border-b border-border shrink-0 flex justify-between items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-balance">
              AI Career Counsellor
            </h1>
            <p className="text-muted-foreground mt-2 text-pretty">
              Ask about career paths, project ideas, interview prep and next
              steps.
            </p>
          </div>
          <ThemeToggle />
        </div>
        <div className="flex-1 overflow-hidden">
          <ChatApp />
        </div>
      </div>
    </main>
  );
}
