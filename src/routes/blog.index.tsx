import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import BlogPostsList from "~/components/ui/blog/BlogPostsList";
//import getAllBlogPosts from "~/server_functions/getAllBlogPosts";
//import getAllTeaCategories from "~/server_functions/getAllTeaCategories";
import { BlogPost as BlogPostType } from "~/types/index";

const blogLoader = createServerFn().handler(async () => {
  // const [blogPosts, teaCategories] = await Promise.all([
  //   getAllBlogPosts(),
  //   getAllTeaCategories(),
  // ]);
  // const posts: BlogPostType[] = Array.isArray(blogPosts) ? blogPosts : [];
  // return { posts, teaCategories };
});

function PostsIndexComponent() {
  //const { posts, teaCategories } = Route.useLoaderData();

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

      {/* <BlogPostsList posts={posts} teaCategories={teaCategories} /> */}
    </section>
  );
}

export const Route = createFileRoute("/blog/")({
  component: PostsIndexComponent,
  loader: async () => {
    return blogLoader();
  },
});
