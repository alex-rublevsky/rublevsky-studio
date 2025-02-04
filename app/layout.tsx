import type { Metadata } from "next";
import "@/styles/globals.css";
import "@/styles/links.css";
import { NavBar } from "@/components/ui/navbar";
import localFont from "next/font/local";
import "@/styles/typography.css";
import { AnimationProvider } from "@/components/providers/animation-provider";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${overusedGrotesk.variable} antialiased`}>
        <AnimationProvider>
          <NavBar />
          {children}
        </AnimationProvider>
      </body>
    </html>
  );
}
