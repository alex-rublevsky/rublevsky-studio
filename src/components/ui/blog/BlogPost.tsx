import "./blogPost.css";
import ReactMarkdown from "react-markdown";
// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/keyboard";
import "swiper/css/mousewheel";

import { Link } from "@tanstack/react-router";

import { CopyLinkButton } from "./CopyLinkButton";
import BlogPostImageGallery from "./BlogPostImageGallery";
import { markdownComponents } from "../shared/MarkdownComponents";

interface BlogPostProps {
  title: string | null;
  body: string;
  images: string | null;
  productSlug?: string | null;
  slug: string;
  publishedAt: number;
}

function BlogPost({
  title,
  body,
  images,
  productSlug,
  slug,
  publishedAt,
}: BlogPostProps) {
  // Convert comma-separated string to array, filter out empty strings, or empty array if null
  const imageArray = images
    ? images
        .split(",")
        .map((img) => img.trim())
        .filter((img) => img !== "")
    : [];

  return (
    <article id={`${slug}`} className="max-w-2xl mx-auto">
      {imageArray.length > 0 && (
        <BlogPostImageGallery
          images={imageArray}
          title={title || undefined}
          slug={slug}
        />
      )}

      <div className="sticky-header-container">
        <div className="relative max-w-2xl mx-auto z-1">
          <h3>{title}</h3>

          <div className="my-2 flex gap-4 items-center">
            <div className="flex gap-4">
              {productSlug && (
                <Link
                  to="/store/$itemId"
                  params={{
                    itemId: productSlug,
                  }}
                  className="blurLink"
                >
                  <h6 className="whitespace-nowrap">Purchase →</h6>
                </Link>
              )}
              <time className="whitespace-nowrap">
                {new Date(publishedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  timeZone: "UTC",
                })}
              </time>
            </div>
            <CopyLinkButton sectionId={slug} />
          </div>
        </div>
      </div>
      <div className="prose prose-lg -mt-6">
        <ReactMarkdown components={markdownComponents}>{body}</ReactMarkdown>
      </div>
    </article>
  );
}

export default BlogPost;
