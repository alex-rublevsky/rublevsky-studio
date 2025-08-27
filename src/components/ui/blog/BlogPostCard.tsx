import { Link } from "@tanstack/react-router";
import { BlogPostPreview } from "~/types/index";
import { Badge } from "~/components/ui/shared/Badge";
import ReactMarkdown from "react-markdown";
import { markdownComponents, rehypePlugins } from "~/components/ui/shared/MarkdownComponents";
import { formatBlogDate } from "~/lib/utils";
import styles from "./blogCard.module.css";

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
      className="block h-full relative"
      viewTransition={true}
    >
      <article className="w-full overflow-hidden group bg-background flex flex-col h-full" id={styles.blogCard}>
        {/* Image */}
        {firstImage && (
          <div className="w-full overflow-hidden">
            <img 
              src={`https://assets.rublevsky.studio/${firstImage}`}
              alt={title || `Blog post ${id}`}
              width={600}
              height={400}
              loading="eager"
              className="w-full h-auto object-cover"
              style={{ viewTransitionName: `blog-image-${slug}` }}
            />
          </div>
        )}
        
        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          {/* Title */}
          <h3 
            className="text-xl font-semibold mb-3"
            style={{ viewTransitionName: `blog-title-${slug}` }}
          >
            {title || `Post ${id}`}
          </h3>
          
          {/* Excerpt */}
          {excerpt && (
            <div className="text-muted-foreground mb-4 prose prose-sm prose-p:my-0 prose-strong:text-foreground prose-em:text-muted-foreground flex-1">
              <ReactMarkdown components={markdownComponents} rehypePlugins={rehypePlugins}>{excerpt}</ReactMarkdown>
            </div>
          )}
          
          {/* Footer with date and tags */}
          <div className="flex items-center justify-between mt-auto">
            {/* Date */}
            <time className="text-sm text-muted-foreground">
              {formatBlogDate(publishedAt)}
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