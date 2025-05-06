import { Link, createFileRoute } from "@tanstack/react-router";
import { fetchPost } from "../utils/posts";
import { NotFound } from "~/components/NotFound";
import { PostErrorComponent } from "~/components/PostError";

export const Route = createFileRoute("/blog/$blogId")({
  loader: ({ params: { blogId } }) => fetchPost({ data: blogId }),
  errorComponent: PostErrorComponent,
  component: PostComponent,
  notFoundComponent: () => {
    return <NotFound>Post not found</NotFound>;
  },
});

function PostComponent() {
  const post = Route.useLoaderData();

  return (
    <div className="space-y-2">
      <h4 className="text-xl font-bold underline">{post.title}</h4>
      <div className="text-sm">{post.body}</div>
      <Link
        to="/blog/$blogId/deep"
        params={{
          blogId: post.id,
        }}
        activeProps={{ className: "text-black font-bold" }}
        className="block py-1 text-blue-800 hover:text-blue-600"
      >
        Deep View
      </Link>
    </div>
  );
}
