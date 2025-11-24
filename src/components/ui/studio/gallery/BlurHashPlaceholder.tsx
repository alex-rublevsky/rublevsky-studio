import { useEffect, useState } from "react";
import { Blurhash } from "react-blurhash";

type BlurHashPlaceholderProps = {
	hash: string;
	width?: number;
	height?: number;
	className?: string;
	ratio?: string; // "width/height" format
	src?: string; // Optional image source - if provided, component handles both blurhash and image
	alt?: string; // Alt text for image (required if src is provided)
	resolutionX?: number; // Blurhash resolution X (default: 32)
	resolutionY?: number; // Blurhash resolution Y (default: 32)
	punch?: number; // Blurhash punch (default: 1)
};

export function BlurHashPlaceholder({
	hash,
	width: _width = 32, // Kept for backward compatibility, not used with react-blurhash
	height: _height, // Kept for backward compatibility, not used with react-blurhash
	className = "",
	ratio: _ratio, // Kept for backward compatibility, not used with react-blurhash
	src,
	alt,
	resolutionX = 32,
	resolutionY = 32,
	punch = 1,
}: BlurHashPlaceholderProps) {
	const [isLoaded, setIsLoaded] = useState(false);

	// If src is provided, track image loading
	useEffect(() => {
		if (!src) return;

		const img = new Image();
		img.onload = () => {
			setIsLoaded(true);
		};
		img.src = src;
	}, [src]);

	// If src is provided, render both blurhash and image
	if (src) {
		if (!alt) {
			console.warn(
				"BlurHashPlaceholder: alt prop is required when src is provided",
			);
		}

		return (
			<div
				className={className}
				style={{
					position: "relative",
					backgroundColor: "var(--background)",
					width: "100%",
					height: "100%",
				}}
			>
				{/* Blur hash - stays visible during image fade-in, then gets removed */}
				<Blurhash
					hash={hash}
					width="100%"
					height="100%"
					resolutionX={resolutionX}
					resolutionY={resolutionY}
					punch={punch}
					style={{
						display: "block",
						animation: isLoaded
							? "hideAfterDelay 0.5s forwards"
							: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
					}}
				/>

				{/* Actual image - positioned absolutely to overlay */}
				<img
					src={src}
					alt={alt || ""}
					style={{
						position: "absolute",
						top: 0,
						left: 0,
						width: "100%",
						height: "100%",
						objectFit: "cover",
						opacity: isLoaded ? 1 : 0,
						transition: "opacity 0.5s ease-in-out",
					}}
				/>
			</div>
		);
	}

	// Standalone blurhash (backward compatible with current usage)
	return (
		<div
			className={className}
			style={{
				position: "relative",
				backgroundColor: "var(--background)",
				width: "100%",
				height: "100%",
			}}
		>
			<Blurhash
				hash={hash}
				width="100%"
				height="100%"
				resolutionX={resolutionX}
				resolutionY={resolutionY}
				punch={punch}
				style={{
					display: "block",
					animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
				}}
			/>
		</div>
	);
}
