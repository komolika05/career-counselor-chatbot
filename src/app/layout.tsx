import type React from "react";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import Providers from "./providers";
import { Suspense } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Career Counsellor",
  description: "Get personalized career advice from AI",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <Suspense fallback={null}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Providers>{children}</Providers>
          </ThemeProvider>
        </Suspense>
      </body>
    </html>
  );
}
