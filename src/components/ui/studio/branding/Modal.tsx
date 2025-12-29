import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Image } from "~/components/ui/shared/Image";
import { ASSETS_BASE_URL } from "~/constants/urls";
import type { BrandingProject } from "./brandingTypes";
//import { unstable_ViewTransition as ViewTransition } from "react";

export default function Modal({
	selected,
	setSelected,
}: {
	selected: BrandingProject | null;
	setSelected: (project: BrandingProject | null) => void;
}) {
	const [selectedGalleryImage, setSelectedGalleryImage] = useState<
		string | null
	>(null);

	// Reset gallery image when modal opens/changes project
	const displayedImage = useMemo(() => {
		if (selected?.type === "image") {
			// Reset to first image when project changes
			if (
				selectedGalleryImage &&
				selected.images?.includes(selectedGalleryImage)
			) {
				return selectedGalleryImage;
			}
			return selected.images?.[0] || null;
		}
		return null;
	}, [selected, selectedGalleryImage]);

	// Handle body scroll lock and custom close event
	useEffect(() => {
		if (!selected) return;

		// Lock body scroll
		document.body.style.overflow = "hidden";
		document.body.setAttribute("data-branding-modal-open", "true");

		// Reset gallery selection when new project opens
		setSelectedGalleryImage(null);

		// Listen for close event from NavBar
		const handleCloseModal = () => setSelected(null);
		window.addEventListener("close-branding-modal", handleCloseModal);

		return () => {
			document.body.style.overflow = "unset";
			document.body.removeAttribute("data-branding-modal-open");
			window.removeEventListener("close-branding-modal", handleCloseModal);
		};
	}, [selected, setSelected]);

	const modal = (
		<AnimatePresence mode="wait">
			{selected && (
				<motion.div
					key="modal-backdrop"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.3, delay: 0 }}
					className="p-2 lg:p-4 not-first:fixed inset-0 h-auto z-50 cursor-pointer flex items-center justify-center bg-background/40 backdrop-blur-2xl"
					onClick={() => setSelected(null)}
				>
					<motion.div
						key="modal-content"
						initial={{ opacity: 0, scale: 0.95, y: 20 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.95, y: 20 }}
						transition={{ duration: 0.3, ease: "easeOut" }}
						className="h-full w-full max-w-7xl cursor-default overflow-y-auto overflow-x-hidden scrollbar-none bg-background lg:p-4 rounded-2xl"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="relative flex flex-col lg:flex-row h-auto gap-2">
							{/* Thumbnails column - desktop only */}
							{selected.type === "image" &&
								selected.images &&
								selected.images.length > 1 && (
									<motion.div className="hidden lg:block shrink-0 w-24 overflow-y-auto">
										<div className="flex flex-col gap-2">
											{selected.images.map((image, index) => (
												<motion.div
													key={image}
													initial={{ opacity: 0, scale: 0.8 }}
													animate={{ opacity: 1, scale: 1 }}
													transition={{
														duration: 0.3,
														delay: 0.3 + index * 0.05,
														ease: "easeOut",
													}}
													className="shrink-0 w-24 h-24 relative cursor-pointer"
													onMouseEnter={() => setSelectedGalleryImage(image)}
												>
													<div
														className={`
                        absolute inset-0
                        rounded-sm
                        ${displayedImage === image ? "border-2 border-black" : "border border-transparent"}
                        transition-colors duration-200
                        pointer-events-none
                        z-10
                      `}
													/>
													<div className="absolute inset-0 rounded-sm overflow-hidden">
														<img
															src={`${ASSETS_BASE_URL}/${image}`}
															alt={`${selected.name} thumbnail ${index + 1}`}
															className="object-cover h-full w-full"
														/>
													</div>
												</motion.div>
											))}
										</div>
									</motion.div>
								)}

							{/* Main image container */}
							<div className="flex items-center  justify-center lg:items-start lg:justify-start lg:grow relative pl-4 lg:pl-0 pr-4 lg:pr-0 pt-4 lg:pt-0">
								{selected.type === "image" ? (
									<div className="relative  w-full lg:w-auto lg:h-[60vh] flex items-center lg:items-start justify-center">
										{/* <ViewTransition key={displayedImage}> */}
										<motion.img
											layoutId={`card-${selected.id}`}
											transition={{ duration: 0.3 }}
											//style={{ viewTransitionName: `branding-image` }}
											src={`${ASSETS_BASE_URL}/${displayedImage}`}
											alt={selected.name}
											width={1000}
											height={1000}
											className="w-auto h-auto max-w-full max-h-[60dvh] lg:max-h-[calc(100vh-4rem)] object-contain rounded-lg relative z-2"
										/>
										{/* </ViewTransition> */}
									</div>
								) : (
									<motion.video
										layoutId={`card-${selected.id}`}
										src={`${ASSETS_BASE_URL}/${selected.src}`}
										className="w-full h-full overflow-hidden rounded-lg object-contain"
										muted
										autoPlay={true}
										loop={true}
										playsInline
									/>
								)}
							</div>

							{/* Mobile thumbnails */}
							{selected.type === "image" &&
								selected.images &&
								selected.images.length > 1 && (
									<motion.div
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.5, delay: 0.2 }}
										className="mt-1 lg:hidden"
									>
										<div className="overflow-x-auto scrollbar-none">
											<div className="flex gap-2 px-4 pb-2">
												{selected.images.map((image, index) => (
													<motion.div
														key={image}
														initial={{ opacity: 0, scale: 0.8 }}
														animate={{ opacity: 1, scale: 1 }}
														transition={{
															duration: 0.3,
															delay: 0.3 + index * 0.05,
															ease: "easeOut",
														}}
														className="shrink-0 w-24 h-24 relative cursor-pointer"
														onMouseEnter={() => setSelectedGalleryImage(image)}
													>
														<div
															className={`
                            absolute inset-0
                            rounded-sm
                            ${displayedImage === image ? "border-2 border-black" : "border border-transparent"}
                            transition-colors duration-200
                            pointer-events-none
                            z-10
                          `}
														/>
														<div className="absolute inset-0 rounded-sm overflow-hidden">
															<Image
																src={`${ASSETS_BASE_URL}/${image}`}
																alt={`${selected.name} thumbnail ${index + 1}`}
																className="object-cover w-full h-full"
															/>
														</div>
													</motion.div>
												))}
											</div>
										</div>
									</motion.div>
								)}

							{/* Details column */}
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.5, delay: 0.2 }}
								className="lg:w-[37ch] lg:pl-6 pt-4 lg:pt-18 pb-20 lg:pb-0 shrink-0 overflow-y-auto mx-4 lg:mx-0 flex flex-col"
							>
								<div>
									<h3 className="text-2xl font-bold">{selected.name}</h3>

									{selected.description && (
										<div className="prose prose-sm dark:prose-invert mt-2 ">
											<p className="text-lg">{selected.description}</p>
										</div>
									)}

									{selected.logo && (
										<div className="flex items-center justify-start mt-4">
											<Image
												src={`/${selected.logo}`}
												alt={`${selected.name} logo`}
												width={64}
												height={64}
												className="object-contain w-20 md:w-28"
											/>
										</div>
									)}
								</div>
							</motion.div>
						</div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);

	return createPortal(modal, document.body);
}
