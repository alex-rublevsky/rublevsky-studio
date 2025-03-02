"use client";

// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/keyboard";
import "swiper/css/mousewheel";
import BlogPostImageGallery from "./blogPostImageGallery";

interface BlogPostProps {
  title: string;
  body: string;
  images: string[];
}

function BlogPost({ title, body, images }: BlogPostProps) {
  return (
    <article className="max-w-2xl mx-auto">
      <BlogPostImageGallery images={images} title={title} />

      <div className="sticky top-0">
        <h3>{title}</h3>
      </div>
      <p className="whitespace-pre-line">{body}</p>
    </article>
  );
}

export default BlogPost;
