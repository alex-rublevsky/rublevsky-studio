import { createFileRoute, redirect } from "@tanstack/react-router";
import { getUserID, getUserEmail } from "~/utils/auth-server-func";
import { Outlet } from "@tanstack/react-router";
import { Toaster } from "~/components/ui/shared/Sonner";
import { NavBar } from "~/components/ui/shared/NavBar";

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
    // if (!context.userID) {
    //   throw redirect({ to: "/login" });
    // }
    // // Check if user email matches authorized email
    // if (context.userEmail !== AUTHORIZED_EMAIL) {
    //   throw redirect({ to: "/login" });
    // }
    // return { userID: context.userID, userEmail: context.userEmail };
  },
});

function RouteComponent() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto py-8 pb-24 max-w-7xl">
        <Outlet />
      </main>
      <NavBar />
      <Toaster />
    </div>
  );
}
