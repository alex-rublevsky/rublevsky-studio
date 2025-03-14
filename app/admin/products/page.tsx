"use client";
//TODO: update input to include label

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Product,
  Category,
  Brand,
  ProductFormData,
  TeaCategory,
} from "@/types";
import Image from "next/image";
import ProductVariationForm from "@/components/ui/admin/ProductVariationForm";
import { getAllBrands } from "@/lib/actions/brands";
import { getAllCategories } from "@/lib/actions/categories";
import { getAllTeaCategories } from "@/lib/actions/blog";
import {
  getAdminProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/actions/products";
import DeleteConfirmationDialog from "@/components/ui/admin/DeleteConfirmationDialog";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OrangeToggle } from "@/components/ui/toggle";
import { Badge } from "@/components/ui/badge";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerBody,
} from "@/components/ui/drawer";

// Define the Variation interface to match the one in ProductVariationForm
interface Variation {
  id: string;
  sku: string;
  price: number;
  stock: number;
  sort: number;
  attributes: VariationAttribute[];
}

interface VariationAttribute {
  attributeId: string;
  value: string;
}

export default function ProductsPage() {
  const router = useRouter();
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

  const [formData, setFormData] = useState<ProductFormData>(defaultFormData);
  const [editFormData, setEditFormData] =
    useState<ProductFormData>(defaultFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
  const [teaCategories, setTeaCategories] = useState<TeaCategory[]>([]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchBrands();
    fetchTeaCategories();
  }, []);

  // Generate slug from product name for the main form
  useEffect(() => {
    if (isAutoSlug && formData.name) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^\w\s-]/g, "") // Remove special characters
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
        .trim();

      setFormData((prev) => ({
        ...prev,
        slug,
      }));
    }
  }, [formData.name, isAutoSlug]);

  // Generate slug from product name for the edit form
  useEffect(() => {
    if (isEditAutoSlug && editFormData.name) {
      const slug = editFormData.name
        .toLowerCase()
        .replace(/[^\w\s-]/g, "") // Remove special characters
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
        .trim();

      setEditFormData((prev) => ({
        ...prev,
        slug,
      }));
    }
  }, [editFormData.name, isEditAutoSlug]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      // Use the server action instead of the API
      const productsData = await getAdminProducts();
      setProducts(productsData || []);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      // Use the server action instead of the API
      const categoriesData = await getAllCategories();
      setCategories(categoriesData || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchBrands = async () => {
    try {
      // Use the server action instead of the API
      const brandsData = await getAllBrands();
      setBrands(brandsData || []);
    } catch (err) {
      console.error("Error fetching brands:", err);
    }
  };

  const fetchTeaCategories = async () => {
    try {
      const categoriesData = await getAllTeaCategories();
      setTeaCategories(categoriesData || []);
    } catch (err) {
      console.error("Error fetching tea categories:", err);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

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

      setFormData({
        ...formData,
        teaCategories: updatedTeaCategories,
      });
      return;
    }

    // If hasVariations is checked and there are no variations, create a default one
    if (name === "hasVariations" && checked && variations.length === 0) {
      const defaultVariation: Variation = {
        id: `temp-${Date.now()}`,
        sku: "",
        price: formData.price ? parseFloat(formData.price) : 0,
        stock: formData.stock ? parseInt(formData.stock) : 0,
        sort: 0,
        attributes: [],
      };
      setVariations([defaultVariation]);
    }

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleEditChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

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

      setEditFormData({
        ...editFormData,
        teaCategories: updatedTeaCategories,
      });
      return;
    }

    // If hasVariations is checked and there are no variations, create a default one
    if (name === "hasVariations" && checked && editVariations.length === 0) {
      const defaultVariation: Variation = {
        id: `temp-${Date.now()}`,
        sku: "",
        price: editFormData.price ? parseFloat(editFormData.price) : 0,
        stock: editFormData.stock ? parseInt(editFormData.stock) : 0,
        sort: 0,
        attributes: [],
      };
      setEditVariations([defaultVariation]);
    }

    setEditFormData({
      ...editFormData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    // Convert variations to the format expected by the API
    const formattedVariations = variations.map((variation) => ({
      id: variation.id.startsWith("temp-") ? undefined : parseInt(variation.id),
      sku: variation.sku,
      price: variation.price.toString(),
      stock: variation.stock.toString(),
      sort: variation.sort,
      attributes: variation.attributes.map((attr) => ({
        attributeId: attr.attributeId,
        value: attr.value,
      })),
    }));

    const submissionData = {
      ...formData,
      variations: formattedVariations,
      teaCategories: formData.teaCategories || undefined,
    };

    try {
      await createProduct(submissionData);
      toast.success("Product added successfully!");

      setFormData(defaultFormData);
      setVariations([]);
      setIsAutoSlug(true);
      router.refresh();
      fetchProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast.error(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (product: Product) => {
    const productDetails = await getProductById(product.id);
    if (!productDetails) {
      toast.error("Failed to fetch product details");
      return;
    }

    setEditingProductId(product.id);
    setShowEditModal(true);
    setIsEditMode(true);
    setIsEditAutoSlug(false);

    // Update to use slugs
    setEditFormData({
      name: productDetails.name,
      slug: productDetails.slug,
      description: productDetails.description || "",
      price: productDetails.price.toString(),
      categorySlug: productDetails.categorySlug || "",
      brandSlug: productDetails.brandSlug || "",
      teaCategories: productDetails.teaCategories || [],
      stock: productDetails.stock.toString(),
      isActive: productDetails.isActive,
      isFeatured: productDetails.isFeatured,
      discount: productDetails.discount,
      hasVariations: productDetails.hasVariations,
      weight: productDetails.weight || "",
      images: productDetails.images || "",
      variations: [],
    });

    // Fetch product variations if the product has variations
    if (productDetails.hasVariations) {
      const variations = (productDetails as any).variations || [];
      setEditVariations(
        variations.map((variation: any) => ({
          id: variation.id.toString(),
          sku: variation.sku,
          price: parseFloat(variation.price),
          stock: parseInt(variation.stock),
          sort: variation.sort || 0,
          attributes: variation.attributes
            ? variation.attributes.map((attr: any) => ({
                attributeId: attr.attributeId,
                value: attr.value,
              }))
            : [],
        }))
      );
    }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingProductId) return;

    setIsSubmitting(true);
    setError("");

    // Convert variations to the format expected by the API
    const formattedVariations = editVariations.map((variation) => ({
      id: variation.id.startsWith("temp-") ? undefined : parseInt(variation.id),
      sku: variation.sku,
      price: variation.price.toString(),
      stock: variation.stock.toString(),
      sort: variation.sort,
      attributes: variation.attributes.map((attr) => ({
        attributeId: attr.attributeId,
        value: attr.value,
      })),
    }));

    const submissionData = {
      ...editFormData,
      variations: formattedVariations,
    };

    try {
      // Use the server action instead of the API
      await updateProduct(editingProductId, submissionData);

      // Replace success state with toast notification
      toast.success("Product updated successfully!");

      setShowEditModal(false);
      setIsEditMode(false);
      setEditingProductId(null);
      // Reset the edit form data
      setEditFormData({
        name: "",
        slug: "",
        description: "",
        price: "",
        categorySlug: "",
        brandSlug: "",
        stock: "0",
        isActive: true,
        isFeatured: false,
        discount: null,
        hasVariations: false,
        weight: "",
        images: "",
        variations: [],
      });
      // Reset the edit variations
      setEditVariations([]);
      setIsEditAutoSlug(false);
      router.refresh();
      fetchProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      // Add toast notification for error
      toast.error(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingProductId(null);
    setEditFormData(defaultFormData);
    setEditVariations([]);
    setIsEditAutoSlug(false);
    setError("");
  };

  // Format price as Canadian dollars
  const formatPrice = (price: number | string | null): string => {
    if (price === null) return "$0.00";
    const numericPrice = typeof price === "string" ? parseFloat(price) : price;
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
    }).format(numericPrice);
  };

  // Handle variations change from ProductVariationForm for the main form
  const handleVariationsChange = (newVariations: Variation[]) => {
    setVariations(newVariations);
  };

  // Handle variations change from ProductVariationForm for the edit form
  const handleEditVariationsChange = (newVariations: Variation[]) => {
    setEditVariations(newVariations);
  };

  // Update formData when variations change for the main form
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

  // Update editFormData when editVariations change for the edit form
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

  const handleDeleteClick = (product: Product) => {
    setDeletingProductId(product.id);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProductId) return;

    setIsDeleting(true);
    setError("");

    try {
      await deleteProduct(deletingProductId);

      // Replace success state with toast notification
      toast.success("Product deleted successfully!");

      setShowDeleteDialog(false);
      setDeletingProductId(null);
      router.refresh();
      fetchProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      // Add toast notification for error
      toast.error(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
    setDeletingProductId(null);
  };

  // Helper function to get category name from slug
  const getCategoryName = (slug: string | null): string | null => {
    if (!slug) return null;
    const category = categories.find((cat) => cat.slug === slug);
    return category?.name || null;
  };

  // Helper function to get brand name from slug
  const getBrandName = (slug: string | null): string | null => {
    if (!slug) return null;
    const brand = brands.find((b) => b.slug === slug);
    return brand?.name || null;
  };

  const getTeaCategoryNames = (slugs: string[] | undefined): string => {
    if (!slugs || slugs.length === 0) return "N/A";
    return slugs
      .map(
        (slug) => teaCategories.find((category) => category.slug === slug)?.name
      )
      .filter(Boolean)
      .join(", ");
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Products</h1>
        <div className="flex space-x-2">
          <Button
            variant="inverted"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? "Hide Form" : "Add New Product"}
          </Button>
        </div>
      </div>

      {/* Create Product Form */}
      {showCreateForm && (
        <div className="bg-card rounded-lg shadow border border-border p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Add New Product</h2>

          {error && !isEditMode && (
            <div className="bg-destructive/20 border border-destructive text-destructive-foreground px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Product Name *
                </label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Slug *{" "}
                  <span className="text-xs text-muted-foreground">
                    (Auto-generated from name)
                  </span>
                </label>
                <div className="flex">
                  <Input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    required
                  />
                  <Button
                    variant="inverted"
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
                    className="ml-2"
                  >
                    Reset
                  </Button>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Price (CAD) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-muted-foreground">$</span>
                  </div>
                  <Input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Stock</label>
                <Input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
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
                >
                  <SelectTrigger variant="inverted">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent variant="inverted">
                    {categories.map((category: Category) => (
                      <SelectItem
                        key={category.slug}
                        value={category.slug}
                        variant="inverted"
                      >
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Brand</label>
                <Select
                  value={formData.brandSlug}
                  onValueChange={(value) => {
                    setFormData({
                      ...formData,
                      brandSlug: value,
                    });
                  }}
                >
                  <SelectTrigger variant="inverted">
                    <SelectValue placeholder="Select a brand" />
                  </SelectTrigger>
                  <SelectContent variant="inverted">
                    {brands.map((brand: Brand) => (
                      <SelectItem
                        key={brand.slug}
                        value={brand.slug}
                        variant="inverted"
                      >
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
                <div className="space-y-2 border border-input rounded-md p-3">
                  {teaCategories.map((category) => (
                    <label
                      key={category.slug}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="checkbox"
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
                <label className="block text-sm font-medium mb-1">
                  Image Identifiers
                </label>
                <Input
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
                  <OrangeToggle
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                  />
                  <label className="ml-2 text-sm">Active</label>
                </div>

                <div className="flex items-center">
                  <OrangeToggle
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
                  <OrangeToggle
                    name="hasVariations"
                    checked={formData.hasVariations}
                    onChange={handleChange}
                  />
                  <label className="ml-2 text-sm">Has Variations</label>
                </div>
              </div>

              <Input
                label="Weight (in grams)"
                id="weight"
                name="weight"
                type="text"
                value={formData.weight}
                onChange={handleChange}
                placeholder="Enter weight in grams"
              />
            </div>

            {/* Tea Categories */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                Tea Categories
              </label>
              <div className="grid grid-cols-2 gap-4">
                {teaCategories.map((category) => (
                  <div key={category.slug} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`teaCategory-${category.slug}`}
                      name={`teaCategory-${category.slug}`}
                      checked={
                        formData.teaCategories?.includes(category.slug) || false
                      }
                      onChange={handleChange}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label
                      htmlFor={`teaCategory-${category.slug}`}
                      className="ml-2 block text-sm text-foreground"
                    >
                      {category.name}
                    </label>
                  </div>
                ))}
              </div>
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
      <div className="bg-card rounded-lg shadow border border-border p-6">
        <h2 className="text-xl font-semibold mb-4">Products</h2>

        {isLoading ? (
          <div className="text-center py-4">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No products found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted">
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
                    Brand
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
                          <div className="h-10 w-10 relative flex-shrink-0 mr-3">
                            <Image
                              src={`/${product.images.split(",").map((img) => img.trim())[0]}`}
                              alt={product.name}
                              fill
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
                      {getBrandName(product.brandSlug) || "N/A"}
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
                        variant="inverted"
                        size="sm"
                        onClick={() => handleEdit(product)}
                        className="mr-2"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="invertedDestructive"
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
                  <label className="block text-sm font-medium mb-1">
                    Description
                  </label>
                  <Textarea
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
                    Category
                  </label>
                  <Select
                    name="categorySlug"
                    value={editFormData.categorySlug}
                    onValueChange={(value) =>
                      handleEditChange({
                        target: { name: "categorySlug", value },
                      } as any)
                    }
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
                    Brand
                  </label>
                  <Select
                    name="brandSlug"
                    value={editFormData.brandSlug}
                    onValueChange={(value) =>
                      handleEditChange({
                        target: { name: "brandSlug", value },
                      } as any)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a brand" />
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
                  <div className="space-y-2 border border-input rounded-md p-3">
                    {teaCategories.map((category) => (
                      <label
                        key={category.slug}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="checkbox"
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

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Images (URLs, comma-separated)
                  </label>
                  <Input
                    type="text"
                    name="images"
                    value={editFormData.images}
                    onChange={handleEditChange}
                  />
                </div>

                <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center">
                    <OrangeToggle
                      name="isActive"
                      checked={editFormData.isActive}
                      onChange={handleEditChange}
                    />
                    <label className="ml-2 text-sm">Active</label>
                  </div>

                  <div className="flex items-center">
                    <OrangeToggle
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
                    <OrangeToggle
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

              {/* Tea Categories */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tea Categories
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {teaCategories.map((category) => (
                    <div key={category.slug} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`edit-teaCategory-${category.slug}`}
                        name={`teaCategory-${category.slug}`}
                        checked={
                          editFormData.teaCategories?.includes(category.slug) ||
                          false
                        }
                        onChange={handleEditChange}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <label
                        htmlFor={`edit-teaCategory-${category.slug}`}
                        className="ml-2 block text-sm text-foreground"
                      >
                        {category.name}
                      </label>
                    </div>
                  ))}
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
