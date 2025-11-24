import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminProductCard } from "~/components/ui/dashboard/AdminProductCard";
import DeleteConfirmationDialog from "~/components/ui/dashboard/ConfirmationDialog";
import { ProductsPageSkeleton } from "~/components/ui/dashboard/skeletons/ProductsPageSkeleton";
import { ProductStatsCompact } from "~/components/ui/shared/productNumberAndWeightDisplay";
import { SearchInput } from "~/components/ui/shared/SearchInput";
import { storeDataQueryOptions } from "~/lib/queryOptions";
import { deleteProduct } from "~/server_functions/dashboard/store/deleteProduct";
import { getAllProducts } from "~/server_functions/dashboard/store/getAllProducts";
import type { ProductGroup, ProductWithVariations } from "~/types";

// Query options factory for reuse
const productsQueryOptions = () => ({
	queryKey: ["dashboard-products"],
	queryFn: () => getAllProducts(),
	staleTime: 1000 * 60 * 5, // Cache for 5 minutes
});

export const Route = createFileRoute("/dashboard/")({
	component: RouteComponent,
	pendingComponent: ProductsPageSkeleton,

	// Loader prefetches data before component renders
	loader: async ({ context: { queryClient } }) => {
		// Ensure data is loaded before component renders
		await queryClient.ensureQueryData(productsQueryOptions());
	},
});

function RouteComponent() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	// Use suspense query - data is guaranteed to be loaded by the loader
	const { data: productsData } = useSuspenseQuery(productsQueryOptions());

	// Function to refetch data using query invalidation
	const refetch = () => {
		// Invalidate dashboard products cache
		queryClient.invalidateQueries({
			queryKey: ["dashboard-products"],
		});

		// Remove store data cache completely - forces fresh fetch on all clients
		queryClient.removeQueries({
			queryKey: storeDataQueryOptions().queryKey,
		});
	};

	// State for delete dialog
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [deletingProductId, setDeletingProductId] = useState<number | null>(
		null,
	);
	const [isDeleting, setIsDeleting] = useState(false);

	// Search state
	const [searchTerm, setSearchTerm] = useState("");

	// Listen for action button clicks from navbar
	useEffect(() => {
		const handleAction = () => {
			navigate({ to: "/dashboard/new" });
		};

		window.addEventListener("dashboardAction", handleAction);
		return () => window.removeEventListener("dashboardAction", handleAction);
	}, [navigate]);

	// Event handlers

	const formatPrice = (price: number | string | null): string => {
		if (price === null) return "$0.00";
		const numericPrice = typeof price === "string" ? parseFloat(price) : price;
		return new Intl.NumberFormat("en-CA", {
			style: "currency",
			currency: "CAD",
		}).format(numericPrice);
	};

	const getTeaCategoryNames = (slugs: string[] | undefined): string => {
		if (!slugs || !productsData || slugs.length === 0) return "N/A";
		return slugs
			.map(
				(slug) =>
					productsData.teaCategories.find((category) => category.slug === slug)
						?.name,
			)
			.filter(Boolean)
			.join(", ");
	};

	const { groupedProducts } = productsData;

	// Filter grouped products based on search
	// Products are already sorted by availability on the server side
	const displayGroupedProducts: ProductGroup[] = searchTerm
		? groupedProducts
				.map((group) => ({
					...group,
					products: group.products.filter(
						(product) =>
							product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
							product.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
							group.title.toLowerCase().includes(searchTerm.toLowerCase()),
					),
				}))
				.filter((group) => group.products.length > 0)
		: groupedProducts;

	const handleDeleteClick = (product: ProductWithVariations) => {
		setDeletingProductId(product.id);
		setShowDeleteDialog(true);
	};

	const handleDeleteConfirm = async () => {
		if (!deletingProductId) return;

		setIsDeleting(true);

		try {
			await deleteProduct({ data: { id: deletingProductId } });

			toast.success("Product deleted successfully!");
			setShowDeleteDialog(false);
			setDeletingProductId(null);

			// Refresh data
			refetch();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setIsDeleting(false);
		}
	};

	const handleDeleteCancel = () => {
		setShowDeleteDialog(false);
		setDeletingProductId(null);
	};

	const handleEdit = (product: ProductWithVariations) => {
		navigate({
			to: "/dashboard/$productId/edit",
			params: { productId: String(product.id) },
		});
	};

	return (
		<div>
			{/* Products List */}
			<div className="space-y-6">
				{/* Products Header with Search and Total Weight */}
				<div className="space-y-4 px-4">
					{/* Top row: Product stats and search */}
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
						<ProductStatsCompact />

						{/* Search */}
						<SearchInput
							placeholder="Search products..."
							value={searchTerm}
							onChange={setSearchTerm}
							className="w-full sm:w-64"
						/>
					</div>
				</div>

				{displayGroupedProducts.length === 0 ? (
					<div className="text-center py-8 text-muted-foreground px-4">
						<div className="mb-4">
							<div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
								<Plus className="w-8 h-8" />
							</div>
						</div>
						<h3 className="text-lg font-medium mb-2">
							{searchTerm ? "No products found" : "No products yet"}
						</h3>
						<p className="text-sm text-muted-foreground">
							{searchTerm
								? "Try adjusting your search"
								: "Get started by creating your first product"}
						</p>
					</div>
				) : (
					<div className="space-y-8">
						{displayGroupedProducts.map((group) => (
							<div key={group.title} className="space-y-4">
								{/* Group Title */}
								<div className="px-4">
									<h2 className="text-2xl font-semibold text-foreground flex items-baseline gap-1">
										{group.title}
										<span className="text-sm text-muted-foreground">
											{group.products.length}{" "}
											{group.products.length === 1 ? "product" : "products"}
										</span>
									</h2>
								</div>

								{/* Products Grid */}
								<div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 md:gap-3 px-4">
									{group.products.map((product) => (
										<AdminProductCard
											key={product.id}
											product={product}
											onEdit={handleEdit}
											onDelete={handleDeleteClick}
											formatPrice={formatPrice}
											getTeaCategoryNames={getTeaCategoryNames}
										/>
									))}
								</div>

								{/* No divider between groups */}
							</div>
						))}
					</div>
				)}
			</div>

			{/* Delete Confirmation Dialog */}
			{showDeleteDialog && (
				<DeleteConfirmationDialog
					isOpen={showDeleteDialog}
					onClose={handleDeleteCancel}
					onConfirm={handleDeleteConfirm}
					title="Delete Product"
					description="Are you sure you want to delete this product? This action cannot be undone."
					isDeleting={isDeleting}
				/>
			)}
		</div>
	);
}
