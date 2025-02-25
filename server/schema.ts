import { sqliteTable, integer, text, numeric } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull(),
  emailVerifiedAt: text('email_verified_at'),
  password: text('password').notNull(),
  rememberToken: text('remember_token'),
  createdAt: text('created_at'),
  updatedAt: text('updated_at'),
});

export const orders = sqliteTable('orders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
  grandTotal: numeric('grand_total'),
  paymentMethod: text('payment_method'),
  paymentStatus: text('payment_status'),
  status: text('status').notNull().default('new'),
  currency: text('currency'),
  shippingAmount: numeric('shipping_amount'),
  shippingMethod: text('shipping_method'),
  notes: text('notes'),
  createdAt: text('created_at'),
  updatedAt: text('updated_at'),
});

export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  image: text('image'),
  isActive: text('is_active').notNull().default('1'),
  createdAt: text('created_at'),
  updatedAt: text('updated_at'),
});

export const brands = sqliteTable('brands', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  image: text('image'),
  isActive: text('is_active').notNull().default('1'),
  createdAt: text('created_at'),
  updatedAt: text('updated_at'),
});

export const products = sqliteTable('products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  categoryId: integer('category_id').references(() => categories.id, { onDelete: 'cascade' }),
  brandId: integer('brand_id').references(() => brands.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  images: text('images'),
  description: text('description'),
  price: numeric('price'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  isFeatured: integer('is_featured', { mode: 'boolean' }).notNull().default(false),
  inStock: integer('in_stock', { mode: 'boolean' }).notNull().default(true),
  onSale: integer('on_sale', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at'),
  updatedAt: text('updated_at'),
  stock: integer('stock').notNull().default(0),
});
