import { useCallback, useEffect, useId } from "react";
import { DescriptionField } from "~/components/ui/dashboard/DescriptionField";
import { ImageUpload } from "~/components/ui/dashboard/ImageUpload";
import { DrawerSection } from "~/components/ui/dashboard/ProductFormSection";
import { ProductSettingsFields } from "~/components/ui/dashboard/ProductSettingsFields";
import ProductVariationForm from "~/components/ui/dashboard/ProductVariationForm";
import { SlugField } from "~/components/ui/dashboard/SlugField";
import { TeaCategoriesSelector } from "~/components/ui/dashboard/TeaCategoriesSelector";
import { Input } from "~/components/ui/shared/Input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/shared/Select";
import {
	getCountryFlag,
	getCountryName,
	SHIPPING_COUNTRIES,
} from "~/constants/countries";
import { generateSlug, useSlugGeneration } from "~/hooks/useSlugGeneration";
import type {
	Brand,
	Category,
	ProductFormData,
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

interface ProductFormProps {
	formData: ProductFormData;
	onFormDataChange: (data: ProductFormData) => void;
	variations: Variation[];
	onVariationsChange: (variations: Variation[]) => void;
	deletedImages: string[];
	onDeletedImagesChange: (images: string[]) => void;
	categories: Category[];
	brands: Brand[];
	teaCategories: TeaCategory[];
	isAutoSlug: boolean;
	onAutoSlugChange: (isAuto: boolean) => void;
	idPrefix?: "add" | "edit" | "create";
	hasAttemptedSubmit?: boolean;
}

export function ProductForm({
	formData,
	onFormDataChange,
	variations,
	onVariationsChange,
	deletedImages: _deletedImages, // Renamed to indicate unused
	onDeletedImagesChange,
	categories,
	brands,
	teaCategories,
	isAutoSlug,
	onAutoSlugChange,
	idPrefix = "create",
	hasAttemptedSubmit = false,
}: ProductFormProps) {
	// Generate unique IDs for form elements
	const priceId = useId();
	const stockId = useId();
	const categoryId = useId();
	const brandId = useId();
	const weightId = useId();
	const shipsFromId = useId();

	// Stable callback for slug generation
	const handleSlugChange = useCallback(
		(slug: string) => {
			onFormDataChange({ ...formData, slug });
		},
		[formData, onFormDataChange],
	);

	// Auto-slug generation hook
	useSlugGeneration(formData.name, isAutoSlug, handleSlugChange);

	// Sync variations to formData
	// Note: formData and onFormDataChange are intentionally excluded from dependencies
	// to prevent infinite update loops. This effect should only run when variations change.
	// biome-ignore lint/correctness/useExhaustiveDependencies: formData and onFormDataChange excluded to prevent loops
	useEffect(() => {
		onFormDataChange({
			...formData,
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
		});
	}, [variations]);

	const handleChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>,
	) => {
		const { name, value, type } = e.target;
		const checked = (e.target as HTMLInputElement).checked;

		let updatedFormData: ProductFormData = { ...formData };

		// Handle slug auto-generation
		if (name === "slug") {
			onAutoSlugChange(false);
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
			if (name === "discount") {
				// Handle discount field specifically - allow empty string to be converted to null
				updatedFormData = {
					...updatedFormData,
					discount: value === "" ? null : parseInt(value, 10) || null,
				};
			} else {
				updatedFormData = {
					...updatedFormData,
					[name]: type === "checkbox" ? checked : value,
				};
			}
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
			onVariationsChange([defaultVariation]);
		}

		onFormDataChange(updatedFormData);
	};

	const handleImagesChange = (images: string, deletedImagesList?: string[]) => {
		onFormDataChange({ ...formData, images });
		if (deletedImagesList) {
			onDeletedImagesChange(deletedImagesList);
		}
	};

	return (
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
			{/* Left Column - Images, Settings, Description */}
			<div className="space-y-4 flex flex-col">
				{/* Product Images Block */}
				<DrawerSection variant="default">
					<ImageUpload
						currentImages={formData.images}
						onImagesChange={handleImagesChange}
						folder="products"
						slug={formData.slug}
					/>
				</DrawerSection>

				{/* Settings Block */}
				<DrawerSection variant="default" title="Settings">
					<ProductSettingsFields
						isActive={formData.isActive}
						isFeatured={formData.isFeatured}
						discount={formData.discount}
						hasVariations={formData.hasVariations}
						onIsActiveChange={handleChange}
						onIsFeaturedChange={handleChange}
						onDiscountChange={handleChange}
						onHasVariationsChange={handleChange}
						idPrefix={idPrefix === "create" ? "add" : idPrefix}
					/>
				</DrawerSection>

				{/* Description Block - flex-1 to take remaining space */}
				<DrawerSection
					variant="default"
					className="flex-1"
					style={{ minHeight: "7rem" }}
				>
					<DescriptionField
						name="description"
						value={formData.description}
						onChange={handleChange}
						className="h-full"
					/>
				</DrawerSection>
			</div>

			{/* Right Column - Basic Info and Tea Categories */}
			<DrawerSection variant="default" title="Basic Information">
				<div className="grid grid-cols-1 gap-4">
					<Input
						label={idPrefix === "edit" ? "Name" : "Product Name"}
						type="text"
						name="name"
						value={formData.name}
						onChange={handleChange}
						required
						className={
							hasAttemptedSubmit && !formData.name ? "border-red-500" : ""
						}
					/>
					<SlugField
						slug={formData.slug}
						name={formData.name}
						isAutoSlug={isAutoSlug}
						onSlugChange={(slug) => {
							onAutoSlugChange(false);
							onFormDataChange({ ...formData, slug });
						}}
						onAutoSlugChange={(isAuto) => {
							onAutoSlugChange(isAuto);
							if (isAuto && formData.name) {
								const generated = generateSlug(formData.name);
								onFormDataChange({ ...formData, slug: generated });
							}
						}}
						className={
							hasAttemptedSubmit && !formData.slug ? "border-red-500" : ""
						}
						idPrefix={idPrefix}
					/>

					{/* Two column layout for basic information fields */}
					<div className="grid grid-cols-2 gap-4">
						{/* Column 1: Price */}
						<div>
							<Input
								id={priceId}
								type="number"
								name="price"
								label="Price (CAD)"
								value={formData.price}
								onChange={handleChange}
								step="0.01"
								required
								min="0"
								className={
									hasAttemptedSubmit && !formData.price ? "border-red-500" : ""
								}
							/>
						</div>

						{/* Column 2: Stock */}
						<div>
							<Input
								id={stockId}
								type="number"
								name="stock"
								label="Stock"
								value={formData.stock}
								onChange={handleChange}
								required
								min="0"
							/>
						</div>

						{/* Column 1: Category */}
						<div>
							<label
								htmlFor={categoryId}
								className="block text-sm font-medium mb-1"
							>
								Category
							</label>
							<Select
								value={formData.categorySlug}
								onValueChange={(value: string) =>
									handleChange({
										target: { name: "categorySlug", value },
									} as React.ChangeEvent<HTMLSelectElement>)
								}
								required
							>
								<SelectTrigger
									id={categoryId}
									className={
										hasAttemptedSubmit && !formData.categorySlug
											? "border-red-500"
											: ""
									}
								>
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

						{/* Column 2: Brand */}
						<div>
							<label
								htmlFor={brandId}
								className="block text-sm font-medium mb-1"
							>
								Brand (optional)
							</label>
							<Select
								value={formData.brandSlug || undefined}
								onValueChange={(value: string) =>
									handleChange({
										target: {
											name: "brandSlug",
											value: value || null,
										},
									} as React.ChangeEvent<HTMLSelectElement>)
								}
							>
								<SelectTrigger id={brandId}>
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

						{/* Column 1: Weight */}
						<div>
							<Input
								id={weightId}
								type="text"
								name="weight"
								label="Weight (in grams)"
								value={formData.weight}
								onChange={handleChange}
								placeholder="Enter weight in grams"
							/>
						</div>

						{/* Column 2: Ships From */}
						<div className="w-24">
							<label
								htmlFor={shipsFromId}
								className="block text-sm font-medium mb-1"
							>
								Ships From
							</label>
							<Select
								value={formData.shippingFrom || "NONE"}
								onValueChange={(value: string) =>
									handleChange({
										target: {
											name: "shippingFrom",
											value: value === "NONE" ? "" : value,
										},
									} as React.ChangeEvent<HTMLSelectElement>)
								}
							>
								<SelectTrigger id={shipsFromId} className="w-24">
									<SelectValue placeholder="Choose shipping location">
										{getCountryFlag(formData.shippingFrom || undefined) || ""}
									</SelectValue>
								</SelectTrigger>
								<SelectContent>
									{SHIPPING_COUNTRIES.map((code) => (
										<SelectItem key={code} value={code}>
											{getCountryName(code)}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>
				</div>

				{/* Tea Categories Block */}
				<TeaCategoriesSelector
					teaCategories={teaCategories}
					selectedCategories={formData.teaCategories || []}
					onCategoryChange={(categorySlug, checked) => {
						const newCategories = checked
							? [...(formData.teaCategories || []), categorySlug]
							: (formData.teaCategories || []).filter(
									(slug) => slug !== categorySlug,
								);
						onFormDataChange({
							...formData,
							teaCategories: newCategories,
						});
					}}
					idPrefix={idPrefix}
				/>
			</DrawerSection>

			{/* Variations Block */}
			{formData.hasVariations && (
				<DrawerSection variant="default" className="lg:col-span-2">
					<ProductVariationForm
						variations={variations}
						onChange={onVariationsChange}
					/>
				</DrawerSection>
			)}
		</div>
	);
}
