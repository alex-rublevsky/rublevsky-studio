import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "~/utils/utils";

const badgeVariants = cva(
	"inline-flex items-center justify-center rounded-md border w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-all overflow-hidden",
	{
	variants: {
		variant: {
			default:
				"border-transparent bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/90",
			secondary:
				"border-transparent bg-muted/65 text-secondary-foreground hover:brightness-96 active:brightness-96",
			destructive:
				"border-transparent bg-destructive text-white hover:bg-destructive/90 active:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/70",
			outline:
				"text-foreground border-muted hover:bg-muted hover:text-foreground active:bg-muted active:text-foreground",
			green:
				"border-transparent bg-green-600 text-white font-medium hover:bg-green-600/90 active:bg-green-600/90 focus-visible:ring-green-600/20 dark:focus-visible:ring-green-600/40 dark:bg-green-600/70",
			greenOutline:
				"border-green-600 bg-transparent text-green-600 hover:bg-green-600/10 active:bg-green-600/10 focus-visible:ring-green-600/20 dark:focus-visible:ring-green-600/40 dark:bg-green-600/70",
		},
			size: {
				default: "px-2 py-0.5 text-xs",
				lg: "px-3 py-1 text-2xl",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

function Badge({
	className,
	variant,
	size,
	asChild = false,
	...props
}: React.ComponentProps<"span"> &
	VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
	const Comp = asChild ? Slot : "span";

	return (
		<Comp
			data-slot="badge"
			className={cn(badgeVariants({ variant, size }), className)}
			{...props}
		/>
	);
}

export { Badge, badgeVariants };
