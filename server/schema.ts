import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

// System Tables

// Products and Related Tables
export const products = sqliteTable('products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  categorySlug: text('category_slug').references(() => categories.slug, { onDelete: 'cascade' }),
  brandSlug: text('brand_slug').references(() => brands.slug, { onDelete: 'cascade' }),
  teaCategorySlug: text('tea_category_slug').references(() => teaCategories.slug, { onDelete: 'set null' }),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  images: text('images'), // JSON stored as text
  description: text('description'),
  price: real('price').notNull().default(0), // Make price non-nullable with default value
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  isFeatured: integer('is_featured', { mode: 'boolean' }).notNull().default(false),
  discount: integer('discount'), // Percentage discount (e.g., 20 for 20% off)
  hasVariations: integer('has_variations', { mode: 'boolean' }).notNull().default(false),
  weight: text('weight'),
  stock: integer('stock').notNull().default(0),
  unlimitedStock: integer('unlimited_stock', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at'),
});

export const productVariations = sqliteTable('product_variations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  productId: integer('product_id').references(() => products.id, { onDelete: 'cascade' }),
  sku: text('sku').notNull().unique(),
  price: real('price').notNull(), // Using real for decimal in SQLite
  stock: integer('stock').notNull().default(0),
  sort: integer('sort'),
  createdAt: text('created_at'),
});

export const variationAttributes = sqliteTable('variation_attributes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  productVariationId: integer('product_variation_id').references(() => productVariations.id, { onDelete: 'cascade' }),
  attributeId: text('attributeId').notNull(),
  value: text('value').notNull(),
  createdAt: text('created_at')
});

export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  image: text('image'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
});

export const brands = sqliteTable('brands', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  image: text('image'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
});

export const orders = sqliteTable('orders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  status: text('status').notNull().default('pending'),
  subtotalAmount: real('subtotalAmount').notNull(), // Base price before discounts
  discountAmount: real('discountAmount').notNull().default(0), // Total discounts applied
  shippingAmount: real('shippingAmount').notNull().default(0),
  totalAmount: real('totalAmount').notNull(), // Final total (subtotal - discount + shipping)
  currency: text('currency').notNull().default('CAD'),
  paymentMethod: text('paymentMethod'),
  paymentStatus: text('paymentStatus').notNull().default('pending'),
  shippingMethod: text('shippingMethod'),
  notes: text('notes'),
  createdAt: text('createdAt').notNull(),
  completedAt: text('completedAt'),
});

export const orderItems = sqliteTable('order_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  orderId: integer('orderId').references(() => orders.id, { onDelete: 'cascade' }).notNull(),
  productId: integer('productId').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  productVariationId: integer('productVariationId').references(() => productVariations.id, { onDelete: 'set null' }),
  quantity: integer('quantity').notNull(),
  unitAmount: real('unitAmount').notNull(),
  discountPercentage: integer('discountPercentage'),
  finalAmount: real('finalAmount').notNull(), // Unit amount after discount × quantity
  attributes: text('attributes'), // JSON stored as text
  createdAt: text('createdAt').notNull(),
});

export const addresses = sqliteTable('addresses', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  orderId: integer('orderId').references(() => orders.id, { onDelete: 'cascade' }).notNull(),
  addressType: text('addressType').notNull(), // Can be 'shipping', 'billing', or 'both'
  firstName: text('firstName').notNull(),
  lastName: text('lastName').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  streetAddress: text('streetAddress').notNull(),
  city: text('city').notNull(),
  state: text('state'),
  zipCode: text('zipCode').notNull(),
  country: text('country').notNull(),
  createdAt: text('createdAt').notNull(),
});

// Blog Related Tables
export const teaCategories = sqliteTable('tea_categories', {
  slug: text('slug').primaryKey(),
  name: text('name').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
});

export const blogPosts = sqliteTable('blog_posts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  productSlug: text('product_slug').references(() => products.slug, { onDelete: 'set null' }),
  teaCategorySlug: text('tea_category_slug').references(() => teaCategories.slug, { onDelete: 'set null' }),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  body: text('body').notNull(),
  images: text('images'),
  publishedAt: text('published_at'),
});

// Inquiries
export const inquiries = sqliteTable('inquiries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull(),
  companyName: text('company_name'),
  role: text('role'),
  budget: real('budget'), // Using real for decimal in SQLite
  message: text('message').notNull(),
  createdAt: text('created_at'),
});