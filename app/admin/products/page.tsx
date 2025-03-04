"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Product,
  Category,
  Brand,
  ProductFormData,
  ProductsResponse,
  CategoriesResponse,
  BrandsResponse,
} from "@/types";
import Image from "next/image";
import ProductVariationForm from "@/components/ui/admin/ProductVariationForm";
import { getAllBrands } from "@/lib/actions/brands";
import { getAllCategories } from "@/lib/actions/categories";
import {
  getAdminProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/actions/products";
import DeleteConfirmationDialog from "@/components/ui/admin/DeleteConfirmationDialog";
import { toast } from "sonner";

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
  name: string;
  value: string;
}

export default function ProductsPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    slug: "",
    description: "",
    price: "",
    categorySlug: "",
    brandSlug: "",
    stock: "0",
    isActive: true,
    isFeatured: false,
    onSale: false,
    hasVariations: false,
    hasVolume: false,
    volume: "",
    images: "",
    variations: [],
  });
  const [editFormData, setEditFormData] = useState<ProductFormData>({
    name: "",
    slug: "",
    description: "",
    price: "",
    categorySlug: "",
    brandSlug: "",
    stock: "0",
    isActive: true,
    isFeatured: false,
    onSale: false,
    hasVariations: false,
    hasVolume: false,
    volume: "",
    images: "",
    variations: [],
  });
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
  const [showCreateForm, setShowCreateForm] = useState(true);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchBrands();
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
        name: attr.name,
        value: attr.value,
      })),
    }));

    const submissionData = {
      ...formData,
      variations: formattedVariations,
    };

    try {
      // Use the server action instead of the API
      await createProduct(submissionData);

      // Replace success state with toast notification
      toast.success("Product added successfully!");

      setFormData({
        name: "",
        slug: "",
        description: "",
        price: "",
        categorySlug: "",
        brandSlug: "",
        stock: "0",
        isActive: true,
        isFeatured: false,
        onSale: false,
        hasVariations: false,
        hasVolume: false,
        volume: "",
        images: "",
        variations: [],
      });
      setVariations([]);
      setIsAutoSlug(true);
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

  const handleEdit = async (product: Product) => {
    setEditingProductId(product.id);
    setShowEditModal(true);
    setIsEditMode(true);
    setIsEditAutoSlug(false);

    // Update to use slugs
    setEditFormData({
      name: product.name,
      slug: product.slug,
      description: product.description || "",
      price: product.price.toString(),
      categorySlug: product.categorySlug || "",
      brandSlug: product.brandSlug || "",
      stock: product.stock.toString(),
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      onSale: product.onSale,
      hasVariations: product.hasVariations,
      hasVolume: product.hasVolume,
      volume: product.volume || "",
      images: product.images || "",
      variations: [],
    });

    // Fetch product variations if the product has variations
    let productVariations: Variation[] = [];
    if (product.hasVariations) {
      try {
        // Use the server action instead of the API
        const productData = await getProductById(product.id);
        if (productData && productData.hasVariations) {
          // The Product type might not have variations property in the type definition
          // but the server action adds it to the returned object
          const productWithVariations = productData as any;
          if (productWithVariations.variations) {
            // Map the database variations to the form data structure
            productVariations = productWithVariations.variations.map(
              (variation: any) => ({
                id: variation.id.toString(),
                sku: variation.sku,
                price: parseFloat(variation.price),
                stock: parseInt(variation.stock),
                sort: variation.sort || 0,
                attributes: variation.attributes
                  ? variation.attributes.map((attr: any) => ({
                      name: attr.name,
                      value: attr.value,
                    }))
                  : [],
              })
            );
          }
        }
      } catch (e) {
        console.error("Failed to fetch product variations:", e);
      }
    }

    // Update the edit variations instead of the main variations
    setEditVariations(productVariations);
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
        name: attr.name,
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
        onSale: false,
        hasVariations: false,
        hasVolume: false,
        volume: "",
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
      onSale: false,
      hasVariations: false,
      hasVolume: false,
      volume: "",
      images: "",
      variations: [],
    });
    // Reset the edit variations
    setEditVariations([]);
    setIsEditAutoSlug(false);
    setError("");
  };

  // Format price as Canadian dollars
  const formatPrice = (price: number | null): string => {
    if (price === null) return "$0.00";
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
    }).format(price);
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
          name: attr.name,
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
          name: attr.name,
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

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Products</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none"
          >
            {showCreateForm ? "Hide Form" : "Add New Product"}
          </button>
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
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-muted border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
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
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 bg-muted border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    type="button"
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
                    className="ml-2 px-3 py-2 bg-muted hover:bg-muted/80 rounded-md focus:outline-none"
                  >
                    Reset
                  </button>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 bg-muted border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
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
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    step="0.01"
                    min="0"
                    className="w-full pl-7 px-3 py-2 bg-muted border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Stock</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 bg-muted border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Category
                </label>
                <select
                  name="categorySlug"
                  value={formData.categorySlug}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-muted border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.slug} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Brand</label>
                <select
                  name="brandSlug"
                  value={formData.brandSlug}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-muted border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select a brand</option>
                  {brands.map((brand) => (
                    <option key={brand.slug} value={brand.slug}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Image Identifiers
                </label>
                <input
                  type="text"
                  name="images"
                  value={formData.images}
                  onChange={handleChange}
                  placeholder="image1.jpg,image2.jpg,image3.jpg"
                  className="w-full px-3 py-2 bg-muted border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="mt-1 text-sm text-muted-foreground">
                  Enter image identifiers separated by commas. These should
                  match your R2 image filenames.
                </p>
              </div>

              <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary focus:ring-primary border-input rounded"
                  />
                  <label className="ml-2 text-sm">Active</label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary focus:ring-primary border-input rounded"
                  />
                  <label className="ml-2 text-sm">Featured</label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="onSale"
                    checked={formData.onSale}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary focus:ring-primary border-input rounded"
                  />
                  <label className="ml-2 text-sm">On Sale</label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="hasVariations"
                    checked={formData.hasVariations}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary focus:ring-primary border-input rounded"
                  />
                  <label className="ml-2 text-sm">Has Variations</label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="hasVolume"
                    checked={formData.hasVolume}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary focus:ring-primary border-input rounded"
                  />
                  <label className="ml-2 text-sm">Has Volume</label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Volume</label>
                <input
                  type="text"
                  name="volume"
                  value={formData.volume}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-muted border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
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
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
              >
                {isSubmitting ? "Creating..." : "Create Product"}
              </button>
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
                              src={`${process.env.NEXT_PUBLIC_CLOUDFLARE_WORKER_URL}/${
                                product.images.split(",")[0]
                              }`}
                              alt={product.name}
                              fill
                              className="object-cover rounded"
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
                      {formatPrice(parseFloat(product.price))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.stock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.category?.name || "None"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.brand?.name || "None"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          product.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {product.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-primary hover:text-primary/80 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(product)}
                        className="text-destructive hover:text-destructive/80"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-lg shadow-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Edit Product</h2>
              <button
                onClick={closeEditModal}
                className="text-muted-foreground hover:text-foreground"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {error && isEditMode && (
              <div className="bg-destructive/20 border border-destructive text-destructive-foreground px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleUpdate}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slug *
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      name="slug"
                      value={editFormData.slug}
                      onChange={handleEditChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditAutoSlug(true);
                        if (editFormData.name) {
                          const slug = editFormData.name
                            .toLowerCase()
                            .replace(/[^\w\s-]/g, "")
                            .replace(/\s+/g, "-")
                            .replace(/-+/g, "-")
                            .trim();

                          setEditFormData((prev) => ({
                            ...prev,
                            slug,
                          }));
                        }
                      }}
                      className="ml-2 px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={editFormData.description}
                    onChange={handleEditChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (CAD) *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">$</span>
                    </div>
                    <input
                      type="number"
                      name="price"
                      value={editFormData.price}
                      onChange={handleEditChange}
                      required
                      step="0.01"
                      min="0"
                      className="w-full pl-7 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={editFormData.stock}
                    onChange={handleEditChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    name="categorySlug"
                    value={editFormData.categorySlug}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.slug} value={category.slug}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brand
                  </label>
                  <select
                    name="brandSlug"
                    value={editFormData.brandSlug}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a brand</option>
                    {brands.map((brand) => (
                      <option key={brand.slug} value={brand.slug}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image Identifiers
                  </label>
                  <input
                    type="text"
                    name="images"
                    value={editFormData.images}
                    onChange={handleEditChange}
                    placeholder="image1.jpg,image2.jpg,image3.jpg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Enter image identifiers separated by commas. These should
                    match your R2 image filenames.
                  </p>
                </div>

                <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={editFormData.isActive}
                      onChange={handleEditChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">Active</label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isFeatured"
                      checked={editFormData.isFeatured}
                      onChange={handleEditChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      Featured
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="onSale"
                      checked={editFormData.onSale}
                      onChange={handleEditChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      On Sale
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="hasVariations"
                      checked={editFormData.hasVariations}
                      onChange={handleEditChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      Has Variations
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="hasVolume"
                      checked={editFormData.hasVolume}
                      onChange={handleEditChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      Has Volume
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Volume
                  </label>
                  <input
                    type="text"
                    name="volume"
                    value={editFormData.volume}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Add the variations form when hasVariations is checked */}
              {editFormData.hasVariations && (
                <div className="mt-6 md:col-span-2">
                  <ProductVariationForm
                    variations={editVariations}
                    onChange={handleEditVariationsChange}
                  />
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md mr-2 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {isSubmitting ? "Updating..." : "Update Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
