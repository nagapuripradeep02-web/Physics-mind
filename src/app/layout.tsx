import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { BookmarkProvider } from "@/contexts/BookmarkContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { ProfileProvider } from "@/contexts/ProfileContext";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PhysicsMind — AI Physics Tutor for JEE & CBSE",
  description: "Personalised AI physics tutor with interactive simulations, concept tags, and adaptive practice for JEE and CBSE students.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
        <ProfileProvider>
          <BookmarkProvider>
            <ChatProvider>
              {children}
            </ChatProvider>
          </BookmarkProvider>
        </ProfileProvider>
      </body>
    </html>
  );
}
