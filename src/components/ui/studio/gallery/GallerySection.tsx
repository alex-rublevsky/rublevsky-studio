import { useState } from "react";
import { photos } from "~/data/photographyData";
import { posters } from "~/data/postersData";
import SimpleGallery from "./FullScreenGallery";
import GalleryItemComponent from "./GalleryItem";
import type { GalleryType } from "./galleryTypes";

type GallerySectionProps = {
	type: string;
};

export default function GallerySection({ type }: GallerySectionProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [currentIndex, setCurrentIndex] = useState(0);

	const galleryData = type === "photos" ? photos : posters;

	// Create a flat array of all images
	const allImages = galleryData.reduce((acc: string[], item) => {
		acc.push(...item.images);
		return acc;
	}, []);

	const openGallery = (itemIndex: number, _itemId: string) => {
		// Calculate the starting index in the flat array based on the item index
		const startIndex = galleryData
			.slice(0, itemIndex)
			.reduce((acc, item) => acc + item.images.length, 0);

		// Set index first, then open gallery in next tick to ensure index is set before visibility
		setCurrentIndex(startIndex);
		// Use requestAnimationFrame to ensure index state is committed before opening
		requestAnimationFrame(() => {
			setIsOpen(true);
		});
	};

	const closeGallery = () => {
		setIsOpen(false);
	};

	return (
		<section id={type}>
			<h1
				className={"text-center work_page_section_title_holder"}
				data-heading-reveal
			>
				{type === "posters"
					? "Graphic Design"
					: type.charAt(0).toUpperCase() + type.slice(1)}
			</h1>

			<div className="columns-2 md:columns-3 2xl:columns-4 gap-3 break-inside-avoid overflow-visible">
				{galleryData.map((item, index) => (
					<GalleryItemComponent
						key={item.id}
						item={item}
						index={index}
						onOpenGallery={openGallery}
						galleryType={type as GalleryType}
					/>
				))}
			</div>

			<SimpleGallery
				isOpen={isOpen}
				onClose={closeGallery}
				images={allImages}
				galleryItems={galleryData}
				initialIndex={currentIndex}
			/>
		</section>
	);
}
