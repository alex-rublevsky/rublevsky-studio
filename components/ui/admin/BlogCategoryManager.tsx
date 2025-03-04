"use client";

import { useState, useEffect } from "react";
import { BlogCategory } from "@/types";
import {
  getAllBlogCategories,
  createBlogCategory,
  updateBlogCategory,
  deleteBlogCategory,
} from "@/lib/actions/blog";
import { toast } from "sonner";

interface BlogCategoryFormData {
  name: string;
  slug: string;
  isActive: boolean;
}

export default function BlogCategoryManager() {
  // State for categories
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [createFormData, setCreateFormData] = useState<BlogCategoryFormData>({
    name: "",
    slug: "",
    isActive: true,
  });
  const [editFormData, setEditFormData] = useState<
    BlogCategoryFormData & { id?: number }
  >({
    name: "",
    slug: "",
    isActive: true,
  });
  const [isCreateAutoSlug, setIsCreateAutoSlug] = useState(true);
  const [isEditAutoSlug, setIsEditAutoSlug] = useState(false);

  // UI states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(
    null
  );
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [deletingCategoryId, setDeletingCategoryId] = useState<number | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Generate slug from category name for create form
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

  // Generate slug from category name for edit form
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

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const categoriesData = await getAllBlogCategories(false);
      setCategories(categoriesData || []);
    } catch (err) {
      console.error("Error fetching blog categories:", err);
      toast.error("Failed to fetch blog categories");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
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
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

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
      await createBlogCategory(createFormData);

      toast.success("Blog category added successfully!");

      setCreateFormData({
        name: "",
        slug: "",
        isActive: true,
      });
      setIsCreateAutoSlug(true);
      fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast.error(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (category: BlogCategory) => {
    setEditingCategoryId(category.id);
    setEditFormData({
      id: category.id,
      name: category.name,
      slug: category.slug,
      isActive: category.isActive,
    });
    setIsEditAutoSlug(false);
    setShowEditModal(true);
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editFormData.id) return;

    setIsSubmitting(true);
    setError("");

    try {
      await updateBlogCategory({
        id: editFormData.id,
        name: editFormData.name,
        slug: editFormData.slug,
        isActive: editFormData.isActive,
      });

      toast.success("Blog category updated successfully!");

      setShowEditModal(false);
      setEditingCategoryId(null);
      setEditFormData({
        name: "",
        slug: "",
        isActive: true,
      });
      setIsEditAutoSlug(false);
      fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast.error(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (category: BlogCategory) => {
    setDeletingCategoryId(category.id);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    setShowDeleteDialog(false);
    setShowDeleteConfirmDialog(true);
  };

  const handleFinalDeleteConfirm = async () => {
    if (!deletingCategoryId) return;

    setIsDeleting(true);
    setError("");

    try {
      await deleteBlogCategory(deletingCategoryId);

      toast.success("Blog category deleted successfully!");

      setShowDeleteConfirmDialog(false);
      setDeletingCategoryId(null);
      fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast.error(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
    setShowDeleteConfirmDialog(false);
    setDeletingCategoryId(null);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingCategoryId(null);
    setEditFormData({
      name: "",
      slug: "",
      isActive: true,
    });
    setIsEditAutoSlug(false);
    setError("");
  };

  return (
    <div className="bg-card p-6 rounded shadow border border-border">
      <h2 className="text-xl font-semibold mb-4">Blog Categories</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Create Category Form */}
        <div>
          <h3 className="text-lg font-medium mb-3">Add New Category</h3>

          {error && !showEditModal && (
            <div className="bg-destructive/20 border border-destructive text-destructive-foreground px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block mb-2" htmlFor="name">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={createFormData.name}
                onChange={handleCreateChange}
                className="w-full px-3 py-2 bg-muted border border-input rounded"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block mb-2" htmlFor="slug">
                Slug
              </label>
              <input
                type="text"
                id="slug"
                name="slug"
                value={createFormData.slug}
                onChange={handleCreateChange}
                className="w-full px-3 py-2 bg-muted border border-input rounded"
                required
              />
            </div>

            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={createFormData.isActive}
                  onChange={handleCreateChange}
                  className="mr-2"
                />
                <span>Active</span>
              </label>
            </div>

            <button
              type="submit"
              className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adding..." : "Add Category"}
            </button>
          </form>
        </div>

        {/* Categories List */}
        <div>
          <h3 className="text-lg font-medium mb-3">Existing Categories</h3>

          {isLoading ? (
            <p className="text-muted-foreground">Loading categories...</p>
          ) : categories.length === 0 ? (
            <p className="text-muted-foreground">No categories found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="px-4 py-2 border-b border-border text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 py-2 border-b border-border text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Slug
                    </th>
                    <th className="px-4 py-2 border-b border-border text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-2 border-b border-border text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category.id}>
                      <td className="px-4 py-2 border-b border-border text-sm">
                        {category.name}
                      </td>
                      <td className="px-4 py-2 border-b border-border text-sm">
                        {category.slug}
                      </td>
                      <td className="px-4 py-2 border-b border-border text-sm">
                        <span
                          className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                            category.isActive
                              ? "bg-green-900 text-green-100"
                              : "bg-red-900 text-red-100"
                          }`}
                        >
                          {category.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-2 border-b border-border text-sm">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(category)}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClick(category)}
                            className="text-destructive hover:text-destructive/80"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded shadow-lg w-full max-w-md border border-border">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Edit Category</h2>
              <button
                onClick={closeEditModal}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            {error && showEditModal && (
              <div className="bg-destructive/20 border border-destructive text-destructive-foreground px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleUpdate}>
              <div className="mb-4">
                <label className="block mb-2" htmlFor="edit-name">
                  Name
                </label>
                <input
                  type="text"
                  id="edit-name"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 bg-muted border border-input rounded"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2" htmlFor="edit-slug">
                  Slug
                </label>
                <input
                  type="text"
                  id="edit-slug"
                  name="slug"
                  value={editFormData.slug}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 bg-muted border border-input rounded"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={editFormData.isActive}
                    onChange={handleEditChange}
                    className="mr-2"
                  />
                  <span>Active</span>
                </label>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="bg-secondary text-secondary-foreground px-4 py-2 rounded hover:bg-secondary/80"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Updating..." : "Update Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* First Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded shadow-lg w-full max-w-md border border-border">
            <h2 className="text-xl font-semibold mb-4">Delete Category</h2>
            <p className="mb-6">
              Are you sure you want to delete this category? This action cannot
              be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleDeleteCancel}
                className="bg-secondary text-secondary-foreground px-4 py-2 rounded hover:bg-secondary/80"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="bg-destructive text-destructive-foreground px-4 py-2 rounded hover:bg-destructive/90"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Second Delete Confirmation Dialog */}
      {showDeleteConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded shadow-lg w-full max-w-md border border-border">
            <h2 className="text-xl font-semibold mb-4">Confirm Deletion</h2>
            <p className="mb-6 text-destructive font-bold">
              Are you ABSOLUTELY sure you want to delete this category? This
              action CANNOT be undone and may affect blog posts using this
              category.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleDeleteCancel}
                className="bg-secondary text-secondary-foreground px-4 py-2 rounded hover:bg-secondary/80"
              >
                Cancel
              </button>
              <button
                onClick={handleFinalDeleteConfirm}
                className="bg-destructive text-destructive-foreground px-4 py-2 rounded hover:bg-destructive/90"
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Yes, Delete It"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
