import {
  products,
  categories,
  brands,
  productVariations,
  variationAttributes,
  orders,
  orderItems,
  addresses,
  blogCategories,
  blogPosts,
  inquiries
} from "@/server/schema";
import { InferSelectModel, InferInsertModel } from "drizzle-orm";

// Products
export type Product = InferSelectModel<typeof products>;
export type NewProduct = InferInsertModel<typeof products>;

// Product variation with attributes
export interface ProductVariationWithAttributes extends ProductVariation {
  attributes: VariationAttribute[];
}

// Extended product type with variations
export interface ProductWithVariations extends Product {
  variations?: ProductVariationWithAttributes[];
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
export type VariationAttribute = InferSelectModel<typeof variationAttributes>;
export type NewVariationAttribute = InferInsertModel<typeof variationAttributes>;

// Orders
export type Order = InferSelectModel<typeof orders>;
export type NewOrder = InferInsertModel<typeof orders>;

// Order Items
export type OrderItem = InferSelectModel<typeof orderItems>;
export type NewOrderItem = InferInsertModel<typeof orderItems>;

// Addresses
export type Address = InferSelectModel<typeof addresses>;
export type NewAddress = InferInsertModel<typeof addresses>;

// Blog Categories
export type BlogCategory = InferSelectModel<typeof blogCategories>;
export type NewBlogCategory = InferInsertModel<typeof blogCategories>;

// Blog Posts
export type BlogPost = InferSelectModel<typeof blogPosts>;
export type NewBlogPost = InferInsertModel<typeof blogPosts>;

// Inquiries
export type Inquiry = InferSelectModel<typeof inquiries>;
export type NewInquiry = InferInsertModel<typeof inquiries>;

// Form data types for frontend components
export interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  price: string;
  categorySlug: string;
  brandSlug: string;
  stock: string;
  isActive: boolean;
  isFeatured: boolean;
  onSale: boolean;
  hasVariations: boolean;
  hasVolume: boolean;
  volume: string;
  images: string;
  variations?: ProductVariationFormData[];
}

export interface ProductVariationFormData {
  id?: number;
  sku: string;
  price: string;
  stock: string;
  sort: number;
  attributes: VariationAttributeFormData[];
}

export interface VariationAttributeFormData {
  name: string;
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

export interface BlogPostFormData {
  title: string;
  slug: string;
  body: string;
  blogCategorySlug: string;
  productSlug?: string;
  images?: string;
  publishedAt?: string;
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