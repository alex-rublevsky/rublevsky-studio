import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ProductForm } from "~/components/ui/dashboard/ProductForm";
import { ProductsPageSkeleton } from "~/components/ui/dashboard/skeletons/ProductsPageSkeleton";
import { Button } from "~/components/ui/shared/Button";
import { generateSlug } from "~/hooks/useSlugGeneration";
import { deleteProductImage } from "~/server_functions/dashboard/store/deleteProductImage";
import { getAllProducts } from "~/server_functions/dashboard/store/getAllProducts";
import { getProductBySlug } from "~/server_functions/dashboard/store/getProductBySlug";
import { updateProduct } from "~/server_functions/dashboard/store/updateProduct";
import type {
	ProductFormData,
	ProductVariationWithAttributes,
	VariationAttribute,
} from "~/types";

interface Variation {
	id: string;
	sku: string;
	price: number;
	stock: number;
	discount?: number | null;
	sort: number;
	shippingFrom?: string;
	attributes: VariationAttribute[];
}

// Query options factory for reuse
const productsQueryOptions = () => ({
	queryKey: ["dashboard-products"],
	queryFn: () => getAllProducts(),
	staleTime: 1000 * 60 * 5, // Cache for 5 minutes
});

const productQueryOptions = (productId: number) => ({
	queryKey: ["product-edit", productId],
	queryFn: () => getProductBySlug({ data: { id: productId } }),
	staleTime: 1000 * 60 * 5, // Cache for 5 minutes
});

export const Route = createFileRoute("/dashboard/$productId/edit")({
	component: RouteComponent,
	pendingComponent: ProductsPageSkeleton,
	// Loader prefetches data before component renders
	loader: async ({ context: { queryClient }, params }) => {
		const productId = parseInt(params.productId, 10);
		if (Number.isNaN(productId)) {
			throw new Error("Invalid product ID");
		}
		// Ensure data is loaded before component renders
		await Promise.all([
			queryClient.ensureQueryData(productsQueryOptions()),
			queryClient.ensureQueryData(productQueryOptions(productId)),
		]);
	},
});

const defaultFormData: ProductFormData = {
	name: "",
	slug: "",
	description: "",
	price: "0",
	categorySlug: "",
	brandSlug: "",
	teaCategories: [],
	stock: "0",
	isActive: true,
	isFeatured: false,
	discount: null,
	hasVariations: false,
	weight: "",
	images: "",
	shippingFrom: "",
	variations: [],
};

