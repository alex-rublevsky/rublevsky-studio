import { createFileRoute } from "@tanstack/react-router";
import BlogPostsList from "~/components/ui/blog/BlogPostsList";
import { BlogPost as BlogPostType, TeaCategory } from "~/types/index";
import { useQuery } from "@tanstack/react-query";
import { DEPLOY_URL } from "~/utils/store";
import { useEffect } from "react";

export const Route = createFileRoute("/blog")({
  component: PostsIndexComponent,
  loader: async () => {
    // Preload blog data
    const response = await fetch(`${DEPLOY_URL}/api/blog`);
    if (!response.ok) {
      throw new Error(`Failed to fetch blog data: ${response.status}`);
    }
    return response.json() as Promise<{
      posts: BlogPostType[];
      teaCategories: TeaCategory[];
      totalCount: number;
    }>;
  },
});

function PostsIndexComponent() {
  const loaderData = Route.useLoaderData();
  
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
    initialData: loaderData,
  });

  const posts = data?.posts || [];
  const teaCategories = data?.teaCategories || [];
  const totalCount = data?.totalCount || 0;

  // Handle anchor scrolling after data loads
  useEffect(() => {
    // Only scroll to anchor if we have posts loaded and there's a hash in the URL
    if (posts.length > 0 && window.location.hash) {
      const hash = window.location.hash.substring(1); // Remove the # character
      
      // Use a small delay to ensure the DOM is rendered
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [posts]);

  return (
    //TODO: 2 column layout for desktop
    <section className="pt-24 sm:pt-32 div min-h-screen">
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
