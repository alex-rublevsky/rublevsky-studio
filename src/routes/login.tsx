import { createFileRoute } from "@tanstack/react-router";
import { Button } from "~/components/ui/shared/Button";
import { useSession, signIn } from "~/utils/auth-client";

export const Route = createFileRoute("/login")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: session } = useSession();

  return (
    <>
      <Button
        onClick={() =>
          signIn.social({ provider: "github", callbackURL: "/dashboard" })
        }
      >
        Sign in with Github
      </Button>
      {session ? <p>Signed In</p> : <p>Not signed in</p>}
    </>
  );
}
