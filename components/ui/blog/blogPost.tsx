"use client";

// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/keyboard";
import "swiper/css/mousewheel";
import BlogPostImageGallery from "./blogPostImageGallery";
import Link from "next/link";

interface BlogPostProps {
  title: string;
  body: string;
  images: string[];
  productSlug?: string | null;
  slug: string;
}

function BlogPost({ title, body, images, productSlug, slug }: BlogPostProps) {
  return (
    <article id={`${slug}`} className="max-w-2xl mx-auto">
      <BlogPostImageGallery images={images} title={title} />

      <div className="sticky top-0">
        <h3>{title}</h3>
        {productSlug && (
          <div className="mt-1 mb-4">
            <Link
              href={`/product/${productSlug}`}
              className="text-blue-600 hover:underline inline-flex items-center gap-1"
            >
              <span>View product</span>
            </Link>
          </div>
        )}
      </div>
      <p className="whitespace-pre-line">{body}</p>
    </article>
  );
}

export default BlogPost;
