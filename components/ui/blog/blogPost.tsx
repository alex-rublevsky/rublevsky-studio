"use client";

import ReactMarkdown from "react-markdown";
// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/keyboard";
import "swiper/css/mousewheel";
import BlogPostImageGallery from "./blogPostImageGallery";
import Link from "next/link";
import { CopyLinkButton } from "../shared/copyLinkButton";
interface BlogPostProps {
  title: string;
  body: string;
  images: string | null;
  productSlug?: string | null;
  slug: string;
  createdAt: string;
}

function BlogPost({
  title,
  body,
  images,
  productSlug,
  slug,
  createdAt,
}: BlogPostProps) {
  // Convert comma-separated string to array, or empty array if null
  const imageArray = images?.split(",").map((img) => img.trim()) ?? [];

  return (
    <article id={`${slug}`} className="max-w-2xl mx-auto">
      <BlogPostImageGallery images={imageArray} title={title} />

      <div className="sticky top-0">
        <h3 className="my-4">{title}</h3>

        <div className="mb-8 flex gap-4 items-center">
          <div className="flex gap-4">
            {productSlug && (
              <Link href={`/product/${productSlug}`} className="blurLink">
                <h6>Buy this tea →</h6>
              </Link>
            )}
            <time className="">
              {new Date(createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          </div>
          <CopyLinkButton />
        </div>
      </div>
      <div className="prose prose-lg">
        <ReactMarkdown>{body}</ReactMarkdown>
      </div>
    </article>
  );
}

export default BlogPost;
