import { Link } from "@tanstack/react-router";
import { BlogPostPreview } from "~/types/index";
import { Badge } from "~/components/ui/shared/Badge";
import ReactMarkdown from "react-markdown";
import { markdownComponents } from "~/components/ui/shared/MarkdownComponents";

interface BlogPostCardProps {
  post: BlogPostPreview;
  teaCategories: { slug: string; name: string }[];
}

export default function BlogPostCard({ post, teaCategories }: BlogPostCardProps) {
  const { id, title, slug, excerpt, images, publishedAt, teaCategories: postTeaCategories } = post;

  // Extract first image from images string
  const firstImage = images 
    ? images.split(',').map(img => img.trim()).filter(img => img !== '')[0] || null
    : null;

  // Get tea category names from slugs
  const categoryNames = postTeaCategories?.map(catSlug => {
    const category = teaCategories.find(cat => cat.slug === catSlug);
    return category?.name || catSlug;
  }) || [];

  return (
    <Link 
      to="/blog/$slug" 
      params={{ slug }}
      className="block group"
      viewTransition={true}
    >
      <article className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 h-full">
        {/* Image */}
        {firstImage && (
          <div className="w-full overflow-hidden">
            <img 
              src={`https://assets.rublevsky.studio/${firstImage}`}
              alt={title || `Blog post ${id}`}
              width={600}
              height={400}
              loading="eager"
              className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
              style={{ viewTransitionName: `blog-image-${slug}` }}
            />
          </div>
        )}
        
        {/* Content */}
        <div className="p-6">
          {/* Title */}
          <h3 
            className="text-xl font-semibold mb-3 group-hover:text-blue-600 transition-colors"
            style={{ viewTransitionName: `blog-title-${slug}` }}
          >
            {title || `Post ${id}`}
          </h3>
          
          {/* Excerpt */}
          {excerpt && (
            <div className="text-gray-600 mb-4 prose prose-sm prose-p:my-0 prose-strong:text-gray-800 prose-em:text-gray-700">
              <ReactMarkdown components={markdownComponents}>{excerpt}</ReactMarkdown>
            </div>
          )}
          
          {/* Footer with date and tags */}
          <div className="flex items-center justify-between">
            {/* Date */}
            <time className="text-sm text-gray-500">
              {new Date(publishedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                timeZone: "UTC",
              })}
            </time>
            
            {/* Tags */}
            {categoryNames.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {categoryNames.slice(0, 2).map((categoryName, index) => (
                  <Badge 
                    key={index}
                    variant="secondary" 
                    className="text-xs"
                  >
                    {categoryName}
                  </Badge>
                ))}
                {categoryNames.length > 2 && (
                  <Badge variant="secondary" className="text-xs">
                    +{categoryNames.length - 2}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}