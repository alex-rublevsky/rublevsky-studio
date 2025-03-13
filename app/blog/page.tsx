import BlogPostsList from "@/components/ui/blog/blogPostsList";
import getAllBlogPosts from "@/lib/actions/blog/getAllBlogPosts";
import getAllTeaCategories from "@/lib/actions/tea/getAllTeaCategories";
import { BlogPost as BlogPostType } from "@/types";
// Force this page to be dynamically rendered
export const dynamic = "force-dynamic";

export default async function Page() {
  try {
    const [blogPosts, teaCategories] = await Promise.all([
      getAllBlogPosts(),
      getAllTeaCategories(),
    ]);

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

        <BlogPostsList posts={posts} teaCategories={teaCategories} />
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
