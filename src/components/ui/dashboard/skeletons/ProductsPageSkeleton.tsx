import { Skeleton } from "~/components/ui/dashboard/skeleton";

export function ProductsPageSkeleton() {
	return (
		<div className="space-y-6">
			{/* Header with Search - exact match */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4">
				<p className="text-muted-foreground relative">
					<span className="invisible">Loading products...</span>
					<Skeleton className="absolute inset-0" />
				</p>
				<div className="w-full sm:w-64 relative">
					<input
						type="text"
						className="w-full h-10 invisible"
						aria-hidden="true"
					/>
					<Skeleton className="absolute inset-0" />
				</div>
			</div>

			{/* Products Groups */}
			<div className="space-y-8">
				{/* First Group */}
				<div className="space-y-4">
					{/* Group Title - using real text elements for exact height */}
					<div className="px-4">
						<h2 className="text-2xl font-semibold text-foreground relative">
							<span className="invisible">Loading</span>
							<Skeleton className="absolute inset-0 w-48" />
						</h2>
						<p className="text-sm text-muted-foreground mt-1 relative">
							<span className="invisible">12 products</span>
							<Skeleton className="absolute inset-0 w-24" />
						</p>
					</div>
					<div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 md:gap-3 px-4">
						{Array.from({ length: 12 }).map((_, index) => (
							<ProductCardSkeleton key={index} />
						))}
					</div>
				</div>

				{/* Divider */}
				<div className="border-b border-border/40 mt-8 mx-4" />

				{/* Second Group */}
				<div className="space-y-4">
					{/* Group Title - using real text elements for exact height */}
					<div className="px-4">
						<h2 className="text-2xl font-semibold text-foreground relative">
							<span className="invisible">Loading</span>
							<Skeleton className="absolute inset-0 w-32" />
						</h2>
						<p className="text-sm text-muted-foreground mt-1 relative">
							<span className="invisible">8 products</span>
							<Skeleton className="absolute inset-0 w-20" />
						</p>
					</div>
					<div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 md:gap-3 px-4">
						{Array.from({ length: 8 }).map((_, index) => (
							<ProductCardSkeleton key={index} />
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

function ProductCardSkeleton() {
	return (
		<div className="bg-background overflow-hidden">
			{/* Image - no rounded corners */}
			<div className="aspect-square relative">
				<Skeleton className="absolute inset-0 w-full h-full rounded-none" />
			</div>

			{/* Content Section - exact match to real card */}
			<div className="flex flex-col h-auto md:h-full">
				{/* Info Section */}
				<div className="p-4 flex flex-col h-auto md:h-full">
					{/* Price - using real h5 element for exact height */}
					<div className="flex flex-col mb-2">
						<div className="flex flex-wrap items-center justify-between w-full gap-x-2">
							<div className="flex flex-col items-baseline gap-1">
								<h5 className="whitespace-nowrap relative">
									<span className="invisible">$00.00 CAD</span>
									<Skeleton className="absolute inset-0 w-24" />
								</h5>
							</div>
						</div>
					</div>

					{/* Product Name - using real p element for exact height */}
					<p className="mb-3 relative">
						<span className="invisible">Loading product name</span>
						<Skeleton className="absolute inset-0" />
					</p>

					{/* Metadata - using real text elements with exact spacing */}
					<div className="space-y-1 text-sm">
						{/* Category */}
						<div className="relative">
							<span className="text-muted-foreground invisible">Category</span>
							<Skeleton className="absolute inset-0 w-20" />
						</div>

						{/* Tea Categories */}
						<div className="relative">
							<span className="text-muted-foreground text-xs invisible">
								Tea type
							</span>
							<Skeleton className="absolute inset-0 w-16" />
						</div>

						{/* Stock */}
						<div className="relative">
							<span className="text-xs text-muted-foreground invisible">
								Stock: 100
							</span>
							<Skeleton className="absolute inset-0 w-24" />
						</div>
					</div>
				</div>

				{/* Mobile Action Buttons - exact match to real buttons */}
				<div className="md:hidden mt-auto flex items-stretch">
					<button
						type="button"
						className="flex-1 flex items-center justify-center space-x-2 py-2 px-4 relative"
						disabled
						aria-hidden="true"
					>
						<span className="invisible">Edit</span>
						<Skeleton className="absolute inset-0 rounded-none" />
					</button>
					<button
						type="button"
						className="w-12 flex items-center justify-center relative"
						disabled
						aria-hidden="true"
					>
						<span className="invisible">X</span>
						<Skeleton className="absolute inset-0 rounded-none" />
					</button>
				</div>
			</div>
		</div>
	);
}
