import { BlogPost } from "~/types/index";
import { Badge } from "~/components/ui/shared/Badge";
import { Button } from "~/components/ui/shared/Button";
import ReactMarkdown from "react-markdown";
import { markdownComponents } from "~/components/ui/shared/MarkdownComponents";
import { Edit, Trash2 } from "lucide-react";
import { formatBlogDate } from "~/lib/utils";

interface DashboardBlogPostCardProps {
  post: BlogPost;
  teaCategories: { slug: string; name: string }[];
  onEdit: (post: BlogPost) => void;
  onDelete: (post: BlogPost) => void;
}

export default function DashboardBlogPostCard({ 
  post, 
  teaCategories, 
  onEdit, 
  onDelete 
}: DashboardBlogPostCardProps) {
  const { id, title, slug, body, images, publishedAt, isVisible, teaCategories: postTeaCategories, productSlug, productName } = post;

  // Extract first image from images string
  const firstImage = images 
    ? images.split(',').map(img => img.trim()).filter(img => img !== '')[0] || null
    : null;

  // Get tea category names from slugs
  const categoryNames = postTeaCategories?.map(catSlug => {
    const category = teaCategories.find(cat => cat.slug === catSlug);
    return category?.name || catSlug;
  }) || [];

  // Create excerpt from body (first 120 characters for dashboard)
  const excerpt = body && body.length > 120 
    ? body.substring(0, 120).trim() + '...'
    : body;

  return (
    <article className="bg-white dark:bg-gray-800 overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-200 dark:border-gray-700">
      {/* Image */}
      {firstImage && (
        <div className="w-full overflow-hidden">
          <img 
            src={`https://assets.rublevsky.studio/${firstImage}`}
            alt={title || `Blog post ${id}`}
            width={600}
            height={400}
            loading="eager"
            className="w-full h-auto object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      
      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Header with title */}
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title || `Post ${id}`}
          </h3>
        </div>
        
        {/* Excerpt */}
        {excerpt && (
          <div className="text-gray-600 dark:text-gray-300 mb-3 prose prose-sm prose-p:my-0 prose-strong:text-gray-800 prose-em:text-gray-700 dark:prose-strong:text-gray-200 dark:prose-em:text-gray-300 flex-1">
            <ReactMarkdown components={markdownComponents}>{excerpt}</ReactMarkdown>
          </div>
        )}
        
        {/* Footer with metadata */}
        <div className="space-y-3 mt-auto">
          {/* Tea Categories */}
          {categoryNames.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {categoryNames.slice(0, 3).map((categoryName, index) => (
                <Badge 
                  key={index}
                  variant="secondary" 
                  className="text-xs"
                >
                  {categoryName}
                </Badge>
              ))}
              {categoryNames.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{categoryNames.length - 3}
                </Badge>
              )}
            </div>
          )}
          
          {/* Linked Product */}
          {productName && productSlug && (
            <div>
              <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                Linked product:
              </span>
              <Badge 
                variant="outline" 
                className="text-xs cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                onClick={() => window.open(`/store/${productSlug}`, '_blank')}
              >
                {productName}
              </Badge>
            </div>
          )}
          
          {/* Date, Visibility and Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <time className="text-sm text-gray-500 dark:text-gray-400">
                {formatBlogDate(publishedAt)}
              </time>
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  isVisible 
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                }`}
              >
                {isVisible ? "Visible" : "Hidden"}
              </span>
            </div>
            
            {/* Action buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(post)}
                className="w-8 h-8 p-0"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(post)}
                className="w-8 h-8 p-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Slug indicator */}
          <div className="flex justify-end">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Slug: {slug}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
