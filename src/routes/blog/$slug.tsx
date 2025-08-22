import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import BlogPost from "~/components/ui/blog/BlogPost";
import { BlogPost as BlogPostType } from "~/types/index";
import { DEPLOY_URL } from "~/utils/store";

export const Route = createFileRoute("/blog/$slug")({
  component: BlogPostComponent,
});

function BlogPostComponent() {
  const params = Route.useParams();
  const slug = params.slug;

  const {
    isPending: isLoading,
    error: hasError,
    data: post,
  } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async (): Promise<BlogPostType> => {
      console.log(`Fetching blog post with slug: ${slug}`);
      const response = await fetch(`${DEPLOY_URL}/api/blog/${slug}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw notFound();
        }
        throw new Error("Failed to fetch blog post");
      }
      const data = await response.json();
      console.log("Fetched blog post:", data);
      return data as BlogPostType;
    },
  });

  if (isLoading) {
    return (
      <section className="pt-24 sm:pt-32 div min-h-screen">
        <div className="text-center">Loading blog post...</div>
      </section>
    );
  }

  if (hasError) {
    return (
      <section className="pt-24 sm:pt-32 div min-h-screen">
        <div className="text-center text-red-500">
          Error loading blog post. Please try again later.
        </div>
      </section>
    );
  }

  if (!post) {
    throw notFound();
  }

  return (
    <section className="pt-24 sm:pt-32 div min-h-screen">
      <div className="max-w-4xl mx-auto px-4">
        {/* Add a back to blog link */}
        <div className="mb-8">
          <Link 
            to="/blog"
            className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2 no-underline"
          >
            ← Back to blog
          </Link>
        </div>
        
        <BlogPost
          title={post.title}
          body={post.body || ""}
          images={post.images}
          productSlug={post.productSlug}
          slug={post.slug || `post-${post.id}`}
          publishedAt={post.publishedAt}
        />
      </div>
    </section>
  );
}