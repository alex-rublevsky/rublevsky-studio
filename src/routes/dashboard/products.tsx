import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { DEPLOY_URL } from "~/utils/store";
import { Plus } from "lucide-react";

import {
  Product,
  Category,
  Brand,
  ProductFormData,
  TeaCategory,
  ProductWithVariations,
  VariationAttribute,
} from "~/types";
import { Image } from "~/components/ui/shared/Image";
import ProductVariationForm from "~/components/ui/dashboard/ProductVariationForm";

import DeleteConfirmationDialog from "~/components/ui/dashboard/ConfirmationDialog";
import { toast } from "sonner";
import { Input } from "~/components/ui/shared/Input";
import { Button } from "~/components/ui/shared/Button";
import { Textarea } from "~/components/ui/shared/TextArea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/dashboard/Select";
import { Switch } from "~/components/ui/shared/Switch";
import { Badge } from "~/components/ui/shared/Badge";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerBody,
} from "~/components/ui/shared/Drawer";
import { cn } from "~/lib/utils";

interface Variation {
  id: string;
  sku: string;
  price: number;
  stock: number;
  sort: number;
  attributes: VariationAttribute[];
}

export const Route = createFileRoute("/dashboard/products")({
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();

  // Products Query
  const {
    isPending,
    data: productsData,
    isError,
    refetch,
  } = useQuery<{
    products: Product[];
    categories: Category[];
    teaCategories: TeaCategory[];
    brands: Brand[];
  }>({
    queryKey: ["dashboard-products"],
    queryFn: () =>
      fetch(`${DEPLOY_URL}/api/dashboard/products`).then((res) => res.json()),
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
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

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
        id: v.id.startsWith("temp-") ? undefined : parseInt(v.id),
        sku: v.sku,
        price: v.price.toString(),
        stock: v.stock.toString(),
        sort: v.sort,
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
        id: v.id.startsWith("temp-") ? undefined : parseInt(v.id),
        sku: v.sku,
        price: v.price.toString(),
        stock: v.stock.toString(),
        sort: v.sort,
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
            ?.name
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

  const { products, categories, teaCategories, brands } = productsData;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
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
            (slug) => slug !== teaCategorySlug
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
        stock: updatedFormData.stock ? parseInt(updatedFormData.stock) : 0,
        sort: 0,
        attributes: [],
      };
      setVariations([defaultVariation]);
    }

    setFormData(updatedFormData);
  };

  const handleEditChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
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
            (slug) => slug !== teaCategorySlug
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
        stock: updatedFormData.stock ? parseInt(updatedFormData.stock) : 0,
        sort: 0,
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
          : parseInt(variation.id),
        sku: variation.sku,
        price: variation.price.toString(),
        stock: variation.stock.toString(),
        sort: variation.sort,
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

      // await createProduct(submissionData);
      toast.success("Product added successfully!");

      // Reset form state
      setFormData(defaultFormData);
      setVariations([]);
      setIsAutoSlug(true);
      setHasAttemptedSubmit(false);

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
            : parseInt(variation.id),
          sku: variation.sku,
          price: variation.price.toString(),
          stock: variation.stock.toString(),
          sort: variation.sort,
          attributes: variation.attributes.map((attr: VariationAttribute) => ({
            attributeId: attr.attributeId,
            value: attr.value,
          })),
        })
      );

      const submissionData = {
        ...editFormData,
        variations: formattedVariations,
      };

      // await updateProduct(editingProductId, submissionData);
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

  const handleDeleteClick = (product: Product) => {
    setDeletingProductId(product.id);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProductId) return;

    setIsDeleting(true);
    setError("");

    try {
      // await deleteProduct(deletingProductId);
      toast.success("Product deleted successfully!");
      setShowDeleteDialog(false);
      setDeletingProductId(null);
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

  const handleEdit = async (product: Product) => {
    setEditingProductId(product.id);
    setShowEditModal(true);
    setIsEditMode(true);
    setIsEditAutoSlug(false);

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
      variations: [],
    });
  };

  return (
    <div className="space-y-8">
      <div className="fixed bottom-0 right-2 z-50">
        <Button onClick={() => setShowCreateForm(!showCreateForm)} size="lg">
          <Plus />
          {showCreateForm ? "Hide Form" : "Add New Product"}
        </Button>
      </div>

      {/* Create Product Form */}
      {showCreateForm && (
        <div className="bg-card rounded-lg shadow-sm border border-border p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Add New Product</h2>

          {error && !isEditMode && (
            <div className="bg-destructive/20 border border-destructive text-destructive-foreground px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
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
                  className={
                    hasAttemptedSubmit && !formData.slug ? "border-red-500" : ""
                  }
                />
                <Button
                  type="button"
                  size="sm"
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
                  className="ml-2 mt-2"
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
                  rows={4}
                />
              </div>

              <div className="relative">
                <Input
                  label="Price (CAD)"
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
                      : ""
                  )}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none mt-7">
                  <span className="text-muted-foreground">$</span>
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

              <Select
                //label="Category"
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

              <Select
                //label="Brand (optional)"
                value={formData.brandSlug || undefined}
                onValueChange={(value) => {
                  setFormData({
                    ...formData,
                    brandSlug: value || null,
                  });
                }}
              >
                <SelectTrigger>
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

              <div>
                <label className="block text-sm font-medium mb-1">
                  Tea Categories
                </label>
                <div className="space-y-2 border border-input rounded-md p-3">
                  {teaCategories.map((category) => (
                    <label
                      key={category.slug}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        name={`teaCategory-${category.slug}`}
                        checked={
                          formData.teaCategories?.includes(category.slug) ||
                          false
                        }
                        onChange={handleChange}
                        className="h-4 w-4 border-input"
                      />
                      <span className="text-sm">{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <Input
                  label="Image Identifiers"
                  type="text"
                  name="images"
                  value={formData.images}
                  onChange={handleChange}
                  placeholder="image1.jpg,image2.jpg,image3.jpg"
                />
                <p className="mt-1 text-sm text-muted-foreground">
                  Enter image identifiers separated by commas. These should
                  match your R2 image filenames.
                </p>
              </div>

              <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center">
                  <Switch
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                  />
                  <label className="ml-2 text-sm">Active</label>
                </div>

                <div className="flex items-center">
                  <Switch
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleChange}
                  />
                  <label className="ml-2 text-sm">Featured</label>
                </div>

                <div className="flex items-center">
                  <Input
                    type="number"
                    name="discount"
                    value={formData.discount || ""}
                    onChange={handleChange}
                    placeholder="Discount %"
                    min="0"
                    max="100"
                    className="w-24"
                  />
                  <label className="ml-2 text-sm">% Off</label>
                </div>

                <div className="flex items-center">
                  <Switch
                    name="hasVariations"
                    checked={formData.hasVariations}
                    onChange={handleChange}
                  />
                  <label className="ml-2 text-sm">Has Variations</label>
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
            </div>

            {/* Add the variations form when hasVariations is checked */}
            {formData.hasVariations && (
              <div className="mt-6 md:col-span-2">
                <ProductVariationForm
                  variations={variations}
                  onChange={handleVariationsChange}
                />
              </div>
            )}

            <div className="mt-6">
              <Button
                variant="greenInverted"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Product"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Products List */}
      <div>
        {isPending ? (
          <div className="text-center py-4">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No products found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Tea Categories
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
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {product.images && (
                          <div className="h-10 w-10 relative shrink-0 mr-3">
                            <Image
                              src={`/${product.images.split(",").map((img) => img.trim())[0]}`}
                              alt={product.name}
                              className="object-cover rounded"
                              sizes="2rem"
                            />
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {product.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatPrice(product.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.stock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getCategoryName(product.categorySlug) || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getTeaCategoryNames(product.teaCategories)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant={product.isActive ? "default" : "secondary"}
                      >
                        {product.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button
                        size="sm"
                        onClick={() => handleEdit(product)}
                        className="mr-2"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteClick(product)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
              id="editProductForm"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Name *"
                  type="text"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditChange}
                  required
                />

                <Input
                  label="Slug *"
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
                  <label className="block text-sm font-medium mb-1">
                    Price *
                  </label>
                  <Input
                    type="number"
                    name="price"
                    value={editFormData.price}
                    onChange={handleEditChange}
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Stock *
                  </label>
                  <Input
                    type="number"
                    name="stock"
                    value={editFormData.stock}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Category *
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
                    <SelectTrigger>
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
                  <label className="block text-sm font-medium mb-1">
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
                    <SelectTrigger>
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

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Tea Categories
                  </label>
                  <div className="space-y-2 border border-input rounded-md p-3 max-h-48 overflow-y-auto">
                    {teaCategories.map((category) => (
                      <label
                        key={category.slug}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="checkbox"
                          name={`teaCategory-${category.slug}`}
                          checked={
                            editFormData.teaCategories?.includes(
                              category.slug
                            ) || false
                          }
                          onChange={handleEditChange}
                          className="h-4 w-4 border-input"
                        />
                        <span className="text-sm">{category.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Images (comma-separated)
                  </label>
                  <Input
                    type="text"
                    name="images"
                    value={editFormData.images}
                    onChange={handleEditChange}
                    placeholder="image1.jpg, image2.jpg, image3.jpg"
                  />
                </div>

                <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center">
                    <Switch
                      name="isActive"
                      checked={editFormData.isActive}
                      onChange={handleEditChange}
                    />
                    <label className="ml-2 text-sm">Active</label>
                  </div>

                  <div className="flex items-center">
                    <Switch
                      name="isFeatured"
                      checked={editFormData.isFeatured}
                      onChange={handleEditChange}
                    />
                    <label className="ml-2 text-sm">Featured</label>
                  </div>

                  <div className="flex items-center">
                    <Input
                      type="number"
                      name="discount"
                      value={editFormData.discount || ""}
                      onChange={handleEditChange}
                      placeholder="Discount %"
                      min="0"
                      max="100"
                      className="w-24"
                    />
                    <label className="ml-2 text-sm">% Off</label>
                  </div>

                  <div className="flex items-center">
                    <Switch
                      name="hasVariations"
                      checked={editFormData.hasVariations}
                      onChange={handleEditChange}
                    />
                    <label className="ml-2 text-sm">Has Variations</label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Weight (in grams)
                  </label>
                  <Input
                    type="text"
                    name="weight"
                    value={editFormData.weight}
                    onChange={handleEditChange}
                    placeholder="Enter weight in grams"
                  />
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
                form="editProductForm"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Updating..." : "Update Product"}
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
