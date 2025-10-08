import {
  createFileRoute,
  redirect,
  useLoaderData,
} from "@tanstack/react-router";
import { getUserData } from "~/utils/auth-server-func";
import { Outlet } from "@tanstack/react-router";
import { Toaster } from "~/components/ui/shared/sonner";
import { NavBar } from "~/components/ui/shared/NavBar";

export const Route = createFileRoute("/dashboard")({
  // Use beforeLoad for security: prevents child routes from loading if auth fails
  beforeLoad: async () => {
    try {
      const userData = await getUserData();

      // Check if user is authenticated and is admin
      if (!userData.isAuthenticated || !userData.isAdmin) {
        throw redirect({ to: "/login" });
      }

      // Ensure we have required user data
      if (!userData.userID || !userData.userEmail) {
        throw redirect({ to: "/login" });
      }

      // Return user data in context for the loader to use
      return { userData };
    } catch {
      throw redirect({ to: "/login" });
    }
  },
  // Loader just passes through the user data from beforeLoad context
  loader: async ({ context }) => {
    return {
      userID: context.userData.userID,
      userName: context.userData.userName,
      userEmail: context.userData.userEmail,
      userAvatar: context.userData.userAvatar,
    };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const loaderData = useLoaderData({ from: "/dashboard" }) as
    | {
        userID: string;
        userName: string;
        userEmail: string;
        userAvatar: string;
      }
    | undefined;

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto py-8 pb-24 max-w-7xl">
        <Outlet />
      </main>
      <NavBar userData={loaderData} />
      <Toaster />
    </div>
  );
}
