import {
	DndContext,
	type DragEndEvent,
	KeyboardSensor,
	PointerSensor,
	closestCenter,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	SortableContext,
	arrayMove,
	rectSortingStrategy,
	useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { uploadProductImage } from "~/server_functions/dashboard/store/uploadProductImage";
import { ASSETS_BASE_URL } from "~/constants/urls";
import { Button } from "../shared/Button";
import { Input } from "../shared/Input";
import { Textarea } from "../shared/TextArea";

interface ImageUploadProps {
	currentImages: string; // comma-separated string from the form
	onImagesChange: (images: string, deletedImages?: string[]) => void; // callback to update the form
	folder?: string;
	label?: string;
	maxSizeMB?: number;
}

interface SortableImageItemProps {
	image: string;
	index: number;
	onRemove: (index: number) => Promise<void>;
}

function SortableImageItem({ image, index, onRemove }: SortableImageItemProps) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: image });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			className="relative group bg-background rounded-lg border border-border overflow-hidden"
		>
			<div className="aspect-square relative">
				<img
					src={`${ASSETS_BASE_URL}/${image}`}
					alt={`Product ${index + 1}`}
					className="w-full h-full object-cover"
					onError={(e) => {
						e.currentTarget.src =
							"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23ddd' width='100' height='100'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999' font-size='14'%3ENo Image%3C/text%3E%3C/svg%3E";
					}}
				/>
				{/* Drag Handle */}
				<button
					type="button"
					{...attributes}
					{...listeners}
					className="absolute top-1 left-1 p-1.5 bg-primary text-primary-foreground rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
					title="Drag to reorder"
				>
					<GripVertical className="w-3 h-3" />
				</button>
				{/* Delete Button */}
				<button
					type="button"
					onClick={() => onRemove(index)}
					className="absolute top-1 right-1 p-1.5 bg-destructive text-destructive-foreground rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/90"
					title="Remove image"
				>
					<Trash2 className="w-3 h-3" />
				</button>
			</div>
			<div className="p-2 bg-background border-t border-border">
				<p className="text-xs truncate font-mono text-muted-foreground">
					{image.split("/").pop()}
				</p>
			</div>
		</div>
	);
}

