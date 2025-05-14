import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/product/")({
  component: RouteComponent,
});

function RouteComponent() {
  //TODO: add redirect to /store?
  return <div>Hello "/product/"!</div>;
}
