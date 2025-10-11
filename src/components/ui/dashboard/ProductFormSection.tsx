import type { CSSProperties, ReactNode } from "react";
import { cn } from "~/lib/utils";

interface ProductFormSectionProps {
	title?: string;
	variant?: "default" | "muted";
	children: ReactNode;
	className?: string;
	style?: CSSProperties;
}

export function ProductFormSection({
	title,
	variant = "default",
	children,
	className,
	style,
}: ProductFormSectionProps) {
	return (
		<div
			className={cn(
				"px-4 sm:px-6 lg:px-8 py-6",
				variant === "muted" ? "bg-muted/30" : "bg-background",
				className,
			)}
			style={style}
		>
			{title && <h3 className="text-lg font-medium mb-4">{title}</h3>}
			{children}
		</div>
	);
}