export function ImageUpload({
	currentImages,
	onImagesChange,
	folder = "products",
	label = "Upload Image",
	maxSizeMB = 5,
}: ImageUploadProps) {
	const [isUploading, setIsUploading] = useState(false);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [imageList, setImageList] = useState<string[]>([]);
	const [showTextarea, setShowTextarea] = useState(false);
	const [deletedImages, setDeletedImages] = useState<string[]>([]); // Track images to delete
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Drag and drop sensors
	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor),
	);

	// Parse comma-separated string into array
	useEffect(() => {
		const images = currentImages
			? currentImages
					.split(",")
					.map((img) => img.trim())
					.filter(Boolean)
			: [];
		setImageList(images);
		// Reset deleted images when currentImages changes (e.g., modal reopened)
		setDeletedImages([]);
	}, [currentImages]);

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		// Validate file type
		const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
		if (!allowedTypes.includes(file.type)) {
			toast.error("Invalid file type. Only JPEG, PNG, and WebP are allowed.");
			return;
		}

		// Validate file size
		const maxSize = maxSizeMB * 1024 * 1024;
		if (file.size > maxSize) {
			toast.error(`File size must be less than ${maxSizeMB}MB`);
			return;
		}

		setSelectedFile(file);

		// Create preview
		const reader = new FileReader();
		reader.onloadend = () => {
			setPreviewUrl(reader.result as string);
		};
		reader.readAsDataURL(file);
	};

	const handleUpload = async () => {
		if (!selectedFile) {
			toast.error("Please select a file first");
			return;
		}

		setIsUploading(true);

		try {
			// Convert file to base64
			const reader = new FileReader();
			reader.onloadend = async () => {
				try {
					const base64String = reader.result as string;

					const result = await uploadProductImage({
						data: {
							fileData: base64String,
							fileName: selectedFile.name,
							fileType: selectedFile.type,
							fileSize: selectedFile.size,
							folder,
						},
					});

					if (result.success) {
						toast.success("Image uploaded successfully!");
						// Add new image to the list
						const newImages = [...imageList, result.filename];
						onImagesChange(newImages.join(", "));
						// Reset the form
						setSelectedFile(null);
						setPreviewUrl(null);
						if (fileInputRef.current) {
							fileInputRef.current.value = "";
						}
					}
				} catch (error) {
					console.error("Upload error:", error);
					toast.error(
						error instanceof Error ? error.message : "Failed to upload image",
					);
				} finally {
					setIsUploading(false);
				}
			};

			reader.onerror = () => {
				toast.error("Failed to read file");
				setIsUploading(false);
			};

			reader.readAsDataURL(selectedFile);
		} catch (error) {
			console.error("Upload error:", error);
			toast.error(
				error instanceof Error ? error.message : "Failed to upload image",
			);
			setIsUploading(false);
		}
	};

	const handleClear = () => {
		setSelectedFile(null);
		setPreviewUrl(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const handleRemoveImage = async (index: number) => {
		const imageToRemove = imageList[index];

		// Mark image for deletion
		setDeletedImages((prev) => [...prev, imageToRemove]);

		// Remove from list
		const newImages = imageList.filter((_, i) => i !== index);
		const newImagesString = newImages.join(", ");

		// Update parent with new list and deleted images
		onImagesChange(newImagesString, [...deletedImages, imageToRemove]);
		toast.info("Image will be deleted when you save");
	};

	const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		onImagesChange(e.target.value);
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		if (over && active.id !== over.id) {
			const oldIndex = imageList.indexOf(active.id as string);
			const newIndex = imageList.indexOf(over.id as string);

			const newImages = arrayMove(imageList, oldIndex, newIndex);
			onImagesChange(newImages.join(", "));
		}
	};

	return (
		<div className="space-y-4">
			{/* Current Images List */}
			{imageList.length > 0 && (
				<div>
					<div className="flex items-center justify-between mb-2">
						<label className="block text-sm font-medium">
							Current Images ({imageList.length})
						</label>
						<Button
							type="button"
							onClick={() => setShowTextarea(!showTextarea)}
							variant="outline"
							size="sm"
						>
							{showTextarea ? "Hide" : "Edit"} Raw
						</Button>
					</div>

					{showTextarea ? (
						<Textarea
							value={currentImages}
							onChange={handleTextareaChange}
							placeholder="image1.jpg, image2.jpg, image3.jpg"
							className="h-32 resize-none font-mono text-xs"
							rows={4}
						/>
					) : (
						<DndContext
							sensors={sensors}
							collisionDetection={closestCenter}
							onDragEnd={handleDragEnd}
						>
							<SortableContext items={imageList} strategy={rectSortingStrategy}>
								<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-3 border border-border rounded-lg bg-muted/30">
									{imageList.map((image, index) => (
										<SortableImageItem
											key={image}
											image={image}
											index={index}
											onRemove={handleRemoveImage}
										/>
									))}
								</div>
							</SortableContext>
						</DndContext>
					)}
				</div>
			)}

			{/* Upload New Image */}
			<div className="border-t border-border pt-4">
				<div className="flex flex-col gap-2">
					<label className="block text-sm font-medium">{label}</label>
					<Input
						ref={fileInputRef}
						type="file"
						accept="image/jpeg,image/jpg,image/png,image/webp"
						onChange={handleFileChange}
						disabled={isUploading}
					/>
					<p className="text-xs text-muted-foreground">
						Accepted formats: JPEG, PNG, WebP. Max size: {maxSizeMB}MB
					</p>
					{selectedFile && (
						<p className="text-xs text-muted-foreground">
							Will save as: <span className="font-mono">{selectedFile.name}</span>
						</p>
					)}
				</div>

				{previewUrl && (
					<div className="relative inline-block mt-3">
						<img
							src={previewUrl}
							alt="Preview"
							className="max-w-xs max-h-48 rounded-lg border border-border"
						/>
						<button
							type="button"
							onClick={handleClear}
							className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors"
							disabled={isUploading}
						>
							<X className="w-4 h-4" />
						</button>
					</div>
				)}

				{selectedFile && (
					<div className="flex gap-2 mt-3">
						<Button
							type="button"
							onClick={handleUpload}
							disabled={isUploading}
							variant="greenInverted"
							size="sm"
						>
							{isUploading ? (
								<>
									<span className="animate-spin mr-2">⏳</span>
									Uploading...
								</>
							) : (
								<>
									<Upload className="w-4 h-4 mr-2" />
									Upload Image
								</>
							)}
						</Button>
						<Button
							type="button"
							onClick={handleClear}
							disabled={isUploading}
							variant="secondaryInverted"
							size="sm"
						>
							Clear
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}

