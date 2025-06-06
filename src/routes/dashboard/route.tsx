import { createFileRoute, redirect } from "@tanstack/react-router";
import { getUserID, getUserEmail } from "~/utils/auth-server-func";
import { AppSidebar } from "~/components/ui/dashboard/DashboardSidebar";

import { SiteHeader } from "~/components/site-header";
import {
  SidebarInset,
  SidebarProvider,
} from "~/components/ui/dashboard/sidebar";

import { Outlet } from "@tanstack/react-router";
import { Toaster } from "~/components/ui/shared/Sonner";

// TODO: move to environment variable
const AUTHORIZED_EMAIL = "alexander.rublevskii@gmail.com";

export const Route = createFileRoute("/dashboard")({
  component: RouteComponent,
  beforeLoad: async () => {
    const userID = await getUserID();
    const userEmail = await getUserEmail();
    return { userID, userEmail };
  },
  loader: async ({ context }) => {
    if (!context.userID) {
      throw redirect({ to: "/login" });
    }
    // Check if user email matches authorized email
    if (context.userEmail !== AUTHORIZED_EMAIL) {
      throw redirect({ to: "/login" });
    }
    return { userID: context.userID, userEmail: context.userEmail };
  },
});

function RouteComponent() {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2 p-6 mb-8">
            <Outlet />
          </div>
        </div>
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  );
}
