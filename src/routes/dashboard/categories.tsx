import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useRouter } from "@tanstack/react-router";
import { Category, CategoryFormData } from "~/types";
import DeleteConfirmationDialog from "~/components/ui/dashboard/ConfirmationDialog";
import { toast } from "sonner";
import { Image } from "~/components/ui/shared/Image";
import { Button } from "~/components/ui/shared/Button";
import { Input } from "~/components/ui/shared/Input";
import { Switch } from "~/components/ui/shared/Switch";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerBody,
  DrawerFooter,
} from "~/components/ui/shared/Drawer";
import { Badge } from "~/components/ui/shared/Badge";

export const Route = createFileRoute("/dashboard/categories")({
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();
  // Separate form data for creating and editing
  const [createFormData, setCreateFormData] = useState<CategoryFormData>({
    name: "",
    slug: "",
    image: "",
    isActive: true,
  });
  const [editFormData, setEditFormData] = useState<CategoryFormData>({
    name: "",
    slug: "",
    image: "",
    isActive: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateAutoSlug, setIsCreateAutoSlug] = useState(true);
  const [isEditAutoSlug, setIsEditAutoSlug] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(
    null
  );
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingCategoryId, setDeletingCategoryId] = useState<number | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

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
      // await createCategory({
      //   name: createFormData.name,
      //   slug: createFormData.slug,
      //   image: createFormData.image || null,
      //   isActive: createFormData.isActive,
      // });

      toast.success("Category added successfully!");

      setCreateFormData({
        name: "",
        slug: "",
        image: "",
        isActive: true,
      });
      setIsCreateAutoSlug(true);
      // router.refresh();
      // fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast.error(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategoryId(category.id);
    setEditFormData({
      name: category.name,
      slug: category.slug,
      image: category.image || "",
      isActive: category.isActive,
    });
    // Enable auto-slug generation when editing
    setIsEditAutoSlug(true);
    setShowEditModal(true);
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingCategoryId) return;

    setIsSubmitting(true);
    setError("");

    try {
      // Use the server action instead of the API
      // await updateCategory(editingCategoryId, {
      //   name: editFormData.name,
      //   slug: editFormData.slug,
      //   image: editFormData.image || null,
      //   isActive: editFormData.isActive,
      // });

      toast.success("Category updated successfully!");

      setShowEditModal(false);
      setEditingCategoryId(null);
      setEditFormData({
        name: "",
        slug: "",
        image: "",
        isActive: true,
      });
      setIsEditAutoSlug(false);
      // router.refresh();
      // fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast.error(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingCategoryId(null);
    setEditFormData({
      name: "",
      slug: "",
      image: "",
      isActive: true,
    });
    setIsEditAutoSlug(false);
    setError("");
  };

  const handleDeleteClick = (category: Category) => {
    setDeletingCategoryId(category.id);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCategoryId) return;

    setIsDeleting(true);
    setError("");

    try {
      // await deleteCategory(deletingCategoryId);

      toast.success("Category deleted successfully!");

      setShowDeleteDialog(false);
      setDeletingCategoryId(null);
      // router.refresh();
      // fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast.error(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
    setDeletingCategoryId(null);
  };

  return (
    <div className="space-y-8">
      <div className="bg-card rounded-lg shadow-sm border border-border p-6 mb-8">
        <h2 className="!text-xl font-semibold mb-4">Add New Category</h2>

        {error && !showEditModal && (
          <div className="bg-destructive/20 border border-destructive text-destructive-foreground px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">
                Category Name *
              </label>
              <Input
                type="text"
                name="name"
                value={createFormData.name}
                onChange={handleCreateChange}
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
                  value={createFormData.slug}
                  onChange={handleCreateChange}
                  required
                />
                <Button
                  type="button"
                  className="ml-2"
                  size="sm"
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
                >
                  Reset
                </Button>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                Image URL
              </label>
              <Input
                type="text"
                name="image"
                value={createFormData.image}
                onChange={handleCreateChange}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center">
                <Switch
                  name="isActive"
                  checked={createFormData.isActive}
                  onChange={handleCreateChange}
                />
                <label className="ml-2 text-sm">Active</label>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Category"}
            </Button>
          </div>
        </form>
      </div>

      <div className="bg-card rounded-lg shadow-sm border border-border p-6">
        {isLoading ? (
          <div className="text-center py-4">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No categories found
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
                    Image
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
                {categories.map((category) => (
                  <tr key={category.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {category.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {category.slug}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {category.image ? (
                        <div className="h-10 w-10 relative">
                          <Image
                            src={category.image}
                            alt={category.name}
                            className="object-cover rounded"
                          />
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No image</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant={category.isActive ? "default" : "secondary"}
                      >
                        {category.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button
                        className="mr-2"
                        size="sm"
                        onClick={() => handleEdit(category)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="invertedDestructive"
                        size="sm"
                        onClick={() => handleDeleteClick(category)}
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

      <Drawer open={showEditModal} onOpenChange={setShowEditModal}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Edit Category</DrawerTitle>
          </DrawerHeader>

          <DrawerBody>
            {error && showEditModal && (
              <div className="bg-destructive/20 border border-destructive text-destructive-foreground px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleUpdate} id="editCategoryForm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Category Name *
                  </label>
                  <Input
                    type="text"
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditChange}
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
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      name="slug"
                      value={editFormData.slug}
                      onChange={handleEditChange}
                      required
                    />
                    <Button
                      size="sm"
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
                    >
                      Reset
                    </Button>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Image URL
                  </label>
                  <Input
                    type="text"
                    name="image"
                    value={editFormData.image}
                    onChange={handleEditChange}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center">
                    <Switch
                      name="isActive"
                      checked={editFormData.isActive}
                      onChange={handleEditChange}
                    />
                    <label className="ml-2 text-sm">Active</label>
                  </div>
                </div>
              </div>
            </form>
          </DrawerBody>

          <DrawerFooter>
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
                form="editCategoryForm"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Updating..." : "Update Category"}
              </Button>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {showDeleteDialog && (
        <DeleteConfirmationDialog
          isOpen={showDeleteDialog}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          title="Delete Category"
          description="Are you sure you want to delete this category? This action cannot be undone."
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}
