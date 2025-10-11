import type * as React from "react";

import { Badge } from "./Badge";

interface TeaCategoryBadgesProps {
	teaCategories?: string[];
	className?: string;
}

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

// Display names for tea categories
const teaCategoryNames: Record<string, string> = {
	"ripe-pu-er": "Ripe Pu'er",
	"raw-pu-er": "Raw Pu'er",
	"purple": "Purple",
	"gong-ting": "Gong Ting",
	"white": "White",
	"rattan-trees": "Rattan Trees",
	"ancient-trees": "Ancient Trees",
	"oolong": "Oolong",
	"red-tea": "Red Tea",
};

export function TeaCategoryBadges({ teaCategories = [], className }: TeaCategoryBadgesProps) {
	if (!teaCategories.length) return null;

	const validCategories = teaCategories.filter(
		(category) => teaCategoryVariantMap[category]
	);

	if (!validCategories.length) return null;

	return (
		<div className={`flex flex-wrap ${className || ""}`}>
			{validCategories.map((category) => {
				const variant = teaCategoryVariantMap[category];
				const name = teaCategoryNames[category];
				
				if (!variant || !name) return null;

				return (
					<Badge key={category} variant={variant}>
						{name}
					</Badge>
				);
			})}
		</div>
	);
}
