import { Link, Outlet, createFileRoute } from "@tanstack/react-router";
import { DEPLOY_URL } from "../utils/store";
import type { User } from "../utils/store";

export const Route = createFileRoute("/store")({
  loader: async () => {
    try {
      const res = await fetch(DEPLOY_URL + "/api/store");
      if (!res.ok) {
        throw new Error("Unexpected status code");
      }

      const data = (await res.json()) as Array<User>;

      return data;
    } catch {
      throw new Error("Failed to fetch store");
    }
  },
  component: UsersLayoutComponent,
});

function UsersLayoutComponent() {
  const store = Route.useLoaderData();

  return (
    <div className="p-2 flex gap-2">
      <ul className="list-disc pl-4">
        {[
          ...store,
          { id: "i-do-not-exist", name: "Non-existent User", email: "" },
        ].map((user) => {
          return (
            <li key={user.id} className="whitespace-nowrap">
              <Link
                to="/store/$itemId"
                params={{
                  itemId: String(user.id),
                }}
                className="block py-1 text-blue-800 hover:text-blue-600"
                activeProps={{ className: "text-black font-bold" }}
              >
                <div>{user.name}</div>
              </Link>
            </li>
          );
        })}
      </ul>
      <hr />
      <Outlet />
    </div>
  );
}
