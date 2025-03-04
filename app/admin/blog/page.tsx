"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BlogPost, BlogPostFormData, BlogCategory } from "@/types";
import {
  getAdminBlogPosts,
  getBlogPostById,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  getAllBlogCategories,
} from "@/lib/actions/blog";
import DeleteConfirmationDialog from "@/components/ui/admin/DeleteConfirmationDialog";
import { toast } from "sonner";
import ProductSelector from "@/components/ui/admin/ProductSelector";
import Link from "next/link";
import BlogCategoryManager from "@/components/ui/admin/BlogCategoryManager";

export default function BlogPage() {
  const router = useRouter();

  // Form data states
  const [createFormData, setCreateFormData] = useState<BlogPostFormData>({
    title: "",
    slug: "",
    body: "",
    blogCategorySlug: "",
    productSlug: "",
    images: "",
    publishedAt: new Date().toISOString(),
  });

  const [editFormData, setEditFormData] = useState<BlogPostFormData>({
    title: "",
    slug: "",
    body: "",
    blogCategorySlug: "",
    productSlug: "",
    images: "",
    publishedAt: "",
  });

  // UI states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [blogCategories, setBlogCategories] = useState<BlogCategory[]>([]);
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
    fetchBlogCategories();
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

  const fetchBlogCategories = async () => {
    try {
      const categoriesData = await getAllBlogCategories();
      setBlogCategories(categoriesData || []);
    } catch (err) {
      console.error("Error fetching blog categories:", err);
      toast.error("Failed to fetch blog categories");
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
        blogCategorySlug: "",
        productSlug: "",
        images: "",
        publishedAt: new Date().toISOString(),
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
          title: postData.title,
          slug: postData.slug,
          body: postData.body || "",
          blogCategorySlug: postData.blogCategorySlug || "",
          productSlug: postData.productSlug || "",
          images: postData.images || "",
          publishedAt: postData.publishedAt || "",
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
        blogCategorySlug: "",
        productSlug: "",
        images: "",
        publishedAt: "",
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
      blogCategorySlug: "",
      productSlug: "",
      images: "",
      publishedAt: "",
    });
    setIsEditAutoSlug(false);
    setError("");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Blog Management</h1>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Create Blog Post Form */}
        <div className="bg-card p-6 rounded shadow border border-border">
          <h2 className="text-xl font-semibold mb-4">Add New Blog Post</h2>

          {error && !showEditModal && (
            <div className="bg-destructive/20 border border-destructive text-destructive-foreground px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block mb-2" htmlFor="title">
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={createFormData.title}
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
              <label className="block mb-2" htmlFor="blogCategorySlug">
                Category
              </label>
              <select
                id="blogCategorySlug"
                name="blogCategorySlug"
                value={createFormData.blogCategorySlug}
                onChange={handleCreateChange}
                className="w-full px-3 py-2 bg-muted border border-input rounded"
              >
                <option value="">Select a category</option>
                {blogCategories.map((category) => (
                  <option key={category.id} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block mb-2" htmlFor="body">
                Content
              </label>
              <textarea
                id="body"
                name="body"
                value={createFormData.body}
                onChange={handleCreateChange}
                className="w-full px-3 py-2 bg-muted border border-input rounded"
                rows={6}
                required
              />
            </div>

            <div className="mb-4">
              <label className="block mb-2" htmlFor="images">
                Images (comma-separated URLs)
              </label>
              <input
                type="text"
                id="images"
                name="images"
                value={createFormData.images}
                onChange={handleCreateChange}
                className="w-full px-3 py-2 bg-muted border border-input rounded"
              />
            </div>

            <div className="mb-4">
              <label className="block mb-2" htmlFor="productSlug">
                Related Product
              </label>
              <ProductSelector
                selectedProductSlug={createFormData.productSlug || ""}
                onProductSelect={handleProductSelect}
              />
            </div>

            <button
              type="submit"
              className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adding..." : "Add Blog Post"}
            </button>
          </form>
        </div>

        {/* Blog Posts List */}
        <div className="bg-card p-6 rounded shadow border border-border">
          <h2 className="text-xl font-semibold mb-4">Blog Posts</h2>

          {isLoading ? (
            <p className="text-muted-foreground">Loading blog posts...</p>
          ) : blogPosts.length === 0 ? (
            <p className="text-muted-foreground">No blog posts found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="px-6 py-3 border-b border-border text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 border-b border-border text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 border-b border-border text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Published
                    </th>
                    <th className="px-6 py-3 border-b border-border text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Related Product
                    </th>
                    <th className="px-6 py-3 border-b border-border text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {blogPosts.map((post) => (
                    <tr key={post.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {post.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {post.blogCategorySlug || "Uncategorized"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {post.publishedAt
                          ? new Date(post.publishedAt).toLocaleDateString()
                          : "Draft"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {post.productSlug ? (
                          <Link
                            href={`/products/${post.productSlug}`}
                            target="_blank"
                            className="text-blue-400 hover:underline"
                          >
                            {post.productSlug}
                          </Link>
                        ) : (
                          "None"
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => handleEdit(post)}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClick(post)}
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

      {/* Blog Category Management Section */}
      <div className="mt-12">
        <BlogCategoryManager />
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded shadow-lg w-full max-w-2xl max-h-screen overflow-y-auto border border-border">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Edit Blog Post</h2>
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
                <label className="block mb-2" htmlFor="edit-title">
                  Title
                </label>
                <input
                  type="text"
                  id="edit-title"
                  name="title"
                  value={editFormData.title}
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
                <label className="block mb-2" htmlFor="edit-blogCategorySlug">
                  Category
                </label>
                <select
                  id="edit-blogCategorySlug"
                  name="blogCategorySlug"
                  value={editFormData.blogCategorySlug}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 bg-muted border border-input rounded"
                >
                  <option value="">Select a category</option>
                  {blogCategories.map((category) => (
                    <option key={category.id} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block mb-2" htmlFor="edit-body">
                  Content
                </label>
                <textarea
                  id="edit-body"
                  name="body"
                  value={editFormData.body}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 bg-muted border border-input rounded"
                  rows={6}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2" htmlFor="edit-images">
                  Images (comma-separated URLs)
                </label>
                <input
                  type="text"
                  id="edit-images"
                  name="images"
                  value={editFormData.images}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 bg-muted border border-input rounded"
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2" htmlFor="edit-productSlug">
                  Related Product
                </label>
                <ProductSelector
                  selectedProductSlug={editFormData.productSlug || ""}
                  onProductSelect={handleEditProductSelect}
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2" htmlFor="edit-publishedAt">
                  Published Date
                </label>
                <input
                  type="datetime-local"
                  id="edit-publishedAt"
                  name="publishedAt"
                  value={
                    editFormData.publishedAt
                      ? new Date(editFormData.publishedAt)
                          .toISOString()
                          .slice(0, 16)
                      : ""
                  }
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 bg-muted border border-input rounded"
                />
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
                  {isSubmitting ? "Updating..." : "Update Blog Post"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Blog Post"
        description="Are you sure you want to delete this blog post? This action cannot be undone."
        isDeleting={isDeleting}
      />
    </div>
  );
}
