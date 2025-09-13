"use client";

import { useTypewriter } from "@/hooks/useTypewriter";

interface TypewriterMessageProps {
  message: string;
}

export default function TypewriterMessage({ message }: TypewriterMessageProps) {
  const displayText = useTypewriter(message, 30); // Adjust speed as needed

  return <p style={{ whiteSpace: "pre-wrap" }}>{displayText}</p>;
}
