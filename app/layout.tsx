import type { Metadata } from "next";
import "@/app/globals.css";
import { NavBar } from "@/components/ui/navbar";
import localFont from "next/font/local";
import { Toaster } from "@/components/ui/sonner";

import { cn } from "@/lib/utils";

const overusedGrotesk = localFont({
  src: [
    {
      path: "../public/fonts/OverusedGrotesk-VF.woff2",
      weight: "100 900",
      style: "normal",
    },
    {
      path: "../public/fonts/OverusedGrotesk-VF.woff",
      weight: "100 900",
      style: "normal",
    },
  ],
  variable: "--font-overused-grotesk",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "Rublevsky Studio",
  description: "Visual Web Developer",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body
        className={cn(
          `${overusedGrotesk.variable} antialiased bg-background overscroll-none`
        )}
      >
        <NavBar />
        {children}

        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
