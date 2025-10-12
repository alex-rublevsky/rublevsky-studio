import { Skeleton } from "~/components/ui/dashboard/skeleton";

export function BrandsPageSkeleton() {
	return (
		<div className="space-y-8">
			<div>
				<div className="overflow-x-auto">
					<table className="min-w-full divide-y divide-border">
						<thead>
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
									Name
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
									Slug
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
									Logo
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
									Status
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
									Actions
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-border">
							{Array.from({ length: 6 }, (_, index) => (
								<tr key={`brand-skeleton-${Date.now()}-${index}`}>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="relative">
											<span className="invisible">Brand Name</span>
											<Skeleton className="absolute inset-0 w-24" />
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="relative">
											<span className="invisible">brand-slug</span>
											<Skeleton className="absolute inset-0 w-20" />
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="h-10 w-10 relative">
											<Skeleton className="absolute inset-0 rounded" />
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="relative">
											<span className="invisible">Active</span>
											<Skeleton className="absolute inset-0 w-16 h-6 rounded-full" />
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
										<div className="flex space-x-4">
											<div className="relative">
												<button
													type="button"
													className="h-8 px-3 invisible"
													disabled
												>
													<span>Edit</span>
												</button>
												<Skeleton className="absolute inset-0 rounded" />
											</div>
											<div className="relative">
												<button
													type="button"
													className="h-8 px-3 invisible"
													disabled
												>
													<span>Delete</span>
												</button>
												<Skeleton className="absolute inset-0 rounded" />
											</div>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			{/* Floating Action Button */}
			<div className="fixed bottom-3 right-3 z-50">
				<button
					type="button"
					className="h-12 px-6 invisible relative"
					disabled
				>
					<span>Add New Brand</span>
				</button>
				<Skeleton className="absolute inset-0 rounded" />
			</div>
		</div>
	);
}
