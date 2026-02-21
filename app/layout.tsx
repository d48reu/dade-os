import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DADE/OS — Miami-Dade Command Center",
  description:
    "Retro cyberpunk civic intelligence workspace for Miami-Dade County",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-dade-bg overflow-hidden h-screen">
        {/* CRT scanline overlay — always on top */}
        <div className="crt-overlay" aria-hidden="true" />

        {/* Main app shell */}
        <div className="flex flex-col h-screen">{children}</div>
      </body>
    </html>
  );
}
