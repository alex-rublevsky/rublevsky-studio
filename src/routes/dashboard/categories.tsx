import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useRouter } from "@tanstack/react-router";
import type { Category, CategoryFormData, TeaCategory, TeaCategoryFormData } from "~/types";
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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DEPLOY_URL } from "~/utils/store";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/dashboard/categories")({
  component: RouteComponent,
});

function RouteComponent() {
  const queryClient = useQueryClient();
  
  // Fetch product categories
  const { isPending: categoriesPending, data: categoriesData, isError: categoriesError } = useQuery<Category[]>({
    queryKey: ["dashboard-categories"],
    queryFn: () =>
      fetch(`${DEPLOY_URL}/api/dashboard/categories`).then((res) => res.json()),
  });

  // Fetch tea categories
  const { isPending: teaCategoriesPending, data: teaCategoriesData, isError: teaCategoriesError } = useQuery<TeaCategory[]>({
    queryKey: ["dashboard-tea-categories"],
    queryFn: () =>
      fetch(`${DEPLOY_URL}/api/dashboard/tea-categories`).then((res) => res.json()),
  });

  const router = useRouter();
  
  // Category type state (to distinguish between product category and tea category operations)
  const [categoryType, setCategoryType] = useState<'product' | 'tea'>('product');
  
  // Form data for creating categories
  const [createCategoryFormData, setCreateCategoryFormData] = useState<CategoryFormData>({
    name: "",
    slug: "",
    image: "",
    isActive: true,
  });
  
  // Form data for creating tea categories
  const [createTeaCategoryFormData, setCreateTeaCategoryFormData] = useState<TeaCategoryFormData>({
    name: "",
    slug: "",
    isActive: true,
  });
  
  // Form data for editing categories
  const [editCategoryFormData, setEditCategoryFormData] = useState<CategoryFormData>({
    name: "",
    slug: "",
    image: "",
    isActive: true,
  });
  
  // Form data for editing tea categories
  const [editTeaCategoryFormData, setEditTeaCategoryFormData] = useState<TeaCategoryFormData>({
    name: "",
    slug: "",
    isActive: true,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [isCreateAutoSlug, setIsCreateAutoSlug] = useState(true);
  const [isEditAutoSlug, setIsEditAutoSlug] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [editingTeaCategorySlug, setEditingTeaCategorySlug] = useState<string | null>(null);
  const [showCreateDrawer, setShowCreateDrawer] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingCategoryId, setDeletingCategoryId] = useState<number | null>(null);
  const [deletingTeaCategorySlug, setDeletingTeaCategorySlug] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Generate slug from category name for create form (product categories)
  useEffect(() => {
    if (isCreateAutoSlug && createCategoryFormData.name) {
      const slug = createCategoryFormData.name
        .toLowerCase()
        .replace(/[^\w\s-]/g, "") // Remove special characters
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
        .trim();

      setCreateCategoryFormData((prev) => ({
        ...prev,
        slug,
      }));
    }
  }, [createCategoryFormData.name, isCreateAutoSlug]);

  // Generate slug from tea category name for create form
  useEffect(() => {
    if (isCreateAutoSlug && createTeaCategoryFormData.name) {
      const slug = createTeaCategoryFormData.name
        .toLowerCase()
        .replace(/[^\w\s-]/g, "") // Remove special characters
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
        .trim();

      setCreateTeaCategoryFormData((prev) => ({
        ...prev,
        slug,
      }));
    }
  }, [createTeaCategoryFormData.name, isCreateAutoSlug]);

  // Generate slug from category name for edit form (product categories)
  useEffect(() => {
    if (isEditAutoSlug && editCategoryFormData.name) {
      const slug = editCategoryFormData.name
        .toLowerCase()
        .replace(/[^\w\s-]/g, "") // Remove special characters
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
        .trim();

      setEditCategoryFormData((prev) => ({
        ...prev,
        slug,
      }));
    }
  }, [editCategoryFormData.name, isEditAutoSlug]);

  // Generate slug from tea category name for edit form
  useEffect(() => {
    if (isEditAutoSlug && editTeaCategoryFormData.name) {
      const slug = editTeaCategoryFormData.name
        .toLowerCase()
        .replace(/[^\w\s-]/g, "") // Remove special characters
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
        .trim();

      setEditTeaCategoryFormData((prev) => ({
        ...prev,
        slug,
      }));
    }
  }, [editTeaCategoryFormData.name, isEditAutoSlug]);

  // Handler for product category create form
  const handleCreateCategoryChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (name === "slug") {
      setIsCreateAutoSlug(false);
    }

    setCreateCategoryFormData({
      ...createCategoryFormData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Handler for tea category create form
  const handleCreateTeaCategoryChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (name === "slug") {
      setIsCreateAutoSlug(false);
    }

    setCreateTeaCategoryFormData({
      ...createTeaCategoryFormData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Handler for product category edit form
  const handleEditCategoryChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (name === "slug") {
      setIsEditAutoSlug(false);
    }

    setEditCategoryFormData({
      ...editCategoryFormData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Handler for tea category edit form
  const handleEditTeaCategoryChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (name === "slug") {
      setIsEditAutoSlug(false);
    }

    setEditTeaCategoryFormData({
      ...editTeaCategoryFormData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Submit handler for creating categories
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const endpoint = categoryType === 'product' 
        ? `${DEPLOY_URL}/api/dashboard/categories`
        : `${DEPLOY_URL}/api/dashboard/tea-categories`;
      
      const formData = categoryType === 'product' 
        ? createCategoryFormData 
        : createTeaCategoryFormData;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json() as { error?: string };
        throw new Error(errorData.error || 'Failed to create category');
      }

      toast.success(`${categoryType === 'product' ? 'Category' : 'Tea category'} added successfully!`);
      
      // Refresh the relevant query
      queryClient.invalidateQueries({ 
        queryKey: categoryType === 'product' 
          ? ["dashboard-categories"] 
          : ["dashboard-tea-categories"] 
      });
      
      closeCreateDrawer();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast.error(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeCreateDrawer = () => {
    setShowCreateDrawer(false);
    setCreateCategoryFormData({
      name: "",
      slug: "",
      image: "",
      isActive: true,
    });
    setCreateTeaCategoryFormData({
      name: "",
      slug: "",
      isActive: true,
    });
    setIsCreateAutoSlug(true);
    setError("");
  };

  // Handler for editing product categories
  const handleEditCategory = (category: Category) => {
    setCategoryType('product');
    setEditingCategoryId(category.id);
    setEditingTeaCategorySlug(null);
    setEditCategoryFormData({
      name: category.name,
      slug: category.slug,
      image: category.image || "",
      isActive: category.isActive,
    });
    setIsEditAutoSlug(true);
    setShowEditModal(true);
  };

  // Handler for editing tea categories
  const handleEditTeaCategory = (teaCategory: TeaCategory) => {
    setCategoryType('tea');
    setEditingTeaCategorySlug(teaCategory.slug);
    setEditingCategoryId(null);
    setEditTeaCategoryFormData({
      name: teaCategory.name,
      slug: teaCategory.slug,
      isActive: teaCategory.isActive,
    });
    setIsEditAutoSlug(true);
    setShowEditModal(true);
  };

  // Handler for updating categories
  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (categoryType === 'product' && !editingCategoryId) return;
    if (categoryType === 'tea' && !editingTeaCategorySlug) return;

    setIsSubmitting(true);
    setError("");

    try {
      let endpoint: string;
      let formData: any;

      if (categoryType === 'product') {
        endpoint = `${DEPLOY_URL}/api/dashboard/categories/${editingCategoryId}`;
        formData = editCategoryFormData;
      } else {
        endpoint = `${DEPLOY_URL}/api/dashboard/tea-categories/${editingTeaCategorySlug}`;
        formData = editTeaCategoryFormData;
      }

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json() as { error?: string };
        throw new Error(errorData.error || 'Failed to update category');
      }

      toast.success(`${categoryType === 'product' ? 'Category' : 'Tea category'} updated successfully!`);

      // Refresh the relevant query
      queryClient.invalidateQueries({ 
        queryKey: categoryType === 'product' 
          ? ["dashboard-categories"] 
          : ["dashboard-tea-categories"] 
      });

      closeEditModal();
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
    setEditingTeaCategorySlug(null);
    setEditCategoryFormData({
      name: "",
      slug: "",
      image: "",
      isActive: true,
    });
    setEditTeaCategoryFormData({
      name: "",
      slug: "",
      isActive: true,
    });
    setIsEditAutoSlug(false);
    setError("");
  };

  // Handler for deleting product categories
  const handleDeleteCategoryClick = (category: Category) => {
    setCategoryType('product');
    setDeletingCategoryId(category.id);
    setDeletingTeaCategorySlug(null);
    setShowDeleteDialog(true);
  };

  // Handler for deleting tea categories
  const handleDeleteTeaCategoryClick = (teaCategory: TeaCategory) => {
    setCategoryType('tea');
    setDeletingTeaCategorySlug(teaCategory.slug);
    setDeletingCategoryId(null);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (categoryType === 'product' && !deletingCategoryId) return;
    if (categoryType === 'tea' && !deletingTeaCategorySlug) return;

    setIsDeleting(true);
    setError("");

    try {
      let endpoint: string;

      if (categoryType === 'product') {
        endpoint = `${DEPLOY_URL}/api/dashboard/categories/${deletingCategoryId}`;
      } else {
        endpoint = `${DEPLOY_URL}/api/dashboard/tea-categories/${deletingTeaCategorySlug}`;
      }

      const response = await fetch(endpoint, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json() as { error?: string };
        throw new Error(errorData.error || 'Failed to delete category');
      }

      toast.success(`${categoryType === 'product' ? 'Category' : 'Tea category'} deleted successfully!`);

      // Refresh the relevant query
      queryClient.invalidateQueries({ 
        queryKey: categoryType === 'product' 
          ? ["dashboard-categories"] 
          : ["dashboard-tea-categories"] 
      });

      setShowDeleteDialog(false);
      setDeletingCategoryId(null);
      setDeletingTeaCategorySlug(null);
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
    setDeletingTeaCategorySlug(null);
  };

  return (
    <div className="space-y-6 px-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="">Categories Management</h1>
          
        </div>
      </div>

      {/* Two-column layout for categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Categories Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Product Categories</h3>
            <Button 
              onClick={() => {
                setCategoryType('product');
                setShowCreateDrawer(true);
              }} 
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Category
            </Button>
          </div>

          <div>
            {categoriesPending ? (
              <div className="text-center py-8">Loading product categories...</div>
            ) : !categoriesData || categoriesData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No product categories found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <tbody className="divide-y divide-border">
                    {categoriesData?.map((category) => (
                      <tr key={category.id} className="hover:bg-muted/30">
                        <td className="px-1 py-4">
                          <div>
                            <div className="font-medium">{category.name}</div>
                            <div className="text-sm text-muted-foreground">{category.slug}</div>
                          </div>
                        </td>
                        <td className="px-1 py-4">
                          <Badge variant={category.isActive ? "default" : "secondary"}>
                            {category.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="px-1 py-4 text-right">
                          <div className="flex space-x-2 justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditCategory(category)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteCategoryClick(category)}
                            >
                              Delete
                            </Button>
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

        {/* Tea Categories Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Tea Categories</h3>
            <Button 
              onClick={() => {
                setCategoryType('tea');
                setShowCreateDrawer(true);
              }} 
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Tea Category
            </Button>
          </div>

          <div>
            {teaCategoriesPending ? (
              <div className="text-center py-8">Loading tea categories...</div>
            ) : !teaCategoriesData || teaCategoriesData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No tea categories found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <tbody className="divide-y divide-border">
                    {teaCategoriesData?.map((teaCategory) => (
                      <tr key={teaCategory.slug} className="hover:bg-muted/30">
                        <td className="px-1 py-4">
                          <div>
                            <div className="font-medium">{teaCategory.name}</div>
                            <div className="text-sm text-muted-foreground">{teaCategory.slug}</div>
                          </div>
                        </td>
                        <td className="px-1 py-4">
                          <Badge variant={teaCategory.isActive ? "default" : "secondary"}>
                            {teaCategory.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="px-1 py-4 text-right">
                          <div className="flex space-x-2 justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditTeaCategory(teaCategory)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteTeaCategoryClick(teaCategory)}
                            >
                              Delete
                            </Button>
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
      </div>

      {/* Create Category Drawer */}
      <Drawer open={showCreateDrawer} onOpenChange={setShowCreateDrawer}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>
              Add New {categoryType === 'product' ? 'Product Category' : 'Tea Category'}
            </DrawerTitle>
          </DrawerHeader>

          <DrawerBody>
            {error && !showEditModal && (
              <div className="bg-destructive/20 border border-destructive text-destructive-foreground px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} id="createCategoryForm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {categoryType === 'product' ? 'Category' : 'Tea Category'} Name *
                  </label>
                  <Input
                    type="text"
                    name="name"
                    value={categoryType === 'product' ? createCategoryFormData.name : createTeaCategoryFormData.name}
                    onChange={categoryType === 'product' ? handleCreateCategoryChange : handleCreateTeaCategoryChange}
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
                      value={categoryType === 'product' ? createCategoryFormData.slug : createTeaCategoryFormData.slug}
                      onChange={categoryType === 'product' ? handleCreateCategoryChange : handleCreateTeaCategoryChange}
                      required
                    />
                    <Button
                      type="button"
                      className="ml-2"
                      size="sm"
                      onClick={() => {
                        setIsCreateAutoSlug(true);
                        const formData = categoryType === 'product' ? createCategoryFormData : createTeaCategoryFormData;
                        const setFormData = categoryType === 'product' ? setCreateCategoryFormData : setCreateTeaCategoryFormData;
                        
                        if (formData.name) {
                          const slug = formData.name
                            .toLowerCase()
                            .replace(/[^\w\s-]/g, "")
                            .replace(/\s+/g, "-")
                            .replace(/-+/g, "-")
                            .trim();

                          setFormData((prev: any) => ({
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

                {categoryType === 'product' && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">
                      Image URL
                    </label>
                    <Input
                      type="text"
                      name="image"
                      value={createCategoryFormData.image}
                      onChange={handleCreateCategoryChange}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                )}

                <div className="md:col-span-2">
                  <div className="flex items-center">
                    <Switch
                      name="isActive"
                      checked={categoryType === 'product' ? createCategoryFormData.isActive : createTeaCategoryFormData.isActive}
                      onChange={categoryType === 'product' ? handleCreateCategoryChange : handleCreateTeaCategoryChange}
                    />
                    <label className="ml-2 text-sm">Active</label>
                  </div>
                </div>
              </div>
            </form>
          </DrawerBody>

          <DrawerFooter className="border-t border-border bg-background">
            <div className="flex justify-end space-x-2">
              <Button
                variant="secondaryInverted"
                type="button"
                onClick={closeCreateDrawer}
              >
                Cancel
              </Button>
              <Button
                variant="greenInverted"
                type="submit"
                form="createCategoryForm"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : `Create ${categoryType === 'product' ? 'Category' : 'Tea Category'}`}
              </Button>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Edit Category Drawer */}
      <Drawer open={showEditModal} onOpenChange={setShowEditModal}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>
              Edit {categoryType === 'product' ? 'Product Category' : 'Tea Category'}
            </DrawerTitle>
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
                    {categoryType === 'product' ? 'Category' : 'Tea Category'} Name *
                  </label>
                  <Input
                    type="text"
                    name="name"
                    value={categoryType === 'product' ? editCategoryFormData.name : editTeaCategoryFormData.name}
                    onChange={categoryType === 'product' ? handleEditCategoryChange : handleEditTeaCategoryChange}
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
                      value={categoryType === 'product' ? editCategoryFormData.slug : editTeaCategoryFormData.slug}
                      onChange={categoryType === 'product' ? handleEditCategoryChange : handleEditTeaCategoryChange}
                      required
                    />
                    <Button
                      size="sm"
                      type="button"
                      onClick={() => {
                        setIsEditAutoSlug(true);
                        const formData = categoryType === 'product' ? editCategoryFormData : editTeaCategoryFormData;
                        const setFormData = categoryType === 'product' ? setEditCategoryFormData : setEditTeaCategoryFormData;
                        
                        if (formData.name) {
                          const slug = formData.name
                            .toLowerCase()
                            .replace(/[^\w\s-]/g, "")
                            .replace(/\s+/g, "-")
                            .replace(/-+/g, "-")
                            .trim();

                          setFormData((prev: any) => ({
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

                {categoryType === 'product' && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">
                      Image URL
                    </label>
                    <Input
                      type="text"
                      name="image"
                      value={editCategoryFormData.image}
                      onChange={handleEditCategoryChange}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                )}

                <div className="md:col-span-2">
                  <div className="flex items-center">
                    <Switch
                      name="isActive"
                      checked={categoryType === 'product' ? editCategoryFormData.isActive : editTeaCategoryFormData.isActive}
                      onChange={categoryType === 'product' ? handleEditCategoryChange : handleEditTeaCategoryChange}
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
                {isSubmitting ? "Updating..." : `Update ${categoryType === 'product' ? 'Category' : 'Tea Category'}`}
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
          title={`Delete ${categoryType === 'product' ? 'Category' : 'Tea Category'}`}
          description={`Are you sure you want to delete this ${categoryType === 'product' ? 'category' : 'tea category'}? This action cannot be undone.`}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}
