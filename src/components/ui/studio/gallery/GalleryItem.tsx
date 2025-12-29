import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "~/components/ui/shared/Button";
import { useCursorHover } from "~/components/ui/shared/custom_cursor/CustomCursorContext";
import { Image } from "~/components/ui/shared/Image";
import { BlurHashPlaceholder } from "./BlurHashPlaceholder";
import type {
	GalleryItem as GalleryItemType,
	GalleryType,
} from "./galleryTypes.ts";

//import styles from "./branding-photography.module.css";

type GalleryItemProps = {
	item: GalleryItemType;
	index: number;
	onOpenGallery: (index: number, itemId: string) => void;
	galleryType: GalleryType;
};

export default function GalleryItemComponent({
	item,
	index,
	onOpenGallery,
	galleryType: _galleryType,
}: GalleryItemProps) {
	const { handleMouseEnter, handleMouseLeave } = useCursorHover("enlarge");
	const [imageLoaded, setImageLoaded] = useState(false);

	// Calculate aspect ratio from ratio string if provided
	const aspectRatioStyle = item.ratio
		? (() => {
				const [w, h] = item.ratio!.split("/").map(Number);
				if (w && h) {
					return { aspectRatio: `${w} / ${h}` };
				}
				return {};
			})()
		: {};

	// Simple delay: wait for view transition (400ms) + stagger
	const animationDelay = 500 + index * 30; // 500ms base (allows view transition to complete) + 30ms per item

	return (
		// biome-ignore lint/a11y/useSemanticElements: Gallery item with complex nested structure and animations
		<div
			//shadow-[0_5px_6px_rgb(0,0,0,0.08)]
			id={item.id}
			className="gallery-item-animate relative group rounded-lg overflow-hidden cursor-pointer md:cursor-none mb-3 break-inside-avoid transition-transform duration-250 ease-in-out hover:scale-[1.025]"
			style={{
				borderRadius: "0.5rem", // Ensure border-radius is preserved during view transitions and transforms
				backfaceVisibility: "hidden", // Prevent flickering during transforms
				WebkitBackfaceVisibility: "hidden", // Safari support
				// Use CSS custom property to preserve original order for animation
				["--animation-order" as string]: index,
				animationDelay: `${animationDelay}ms`,
				// Ensure items start hidden - inline styles take precedence over CSS classes
				// This prevents FOUC during page transitions
				opacity: 0,
				transform: "translateY(10px)",
			}}
			onClick={() => onOpenGallery(index, item.id)}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					onOpenGallery(index, item.id);
				}
			}}
			onMouseEnter={handleMouseEnter()}
			onMouseLeave={handleMouseLeave()}
			role="button"
			tabIndex={0}
		>
			{/* TODO: does this solve the problem on ios which needed custom css in branding-photography module? */}
			<div
				className="relative rounded-lg overflow-hidden"
				style={{
					...aspectRatioStyle,
					borderRadius: "0.5rem", // Ensure border-radius is preserved during view transitions
					viewTransitionName: `gallery-image-${item.id}`, // Move viewTransitionName to container to preserve border-radius
					backfaceVisibility: "hidden", // Prevent flickering during transforms
					WebkitBackfaceVisibility: "hidden", // Safari support
					transform: "translate3d(0, 0, 0)", // Force GPU layer to preserve border-radius during transitions
				}}
			>
				{/* BlurHash placeholder - shown while image loads */}
				{item.hash && item.hash.trim() !== "" && !imageLoaded && (
					<div className="absolute inset-0 w-full h-full">
						<BlurHashPlaceholder
							hash={item.hash}
							width={800}
							ratio={item.ratio}
							className="w-full h-full object-cover"
						/>
					</div>
				)}
				<Image
					id={`${item.id}-main-image`}
					src={`/${item.images[0]}`}
					alt={`Photo ${index + 1}`}
					width={800}
					height={600}
					className={`w-full ${item.ratio ? "h-full object-cover" : "h-auto"} transition-opacity duration-500 ease-out ${
						imageLoaded || !item.hash || item.hash.trim() === ""
							? "opacity-100"
							: "opacity-0"
					}`}
					loading="lazy"
					onLoad={() => setImageLoaded(true)}
				/>
				{item.images.length > 1 && (
					<Image
						id={`${item.id}-hover-image`}
						src={`/${item.images[1]}`}
						alt={`Photo ${index + 1} (hover)`}
						width={800}
						height={600}
						className="w-full h-full object-cover absolute top-0 left-0 opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100"
						loading="lazy"
						// priority={true}
					/>
				)}
			</div>

			{item.storeLink && (
				<Button
					asChild
					variant="default"
					size="lg"
					className="group-hover:opacity-100 opacity-0 backdrop-blur-md hover:bg-background/20 active:bg-background/20 absolute top-2 right-2 transition-all duration-300 ease-in-out"
				>
					<Link
						to="/store/$productId"
						params={{
							productId: item.storeLink,
						}}
					>
						Buy
					</Link>
				</Button>
			)}

			{(item.description || item.logo) && (
				<div className="absolute inset-0 mt-auto col-start-1 row-start-1 self-end w-full p-2 pointer-events-none">
					<div className="py-4 px-2 bg-background/70 backdrop-blur-sm flex justify-between items-center opacity-0 transition-opacity duration-400 ease-in-out group-hover:opacity-100 rounded-md z-10">
						<div className="flex space-between items-center w-full">
							{item.description && (
								<p className="text-sm text-gray-800 flex-grow mr-2 line-clamp-2">
									{item.description}
								</p>
							)}
							{item.logo && (
								<Image
									src={`/${item.logo}`}
									alt={`Photo ${index + 1} logo`}
									width={64}
									height={64}
									className={`h-7 flex-shrink-0 box-shadow-none ${
										item.roundedLogo ? "rounded-xs" : ""
									}`}
									loading="lazy"
								/>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
