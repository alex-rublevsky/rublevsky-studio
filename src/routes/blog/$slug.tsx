import { createFileRoute, notFound, Link, useRouter } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import BlogPost from "~/components/ui/blog/BlogPost";
import ImageGallery from "~/components/ui/shared/ImageGallery";
import { BlogPost as BlogPostType, BlogPostPreview, TeaCategory } from "~/types/index";
import { DEPLOY_URL } from "~/utils/store";
import { useMemo } from "react";

export const Route = createFileRoute("/blog/$slug")({
  component: BlogPostComponent,
});

function BlogPostComponent() {
  const params = Route.useParams();
  const slug = params.slug;
  const queryClient = useQueryClient();
  const router = useRouter();

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

  // Get cached blog preview data to use as fallback during loading
  const cachedBlogData = queryClient.getQueryData<{
    posts: BlogPostPreview[];
    teaCategories: TeaCategory[];
    totalCount: number;
  }>(["blog"]);

  // Find the preview post from cached data
  const previewPost = useMemo(() => {
    if (!cachedBlogData?.posts) return null;
    return cachedBlogData.posts.find(p => p.slug === slug) || null;
  }, [cachedBlogData, slug]);

  // Create a fallback post from preview data for immediate rendering
  const fallbackPost = useMemo((): BlogPostType | null => {
    if (!previewPost) return null;
    
    // Convert BlogPostPreview to BlogPost format
    return {
      id: previewPost.id,
      title: previewPost.title,
      slug: previewPost.slug,
      body: previewPost.excerpt || "", // Use excerpt as body fallback
      images: previewPost.images || null, // Use all images to prevent layout shifts
      productSlug: null, // Preview doesn't have this, will be updated when full data loads
      publishedAt: previewPost.publishedAt,
      teaCategories: previewPost.teaCategories
    };
  }, [previewPost]);

  // Use fallback post during loading to prevent loading state
  const displayPost = post || fallbackPost;

  // Only show loading if we don't have any data (neither full post nor fallback)
  if (isLoading && !displayPost) {
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

  if (!displayPost) {
    throw notFound();
  }

  return (
    <main className="min-h-screen flex flex-col lg:h-screen lg:overflow-hidden">
      <div className="grow flex items-start justify-center">
        <div className="w-full h-full flex flex-col lg:flex-row gap-0 lg:gap-10 items-start">
          {/* Image gallery with view transitions */}
          <div className="w-full lg:w-3/5 xl:w-2/3 flex flex-col lg:flex-row gap-2 lg:h-full self-start">
            <ImageGallery
              images={displayPost.images ? displayPost.images.split(",").map((img: string) => img.trim()) : []}
              alt={displayPost.title || `Blog post ${displayPost.id}`}
              className="lg:pl-4 lg:pt-4 lg:pb-4"
              productSlug={displayPost.slug || `post-${displayPost.id}`}
              viewTransitionName={`blog-image-${displayPost.slug || `post-${displayPost.id}`}`}
            />
          </div>

          {/* Blog post information */}
          <div 
            className="w-full lg:w-2/5 xl:w-1/3 px-4 lg:px-0 lg:h-[100dvh] lg:overflow-y-auto pt-4 pb-20 lg:pr-4 scrollbar-none"
          >
            <div className="space-y-6 w-full">
              {/* Back to blog button */}
              <div>
                <button
                  onClick={() => {
                    // Use browser's back navigation which preserves scroll position
                    window.history.back();
                  }}
                  className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2 no-underline bg-transparent border-none cursor-pointer"
                >
                  ← Back to blog
                </button>
              </div>

              <BlogPost
                title={displayPost.title}
                body={displayPost.body || ""}
                images={null} // Don't render images in the content area
                productSlug={displayPost.productSlug}
                slug={displayPost.slug || `post-${displayPost.id}`}
                publishedAt={displayPost.publishedAt}
                id={displayPost.id}
                onlyContent={true} // New prop to render only content
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}