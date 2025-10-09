import {
  products,
  categories,
  brands,
  productVariations,
  orders,
  orderItems,
  addresses,
  blogPosts,
  teaCategories,
} from "~/schema";
import { InferSelectModel, InferInsertModel } from "drizzle-orm";

// Products
export interface Product extends InferSelectModel<typeof products> {
  teaCategories?: string[];
}
export type NewProduct = InferInsertModel<typeof products>;

// Product variation with attributes
export interface ProductVariationWithAttributes extends ProductVariation {
  attributes: VariationAttribute[];
}

// Extended product type with variations
export interface ProductWithVariations extends Product {
  variations?: ProductVariationWithAttributes[];
  teaCategories?: string[];
}

// Product group for dashboard
export interface ProductGroup {
  title: string;
  products: ProductWithVariations[];
  categorySlug?: string;
}

// Categories
export type Category = InferSelectModel<typeof categories>;
export type NewCategory = InferInsertModel<typeof categories>;

// Brands
export type Brand = InferSelectModel<typeof brands>;
export type NewBrand = InferInsertModel<typeof brands>;

// Product Variations
export type ProductVariation = InferSelectModel<typeof productVariations>;
export type NewProductVariation = InferInsertModel<typeof productVariations>;

// Variation Attributes
export interface VariationAttribute {
  id?: number;
  productVariationId?: number;
  attributeId: string;
  value: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface NewVariationAttribute {
  attributeId: string;
  value: string;
}

// Orders
export type Order = InferSelectModel<typeof orders>;
export type NewOrder = InferInsertModel<typeof orders>;

// Order Items
export type OrderItem = InferSelectModel<typeof orderItems>;
export type NewOrderItem = InferInsertModel<typeof orderItems>;

// Addresses
export type Address = InferSelectModel<typeof addresses>;
export type NewAddress = InferInsertModel<typeof addresses>;

// Tea Categories
export type TeaCategory = InferSelectModel<typeof teaCategories>;
export type NewTeaCategory = InferInsertModel<typeof teaCategories>;

// Blog Posts
export type BlogPost = Omit<
  InferSelectModel<typeof blogPosts>,
  "publishedAt"
> & {
  teaCategories?: string[];
  publishedAt: number;
  productName?: string | null;
};

// Blog Post Preview (for index page)
export type BlogPostPreview = {
  id: number;
  title: string | null;
  slug: string;
  excerpt: string | null; // Shortened body text
  images: string | null; // All images for proper gallery rendering
  publishedAt: number;
  teaCategories?: string[];
};

export type NewBlogPost = InferInsertModel<typeof blogPosts>;

// Form data types for frontend components
export interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  price: string;
  categorySlug: string;
  brandSlug: string | null;
  teaCategories?: string[];
  stock: string;
  isActive: boolean;
  isFeatured: boolean;
  discount: number | null;
  hasVariations: boolean;
  weight: string;
  images: string;
  shippingFrom?: string; // Location where this product ships from
  variations: ProductVariationFormData[];
}

export interface ProductVariationFormData {
  id?: number;
  sku: string;
  price: string;
  stock: string;
  discount?: number | null; // Add discount field
  sort: number;
  shippingFrom?: string; // Country code for shipping origin
  attributes: VariationAttributeFormData[];
}

export interface VariationAttributeFormData {
  attributeId: string;
  value: string;
}

export interface CategoryFormData {
  name: string;
  slug: string;
  image: string;
  isActive: boolean;
}

export interface BrandFormData {
  name: string;
  slug: string;
  logo: string;
  isActive: boolean;
}

export interface TeaCategoryFormData {
  name: string;
  slug: string;
  isActive: boolean;
}

export interface BlogPostFormData {
  title?: string;
  slug: string;
  body: string;
  teaCategories?: string[];
  productSlug?: string;
  images?: string;
  isVisible?: boolean;
  publishedAt: number;
}

// API Response Types
export interface ApiResponse<T> {
  message?: string;
  error?: string;
  [key: string]: any;
}

export interface ProductsResponse extends ApiResponse<Product[]> {
  products?: Product[];
}

export interface ProductResponse extends ApiResponse<Product> {
  product?: Product;
}

export interface CategoriesResponse extends ApiResponse<Category[]> {
  categories?: Category[];
}

export interface CategoryResponse extends ApiResponse<Category> {
  category?: Category;
}

export interface BrandsResponse extends ApiResponse<Brand[]> {
  brands?: Brand[];
}

export interface BrandResponse extends ApiResponse<Brand> {
  brand?: Brand;
}

export interface CartItem {
  productId: number;
  productName: string;
  productSlug: string;
  variationId?: number;
  quantity: number;
  price: number;
  maxStock: number;
  unlimitedStock: boolean;
  discount?: number | null;
  image?: string;
  attributes?: Record<string, string>;
  weightInfo?: {
    totalWeight: number;
  };
}

export interface ProductWithDetails extends Product {
  category?: {
    name: string;
    slug: string;
  } | null;
  brand?: {
    name: string;
    slug: string;
  } | null;
  variations?: ProductVariationWithAttributes[];
  blogPost?: {
    id: number;
    title: string;
    slug: string;
    body: string;
    blogUrl: string;
  } | null;
  teaCategories?: string[];
}
