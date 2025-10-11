import type * as React from "react";

import { Badge } from "./Badge";

interface TeaCategoryLinkProps {
	href: string;
	children: React.ReactNode;
	variant: "shuPuer" | "rawPuer" | "purple";
	className?: string;
	target?: string;
	rel?: string;
}

export function TeaCategoryLink({
	href,
	children,
	variant,
	className,
	target,
	rel,
	...props
}: TeaCategoryLinkProps & React.ComponentProps<"a">) {
	return (
		<Badge
			asChild
			variant={variant}
			className={`cursor-pointer transition-all hover:brightness-90 active:brightness-90 ${className || ""}`}
		>
			<a
				href={href}
				target={target}
				rel={rel}
				className="text-decoration-line: underline; text-underline-offset: 0.3rem; text-decoration-thickness: 0.1rem; hover:underline"
				{...props}
			>
				{children}
			</a>
		</Badge>
	);
}
