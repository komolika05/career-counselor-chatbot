// src/app/layout.tsx
import Providers from "./providers";
import "./globals.css";

export const metadata = {
  title: "AI Career Counsellor",
  description: "Starter app: Next + tRPC + Prisma + Supabase",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
