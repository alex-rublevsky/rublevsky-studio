import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ProductForm } from "~/components/ui/dashboard/ProductForm";
import { Button } from "~/components/ui/shared/Button";
import { createProduct } from "~/server_functions/dashboard/store/createProduct";
import { getAllProducts } from "~/server_functions/dashboard/store/getAllProducts";
import type { ProductFormData, VariationAttribute } from "~/types";

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

export const Route = createFileRoute("/dashboard/new")({
	component: RouteComponent,
	// Loader prefetches data before component renders
	loader: async ({ context: { queryClient } }) => {
		// Ensure data is loaded before component renders
		await queryClient.ensureQueryData(productsQueryOptions());
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

	// Use suspense query - data is guaranteed to be loaded by the loader
	const { data: productsData } = useSuspenseQuery(productsQueryOptions());

	const [formData, setFormData] = useState<ProductFormData>(defaultFormData);
	const [variations, setVariations] = useState<Variation[]>([]);
	const [deletedImages, setDeletedImages] = useState<string[]>([]);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState("");
	const [isAutoSlug, setIsAutoSlug] = useState(true);
	const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setHasAttemptedSubmit(true);

		// Collect validation errors
		const errors: string[] = [];
		if (!formData.name) errors.push("Product Name");
		if (!formData.slug) errors.push("Slug");
		if (!formData.price) errors.push("Price");
		if (!formData.categorySlug) errors.push("Category");

		if (errors.length > 0) {
			toast.error(`Please fill in all required fields: ${errors.join(", ")}`);
			return;
		}

		setIsSubmitting(true);
		setError("");

		try {
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
				teaCategories: formData.teaCategories || undefined,
			};

			await createProduct({ data: submissionData });

			toast.success("Product added successfully!");

			// Invalidate dashboard products cache
			queryClient.invalidateQueries({
				queryKey: ["dashboard-products"],
			});

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
				<h1 className="text-3xl font-bold">Add New Product</h1>
				<p className="text-muted-foreground mt-2">
					Create a new product for your store
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
					idPrefix="create"
					hasAttemptedSubmit={hasAttemptedSubmit}
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
						{isSubmitting ? "Creating..." : "Create Product"}
					</Button>
				</div>
			</form>
		</div>
	);
}
