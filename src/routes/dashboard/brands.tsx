import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { toast } from "sonner";
import DeleteConfirmationDialog from "~/components/ui/dashboard/ConfirmationDialog";
import { Badge } from "~/components/ui/shared/Badge";
import { Button } from "~/components/ui/shared/Button";
import {
	Drawer,
	DrawerBody,
	DrawerContent,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from "~/components/ui/shared/Drawer";
import { Image } from "~/components/ui/shared/Image";
import { Input } from "~/components/ui/shared/Input";
import { Switch } from "~/components/ui/shared/Switch";
import { getAllBrands } from "~/server_functions/dashboard/getAllBrands";
import type { Brand, BrandFormData } from "~/types";

export const Route = createFileRoute("/dashboard/brands")({
	component: RouteComponent,
});

function RouteComponent() {
	const queryClient = useQueryClient();
	const createFormId = useId();
	const editFormId = useId();
	const editNameId = useId();
	const editSlugId = useId();
	const editLogoId = useId();
	const editIsActiveId = useId();
	const createNameId = useId();
	const createSlugId = useId();
	const createLogoId = useId();
	const createIsActiveId = useId();
	const { isPending, data } = useQuery<Brand[]>({
		queryKey: ["dashboard-brands"],
		queryFn: () => getAllBrands(),
	});
	// Separate form data for creating and editing
	const [createFormData, setCreateFormData] = useState<BrandFormData>({
		name: "",
		slug: "",
		logo: "",
		isActive: true,
	});
	const [editFormData, setEditFormData] = useState<BrandFormData>({
		name: "",
		slug: "",
		logo: "",
		isActive: true,
	});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState("");
	const [isCreateAutoSlug, setIsCreateAutoSlug] = useState(true);
	const [isEditAutoSlug, setIsEditAutoSlug] = useState(false);
	const [editingBrandId, setEditingBrandId] = useState<number | null>(null);
	const [showCreateDrawer, setShowCreateDrawer] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [deletingBrandId, setDeletingBrandId] = useState<number | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);

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

	const handleCreateChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
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
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
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
			// TODO: Implement API call to create brand
			// await createBrand({
			//   name: createFormData.name,
			//   slug: createFormData.slug,
			//   image: createFormData.logo || null,
			//   isActive: createFormData.isActive,
			// });

			toast.success("Brand added successfully!");

			closeCreateDrawer();
			queryClient.invalidateQueries({ queryKey: ["dashboard-brands"] });
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
			toast.error(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setIsSubmitting(false);
		}
	};

	const closeCreateDrawer = () => {
		setShowCreateDrawer(false);
		setCreateFormData({
			name: "",
			slug: "",
			logo: "",
			isActive: true,
		});
		setIsCreateAutoSlug(true);
		setError("");
	};

	const handleEdit = (brand: Brand) => {
		setEditingBrandId(brand.id);
		setEditFormData({
			name: brand.name,
			slug: brand.slug,
			logo: brand.image || "",
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
			// TODO: Implement API call to update brand
			// await updateBrand(editingBrandId, {
			//   name: editFormData.name,
			//   slug: editFormData.slug,
			//   image: editFormData.logo || null,
			//   isActive: editFormData.isActive,
			// });

			toast.success("Brand updated successfully!");

			setShowEditModal(false);
			setEditingBrandId(null);
			setEditFormData({
				name: "",
				slug: "",
				logo: "",
				isActive: true,
			});
			setIsEditAutoSlug(false);
			queryClient.invalidateQueries({ queryKey: ["dashboard-brands"] });
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
			logo: "",
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
			// TODO: Implement API call to delete brand
			// await deleteBrand(deletingBrandId);

			toast.success("Brand deleted successfully!");

			setShowDeleteDialog(false);
			setDeletingBrandId(null);
			queryClient.invalidateQueries({ queryKey: ["dashboard-brands"] });
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
			<div>
				{isPending ? (
					<div className="text-center py-4">Loading brands...</div>
				) : data === null ? (
					<div className="text-center py-4 text-muted-foreground">
						No brands found
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-border">
							<thead>
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
								{data?.map((brand) => (
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
														className="object-cover rounded"
													/>
												</div>
											) : (
												<span className="text-muted-foreground">No logo</span>
											)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<Badge variant={brand.isActive ? "default" : "secondary"}>
												{brand.isActive ? "Active" : "Inactive"}
											</Badge>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
											<Button
												size="sm"
												onClick={() => handleEdit(brand)}
												className="mr-4"
											>
												Edit
											</Button>
											<Button
												variant="invertedDestructive"
												size="sm"
												onClick={() => handleDeleteClick(brand)}
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

			{/* Create Brand Drawer */}
			<Drawer open={showCreateDrawer} onOpenChange={setShowCreateDrawer}>
				<DrawerContent>
					<DrawerHeader>
						<DrawerTitle>Add New Brand</DrawerTitle>
					</DrawerHeader>

					<DrawerBody>
						{error && !showEditModal && (
							<div className="bg-destructive/20 border border-destructive text-destructive-foreground px-4 py-3 rounded mb-4">
								{error}
							</div>
						)}

						<form onSubmit={handleSubmit} id={createFormId}>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div>
									<label
										htmlFor={createNameId}
										className="block text-sm font-medium mb-1"
									>
										Brand Name *
									</label>
									<Input
										id={createNameId}
										type="text"
										name="name"
										value={createFormData.name}
										onChange={handleCreateChange}
										required
									/>
								</div>

								<div>
									<label
										htmlFor={createSlugId}
										className="block text-sm font-medium mb-1"
									>
										Slug *{" "}
										<span className="text-xs text-muted-foreground">
											(Auto-generated from name)
										</span>
									</label>
									<div className="flex gap-2">
										<Input
											id={createSlugId}
											type="text"
											name="slug"
											value={createFormData.slug}
											onChange={handleCreateChange}
											required
										/>
										<Button
											type="button"
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
									<label
										htmlFor={createLogoId}
										className="block text-sm font-medium mb-1"
									>
										Logo URL
									</label>
									<Input
										id={createLogoId}
										type="text"
										name="logo"
										value={createFormData.logo}
										onChange={handleCreateChange}
										placeholder="https://example.com/logo.jpg"
									/>
								</div>

								<div className="md:col-span-2">
									<div className="flex items-center">
										<Switch
											id={createIsActiveId}
											name="isActive"
											checked={createFormData.isActive}
											onChange={handleCreateChange}
										/>
										<label htmlFor={createIsActiveId} className="ml-2 text-sm">
											Active
										</label>
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
								onClick={closeCreateDrawer}
							>
								Cancel
							</Button>
							<Button
								variant="greenInverted"
								type="submit"
								form="createBrandForm"
								disabled={isSubmitting}
							>
								{isSubmitting ? "Creating..." : "Create Brand"}
							</Button>
						</div>
					</DrawerFooter>
				</DrawerContent>
			</Drawer>

			<Drawer open={showEditModal} onOpenChange={setShowEditModal}>
				<DrawerContent>
					<DrawerHeader>
						<DrawerTitle>Edit Brand</DrawerTitle>
					</DrawerHeader>

					<DrawerBody>
						{error && showEditModal && (
							<div className="bg-destructive/20 border border-destructive text-destructive-foreground px-4 py-3 rounded mb-4">
								{error}
							</div>
						)}

						<form onSubmit={handleUpdate} id={editFormId}>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div>
									<label
										htmlFor={editNameId}
										className="block text-sm font-medium mb-1"
									>
										Brand Name *
									</label>
									<Input
										id={editNameId}
										type="text"
										name="name"
										value={editFormData.name}
										onChange={handleEditChange}
										required
									/>
								</div>

								<div>
									<label
										htmlFor={editSlugId}
										className="block text-sm font-medium mb-1"
									>
										Slug *{" "}
										<span className="text-xs text-muted-foreground">
											(Auto-generated from name)
										</span>
									</label>
									<div className="flex gap-2">
										<Input
											id={editSlugId}
											type="text"
											name="slug"
											value={editFormData.slug}
											onChange={handleEditChange}
											required
										/>
										<Button
											type="button"
											size="sm"
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
									<label
										htmlFor={editLogoId}
										className="block text-sm font-medium mb-1"
									>
										Logo URL
									</label>
									<Input
										id={editLogoId}
										type="text"
										name="logo"
										value={editFormData.logo}
										onChange={handleEditChange}
										placeholder="https://example.com/logo.jpg"
									/>
								</div>

								<div className="md:col-span-2">
									<div className="flex items-center">
										<Switch
											id={editIsActiveId}
											name="isActive"
											checked={editFormData.isActive}
											onChange={handleEditChange}
										/>
										<label htmlFor={editIsActiveId} className="ml-2 text-sm">
											Active
										</label>
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
								form="editBrandForm"
								disabled={isSubmitting}
							>
								{isSubmitting ? "Updating..." : "Update Brand"}
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
					title="Delete Brand"
					description="Are you sure you want to delete this brand? This action cannot be undone."
					isDeleting={isDeleting}
				/>
			)}

			{/* Floating Action Button */}
			<Button
				onClick={() => setShowCreateDrawer(true)}
				className="fixed bottom-3 right-3 z-50 "
				size="lg"
				aria-label="Add new brand"
			>
				<Plus size={24} /> Add New Brand
			</Button>
		</div>
	);
}
