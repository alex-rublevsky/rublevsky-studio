import { createFileRoute } from "@tanstack/react-router";
import BlogPostsList from "~/components/ui/blog/BlogPostsList";
import { BlogPost as BlogPostType, TeaCategory } from "~/types/index";
import { useQuery } from "@tanstack/react-query";
import { DEPLOY_URL } from "~/utils/store";

export const Route = createFileRoute("/blog")({
  component: PostsIndexComponent,
});

function PostsIndexComponent() {
  // Fetch blog posts and tea categories in a single API call
  const {
    isPending: isLoading,
    error: hasError,
    data,
  } = useQuery<{
    posts: BlogPostType[];
    teaCategories: TeaCategory[];
    totalCount: number;
  }>({
    queryKey: ["blog"],
    queryFn: () => fetch(`${DEPLOY_URL}/api/blog`).then((res) => res.json()),
  });

  const posts = data?.posts || [];
  const teaCategories = data?.teaCategories || [];
  const totalCount = data?.totalCount || 0;

  return (
    //TODO: 2 column layout for desktop
    <section className="pt-24 sm:pt-32 div [view-transition-name:main-content]  min-h-screen">
      <div className="flex flex-col items-center ">
        <div className="inline-block">
          <h1 className="mb-8 text-center">What&apos;s in the gaiwan?</h1>
          <div className="flex justify-between mb-4">
            <h5 className="text-secondary-foreground">{totalCount} posts</h5>
            <h5 className="mb-12 sm:mb-20">
              <a className="blurLink" href="https://t.me/gaiwan_contents">
                🇷🇺 RU blog version
              </a>
            </h5>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center">Loading blog posts...</div>
      ) : hasError ? (
        <div className="text-center text-red-500">
          Error loading blog content. Please try again later.
        </div>
      ) : (
        <BlogPostsList posts={posts} teaCategories={teaCategories} />
      )}
    </section>
  );
}
