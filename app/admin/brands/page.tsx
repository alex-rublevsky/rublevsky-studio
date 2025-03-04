"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Brand, BrandFormData, BrandsResponse } from "@/types";
import {
  getAllBrands,
  createBrand,
  updateBrand,
  deleteBrand,
} from "@/lib/actions/brands";
import DeleteConfirmationDialog from "@/components/ui/admin/DeleteConfirmationDialog";
import { toast } from "sonner";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function BrandsPage() {
  const router = useRouter();
  // Separate form data for creating and editing
  const [createFormData, setCreateFormData] = useState<BrandFormData>({
    name: "",
    slug: "",
    image: "",
    isActive: true,
  });
  const [editFormData, setEditFormData] = useState<BrandFormData>({
    name: "",
    slug: "",
    image: "",
    isActive: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateAutoSlug, setIsCreateAutoSlug] = useState(true);
  const [isEditAutoSlug, setIsEditAutoSlug] = useState(false);
  const [editingBrandId, setEditingBrandId] = useState<number | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingBrandId, setDeletingBrandId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchBrands();
  }, []);

  // Generate slug from brand name for create form
  useEffect(() => {
    if (isCreateAutoSlug && createFormData.name) {
      const slug = createFormData.name
        .toLowerCase()
        .replace(/[^\w\s-]/g, "") // Remove special characters
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
        .trim();

      setCreateFormData((prev) => ({
        ...prev,
        slug,
      }));
    }
  }, [createFormData.name, isCreateAutoSlug]);

  // Generate slug from brand name for edit form
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

  const fetchBrands = async () => {
    setIsLoading(true);
    try {
      // Use the server action instead of the API
      const brandsData = await getAllBrands();
      setBrands(brandsData || []);
    } catch (err) {
      console.error("Error fetching brands:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (name === "slug") {
      setIsCreateAutoSlug(false);
    }

    setCreateFormData({
      ...createFormData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    // Only disable auto-slug if the user manually edits the slug field
    if (name === "slug") {
      setIsEditAutoSlug(false);
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

    try {
      // Use the server action instead of the API
      await createBrand({
        name: createFormData.name,
        slug: createFormData.slug,
        image: createFormData.image || null,
        isActive: createFormData.isActive,
      });

      toast.success("Brand added successfully!");

      setCreateFormData({
        name: "",
        slug: "",
        image: "",
        isActive: true,
      });
      setIsCreateAutoSlug(true);
      router.refresh();
      fetchBrands();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast.error(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (brand: Brand) => {
    setEditingBrandId(brand.id);
    setEditFormData({
      name: brand.name,
      slug: brand.slug,
      image: brand.image || "",
      isActive: brand.isActive,
    });
    // Enable auto-slug generation when editing
    setIsEditAutoSlug(true);
    setShowEditModal(true);
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingBrandId) return;

    setIsSubmitting(true);
    setError("");

    try {
      // Use the server action instead of the API
      await updateBrand(editingBrandId, {
        name: editFormData.name,
        slug: editFormData.slug,
        image: editFormData.image || null,
        isActive: editFormData.isActive,
      });

      toast.success("Brand updated successfully!");

      setShowEditModal(false);
      setEditingBrandId(null);
      setEditFormData({
        name: "",
        slug: "",
        image: "",
        isActive: true,
      });
      setIsEditAutoSlug(false);
      router.refresh();
      fetchBrands();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast.error(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingBrandId(null);
    setEditFormData({
      name: "",
      slug: "",
      image: "",
      isActive: true,
    });
    setIsEditAutoSlug(false);
    setError("");
  };

  const handleDeleteClick = (brand: Brand) => {
    setDeletingBrandId(brand.id);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingBrandId) return;

    setIsDeleting(true);
    setError("");

    try {
      await deleteBrand(deletingBrandId);

      toast.success("Brand deleted successfully!");

      setShowDeleteDialog(false);
      setDeletingBrandId(null);
      router.refresh();
      fetchBrands();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast.error(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
    setDeletingBrandId(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Brands</h1>
      </div>

      <div className="bg-card rounded-lg shadow border border-border p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Add New Brand</h2>

        {error && !showEditModal && (
          <div className="bg-destructive/20 border border-destructive text-destructive-foreground px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">
                Brand Name *
              </label>
              <input
                type="text"
                name="name"
                value={createFormData.name}
                onChange={handleCreateChange}
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
                  value={createFormData.slug}
                  onChange={handleCreateChange}
                  required
                  className="w-full px-3 py-2 bg-muted border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateAutoSlug(true);
                    if (createFormData.name) {
                      const slug = createFormData.name
                        .toLowerCase()
                        .replace(/[^\w\s-]/g, "")
                        .replace(/\s+/g, "-")
                        .replace(/-+/g, "-")
                        .trim();

                      setCreateFormData((prev) => ({
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
              <label className="block text-sm font-medium mb-1">Logo URL</label>
              <input
                type="text"
                name="image"
                value={createFormData.image}
                onChange={handleCreateChange}
                placeholder="https://example.com/logo.jpg"
                className="w-full px-3 py-2 bg-muted border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={createFormData.isActive}
                  onChange={handleCreateChange}
                  className="h-4 w-4 text-primary focus:ring-primary border-input rounded"
                />
                <label className="ml-2 text-sm">Active</label>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create Brand"}
            </Button>
          </div>
        </form>
      </div>

      <div className="bg-card rounded-lg shadow border border-border p-6">
        <h2 className="text-xl font-semibold mb-4">Brands</h2>

        {isLoading ? (
          <div className="text-center py-4">Loading brands...</div>
        ) : brands.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No brands found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted">
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
                {brands.map((brand) => (
                  <tr key={brand.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {brand.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {brand.slug}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {brand.image ? (
                        <div className="h-10 w-10 relative">
                          <Image
                            src={brand.image}
                            alt={brand.name}
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No logo</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          brand.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {brand.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(brand)}
                        className="text-primary hover:text-primary/80 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(brand)}
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
          <div className="bg-card rounded-lg shadow-lg p-6 w-full max-w-2xl">
            <h2 className="text-xl font-semibold mb-4">Edit Brand</h2>

            {error && showEditModal && (
              <div className="bg-destructive/20 border border-destructive text-destructive-foreground px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleUpdate}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Brand Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditChange}
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
                      value={editFormData.slug}
                      onChange={handleEditChange}
                      required
                      className="w-full px-3 py-2 bg-muted border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
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
                      className="ml-2 px-3 py-2 bg-muted hover:bg-muted/80 rounded-md focus:outline-none"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Logo URL
                  </label>
                  <input
                    type="text"
                    name="image"
                    value={editFormData.image}
                    onChange={handleEditChange}
                    placeholder="https://example.com/logo.jpg"
                    className="w-full px-3 py-2 bg-muted border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={editFormData.isActive}
                      onChange={handleEditChange}
                      className="h-4 w-4 text-primary focus:ring-primary border-input rounded"
                    />
                    <label className="ml-2 text-sm">Active</label>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-4 py-2 border border-input bg-muted text-foreground rounded-md hover:bg-muted/80 focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none disabled:opacity-50"
                >
                  {isSubmitting ? "Updating..." : "Update Brand"}
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
          title="Delete Brand"
          description="Are you sure you want to delete this brand? This action cannot be undone."
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}
