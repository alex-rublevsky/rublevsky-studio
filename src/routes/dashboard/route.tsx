import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { getUserID, getAvatar } from "~/utils/auth-server-func";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppSidebar } from "~/components/ui/dashboard/DashboardSidebar";

import { SiteHeader } from "~/components/site-header";
import {
  SidebarInset,
  SidebarProvider,
} from "~/components/ui/dashboard/sidebar";

import { Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
  component: RouteComponent,
  beforeLoad: async () => {
    const userID = await getUserID();
    return { userID };
  },
  loader: async ({ context }) => {
    //TODO: Uncomment this when auth is implemented
    // if (!context.userID) {
    //   throw redirect({ to: "/login" });
    // }
    return { userID: context.userID };
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
    </SidebarProvider>
  );
}
