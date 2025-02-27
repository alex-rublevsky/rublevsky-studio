import { sqliteTable, integer, text, real, primaryKey  } from 'drizzle-orm/sqlite-core';
import { AdapterAccountType } from 'next-auth/adapters';
//import  {primaryKey} from 'drizzle-orm/sqlite-core/primary-keys';

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

export const users = sqliteTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  role: text("role").notNull().default("user"),
  password: text("password"),
  emailVerified: integer("emailVerified", { mode: "timestamp_ms" }),
  image: text("image"),
}, () => [])
 
export const accounts = sqliteTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  ]
)
 
export const sessions = sqliteTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
}, () => [])
 
export const verificationTokens = sqliteTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
  },
  (verificationToken) => [
    primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  ]
)
 
export const authenticators = sqliteTable(
  "authenticator",
  {
    credentialID: text("credentialID").notNull().unique(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerAccountId: text("providerAccountId").notNull(),
    credentialPublicKey: text("credentialPublicKey").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credentialDeviceType").notNull(),
    credentialBackedUp: integer("credentialBackedUp", {
      mode: "boolean",
    }).notNull(),
    transports: text("transports"),
  },
  (authenticator) => [
    primaryKey({
      columns: [authenticator.userId, authenticator.credentialID],
    }),
  ]
)

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
  productId: integer('product_id').references(() => products.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  body: text('body').notNull(),
  featuredImage: text('featured_image'),
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