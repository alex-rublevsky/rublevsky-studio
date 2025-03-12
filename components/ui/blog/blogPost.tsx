"use client";
import "./blogPost.css";
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
  publishedAt: string;
}

function BlogPost({
  title,
  body,
  images,
  productSlug,
  slug,
  publishedAt,
}: BlogPostProps) {
  // Convert comma-separated string to array, or empty array if null
  const imageArray = images?.split(",").map((img) => img.trim()) ?? [];

  return (
    <article id={`${slug}`} className="max-w-2xl mx-auto">
      {imageArray.length > 0 && (
        <BlogPostImageGallery images={imageArray} title={title} />
      )}

      <div className="sticky-header-container">
        <div className="relative max-w-2xl mx-auto z-[1]">
          <h3>{title}</h3>

          <div className="my-2 flex gap-4 items-center">
            <div className="flex gap-4">
              {productSlug && (
                <Link href={`/product/${productSlug}`} className="blurLink">
                  <h6 className="whitespace-nowrap">Purchase →</h6>
                </Link>
              )}
              <time className="whitespace-nowrap">
                {publishedAt
                  ? new Date(publishedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      timeZone: "UTC",
                    })
                  : ""}
              </time>
            </div>
            <CopyLinkButton sectionId={slug} />
          </div>
        </div>
      </div>
      <div className="prose prose-lg -mt-6">
        <ReactMarkdown>{body}</ReactMarkdown>
      </div>
    </article>
  );
}

export default BlogPost;
