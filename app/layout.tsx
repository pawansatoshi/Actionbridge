import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ActionBridge — Turn intent into action",
  description: "Goal-driven phone-work orchestration powered by CALL-E.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
