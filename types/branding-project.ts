export type BrandingProject = {
  name: string;
  type: 'image' | 'video';
  images?: string[];
  preview?: string;
  src?: string;
  description?: string;
  logo?: string;
}; 