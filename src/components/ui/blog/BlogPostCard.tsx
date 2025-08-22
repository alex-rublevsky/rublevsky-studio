import { Link } from "@tanstack/react-router";
import { BlogPostPreview } from "~/types/index";
import { Badge } from "~/components/ui/shared/Badge";
import { Image } from "~/components/ui/shared/Image";

interface BlogPostCardProps {
  post: BlogPostPreview;
  teaCategories: { slug: string; name: string }[];
}

export default function BlogPostCard({ post, teaCategories }: BlogPostCardProps) {
  const { id, title, slug, excerpt, firstImage, publishedAt, teaCategories: postTeaCategories } = post;

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
    >
      <article className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 h-full">
        {/* Image */}
        {firstImage && (
          <div className="aspect-video w-full overflow-hidden">
            <Image 
              src={`/${firstImage}`}
              alt={title || `Blog post ${id}`}
              width={600}
              height={400}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        
        {/* Content */}
        <div className="p-6">
          {/* Title */}
          <h3 className="text-xl font-semibold mb-3 group-hover:text-blue-600 transition-colors">
            {title || `Post ${id}`}
          </h3>
          
          {/* Excerpt */}
          {excerpt && (
            <p className="text-gray-600 mb-4">
              {excerpt}
            </p>
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