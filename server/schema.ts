import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

// System Tables

// Products and Related Tables
export const products = sqliteTable('products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  categorySlug: text('category_slug').references(() => categories.slug, { onDelete: 'cascade' }),
  brandSlug: text('brand_slug').references(() => brands.slug, { onDelete: 'cascade' }),
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
  subtotal: real('subtotal'), // Original total before discounts
  totalDiscount: real('total_discount'), // Total amount saved from discounts
  grandTotal: real('grand_total'), // Using real for decimal in SQLite
  paymentMethod: text('payment_method'),
  paymentStatus: text('payment_status'),
  status: text('status').notNull().default('new'),
  currency: text('currency'),
  shippingAmount: real('shipping_amount'), // Using real for decimal in SQLite
  shippingMethod: text('shipping_method'),
  notes: text('notes'),
  createdAt: text('created_at'),
});

export const orderItems = sqliteTable('order_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  orderId: integer('order_id').references(() => orders.id, { onDelete: 'cascade' }),
  productId: integer('product_id').references(() => products.id, { onDelete: 'cascade' }),
  productVariationId: integer('product_variation_id').references(() => productVariations.id, { onDelete: 'set null' }),
  quantity: integer('quantity').notNull().default(1),
  unitAmount: real('unit_amount'), 
  attributes: text('attributes'), // JSON stored as text
  discount: integer('discount'), // Percentage discount at time of order
  createdAt: text('created_at'),
});

export const addresses = sqliteTable('addresses', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  orderId: integer('order_id').references(() => orders.id, { onDelete: 'cascade' }),
  firstName: text('first_name'),
  lastName: text('last_name'),
  email: text('email'),
  phone: text('phone'),
  streetAddress: text('street_address'),
  city: text('city'),
  state: text('state'),
  zipCode: text('zip_code'),
  country: text('country'),
  createdAt: text('created_at'),
});

// Blog Related Tables
export const blogCategories = sqliteTable('blog_categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
});

export const blogPosts = sqliteTable('blog_posts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  blogCategorySlug: text('blog_category_slug').references(() => blogCategories.slug, { onDelete: 'set null' }),
  productSlug: text('product_slug').references(() => products.slug, { onDelete: 'set null' }),
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