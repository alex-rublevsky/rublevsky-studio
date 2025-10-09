import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { toast } from "sonner";
import { AdminProductCard } from "~/components/ui/dashboard/AdminProductCard";
import DeleteConfirmationDialog from "~/components/ui/dashboard/ConfirmationDialog";
import ProductVariationForm from "~/components/ui/dashboard/ProductVariationForm";
import { Button } from "~/components/ui/shared/Button";
import { Checkbox } from "~/components/ui/shared/Checkbox";
import {
	Drawer,
	DrawerBody,
	DrawerContent,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from "~/components/ui/shared/Drawer";
import { Input } from "~/components/ui/shared/Input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/shared/Select";
import { Switch } from "~/components/ui/shared/Switch";
import { Textarea } from "~/components/ui/shared/TextArea";
import { COUNTRY_OPTIONS } from "~/constants/countries";
import { cn } from "~/lib/utils";
import { createProduct } from "~/server_functions/dashboard/store/createProduct";
import { deleteProduct } from "~/server_functions/dashboard/store/deleteProduct";
import { getAllProducts } from "~/server_functions/dashboard/store/getAllProducts";
import { getProductBySlug } from "~/server_functions/dashboard/store/getProductBySlug";
import { updateProduct } from "~/server_functions/dashboard/store/updateProduct";
import type {
	Brand,
	Category,
	ProductFormData,
	ProductGroup,
	ProductVariationWithAttributes,
	ProductWithVariations,
	TeaCategory,
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

export const Route = createFileRoute("/dashboard/products")({
	component: RouteComponent,
});

function RouteComponent() {
	const _router = useRouter();

	// Generate unique IDs for form elements
	const editStockId = useId();
	const editCategoryId = useId();
	const editBrandId = useId();
	const editImagesId = useId();
	const editIsActiveId = useId();
	const editIsFeaturedId = useId();
	const addImagesId = useId();
	const addIsActiveId = useId();
	const addIsFeaturedId = useId();
	const editHasVariationsId = useId();
	const editWeightId = useId();
	const editShipsFromId = useId();
	const addHasVariationsId = useId();
	const addShipsFromId = useId();
	const editDiscountId = useId();
	const addDiscountId = useId();
	const addPriceId = useId();
	const addCategoryId = useId();
	const addBrandId = useId();
	const editProductFormId = useId();
	const createProductFormId = useId();
	const editPriceId = useId();

	// Products Query
	const {
		isPending,
		data: productsData,
		isError,
		refetch,
	} = useQuery<{
		groupedProducts: ProductGroup[];
		categories: Category[];
		teaCategories: TeaCategory[];
		brands: Brand[];
	}>({
		queryKey: ["dashboard-products"],
		queryFn: () => getAllProducts(),
	});

	const defaultFormData = {
		name: "",
		slug: "",
		description: "",
		price: "",
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

	// All state hooks at the top level
	const [formData, setFormData] = useState<ProductFormData>(defaultFormData);
	const [editFormData, setEditFormData] =
		useState<ProductFormData>(defaultFormData);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState("");
	const [isAutoSlug, setIsAutoSlug] = useState(true);
	const [isEditAutoSlug, setIsEditAutoSlug] = useState(false);
	const [isEditMode, setIsEditMode] = useState(false);
	const [editingProductId, setEditingProductId] = useState<number | null>(null);
	const [showEditModal, setShowEditModal] = useState(false);
	const [variations, setVariations] = useState<Variation[]>([]);
	const [editVariations, setEditVariations] = useState<Variation[]>([]);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [deletingProductId, setDeletingProductId] = useState<number | null>(
		null,
	);
	const [isDeleting, setIsDeleting] = useState(false);
	const [showCreateForm, setShowCreateForm] = useState(false);
	const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

	// Search state
	const [searchTerm, setSearchTerm] = useState("");

	// All useEffect hooks
	useEffect(() => {
		if (isAutoSlug && formData.name) {
			const slug = formData.name
				.toLowerCase()
				.replace(/[^\w\s-]/g, "")
				.replace(/\s+/g, "-")
				.replace(/-+/g, "-")
				.trim();
			setFormData((prev) => ({ ...prev, slug }));
		}
	}, [formData.name, isAutoSlug]);

	useEffect(() => {
		if (isEditAutoSlug && editFormData.name) {
			const slug = editFormData.name
				.toLowerCase()
				.replace(/[^\w\s-]/g, "")
				.replace(/\s+/g, "-")
				.replace(/-+/g, "-")
				.trim();
			setEditFormData((prev) => ({ ...prev, slug }));
		}
	}, [editFormData.name, isEditAutoSlug]);

	useEffect(() => {
		setFormData((prev) => ({
			...prev,
			variations: variations.map((v) => ({
				id: v.id.startsWith("temp-") ? undefined : parseInt(v.id, 10),
				sku: v.sku,
				price: v.price.toString(),
				stock: v.stock.toString(),
				sort: v.sort,
				shippingFrom: v.shippingFrom,
				attributes: v.attributes.map((attr) => ({
					attributeId: attr.attributeId,
					value: attr.value,
				})),
			})),
		}));
	}, [variations]);

	useEffect(() => {
		setEditFormData((prev) => ({
			...prev,
			variations: editVariations.map((v) => ({
				id: v.id.startsWith("temp-") ? undefined : parseInt(v.id, 10),
				sku: v.sku,
				price: v.price.toString(),
				stock: v.stock.toString(),
				sort: v.sort,
				shippingFrom: v.shippingFrom,
				attributes: v.attributes.map((attr) => ({
					attributeId: attr.attributeId,
					value: attr.value,
				})),
			})),
		}));
	}, [editVariations]);

	// Event handlers and utility functions
	const handleVariationsChange = (newVariations: Variation[]) => {
		setVariations(newVariations);
	};

	const handleEditVariationsChange = (newVariations: Variation[]) => {
		setEditVariations(newVariations);
	};

	const closeCreateModal = () => {
		setShowCreateForm(false);
		setFormData(defaultFormData);
		setVariations([]);
		setIsAutoSlug(true);
		setHasAttemptedSubmit(false);
		setError("");
	};

	const closeEditModal = () => {
		setShowEditModal(false);
		setEditingProductId(null);
		setEditFormData(defaultFormData);
		setEditVariations([]);
		setIsEditAutoSlug(false);
		setError("");
	};

	const formatPrice = (price: number | string | null): string => {
		if (price === null) return "$0.00";
		const numericPrice = typeof price === "string" ? parseFloat(price) : price;
		return new Intl.NumberFormat("en-CA", {
			style: "currency",
			currency: "CAD",
		}).format(numericPrice);
	};

	const getCategoryName = (slug: string | null): string | null => {
		if (!slug || !productsData) return null;
		const category = productsData.categories.find((cat) => cat.slug === slug);
		return category?.name || null;
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

	// Handle loading and error states
	if (!productsData) {
		return isPending ? (
			<div className="text-center py-4">Loading products...</div>
		) : isError ? (
			<div className="bg-destructive/20 border border-destructive text-destructive-foreground px-4 py-3 rounded">
				Error loading products
			</div>
		) : null;
	}

	const { groupedProducts, categories, teaCategories, brands } = productsData;

	// Filter grouped products based on search
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

	// Calculate total products count
	const totalProducts = groupedProducts.reduce(
		(sum, group) => sum + group.products.length,
		0,
	);
	const displayedProducts = displayGroupedProducts.reduce(
		(sum, group) => sum + group.products.length,
		0,
	);

	const handleChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>,
	) => {
		const { name, value, type } = e.target;
		const checked = (e.target as HTMLInputElement).checked;

		let updatedFormData = { ...formData };

		// Handle slug auto-generation
		if (name === "slug") {
			setIsAutoSlug(false);
		}

		// Handle tea categories checkbox
		if (name.startsWith("teaCategory-")) {
			const teaCategorySlug = name.replace("teaCategory-", "");
			const updatedTeaCategories = checked
				? [...(formData.teaCategories || []), teaCategorySlug]
				: (formData.teaCategories || []).filter(
						(slug) => slug !== teaCategorySlug,
					);

			updatedFormData = {
				...updatedFormData,
				teaCategories: updatedTeaCategories,
			};
		} else {
			// Handle regular form fields
			updatedFormData = {
				...updatedFormData,
				[name]: type === "checkbox" ? checked : value,
			};
		}

		// Handle variations creation
		if (name === "hasVariations" && checked && variations.length === 0) {
			const defaultVariation: Variation = {
				id: `temp-${Date.now()}`,
				sku: "",
				price: updatedFormData.price ? parseFloat(updatedFormData.price) : 0,
				stock: updatedFormData.stock ? parseInt(updatedFormData.stock, 10) : 0,
				sort: 0,
				shippingFrom: undefined,
				attributes: [],
			};
			setVariations([defaultVariation]);
		}

		setFormData(updatedFormData);
	};

	const handleEditChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>,
	) => {
		const { name, value, type } = e.target;
		const checked = (e.target as HTMLInputElement).checked;

		let updatedFormData = { ...editFormData };

		// Handle slug auto-generation
		if (name === "slug") {
			setIsEditAutoSlug(false);
		}

		// Handle tea categories checkbox
		if (name.startsWith("teaCategory-")) {
			const teaCategorySlug = name.replace("teaCategory-", "");
			const updatedTeaCategories = checked
				? [...(editFormData.teaCategories || []), teaCategorySlug]
				: (editFormData.teaCategories || []).filter(
						(slug) => slug !== teaCategorySlug,
					);

			updatedFormData = {
				...updatedFormData,
				teaCategories: updatedTeaCategories,
			};
		} else {
			// Handle regular form fields
			updatedFormData = {
				...updatedFormData,
				[name]: type === "checkbox" ? checked : value,
			};
		}

		// Handle variations creation
		if (name === "hasVariations" && checked && editVariations.length === 0) {
			const defaultVariation: Variation = {
				id: `temp-${Date.now()}`,
				sku: "",
				price: updatedFormData.price ? parseFloat(updatedFormData.price) : 0,
				stock: updatedFormData.stock ? parseInt(updatedFormData.stock, 10) : 0,
				sort: 0,
				shippingFrom: undefined,
				attributes: [],
			};
			setEditVariations([defaultVariation]);
		}

		setEditFormData(updatedFormData);
	};

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

			// Reset form state and close modal
			closeCreateModal();

			// Refresh data
			refetch();
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "An error occurred";
			setError(errorMessage);
			toast.error(errorMessage);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!editingProductId) {
			return;
		}

		setIsSubmitting(true);
		setError("");

		try {
			const formattedVariations = editVariations.map(
				(variation: Variation) => ({
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
				}),
			);

			const submissionData = {
				...editFormData,
				variations: formattedVariations,
			};

			await updateProduct({
				data: { id: editingProductId, data: submissionData },
			});

			toast.success("Product updated successfully!");

			// Reset form state
			closeEditModal();

			// Refresh data
			refetch();
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "An error occurred";
			setError(errorMessage);
			toast.error(errorMessage);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDeleteClick = (product: ProductWithVariations) => {
		setDeletingProductId(product.id);
		setShowDeleteDialog(true);
	};

	const handleDeleteConfirm = async () => {
		if (!deletingProductId) return;

		setIsDeleting(true);
		setError("");

		try {
			await deleteProduct({ data: { id: deletingProductId } });

			toast.success("Product deleted successfully!");
			setShowDeleteDialog(false);
			setDeletingProductId(null);

			// Refresh data
			refetch();
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
			toast.error(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setIsDeleting(false);
		}
	};

	const handleDeleteCancel = () => {
		setShowDeleteDialog(false);
		setDeletingProductId(null);
	};

	const handleEdit = async (product: ProductWithVariations) => {
		setEditingProductId(product.id);
		setShowEditModal(true);
		setIsEditMode(true);
		setIsEditAutoSlug(false);

		try {
			// Fetch complete product data including variations and tea categories
			const productWithDetails = await getProductBySlug({
				data: { id: product.id },
			});

			// Convert variations to the frontend format
			const formattedVariations =
				productWithDetails.variations?.map(
					(variation: ProductVariationWithAttributes) => ({
						id: variation.id.toString(),
						sku: variation.sku,
						price: variation.price,
						stock: variation.stock,
						sort: variation.sort ?? 0, // Handle null sort values
						shippingFrom: variation.shippingFrom || undefined,
						attributes: variation.attributes || [],
					}),
				) || [];

			setEditFormData({
				name: productWithDetails.name,
				slug: productWithDetails.slug,
				description: productWithDetails.description || "",
				price: productWithDetails.price.toString(),
				categorySlug: productWithDetails.categorySlug || "",
				brandSlug: productWithDetails.brandSlug || "",
				teaCategories: productWithDetails.teaCategories || [],
				stock: productWithDetails.stock.toString(),
				isActive: productWithDetails.isActive,
				isFeatured: productWithDetails.isFeatured,
				discount: productWithDetails.discount,
				hasVariations: productWithDetails.hasVariations,
				weight: productWithDetails.weight || "",
				images: productWithDetails.images || "",
				shippingFrom: productWithDetails.shippingFrom || "",
				variations: [],
			});

			// Set the variations separately
			setEditVariations(formattedVariations);
		} catch (error) {
			console.error("Error fetching product details:", error);
			toast.error("Failed to load product details");

			// Fallback to basic product data from the list
			setEditFormData({
				name: product.name,
				slug: product.slug,
				description: product.description || "",
				price: product.price.toString(),
				categorySlug: product.categorySlug || "",
				brandSlug: product.brandSlug || "",
				teaCategories: product.teaCategories || [],
				stock: product.stock.toString(),
				isActive: product.isActive,
				isFeatured: product.isFeatured,
				discount: product.discount,
				hasVariations: product.hasVariations,
				weight: product.weight || "",
				images: product.images || "",
				shippingFrom: product.shippingFrom || "",
				variations: [],
			});
			setEditVariations([]);
		}
	};

	return (
		<div>
			<div className="fixed bottom-3 right-3 z-50">
				<Button
					onClick={() => setShowCreateForm(true)}
					size="lg"
					className="bg-black text-white hover:bg-white/60 hover:text-black hover:backdrop-blur-md transition-all duration-300"
				>
					<Plus />
					Add New Product
				</Button>
			</div>

			{/* Products List */}
			<div className="space-y-6">
				{/* Products Header with Search */}
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4">
					<p className="text-muted-foreground">
						{searchTerm
							? `${displayedProducts} of ${totalProducts} products`
							: `${totalProducts} products`}
					</p>

					{/* Search */}
					<Input
						placeholder="Search products..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="w-full sm:w-64"
					/>
				</div>

				{isPending ? (
					<div className="flex items-center justify-center py-12 px-4">
						<div className="text-center space-y-4">
							<div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
							<p className="text-muted-foreground">Loading products...</p>
						</div>
					</div>
				) : displayGroupedProducts.length === 0 ? (
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
									<h2 className="text-2xl font-semibold text-foreground">
										{group.title}
									</h2>
									<p className="text-sm text-muted-foreground mt-1">
										{group.products.length}{" "}
										{group.products.length === 1 ? "product" : "products"}
									</p>
								</div>

								{/* Products Grid */}
								<div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6 px-4">
									{group.products.map((product) => (
										<AdminProductCard
											key={product.id}
											product={product}
											onEdit={handleEdit}
											onDelete={handleDeleteClick}
											formatPrice={formatPrice}
											getCategoryName={getCategoryName}
											getTeaCategoryNames={getTeaCategoryNames}
										/>
									))}
								</div>

								{/* Divider between groups (except for the last one) */}
								{displayGroupedProducts.indexOf(group) <
									displayGroupedProducts.length - 1 && (
									<div className="border-b border-border/40 mt-8 mx-4" />
								)}
							</div>
						))}
					</div>
				)}
			</div>

			{/* Replace Edit Modal with Drawer */}
			<Drawer open={showEditModal} onOpenChange={setShowEditModal}>
				<DrawerContent>
					<DrawerHeader>
						<DrawerTitle>Edit Product</DrawerTitle>
					</DrawerHeader>

					<DrawerBody>
						{error && isEditMode && (
							<div className="bg-destructive/20 border border-destructive text-destructive-foreground px-4 py-3 rounded mb-4">
								{error}
							</div>
						)}

						<form
							onSubmit={handleUpdate}
							className="space-y-6"
							id={editProductFormId}
						>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<Input
									label="Name"
									type="text"
									name="name"
									value={editFormData.name}
									onChange={handleEditChange}
									required
								/>

								<Input
									label="Slug"
									type="text"
									name="slug"
									value={editFormData.slug}
									onChange={handleEditChange}
									required
								/>
								<div className="md:col-span-2">
									<Textarea
										label="Description"
										name="description"
										value={editFormData.description}
										onChange={handleEditChange}
										rows={3}
									/>
								</div>

								<div>
									<label
										htmlFor={editPriceId}
										className="block text-sm font-medium mb-1"
									>
										Price
									</label>
									<Input
										id={editPriceId}
										type="number"
										name="price"
										value={editFormData.price}
										onChange={handleEditChange}
										step="0.01"
										required
									/>
								</div>

								<div>
									<label
										htmlFor={editStockId}
										className="block text-sm font-medium mb-1"
									>
										Stock
									</label>
									<Input
										id={editStockId}
										type="number"
										name="stock"
										value={editFormData.stock}
										onChange={handleEditChange}
										required
									/>
								</div>

								<div>
									<label
										htmlFor={editCategoryId}
										className="block text-sm font-medium mb-1"
									>
										Category
									</label>
									<Select
										name="categorySlug"
										value={editFormData.categorySlug}
										onValueChange={(value: string) =>
											handleEditChange({
												target: { name: "categorySlug", value },
											} as React.ChangeEvent<HTMLSelectElement>)
										}
										required
									>
										<SelectTrigger id={editCategoryId}>
											<SelectValue placeholder="Select a category" />
										</SelectTrigger>
										<SelectContent>
											{categories.map((category) => (
												<SelectItem key={category.slug} value={category.slug}>
													{category.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								<div>
									<label
										htmlFor={editBrandId}
										className="block text-sm font-medium mb-1"
									>
										Brand (optional)
									</label>
									<Select
										name="brandSlug"
										value={editFormData.brandSlug || undefined}
										onValueChange={(value: string) =>
											handleEditChange({
												target: {
													name: "brandSlug",
													value: value || null,
												},
											} as React.ChangeEvent<HTMLSelectElement>)
										}
									>
										<SelectTrigger id={editBrandId}>
											<SelectValue placeholder="Select a brand (optional)" />
										</SelectTrigger>
										<SelectContent>
											{brands.map((brand) => (
												<SelectItem key={brand.slug} value={brand.slug}>
													{brand.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								<fieldset>
									<legend className="block text-sm font-medium mb-1">
										Tea Categories
									</legend>
									<div className="space-y-2 border border-input rounded-md p-3 h-48 overflow-y-auto">
										{teaCategories.map((category) => (
											<label
												key={category.slug}
												htmlFor={`edit-tea-category-${category.slug}`}
												className="flex items-center space-x-2"
											>
												<Checkbox
													id={`edit-tea-category-${category.slug}`}
													name={`teaCategory-${category.slug}`}
													checked={
														editFormData.teaCategories?.includes(
															category.slug,
														) || false
													}
													onCheckedChange={(checked) => {
														const newCategories = checked
															? [
																	...(editFormData.teaCategories || []),
																	category.slug,
																]
															: (editFormData.teaCategories || []).filter(
																	(slug) => slug !== category.slug,
																);
														setEditFormData({
															...editFormData,
															teaCategories: newCategories,
														});
													}}
												/>
												<span className="text-sm">{category.name}</span>
											</label>
										))}
									</div>
								</fieldset>

								<div>
									<label
										htmlFor={editImagesId}
										className="block text-sm font-medium mb-1"
									>
										Images (comma-separated)
									</label>
									<Textarea
										id={editImagesId}
										name="images"
										value={editFormData.images}
										onChange={handleEditChange}
										placeholder="image1.jpg, image2.jpg, image3.jpg"
										className="h-48 overflow-y-auto resize-none"
										rows={6}
									/>
								</div>

								<div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
									<div className="flex items-center">
										<Switch
											id={editIsActiveId}
											name="isActive"
											checked={editFormData.isActive}
											onChange={handleEditChange}
										/>
										<label htmlFor={editIsActiveId} className="ml-2 text-sm">
											Active
										</label>
									</div>

									<div className="flex items-center">
										<Switch
											id={editIsFeaturedId}
											name="isFeatured"
											checked={editFormData.isFeatured}
											onChange={handleEditChange}
										/>
										<label htmlFor={editIsFeaturedId} className="ml-2 text-sm">
											Featured
										</label>
									</div>

									<div className="flex items-center">
										<Input
											id={editDiscountId}
											type="number"
											name="discount"
											value={editFormData.discount || ""}
											onChange={handleEditChange}
											placeholder="Discount %"
											min="0"
											max="100"
											className="w-24"
										/>
										<label htmlFor={editDiscountId} className="ml-2 text-sm">
											% Off
										</label>
									</div>

									<div className="flex items-center">
										<Switch
											id={editHasVariationsId}
											name="hasVariations"
											checked={editFormData.hasVariations}
											onChange={handleEditChange}
										/>
										<label
											htmlFor={editHasVariationsId}
											className="ml-2 text-sm"
										>
											Has Variations
										</label>
									</div>
								</div>

								<div>
									<label
										htmlFor={editWeightId}
										className="block text-sm font-medium mb-1"
									>
										Weight (in grams)
									</label>
									<Input
										id={editWeightId}
										type="text"
										name="weight"
										value={editFormData.weight}
										onChange={handleEditChange}
										placeholder="Enter weight in grams"
									/>
								</div>

								<div>
									<label
										htmlFor={editShipsFromId}
										className="block text-sm font-medium mb-1"
									>
										Ships From
									</label>
									<Select
										name="shippingFrom"
										value={editFormData.shippingFrom || "NONE"}
										onValueChange={(value: string) =>
											handleEditChange({
												target: {
													name: "shippingFrom",
													value: value === "NONE" ? "" : value,
												},
											} as React.ChangeEvent<HTMLSelectElement>)
										}
									>
										<SelectTrigger id={editShipsFromId}>
											<SelectValue placeholder="Choose shipping location" />
										</SelectTrigger>
										<SelectContent>
											{COUNTRY_OPTIONS.map((country) => (
												<SelectItem key={country.code} value={country.code}>
													{country.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>

							{/* Add the variations form when hasVariations is checked */}
							{editFormData.hasVariations && (
								<div className="mt-6">
									<ProductVariationForm
										variations={editVariations}
										onChange={handleEditVariationsChange}
									/>
								</div>
							)}
						</form>
					</DrawerBody>

					<DrawerFooter className="border-t border-border bg-background">
						<div className="flex justify-end space-x-2">
							<Button
								variant="secondaryInverted"
								type="button"
								onClick={closeEditModal}
							>
								Cancel
							</Button>
							<Button
								variant="greenInverted"
								type="submit"
								form={editProductFormId}
								disabled={isSubmitting}
							>
								{isSubmitting ? "Updating..." : "Update Product"}
							</Button>
						</div>
					</DrawerFooter>
				</DrawerContent>
			</Drawer>

			{/* Create Product Drawer */}
			<Drawer open={showCreateForm} onOpenChange={setShowCreateForm}>
				<DrawerContent>
					<DrawerHeader>
						<DrawerTitle>Add New Product</DrawerTitle>
					</DrawerHeader>

					<DrawerBody>
						{error && !isEditMode && (
							<div className="bg-destructive/20 border border-destructive text-destructive-foreground px-4 py-3 rounded mb-4">
								{error}
							</div>
						)}

						<form
							onSubmit={handleSubmit}
							className="space-y-6"
							id={createProductFormId}
						>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<Input
									label="Product Name"
									type="text"
									name="name"
									value={formData.name}
									onChange={handleChange}
									required
									className={
										hasAttemptedSubmit && !formData.name ? "border-red-500" : ""
									}
								/>

								<div className="flex items-end">
									<Input
										label="Slug (Auto-generated from name)"
										type="text"
										name="slug"
										value={formData.slug}
										onChange={handleChange}
										required
										className={cn(
											"flex-1",
											hasAttemptedSubmit && !formData.slug
												? "border-red-500"
												: "",
										)}
									/>
									<Button
										type="button"
										size="sm"
										variant="outline"
										onClick={() => {
											setIsAutoSlug(true);
											if (formData.name) {
												const slug = formData.name
													.toLowerCase()
													.replace(/[^\w\s-]/g, "")
													.replace(/\s+/g, "-")
													.replace(/-+/g, "-")
													.trim();

												setFormData((prev) => ({
													...prev,
													slug,
												}));
											}
										}}
										className="ml-2"
									>
										Reset
									</Button>
								</div>

								<div className="md:col-span-2">
									<Textarea
										label="Description"
										name="description"
										value={formData.description}
										onChange={handleChange}
										rows={3}
									/>
								</div>

								<div>
									<label
										htmlFor={addPriceId}
										className="block text-sm font-medium mb-1"
									>
										Price (CAD)
									</label>
									<div className="relative">
										<Input
											id={addPriceId}
											type="number"
											name="price"
											value={formData.price}
											onChange={handleChange}
											required
											step="0.01"
											min="0"
											className={cn(
												"pl-7",
												hasAttemptedSubmit && !formData.price
													? "border-red-500"
													: "",
											)}
										/>
										<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
											<span className="text-muted-foreground">$</span>
										</div>
									</div>
								</div>

								<Input
									label="Stock"
									type="number"
									name="stock"
									value={formData.stock}
									onChange={handleChange}
									min="0"
								/>

								<div>
									<label
										htmlFor={addCategoryId}
										className="block text-sm font-medium mb-1"
									>
										Category
									</label>
									<Select
										value={formData.categorySlug}
										onValueChange={(value) => {
											setFormData({
												...formData,
												categorySlug: value,
											});
										}}
										required
									>
										<SelectTrigger
											id={addCategoryId}
											className={
												hasAttemptedSubmit && !formData.categorySlug
													? "border-red-500"
													: ""
											}
										>
											<SelectValue placeholder="Select a category" />
										</SelectTrigger>
										<SelectContent>
											{categories.map((category: Category) => (
												<SelectItem key={category.slug} value={category.slug}>
													{category.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								<div>
									<label
										htmlFor={addBrandId}
										className="block text-sm font-medium mb-1"
									>
										Brand (optional)
									</label>
									<Select
										value={formData.brandSlug || undefined}
										onValueChange={(value) => {
											setFormData({
												...formData,
												brandSlug: value || null,
											});
										}}
									>
										<SelectTrigger id={addBrandId}>
											<SelectValue placeholder="Select a brand (optional)" />
										</SelectTrigger>
										<SelectContent>
											{brands.map((brand: Brand) => (
												<SelectItem key={brand.slug} value={brand.slug}>
													{brand.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								<fieldset>
									<legend className="block text-sm font-medium mb-1">
										Tea Categories
									</legend>
									<div className="space-y-2 border border-input rounded-md p-3 h-48 overflow-y-auto">
										{teaCategories.map((category) => (
											<label
												key={category.slug}
												htmlFor={`add-tea-category-${category.slug}`}
												className="flex items-center space-x-2"
											>
												<Checkbox
													id={`add-tea-category-${category.slug}`}
													name={`teaCategory-${category.slug}`}
													checked={
														formData.teaCategories?.includes(category.slug) ||
														false
													}
													onCheckedChange={(checked) => {
														const newCategories = checked
															? [
																	...(formData.teaCategories || []),
																	category.slug,
																]
															: (formData.teaCategories || []).filter(
																	(slug) => slug !== category.slug,
																);
														setFormData({
															...formData,
															teaCategories: newCategories,
														});
													}}
												/>
												<span className="text-sm">{category.name}</span>
											</label>
										))}
									</div>
								</fieldset>

								<div>
									<label
										htmlFor={addImagesId}
										className="block text-sm font-medium mb-1"
									>
										Images (comma-separated)
									</label>
									<Textarea
										id={addImagesId}
										name="images"
										value={formData.images}
										onChange={handleChange}
										placeholder="image1.jpg, image2.jpg, image3.jpg"
										className="h-48 overflow-y-auto resize-none"
										rows={6}
									/>
									<p className="mt-1 text-xs text-muted-foreground">
										Enter image identifiers separated by commas. These should
										match your R2 image filenames.
									</p>
								</div>

								<div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
									<div className="flex items-center">
										<Switch
											id={addIsActiveId}
											name="isActive"
											checked={formData.isActive}
											onChange={handleChange}
										/>
										<label htmlFor={addIsActiveId} className="ml-2 text-sm">
											Active
										</label>
									</div>

									<div className="flex items-center">
										<Switch
											id={addIsFeaturedId}
											name="isFeatured"
											checked={formData.isFeatured}
											onChange={handleChange}
										/>
										<label htmlFor={addIsFeaturedId} className="ml-2 text-sm">
											Featured
										</label>
									</div>

									<div className="flex items-center">
										<Input
											id={addDiscountId}
											type="number"
											name="discount"
											value={formData.discount || ""}
											onChange={handleChange}
											placeholder="Discount %"
											min="0"
											max="100"
											className="w-24"
										/>
										<label htmlFor={addDiscountId} className="ml-2 text-sm">
											% Off
										</label>
									</div>

									<div className="flex items-center">
										<Switch
											id={addHasVariationsId}
											name="hasVariations"
											checked={formData.hasVariations}
											onChange={handleChange}
										/>
										<label
											htmlFor={addHasVariationsId}
											className="ml-2 text-sm"
										>
											Has Variations
										</label>
									</div>
								</div>

								<Input
									label="Weight (in grams)"
									type="text"
									name="weight"
									value={formData.weight}
									onChange={handleChange}
									placeholder="Enter weight in grams"
								/>

								<div>
									<label
										htmlFor={addShipsFromId}
										className="block text-sm font-medium mb-1"
									>
										Ships From
									</label>
									<Select
										value={formData.shippingFrom || "NONE"}
										onValueChange={(value) => {
											setFormData({
												...formData,
												shippingFrom: value === "NONE" ? "" : value,
											});
										}}
									>
										<SelectTrigger id={addShipsFromId}>
											<SelectValue placeholder="Shipping from..." />
										</SelectTrigger>
										<SelectContent>
											{COUNTRY_OPTIONS.map((country) => (
												<SelectItem key={country.code} value={country.code}>
													{country.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>

							{/* Add the variations form when hasVariations is checked */}
							{formData.hasVariations && (
								<div className="mt-6">
									<ProductVariationForm
										variations={variations}
										onChange={handleVariationsChange}
									/>
								</div>
							)}
						</form>
					</DrawerBody>

					<DrawerFooter className="border-t border-border bg-background">
						<div className="flex justify-end space-x-2">
							<Button
								variant="secondaryInverted"
								type="button"
								onClick={closeCreateModal}
							>
								Cancel
							</Button>
							<Button
								variant="greenInverted"
								type="submit"
								form={createProductFormId}
								disabled={isSubmitting}
							>
								{isSubmitting ? "Creating..." : "Create Product"}
							</Button>
						</div>
					</DrawerFooter>
				</DrawerContent>
			</Drawer>

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
