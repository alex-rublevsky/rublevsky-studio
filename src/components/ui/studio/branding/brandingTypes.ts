export type BrandingProject = { 
    id: number;
    name: string;
    type: 'image' | 'video';
    images?: string[];
    preview?: string;
    src?: string;
    description?: string;
    logo?: string;
  }; 