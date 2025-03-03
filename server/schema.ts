import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

// System Tables

// export const jobs = sqliteTable('jobs', {
//   id: integer('id').primaryKey({ autoIncrement: true }),
//   queue: text('queue').notNull(),
//   payload: text('payload').notNull(),
//   attempts: integer('attempts').notNull(),
//   reservedAt: integer('reserved_at'),
//   availableAt: integer('available_at').notNull(),
//   createdAt: integer('created_at').notNull(),
// });

// export const failedJobs = sqliteTable('failed_jobs', {
//   id: integer('id').primaryKey({ autoIncrement: true }),
//   uuid: text('uuid').unique().notNull(),
//   connection: text('connection').notNull(),
//   queue: text('queue').notNull(),
//   payload: text('payload').notNull(),
//   exception: text('exception').notNull(),
//   failedAt: text('failed_at').notNull(),
// });

// Users and Authentication
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerifiedAt: text('email_verified_at'),
  password: text('password').notNull(),
  rememberToken: text('remember_token'),
  createdAt: text('created_at'),
  updatedAt: text('updated_at'),
});

// export const passwordResetTokens = sqliteTable('password_reset_tokens', {
//   email: text('email').primaryKey(),
//   token: text('token').notNull(),
//   createdAt: text('created_at'),
// });

// export const sessions = sqliteTable('sessions', {
//   id: text('id').primaryKey(),
//   userId: integer('user_id').references(() => users.id),
//   ipAddress: text('ip_address', { length: 45 }),
//   userAgent: text('user_agent'),
//   payload: text('payload').notNull(),
//   lastActivity: integer('last_activity').notNull(),
// });

// Products and Related Tables
export const products = sqliteTable('products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  categoryId: integer('category_id').references(() => categories.id, { onDelete: 'cascade' }),
  brandId: integer('brand_id').references(() => brands.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  images: text('images'), // JSON stored as text
  description: text('description'),
  price: real('price').notNull().default(0), // Make price non-nullable with default value
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  isFeatured: integer('is_featured', { mode: 'boolean' }).notNull().default(false),
  onSale: integer('on_sale', { mode: 'boolean' }).notNull().default(false),
  hasVariations: integer('has_variations', { mode: 'boolean' }).notNull().default(false),
  hasVolume: integer('has_volume', { mode: 'boolean' }).notNull().default(false),
  volume: text('volume'),
  stock: integer('stock').notNull().default(0),
  unlimitedStock: integer('unlimited_stock', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at'),
  updatedAt: text('updated_at'),
});

export const productVariations = sqliteTable('product_variations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  productId: integer('product_id').references(() => products.id, { onDelete: 'cascade' }),
  sku: text('sku').notNull().unique(),
  price: real('price').notNull(), // Using real for decimal in SQLite
  stock: integer('stock').notNull().default(0),
  sort: integer('sort'),
  createdAt: text('created_at'),
  updatedAt: text('updated_at'),
});

export const variationAttributes = sqliteTable('variation_attributes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  productVariationId: integer('product_variation_id').references(() => productVariations.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  value: text('value').notNull(),
  createdAt: text('created_at'),
  updatedAt: text('updated_at'),
});

// Categories and Brands
export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  image: text('image'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull().default(new Date().toISOString()),
  updatedAt: text('updated_at'),
});

export const brands = sqliteTable('brands', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  image: text('image'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull().default(new Date().toISOString()),
  updatedAt: text('updated_at'),
});

// Orders and Related Tables
export const orders = sqliteTable('orders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  grandTotal: real('grand_total'), // Using real for decimal in SQLite
  paymentMethod: text('payment_method'),
  paymentStatus: text('payment_status'),
  status: text('status').notNull().default('new'),
  currency: text('currency'),
  shippingAmount: real('shipping_amount'), // Using real for decimal in SQLite
  shippingMethod: text('shipping_method'),
  notes: text('notes'),
  createdAt: text('created_at'),
  updatedAt: text('updated_at'),
});

export const orderItems = sqliteTable('order_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  orderId: integer('order_id').references(() => orders.id, { onDelete: 'cascade' }),
  productId: integer('product_id').references(() => products.id, { onDelete: 'cascade' }),
  productVariationId: integer('product_variation_id').references(() => productVariations.id, { onDelete: 'set null' }),
  quantity: integer('quantity').notNull().default(1),
  unitAmount: real('unit_amount'), // Using real for decimal in SQLite
  totalAmount: real('total_amount'), // Using real for decimal in SQLite
  attributes: text('attributes'), // JSON stored as text
  createdAt: text('created_at'),
  updatedAt: text('updated_at'),
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
  updatedAt: text('updated_at'),
});

// Blog Related Tables
export const blogCategories = sqliteTable('blog_categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at'),
  updatedAt: text('updated_at'),
});

export const blogPosts = sqliteTable('blog_posts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  blogCategoryId: integer('blog_category_id').references(() => blogCategories.id, { onDelete: 'set null' }),
  productSlug: text('product_slug'),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  body: text('body').notNull(),
  images: text('images'),
  publishedAt: text('published_at'),
  lastEditedAt: text('last_edited_at'),
  createdAt: text('created_at'),
  updatedAt: text('updated_at'),
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
  updatedAt: text('updated_at'),
});