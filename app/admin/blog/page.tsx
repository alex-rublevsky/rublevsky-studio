"use client";

//TODO: update input to include label

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BlogPost, BlogPostFormData, TeaCategory } from "@/types";
import {
  getAdminBlogPosts,
  getBlogPostById,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  getAllTeaCategories,
} from "@/lib/actions/blog";
import DeleteConfirmationDialog from "@/components/ui/admin/DeleteConfirmationDialog";
import { toast } from "sonner";
import ProductSelector from "@/components/ui/admin/ProductSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerBody,
} from "@/components/ui/drawer";

export default function BlogPage() {
  const router = useRouter();
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Form data states
  const [createFormData, setCreateFormData] = useState<BlogPostFormData>({
    title: "",
    slug: "",
    body: "",
    teaCategories: [],
    productSlug: "",
    images: "",
    publishedAt: Date.now(), // Current timestamp in milliseconds
  });

  const [editFormData, setEditFormData] = useState<BlogPostFormData>({
    title: "",
    slug: "",
    body: "",
    teaCategories: [],
    productSlug: "",
    images: "",
    publishedAt: Date.now(), // Current timestamp in milliseconds
  });

  // UI states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [teaCategories, setTeaCategories] = useState<TeaCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateAutoSlug, setIsCreateAutoSlug] = useState(true);
  const [isEditAutoSlug, setIsEditAutoSlug] = useState(false);
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingPostId, setDeletingPostId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchBlogPosts();
    fetchTeaCategories();
  }, []);

  // Generate slug from post title for create form
  useEffect(() => {
    if (isCreateAutoSlug && createFormData.title) {
      const slug = createFormData.title
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
  }, [createFormData.title, isCreateAutoSlug]);

  // Generate slug from post title for edit form
  useEffect(() => {
    if (isEditAutoSlug && editFormData.title) {
      const slug = editFormData.title
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
  }, [editFormData.title, isEditAutoSlug]);

  const fetchBlogPosts = async () => {
    setIsLoading(true);
    try {
      const postsData = await getAdminBlogPosts();
      setBlogPosts(postsData || []);
    } catch (err) {
      console.error("Error fetching blog posts:", err);
      toast.error("Failed to fetch blog posts");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTeaCategories = async () => {
    try {
      const categoriesData = await getAllTeaCategories();
      setTeaCategories(categoriesData || []);
    } catch (err) {
      console.error("Error fetching tea categories:", err);
      toast.error("Failed to fetch tea categories");
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

  const handleCategoryChange = (value: string[]) => {
    setCreateFormData({
      ...createFormData,
      teaCategories: value,
    });
  };

  const handleEditCategoryChange = (value: string[]) => {
    setEditFormData({
      ...editFormData,
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
      await createBlogPost(createFormData);

      toast.success("Blog post added successfully!");

      setCreateFormData({
        title: "",
        slug: "",
        body: "",
        teaCategories: [],
        productSlug: "",
        images: "",
        publishedAt: Date.now(), // Current timestamp in milliseconds
      });
      setIsCreateAutoSlug(true);
      router.refresh();
      fetchBlogPosts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast.error(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (post: BlogPost) => {
    setEditingPostId(post.id);
    setShowEditModal(true);
    setIsEditAutoSlug(false);

    try {
      const postData = await getBlogPostById(post.id);

      if (postData) {
        setEditFormData({
          title: postData.title || "",
          slug: postData.slug,
          body: postData.body || "",
          teaCategories: postData.teaCategories || [],
          productSlug: postData.productSlug || "",
          images: postData.images || "",
          publishedAt: postData.publishedAt,
        });
      }
    } catch (err) {
      console.error("Error fetching blog post details:", err);
      toast.error("Failed to fetch blog post details");
    }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingPostId) return;

    setIsSubmitting(true);
    setError("");

    try {
      await updateBlogPost(editingPostId, editFormData);

      toast.success("Blog post updated successfully!");

      setShowEditModal(false);
      setEditingPostId(null);
      setEditFormData({
        title: "",
        slug: "",
        body: "",
        teaCategories: [],
        productSlug: "",
        images: "",
        publishedAt: Date.now(), // Current timestamp in milliseconds
      });
      setIsEditAutoSlug(false);
      router.refresh();
      fetchBlogPosts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast.error(err instanceof Error ? err.message : "An error occurred");
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
      await deleteBlogPost(deletingPostId);

      toast.success("Blog post deleted successfully!");

      setShowDeleteDialog(false);
      setDeletingPostId(null);
      router.refresh();
      fetchBlogPosts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast.error(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
    setDeletingPostId(null);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingPostId(null);
    setEditFormData({
      title: "",
      slug: "",
      body: "",
      teaCategories: [],
      productSlug: "",
      images: "",
      publishedAt: Date.now(), // Current timestamp in milliseconds
    });
    setIsEditAutoSlug(false);
    setError("");
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Blog Posts</h1>
        <div className="flex space-x-2">
          <Button
            variant="inverted"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? "Hide Form" : "Add New Blog Post"}
          </Button>
        </div>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-card rounded-lg shadow border border-border">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Create New Blog Post</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Title"
                id="title"
                name="title"
                value={createFormData.title}
                onChange={handleCreateChange}
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
                <div className="space-y-2">
                  {teaCategories.map((category) => (
                    <label
                      key={category.slug}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        checked={
                          createFormData.teaCategories?.includes(
                            category.slug
                          ) ?? false
                        }
                        onChange={(e) => {
                          const newCategories = e.target.checked
                            ? [
                                ...(createFormData.teaCategories || []),
                                category.slug,
                              ]
                            : (createFormData.teaCategories || []).filter(
                                (slug) => slug !== category.slug
                              );
                          setCreateFormData((prev) => ({
                            ...prev,
                            teaCategories: newCategories,
                          }));
                        }}
                        className="h-4 w-4 rounded border-gray-300"
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
                  onProductSelect={(value: string) =>
                    setCreateFormData((prev) => ({
                      ...prev,
                      productSlug: value,
                    }))
                  }
                />
              </div>

              <div>
                <label
                  htmlFor="body"
                  className="block text-sm font-medium mb-1"
                >
                  Content
                </label>
                <Textarea
                  id="body"
                  name="body"
                  value={createFormData.body}
                  onChange={handleCreateChange}
                  required
                  rows={10}
                />
              </div>

              <div>
                <label
                  htmlFor="images"
                  className="block text-sm font-medium mb-1"
                >
                  Images (comma-separated URLs)
                </label>
                <Input
                  id="images"
                  name="images"
                  value={createFormData.images}
                  onChange={handleCreateChange}
                />
              </div>

              <div>
                <label
                  htmlFor="publishedAt"
                  className="block text-sm font-medium mb-1"
                >
                  Published At
                </label>
                <Input
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
              </div>

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Post"}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Blog Posts List */}
      <div className="bg-card rounded-lg shadow border border-border">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Blog Posts</h2>
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

      {/* Replace Edit Modal with Drawer */}
      <Drawer open={showEditModal} onOpenChange={setShowEditModal}>
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
                      <input
                        type="checkbox"
                        checked={
                          editFormData.teaCategories?.includes(category.slug) ??
                          false
                        }
                        onChange={(e) => {
                          const newCategories = e.target.checked
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
                        className="h-4 w-4 rounded border-gray-300"
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
                  onProductSelect={(value: string) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      productSlug: value,
                    }))
                  }
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
                label="Publisehd at"
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
                onClick={closeEditModal}
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
