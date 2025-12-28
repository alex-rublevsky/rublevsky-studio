import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeftIcon, ChevronRightIcon, X } from "lucide-react";
import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { createPortal } from "react-dom";
import { Image } from "~/components/ui/shared/Image";
import { ASSETS_BASE_URL } from "~/constants/urls";
import styles from "./FullScreenGallery.module.css";
import type { GalleryItem } from "./galleryTypes";

type FullScreenGalleryProps = {
	images: string[];
	galleryItems: GalleryItem[];
	isOpen: boolean;
	onClose: () => void;
	initialIndex?: number;
};

export default function FullScreenGallery({
	images,
	galleryItems,
	isOpen,
	onClose,
	initialIndex = 0,
}: FullScreenGalleryProps) {
	// Create a mapping from image index to gallery item
	const imageToItemMap = useMemo(() => {
		const map = new Map<number, GalleryItem>();
		let imageIndex = 0;
		galleryItems.forEach((item) => {
			item.images.forEach(() => {
				map.set(imageIndex, item);
				imageIndex++;
			});
		});
		return map;
	}, [galleryItems]);

	const wasOpenRef = useRef(false);
	const thumbnailsContainerRef = useRef<HTMLDivElement>(null);
	const [selectedIndex, setSelectedIndex] = useState(initialIndex);
	const currentItem = imageToItemMap.get(selectedIndex);
	const [canScrollPrev, setCanScrollPrev] = useState(false);
	const [canScrollNext, setCanScrollNext] = useState(false);
	const [isPositioned, setIsPositioned] = useState(false);
	const [shouldCenterThumbnails, setShouldCenterThumbnails] = useState(false);

	const [emblaMainRef, emblaMainApi] = useEmblaCarousel({
		duration: 30,
		loop: true,
	});
	const [emblaThumbsRef, emblaThumbsApi] = useEmblaCarousel({
		align: "center",
		dragFree: true,
	});

	const onSelect = useCallback(() => {
		if (!emblaMainApi || !emblaThumbsApi) return;
		const index = emblaMainApi.selectedScrollSnap();
		setSelectedIndex(index);
		// With looping enabled, buttons are always available (unless only one image)
		setCanScrollPrev(images.length > 1);
		setCanScrollNext(images.length > 1);
		emblaThumbsApi.scrollTo(index);
	}, [emblaMainApi, emblaThumbsApi, images.length]);

	useEffect(() => {
		if (!emblaMainApi) return;
		onSelect();
		emblaMainApi.on("reInit", onSelect).on("select", onSelect);
	}, [emblaMainApi, onSelect]);

	// Check if thumbnails should be centered (when content doesn't overflow)
	useEffect(() => {
		if (!thumbnailsContainerRef.current || !isOpen) return;

		const checkOverflow = () => {
			const container = thumbnailsContainerRef.current;
			if (!container) return;
			const scrollWidth = container.scrollWidth;
			const clientWidth = container.parentElement?.clientWidth || 0;
			setShouldCenterThumbnails(scrollWidth <= clientWidth);
		};

		checkOverflow();
		const resizeObserver = new ResizeObserver(checkOverflow);
		if (thumbnailsContainerRef.current.parentElement) {
			resizeObserver.observe(thumbnailsContainerRef.current.parentElement);
		}

		return () => resizeObserver.disconnect();
	}, [isOpen]);

	useLayoutEffect(() => {
		if (!isOpen || !emblaMainApi) {
			if (!isOpen) setIsPositioned(false);
			wasOpenRef.current = isOpen;
			return;
		}

		if (!wasOpenRef.current) {
			emblaMainApi.scrollTo(initialIndex, true);
			setIsPositioned(true);
			if (emblaThumbsApi) {
				emblaThumbsApi.scrollTo(initialIndex);
			}
		}

		wasOpenRef.current = isOpen;
	}, [isOpen, initialIndex, emblaMainApi, emblaThumbsApi]);

	useEffect(() => {
		if (!isOpen) return;

		const handleKeyPress = (e: KeyboardEvent) => {
			if (!emblaMainApi) return;
			if (e.key === "Escape") onClose();
			else if (e.key === "ArrowLeft") emblaMainApi.scrollPrev();
			else if (e.key === "ArrowRight") emblaMainApi.scrollNext();
		};

		document.addEventListener("keydown", handleKeyPress);
		document.body.style.overflow = "hidden";

		return () => {
			document.removeEventListener("keydown", handleKeyPress);
			document.body.style.overflow = "";
		};
	}, [isOpen, onClose, emblaMainApi]);

	return createPortal(
		<div className={styles.gallery} data-open={isOpen && isPositioned}>
			<button
				type="button"
				onClick={onClose}
				className={styles.closeButton}
				aria-label="Close gallery"
			>
				<X className="h-6 w-6" />
			</button>

			<div className={styles.container}>
				<div className={styles.mainArea}>
					<div className={styles.emblaViewport} ref={emblaMainRef}>
						<div className={styles.emblaContainer}>
							{images.map((image, i) => (
								<div key={image} className={styles.emblaSlide}>
									<img
										src={`${ASSETS_BASE_URL}/${image}`}
										alt={`Gallery item ${i + 1}`}
										className={styles.image}
									/>
								</div>
							))}
						</div>
					</div>
					{currentItem && (currentItem.description || currentItem.logo) && (
						<div
							className={`${styles.infoOverlay} motion-opacity-in-0 motion-translate-y-in-100 motion-blur-in-md`}
							key={`overlay-${selectedIndex}`}
						>
							<div className={styles.infoContent}>
								{currentItem.description && (
									<p className={styles.infoDescription}>
										{currentItem.description}
									</p>
								)}
								{currentItem.logo && (
									<Image
										src={`/${currentItem.logo}`}
										alt="Logo"
										width={64}
										height={64}
										className={`${styles.infoLogo} ${
											currentItem.roundedLogo ? styles.infoLogoRounded : ""
										}`}
										loading="lazy"
									/>
								)}
							</div>
						</div>
					)}

					<button
						type="button"
						onClick={() => emblaMainApi?.scrollPrev()}
						className={`${styles.navButton} ${styles.navButtonPrev}`}
						data-hidden={!canScrollPrev}
						aria-label="Previous image"
					>
						<ChevronLeftIcon className="h-10 w-10" />
					</button>

					<button
						type="button"
						onClick={() => emblaMainApi?.scrollNext()}
						className={`${styles.navButton} ${styles.navButtonNext}`}
						data-hidden={!canScrollNext}
						aria-label="Next image"
					>
						<ChevronRightIcon className="h-10 w-10" />
					</button>
				</div>

				<div className={styles.thumbnails}>
					<div className={styles.thumbnailsViewport} ref={emblaThumbsRef}>
						<div
							ref={thumbnailsContainerRef}
							className={`${styles.thumbnailsContainer} ${shouldCenterThumbnails ? styles.thumbnailsContainerCentered : ""}`}
						>
							{images.map((image, i) => (
								<div
									key={image}
									className={`${styles.thumbnailSlide} ${i === selectedIndex ? styles.thumbnailSlideSelected : ""}`}
								>
									<button
										type="button"
										onClick={() => emblaMainApi?.scrollTo(i)}
										className={styles.thumbnail}
										aria-label={`Go to item ${i + 1}`}
									>
										<img
											src={`${ASSETS_BASE_URL}/${image}`}
											alt=""
											className={styles.thumbnailImage}
										/>
									</button>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>,
		document.body,
	);
}
