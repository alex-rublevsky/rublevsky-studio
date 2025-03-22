import type { Metadata } from "next";
import "@/styles/globals.css";
import "@/styles/links.css";
import { NavBar } from "@/components/ui/navbar";
import localFont from "next/font/local";
import "@/styles/typography.css";
import { AnimationProvider } from "@/components/providers/animation-provider";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ActiveThemeProvider } from "@/components/active-theme";
import { cookies } from "next/headers";
import { cn } from "@/lib/utils";

const MetaThemeColors = [
  {
    light: "#ffffff",
    dark: "#09090b",
  },
];

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
  const cookieStore = await cookies();
  const activeThemeValue = cookieStore.get("active_theme")?.value;
  const isScaled = activeThemeValue?.endsWith("-scaled");

  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body
        className={cn(
          `${overusedGrotesk.variable} antialiased bg-background overscroll-none`,
          activeThemeValue ? `theme-${activeThemeValue}` : "",
          isScaled ? "theme-scaled" : ""
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          enableColorScheme
        >
          <AnimationProvider>
            <ActiveThemeProvider initialTheme={activeThemeValue}>
              <NavBar />
              {children}
            </ActiveThemeProvider>
          </AnimationProvider>
        </ThemeProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
