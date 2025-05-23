import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { getUserID, getAvatar } from "~/utils/auth-server-func";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppSidebar } from "~/components/app-sidebar";

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
  // const { userID } = Route.useLoaderData();

  const [avatar, setAvatar] = useState<string | null>(null);

  useEffect(() => {
    getAvatar().then((avatar) => setAvatar(avatar ?? null));
  }, []);

  const { data: userName } = useQuery({
    queryKey: ["name"],
    queryFn: () => fetch("/api/name").then((res) => res.json()),
  });

  return (
    // <>
    //   <div>Hello "/dashboard" userID: {userID}!</div>
    //
    //   {avatar && (
    //     <img
    //       src={avatar}
    //       alt="User Avatar"
    //       style={{ width: "100px", height: "100px", borderRadius: "50%" }}
    //     />
    //   )}
    //   {userName && <h5>{userName.name}</h5>}
    // </>
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <Outlet />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
