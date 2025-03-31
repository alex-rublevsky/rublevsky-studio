"use client";

import { AppSidebar } from "@/components/ui/admin/app-sidebar";
import { SiteHeader } from "@/components/ui/admin/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { data } from "@/components/ui/admin/app-sidebar";
import { type Icon } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { getCookie } from "../../lib/utils/cookies";
import { useEffect, useState } from "react";

interface NavItem {
  title: string;
  url: string;
  icon: Icon;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [activeThemeValue, setActiveThemeValue] = useState<
    string | undefined
  >();

  useEffect(() => {
    // Get the theme from cookie on client side
    const theme = getCookie("active_theme");
    setActiveThemeValue(theme);
  }, []);

  const currentPage = data.navMain.find(
    (item: NavItem) => item.url === pathname
  );

  return (
    <div>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
        enableColorScheme
      >
        <SidebarProvider
          suppressHydrationWarning
          style={
            {
              "--sidebar-width": "calc(var(--spacing) * 72)",
              "--header-height": "calc(var(--spacing) * 12)",
            } as React.CSSProperties
          }
        >
          <AppSidebar variant="inset" />
          <SidebarInset>
            <SiteHeader title={currentPage?.title} />
            <div className="flex flex-1 flex-col">
              <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                  {children}
                </div>
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </ThemeProvider>
    </div>
  );
}
