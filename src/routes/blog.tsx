import { createFileRoute } from "@tanstack/react-router";
import BlogPostsList from "~/components/ui/blog/BlogPostsList";
import { BlogPost as BlogPostType, TeaCategory } from "~/types/index";
import { useQuery } from "@tanstack/react-query";
import { DEPLOY_URL } from "~/utils/store";
import { useState } from "react";

export const Route = createFileRoute("/blog")({
  component: PostsIndexComponent,
});

function PostsIndexComponent() {
  // Fetch blog posts
  const {
    isPending: isPostsPending,
    error: postsError,
    data: postsData,
  } = useQuery<BlogPostType[]>({
    queryKey: ["blog"],
    queryFn: () => fetch(`${DEPLOY_URL}/api/blog`).then((res) => res.json()),
  });

  // Fetch tea categories
  const {
    isPending: isCategoriesPending,
    error: categoriesError,
    data: categoriesData,
  } = useQuery<TeaCategory[]>({
    queryKey: ["teaCategories"],
    queryFn: () =>
      fetch(`${DEPLOY_URL}/api/tea-categories`).then((res) => res.json()),
  });

  const isLoading = isPostsPending; //|| isCategoriesPending;
  const hasError = postsError; //|| categoriesError;

  return (
    <section className="pt-24 sm:pt-32 div [view-transition-name:main-content] bg-amber-300 min-h-screen">
      <div>
        <h1 className="text-center mb-8">What&apos;s in the gaiwan?</h1>
        <h5 className="text-center mb-16 sm:mb-24">
          <a className="blurLink" href="https://t.me/gaiwan_contents">
            🇷🇺 RU blog version
          </a>
        </h5>
      </div>

      {isLoading ? (
        <div className="text-center">Loading blog posts...</div>
      ) : hasError ? (
        <div className="text-center text-red-500">
          Error loading blog content. Please try again later.
        </div>
      ) : (
        <BlogPostsList
          posts={postsData || []}
          teaCategories={categoriesData || []}
        />
      )}
    </section>
  );
}
