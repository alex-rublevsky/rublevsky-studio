const ASSETS_URL = 'https://assets.rublevsky.studio';

export default function cloudflareLoader({ src, width, quality }) {
  // Build the common params for image optimization
  const params = ['format=auto', `width=${width}`];
  if (quality) {
    params.push(`quality=${quality}`);
  }
  const queryString = params.join("&");

  // If the source is already a full URL, use it as is
  if (src.startsWith("https://")) {
    return `${src}?${queryString}`;
  }
  
  // For all other paths (starting with /), treat as R2 images
  const r2Path = src.startsWith('/') ? src.substring(1) : src;
  return `${ASSETS_URL}/${r2Path}?${queryString}`;
} 