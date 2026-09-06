import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SidebarShell } from "@/components/SidebarShell";
import { Toaster } from "@/components/ui/Toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Managing Africa Foundation",
  description: "Manage CMS posts and product listings across your team",
  icons: {
    icon: [{ url: "/logo/maf-black.png", type: "image/png" }],
    shortcut: [{ url: "/logo/maf-black.png", type: "image/png" }],
    apple: [{ url: "/logo/maf-black.png", type: "image/png" }],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  let notificationCount = 0;

  if (session && session.role === "ADMIN") {
    notificationCount = await prisma.notification.count({
      where: { userId: session.id, read: false },
    });
  }

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans">
        <Toaster />
        {session ? (
          <SidebarShell
            session={{
              id: session.id,
              email: session.email,
              name: session.name,
              role: session.role,
              image: session.image,
            }}
            notificationCount={notificationCount}
          >
            {children}
          </SidebarShell>
        ) : (
          children
        )}
      </body>
    </html>
  );
}