function RouteComponent() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { productId: productIdParam } = Route.useParams();
	const productId = parseInt(productIdParam, 10);

	// Use suspense query - data is guaranteed to be loaded by the loader
	const { data: productsData } = useSuspenseQuery(productsQueryOptions());
	const { data: productData } = useSuspenseQuery(
		productQueryOptions(productId),
	);

	const [formData, setFormData] = useState<ProductFormData>(defaultFormData);
	const [variations, setVariations] = useState<Variation[]>([]);
	const [deletedImages, setDeletedImages] = useState<string[]>([]);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState("");
	const [isAutoSlug, setIsAutoSlug] = useState(false);
	const [originalProductSlug, setOriginalProductSlug] = useState<string>("");

	// Load product data into form
	useEffect(() => {
		if (productData && productsData) {
			// Convert variations to the frontend format
			const formattedVariations =
				productData.variations?.map(
					(variation: ProductVariationWithAttributes) => ({
						id: variation.id.toString(),
						sku: variation.sku,
						price: variation.price,
						stock: variation.stock,
						sort: variation.sort ?? 0, // Handle null sort values
						shippingFrom: variation.shippingFrom || undefined,
						discount: variation.discount || null,
						attributes: variation.attributes || [],
					}),
				) || [];

			// Determine if slug is custom (doesn't match auto-generated)
			const isCustomSlug = productData.slug !== generateSlug(productData.name);

			// Get tea category slugs (should be strings, not objects)
			const teaCategorySlugs = productData.teaCategories || [];

			setFormData({
				name: productData.name,
				slug: productData.slug,
				description: productData.description || "",
				price: productData.price.toString(),
				categorySlug: productData.categorySlug || "",
				brandSlug: productData.brandSlug || "",
				teaCategories: teaCategorySlugs,
				stock: productData.stock.toString(),
				isActive: productData.isActive,
				isFeatured: productData.isFeatured,
				discount: productData.discount,
				hasVariations: productData.hasVariations,
				weight: productData.weight || "",
				images: productData.images || "",
				shippingFrom: productData.shippingFrom || "",
				variations: [],
			});

			setOriginalProductSlug(productData.slug);
			setIsAutoSlug(!isCustomSlug);
			setVariations(formattedVariations);
		}
	}, [productData, productsData]);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		setIsSubmitting(true);
		setError("");

		try {
			// Delete images from R2 first
			if (deletedImages.length > 0) {
				const deletePromises = deletedImages.map((filename) =>
					deleteProductImage({ data: { filename } }).catch((error) => {
						console.error(`Failed to delete ${filename}:`, error);
						// Don't fail the whole update if one image deletion fails
					}),
				);
				await Promise.all(deletePromises);
				toast.success(`Deleted ${deletedImages.length} image(s) from storage`);
			}

			const formattedVariations = variations.map((variation: Variation) => ({
				id: variation.id.startsWith("temp-")
					? undefined
					: parseInt(variation.id, 10),
				sku: variation.sku,
				price: variation.price.toString(),
				stock: variation.stock.toString(),
				sort: variation.sort,
				shippingFrom: variation.shippingFrom,
				attributes: variation.attributes.map((attr: VariationAttribute) => ({
					attributeId: attr.attributeId,
					value: attr.value,
				})),
			}));

			const submissionData = {
				...formData,
				variations: formattedVariations,
				teaCategories: Array.isArray(formData.teaCategories)
					? formData.teaCategories.filter(
							(tc): tc is string => typeof tc === "string",
						)
					: undefined,
			};

			await updateProduct({
				data: { id: productId, data: submissionData },
			});

			toast.success("Product updated successfully!");

			// Invalidate dashboard products cache
			queryClient.invalidateQueries({
				queryKey: ["dashboard-products"],
			});

			// Invalidate store data cache
			queryClient.removeQueries({
				queryKey: ["store-data"],
			});

			// If slug changed, remove both old and new product pages
			if (originalProductSlug && formData.slug !== originalProductSlug) {
				queryClient.removeQueries({
					queryKey: ["product", originalProductSlug],
				});
				queryClient.removeQueries({
					queryKey: ["product", formData.slug],
				});
			}

			// Navigate back to dashboard (products list)
			navigate({ to: "/dashboard" });
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "An error occurred";
			setError(errorMessage);
			toast.error(errorMessage);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleCancel = () => {
		navigate({ to: "/dashboard" });
	};

	const { categories, teaCategories, brands } = productsData;

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			<div className="mb-6">
				<h1 className="text-3xl font-bold">Edit Product</h1>
				<p className="text-muted-foreground mt-2">
					Update product information and settings
				</p>
			</div>

			{error && (
				<div className="bg-destructive/20 border border-destructive text-destructive-foreground px-4 py-3 mb-4 rounded-md">
					{error}
				</div>
			)}

			<form onSubmit={handleSubmit} className="space-y-6">
				<ProductForm
					formData={formData}
					onFormDataChange={setFormData}
					variations={variations}
					onVariationsChange={setVariations}
					deletedImages={deletedImages}
					onDeletedImagesChange={setDeletedImages}
					categories={categories}
					brands={brands}
					teaCategories={teaCategories}
					isAutoSlug={isAutoSlug}
					onAutoSlugChange={setIsAutoSlug}
					idPrefix="edit"
				/>

				<div className="flex justify-end space-x-2 pt-6 border-t border-border">
					<Button
						type="button"
						variant="secondaryInverted"
						onClick={handleCancel}
					>
						Cancel
					</Button>
					<Button type="submit" variant="greenInverted" disabled={isSubmitting}>
						{isSubmitting ? "Updating..." : "Update Product"}
					</Button>
				</div>
			</form>
		</div>
	);
}
