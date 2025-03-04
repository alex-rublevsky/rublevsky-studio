import Link from "next/link";
import BlogPost from "@/components/ui/blog/blogPost";
import getAllBlogPosts from "@/lib/actions/blog/getAllBlogPosts";
import { BlogPost as BlogPostType } from "@/types";
// Force this page to be dynamically rendered
export const dynamic = "force-dynamic";

export default async function Page() {
  try {
    const blogPosts = await getAllBlogPosts();

    const posts: BlogPostType[] = Array.isArray(blogPosts) ? blogPosts : [];

    return (
      <section className="pt-24 sm:pt-32">
        <div>
          <h1 className="text-center mb-8">What&apos;s in the gaiwan?</h1>
          <h5 className="text-center mb-16 sm:mb-24">
            <a className="blurLink" href="https://t.me/gaiwan_contents">
              🇷🇺 RU blog version
            </a>
          </h5>
        </div>

        <div className="space-y-32">
          {posts.length === 0 ? (
            <p className="text-center text-lg">
              No blog posts found. Check back soon!
            </p>
          ) : (
            posts.map((post) => (
              <BlogPost
                key={post.id}
                title={post.title || "Untitled Post"}
                body={post.body || ""}
                images={post.images}
                productSlug={post.productSlug}
                slug={post.slug || `post-${post.id}`}
              />
            ))
          )}
        </div>
      </section>
    );
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return (
      <div className="text-center">
        <p>Error loading blog posts. Please try again later.</p>
      </div>
    );
  }
}
