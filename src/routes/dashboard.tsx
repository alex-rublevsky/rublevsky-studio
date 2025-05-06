import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { getUserID, getAvatar } from "~/utils/auth-server-func";
import { Button } from "~/components/ui/Button";
import { signOut } from "~/utils/auth-client";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppSidebar } from "~/components/app-sidebar";
import { ChartAreaInteractive } from "~/components/chart-area-interactive";
import { DataTable } from "~/components/data-table";
import { SectionCards } from "~/components/section-cards";
import { SiteHeader } from "~/components/site-header";
import {
  SidebarInset,
  SidebarProvider,
} from "~/components/ui/dashboard/sidebar";
import data from "~/data/data.json";

export const Route = createFileRoute("/dashboard")({
  component: RouteComponent,
  beforeLoad: async () => {
    const userID = await getUserID();
    return { userID };
  },
  loader: async ({ context }) => {
    if (!context.userID) {
      throw redirect({ to: "/" });
    }
    return { userID: context.userID };
  },
});

function RouteComponent() {
  const { userID } = Route.useLoaderData();
  const navigate = useNavigate();
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
    //   <Button
    //     onClick={() => signOut({}, { onSuccess: () => navigate({ to: "/" }) })}
    //   >
    //     Sign Out
    //   </Button>
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
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>
              <DataTable data={data} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
