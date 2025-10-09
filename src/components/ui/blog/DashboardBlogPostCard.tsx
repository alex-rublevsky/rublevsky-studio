import { Edit, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Badge } from "~/components/ui/shared/Badge";
import { Button } from "~/components/ui/shared/Button";
import {
	markdownComponents,
	rehypePlugins,
} from "~/components/ui/shared/MarkdownComponents";
import { formatBlogDate } from "~/lib/utils";
import type { BlogPost } from "~/types/index";
import styles from "./blogCard.module.css";

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
	onDelete,
}: DashboardBlogPostCardProps) {
	const {
		id,
		title,
		slug,
		body,
		images,
		publishedAt,
		isVisible,
		teaCategories: postTeaCategories,
		productSlug,
		productName,
	} = post;

	// Extract first image from images string
	const firstImage = images
		? images
				.split(",")
				.map((img) => img.trim())
				.filter((img) => img !== "")[0] || null
		: null;

	// Get tea category names from slugs
	const categoryNames =
		postTeaCategories?.map((catSlug) => {
			const category = teaCategories.find((cat) => cat.slug === catSlug);
			return category?.name || catSlug;
		}) || [];

	// Create excerpt from body (first 120 characters for dashboard)
	const excerpt =
		body && body.length > 120 ? `${body.substring(0, 120).trim()}...` : body;

	return (
		<article
			className="w-full overflow-hidden bg-background flex flex-col h-full border border-border"
			id={styles.blogCard}
		>
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
					/>
				</div>
			)}

			{/* Content */}
			<div className="p-4 flex flex-col flex-1">
				{/* Header with title */}
				<div className="mb-3">
					<h3 className="text-lg font-semibold">{title || `Post ${id}`}</h3>
				</div>

				{/* Excerpt */}
				{excerpt && (
					<div className="text-muted-foreground mb-3 prose prose-sm prose-p:my-0 prose-strong:text-foreground prose-em:text-muted-foreground flex-1">
						<ReactMarkdown
							components={markdownComponents}
							rehypePlugins={rehypePlugins}
						>
							{excerpt}
						</ReactMarkdown>
					</div>
				)}

				{/* Footer with metadata */}
				<div className="space-y-3 mt-auto">
					{/* Tea Categories */}
					{categoryNames.length > 0 && (
						<div className="flex flex-wrap gap-1">
							{categoryNames.slice(0, 3).map((categoryName) => (
								<Badge
									key={categoryName}
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
							<span className="text-xs text-muted-foreground block mb-1">
								Linked product:
							</span>
						<Badge
							variant="outline"
							className="text-xs cursor-pointer hover:bg-muted active:bg-muted transition-colors"
							onClick={() => window.open(`/store/${productSlug}`, "_blank")}
						>
							{productName}
							</Badge>
						</div>
					)}

					{/* Date, Visibility and Actions */}
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<time className="text-sm text-muted-foreground">
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
						<span className="text-xs text-muted-foreground">Slug: {slug}</span>
					</div>
				</div>
			</div>
		</article>
	);
}
