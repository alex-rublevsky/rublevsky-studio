import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BlogPost, BlogPostFormData, TeaCategory } from "~/types";
import { DEPLOY_URL } from "~/utils/store";
import { Plus } from "lucide-react";

import DeleteConfirmationDialog from "~/components/ui/dashboard/ConfirmationDialog";
import { toast } from "sonner";
import ProductSelector from "~/components/ui/dashboard/ProductSelector";
import { Button } from "~/components/ui/shared/Button";
import { Input } from "~/components/ui/shared/Input";
import { Textarea } from "~/components/ui/shared/TextArea";
import { Checkbox } from "~/components/ui/shared/Checkbox";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerBody,
} from "~/components/ui/shared/Drawer";

export const Route = createFileRoute("/dashboard/blog")({
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();

  // Query for blog posts and tea categories
  const {
    isPending: isLoading,
    isError,
    data,
    refetch: refetchBlog,
  } = useQuery<{
    posts: BlogPost[];
    teaCategories: TeaCategory[];
  }>({
    queryKey: ["dashboard-blog"],
    queryFn: () =>
      fetch(`${DEPLOY_URL}/api/dashboard/blog`).then((res) => res.json()),
  });

  const blogPosts = data?.posts || [];
  const teaCategories = data?.teaCategories || [];
  const errorMessage = isError;

  const [showCreateDrawer, setShowCreateDrawer] = useState(false);

  // Form data states
  const [createFormData, setCreateFormData] = useState<BlogPostFormData>({
    title: "",
    slug: "",
    body: "",
    teaCategories: [],
    productSlug: "",
    images: "",
    publishedAt: Date.now(),
  });

  const [editFormData, setEditFormData] = useState<BlogPostFormData>({
    title: "",
    slug: "",
    body: "",
    teaCategories: [],
    productSlug: "",
    images: "",
    publishedAt: Date.now(),
  });

  // UI states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isCreateAutoSlug, setIsCreateAutoSlug] = useState(true);
  const [isEditAutoSlug, setIsEditAutoSlug] = useState(false);
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [showEditDrawer, setShowEditDrawer] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingPostId, setDeletingPostId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Auto-generate slugs
  useEffect(() => {
    if (isCreateAutoSlug && createFormData.title) {
      const slug = createFormData.title
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
  }, [createFormData.title, isCreateAutoSlug]);

  useEffect(() => {
    if (isEditAutoSlug && editFormData.title) {
      const slug = editFormData.title
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
  }, [editFormData.title, isEditAutoSlug]);

  // Event handlers
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

  const handleCategoryChange = (value: string[]) => {
    setCreateFormData({
      ...createFormData,
      teaCategories: value,
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

  const handleProductSelect = (productSlug: string) => {
    setCreateFormData({
      ...createFormData,
      productSlug,
    });
  };

  const handleEditProductSelect = (productSlug: string) => {
    setEditFormData({
      ...editFormData,
      productSlug,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await fetch(`${DEPLOY_URL}/api/dashboard/blog`, {
        method: "POST",
        body: JSON.stringify(createFormData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      toast.success("Blog post added successfully!");

      closeCreateDrawer();
      refetchBlog();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeCreateDrawer = () => {
    setShowCreateDrawer(false);
    setCreateFormData({
      title: "",
      slug: "",
      body: "",
      teaCategories: [],
      productSlug: "",
      images: "",
      publishedAt: Date.now(),
    });
    setIsCreateAutoSlug(true);
    setError("");
  };

  const handleEdit = async (post: BlogPost) => {
    setEditingPostId(post.id);
    setShowEditDrawer(true);
    setIsEditAutoSlug(false);
    setEditFormData({
      title: post.title || "",
      slug: post.slug,
      body: post.body || "",
      teaCategories: post.teaCategories || [],
      productSlug: post.productSlug || "",
      images: post.images || "",
      publishedAt: post.publishedAt,
    });
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingPostId) return;

    setIsSubmitting(true);
    setError("");

    try {
      await fetch(`${DEPLOY_URL}/api/dashboard/blog/${editingPostId}`, {
        method: "PUT",
        body: JSON.stringify(editFormData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      toast.success("Blog post updated successfully!");
      closeEditDrawer();
      refetchBlog();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (post: BlogPost) => {
    setDeletingPostId(post.id);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingPostId) return;

    setIsDeleting(true);
    setError("");

    try {
      await fetch(`${DEPLOY_URL}/api/dashboard/blog/${deletingPostId}`, {
        method: "DELETE",
      });

      toast.success("Blog post deleted successfully!");
      setShowDeleteDialog(false);
      setDeletingPostId(null);
      refetchBlog();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const closeEditDrawer = () => {
    setShowEditDrawer(false);
    setEditingPostId(null);
    setEditFormData({
      title: "",
      slug: "",
      body: "",
      teaCategories: [],
      productSlug: "",
      images: "",
      publishedAt: Date.now(),
    });
    setIsEditAutoSlug(false);
    setError("");
  };

  // JSX
  if (errorMessage) {
    return (
      <div className="bg-destructive/20 border border-destructive text-destructive-foreground px-4 py-3 rounded">
        {errorMessage}
      </div>
    );
  }

  return (
    <div>
      {/* Fixed Create Button */}
      <div className="fixed bottom-3 right-3 z-50">
        <Button
          onClick={() => setShowCreateDrawer(true)}
          size="lg"
          className="hover:backdrop-blur-sm"
        >
          <Plus />
          Add New Blog Post
        </Button>
      </div>

      {/* Blog Posts List */}
      <Drawer open={showCreateDrawer} onOpenChange={setShowCreateDrawer}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Create New Blog Post</DrawerTitle>
          </DrawerHeader>

          <DrawerBody>
            {error && (
              <div className="bg-destructive/20 border border-destructive text-destructive-foreground px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
              id="createBlogForm"
            >
              <Input
                label="Title"
                id="title"
                name="title"
                value={createFormData.title}
                onChange={handleCreateChange}
                required
              />

              <Input
                label="Slug"
                id="slug"
                name="slug"
                value={createFormData.slug}
                onChange={handleCreateChange}
                required
              />

              <div>
                <label className="block text-sm font-medium mb-2">
                  Tea Categories
                </label>
                <div className="space-y-2 border border-input rounded-md p-3 max-h-40 overflow-y-auto">
                  {teaCategories.map((category) => (
                    <label
                      key={category.slug}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        checked={
                          createFormData.teaCategories?.includes(
                            category.slug
                          ) ?? false
                        }
                        onCheckedChange={(checked) => {
                          const newCategories = checked
                            ? [
                                ...(createFormData.teaCategories || []),
                                category.slug,
                              ]
                            : (createFormData.teaCategories || []).filter(
                                (slug) => slug !== category.slug
                              );
                          handleCategoryChange(newCategories);
                        }}
                      />
                      <span>{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label
                  htmlFor="product"
                  className="block text-sm font-medium mb-1"
                >
                  Related Product
                </label>
                <ProductSelector
                  selectedProductSlug={createFormData.productSlug || ""}
                  onProductSelect={handleProductSelect}
                />
              </div>

              <Textarea
                label="Content"
                id="body"
                name="body"
                value={createFormData.body}
                onChange={handleCreateChange}
                required
                rows={10}
              />

              <Input
                label="Images (comma-separated URLs)"
                id="images"
                name="images"
                value={createFormData.images}
                onChange={handleCreateChange}
              />

              <Input
                label="Published At"
                id="publishedAt"
                name="publishedAt"
                type="datetime-local"
                value={new Date(createFormData.publishedAt)
                  .toISOString()
                  .slice(0, 16)}
                onChange={(e) => {
                  const date = new Date(e.target.value);
                  setCreateFormData((prev) => ({
                    ...prev,
                    publishedAt: date.getTime(),
                  }));
                }}
                required
              />
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
                form="createBlogForm"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Post"}
              </Button>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Blog Posts List */}
      <div className="bg-card rounded-lg shadow-sm border border-border">
        <div className="p-6">
          {isLoading ? (
            <p>Loading blog posts...</p>
          ) : blogPosts.length === 0 ? (
            <p>No blog posts found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left">Title</th>
                    <th className="px-4 py-2 text-left">Tea Category</th>
                    <th className="px-4 py-2 text-left">Related Product</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {blogPosts.map((post) => (
                    <tr key={post.id}>
                      <td className="px-4 py-2">{post.title}</td>
                      <td className="px-4 py-2">
                        {post.teaCategories
                          ?.map(
                            (slug) =>
                              teaCategories.find((c) => c.slug === slug)?.name
                          )
                          .filter(Boolean)
                          .join(", ") || "None"}
                      </td>
                      <td className="px-4 py-2">
                        {post.productSlug || "None"}
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(post)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteClick(post)}
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

      {/* Edit Drawer */}
      <Drawer open={showEditDrawer} onOpenChange={setShowEditDrawer}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Edit Blog Post</DrawerTitle>
          </DrawerHeader>

          <DrawerBody>
            {error && (
              <div className="bg-destructive/20 border border-destructive text-destructive-foreground px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form
              onSubmit={handleUpdate}
              className="space-y-4"
              id="editBlogForm"
            >
              <div>
                <label
                  htmlFor="editTitle"
                  className="block text-sm font-medium mb-1"
                >
                  Title
                </label>
                <Input
                  id="editTitle"
                  name="title"
                  value={editFormData.title}
                  onChange={handleEditChange}
                />
              </div>

              <div>
                <label
                  htmlFor="editSlug"
                  className="block text-sm font-medium mb-1"
                >
                  Slug
                </label>
                <Input
                  id="editSlug"
                  name="slug"
                  value={editFormData.slug}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Tea Categories
                </label>
                <div className="space-y-2 border border-input rounded-md p-3 max-h-40 overflow-y-auto">
                  {teaCategories.map((category) => (
                    <label
                      key={category.slug}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        checked={
                          editFormData.teaCategories?.includes(category.slug) ??
                          false
                        }
                        onCheckedChange={(checked) => {
                          const newCategories = checked
                            ? [
                                ...(editFormData.teaCategories || []),
                                category.slug,
                              ]
                            : (editFormData.teaCategories || []).filter(
                                (slug) => slug !== category.slug
                              );
                          setEditFormData((prev) => ({
                            ...prev,
                            teaCategories: newCategories,
                          }));
                        }}
                      />
                      <span>{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label
                  htmlFor="editProduct"
                  className="block text-sm font-medium mb-1"
                >
                  Related Product
                </label>
                <ProductSelector
                  selectedProductSlug={editFormData.productSlug || ""}
                  onProductSelect={handleEditProductSelect}
                />
              </div>

              <Textarea
                label="Content"
                id="editBody"
                name="body"
                value={editFormData.body}
                onChange={handleEditChange}
                required
                rows={10}
              />

              <Input
                label="Images (comma-separated URLs)"
                id="editImages"
                name="images"
                value={editFormData.images}
                onChange={handleEditChange}
              />
              <Input
                id="editPublishedAt"
                label="Published at"
                name="publishedAt"
                type="datetime-local"
                value={new Date(editFormData.publishedAt)
                  .toISOString()
                  .slice(0, 16)}
                onChange={(e) => {
                  const date = new Date(e.target.value);
                  setEditFormData((prev) => ({
                    ...prev,
                    publishedAt: date.getTime(),
                  }));
                }}
                required
              />
            </form>
          </DrawerBody>

          <DrawerFooter className="border-t border-border bg-background">
            <div className="flex justify-end space-x-2">
              <Button
                variant="secondaryInverted"
                type="button"
                onClick={closeEditDrawer}
              >
                Cancel
              </Button>
              <Button
                variant="greenInverted"
                type="submit"
                form="editBlogForm"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Updating..." : "Update Post"}
              </Button>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <DeleteConfirmationDialog
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={handleDeleteConfirm}
          title="Delete Blog Post"
          description="Are you sure you want to delete this blog post? This action cannot be undone."
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}
