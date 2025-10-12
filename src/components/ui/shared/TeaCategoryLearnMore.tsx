import { Badge } from "./Badge";

interface TeaCategoryLearnMoreProps {
	teaCategories?: string[];
	className?: string;
}

// Mapping from tea category slugs to blog post URLs and display names
const teaCategoryBlogMap: Record<string, { href?: string; name: string }> = {
	"ripe-pu-er": {
		href: "https://rublevsky.studio/blog/shu-puer-the-foundation-trilogy-part-iii#shu-puer-the-foundation-trilogy-part-iii",
		name: "Ripe Pu'er",
	},
	"raw-pu-er": {
		href: "https://rublevsky.studio/blog/sheng-puer-the-foundation-trilogy-part-ii",
		name: "Raw Pu'er",
	},
	"purple": {
		href: "https://rublevsky.studio/blog/purple-tea-what-is-this-mystery",
		name: "Purple Tea",
	},
	"gong-ting": {
		//href: "/blog/gong-ting", // Add actual blog post URL when available
		name: "Gong Ting",
		href: "https://rublevsky.studio/blog/gong-ting-from-yong-de-da-xue-shan-lincang",
	},
	"white": {
		//href: "/blog/white-tea", // Add actual blog post URL when available
		name: "White Tea",
	},
	"rattan-trees": {
		//href: "/blog/rattan-trees", // Add actual blog post URL when available
		name: "Rattan Trees",
	},
	"ancient-trees": {
		//href: "/blog/ancient-trees", // Add actual blog post URL when available
		name: "Ancient Trees",
	},
	"oolong": {
		//href: "/blog/oolong", // Add actual blog post URL when available
		name: "Oolong",
	},
	"red-tea": {
		//href: "/blog/red-tea", // Add actual blog post URL when available
		name: "Red Tea",
	},
};

// Mapping from tea category slugs to Badge variants
const teaCategoryVariantMap: Record<string, "shuPuer" | "rawPuer" | "purple" | "gongTing" | "white" | "rattanTrees" | "ancientTrees" | "oolong" | "redTea"> = {
	"ripe-pu-er": "shuPuer",
	"raw-pu-er": "rawPuer",
	"purple": "purple",
	"gong-ting": "gongTing",
	"white": "white",
	"rattan-trees": "rattanTrees",
	"ancient-trees": "ancientTrees",
	"oolong": "oolong",
	"red-tea": "redTea",
};

export function TeaCategoryLearnMore({ teaCategories = [], className }: TeaCategoryLearnMoreProps) {
	if (!teaCategories.length) return null;

	const validCategories = teaCategories.filter(
		(category) => teaCategoryBlogMap[category] && teaCategoryVariantMap[category]
	);

	if (!validCategories.length) return null;

	return (
		<div className={`flex flex-wrap gap-6 text-sm ${className || ""}`}>
			{validCategories.map((category) => {
				const blogInfo = teaCategoryBlogMap[category];
				const variant = teaCategoryVariantMap[category];
				
				if (!blogInfo || !variant) return null;

				const hasLink = blogInfo.href;

				return (
					<div key={category} className="flex flex-col">
						<span className="text-muted-foreground">Learn more about</span>
						{hasLink ? (
							<Badge
								asChild
								variant={variant}
								className="cursor-pointer transition-all hover:brightness-90 active:brightness-90"
							>
								<a
									href={blogInfo.href}
									target="_blank"
									rel="noopener noreferrer"
									className="underline underline-offset-[0.1rem] decoration-[0.09rem] decoration-primary"
								>
									{blogInfo.name}
								</a>
							</Badge>
						) : (
							<Badge
								variant={variant}
								className="transition-all hover:brightness-90 active:brightness-90"
							>
								{blogInfo.name}
							</Badge>
						)}
					</div>
				);
			})}
		</div>
	);
}
