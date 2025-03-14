"use client";

import { BlogPost as BlogPostType, TeaCategory } from "@/types";
import BlogPost from "@/components/ui/blog/blogPost";
import TeaCategoryFilters from "../shared/teaCategoryFilters";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface BlogPostsListProps {
  posts: BlogPostType[];
  teaCategories: TeaCategory[];
}

export default function BlogPostsList({
  posts,
  teaCategories,
}: BlogPostsListProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Filter tea categories to only show those that are used in blog posts
  const usedTeaCategories = useMemo(() => {
    const usedCategories = new Set(
      posts.flatMap((post) => post.teaCategories || [])
    );
    return teaCategories.filter((category) =>
      usedCategories.has(category.slug)
    );
  }, [posts, teaCategories]);

  // Filter posts based on selected categories
  const filteredPosts = useMemo(() => {
    if (selectedCategories.length === 0) return posts;
    return posts.filter((post) =>
      post.teaCategories?.some((category) =>
        selectedCategories.includes(category)
      )
    );
  }, [posts, selectedCategories]);

  const handleCategoryToggle = (categorySlug: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categorySlug)) {
        return prev.filter((slug) => slug !== categorySlug);
      }
      return [...prev, categorySlug];
    });
  };

  return (
    <div>
      <TeaCategoryFilters
        teaCategories={usedTeaCategories}
        selectedCategories={selectedCategories}
        onCategoryToggle={handleCategoryToggle}
      />

      <AnimatePresence mode="popLayout">
        <div className="space-y-24 md:space-y-32">
          {filteredPosts.length === 0 ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center text-lg"
            >
              No blog posts found for the selected categories.
            </motion.p>
          ) : (
            filteredPosts.map((post) => (
              <motion.div
                key={post.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <BlogPost
                  title={post.title || "Untitled Post"}
                  body={post.body || ""}
                  images={post.images}
                  productSlug={post.productSlug}
                  slug={post.slug || `post-${post.id}`}
                  publishedAt={post.publishedAt || ""}
                />
              </motion.div>
            ))
          )}
        </div>
      </AnimatePresence>
    </div>
  );
}
