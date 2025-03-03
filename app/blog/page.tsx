import Link from "next/link";
import BlogPost from "@/components/ui/blog/blogPost";
import getAllBlogPosts from "@/lib/actions/getAllBlogPosts";
import { BlogPost as BlogPostType } from "@/types";

export default async function Page() {
  const blogPosts = await getAllBlogPosts();
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
        {blogPosts.map((post) => {
          // Parse the images string into an array or use an empty array if null
          const imageArray = post.images ? JSON.parse(post.images) : [];

          return (
            <BlogPost
              key={post.id}
              title={post.title}
              body={post.body}
              images={imageArray}
              productSlug={post.productSlug}
              slug={post.slug}
            />
          );
        })}
      </div>
    </section>
  );
}
