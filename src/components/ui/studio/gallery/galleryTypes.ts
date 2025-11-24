export type GalleryItem = {
	id: string;
	images: string[];
	description?: string;
	logo?: string;
	roundedLogo?: boolean;
	storeLink?: string;
	hash?: string; // blurHash string
	ratio?: string; // aspect ratio as "width/height"
};

export type GalleryType = "photos" | "posters";
