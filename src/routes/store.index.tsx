import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/store/")({
  component: UsersIndexComponent,
});

function UsersIndexComponent() {
  return <></>;
}
