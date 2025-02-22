const ASSETS_URL = 'https://assets.rublevsky.studio';

export default function cloudflareLoader({ src, width, quality }) {
  // If the source is already a full URL, use it as is
  if (src.startsWith("https://")) {
    return src;
  }
  const params = ['format=auto', `width=${width}`];
  if (quality) {
    params.push(`quality=${quality}`);
  }
  const queryString = params.join("&");
  return `${ASSETS_URL}${src}?${queryString}`;
} 