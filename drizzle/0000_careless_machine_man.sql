CREATE TABLE `addresses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`orderId` integer NOT NULL,
	`addressType` text NOT NULL,
	`firstName` text NOT NULL,
	`lastName` text NOT NULL,
	`email` text NOT NULL,
	`phone` text NOT NULL,
	`streetAddress` text NOT NULL,
	`city` text NOT NULL,
	`state` text,
	`zipCode` text NOT NULL,
	`country` text NOT NULL,
	`createdAt` text NOT NULL,
	FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `blog_posts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`product_slug` text,
	`tea_category_slug` text,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`body` text NOT NULL,
	`images` text,
	`published_at` text,
	FOREIGN KEY (`product_slug`) REFERENCES `products`(`slug`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`tea_category_slug`) REFERENCES `tea_categories`(`slug`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `blog_posts_slug_unique` ON `blog_posts` (`slug`);--> statement-breakpoint
CREATE TABLE `brands` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`image` text,
	`is_active` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `brands_slug_unique` ON `brands` (`slug`);--> statement-breakpoint
CREATE TABLE `categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`image` text,
	`is_active` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `categories_slug_unique` ON `categories` (`slug`);--> statement-breakpoint
CREATE TABLE `inquiries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`company_name` text,
	`role` text,
	`budget` real,
	`message` text NOT NULL,
	`created_at` text
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`orderId` integer NOT NULL,
	`productId` integer NOT NULL,
	`productVariationId` integer,
	`quantity` integer NOT NULL,
	`unitAmount` real NOT NULL,
	`discountPercentage` integer,
	`finalAmount` real NOT NULL,
	`attributes` text,
	`createdAt` text NOT NULL,
	FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`productVariationId`) REFERENCES `product_variations`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`subtotalAmount` real NOT NULL,
	`discountAmount` real DEFAULT 0 NOT NULL,
	`shippingAmount` real DEFAULT 0 NOT NULL,
	`totalAmount` real NOT NULL,
	`currency` text DEFAULT 'CAD' NOT NULL,
	`paymentMethod` text,
	`paymentStatus` text DEFAULT 'pending' NOT NULL,
	`shippingMethod` text,
	`notes` text,
	`createdAt` text NOT NULL,
	`completedAt` text
);
--> statement-breakpoint
CREATE TABLE `product_variations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`product_id` integer,
	`sku` text NOT NULL,
	`price` real NOT NULL,
	`stock` integer DEFAULT 0 NOT NULL,
	`sort` integer,
	`created_at` text,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `product_variations_sku_unique` ON `product_variations` (`sku`);--> statement-breakpoint
CREATE TABLE `products` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`category_slug` text,
	`brand_slug` text,
	`tea_category_slug` text,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`images` text,
	`description` text,
	`price` real DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`is_featured` integer DEFAULT false NOT NULL,
	`discount` integer,
	`has_variations` integer DEFAULT false NOT NULL,
	`weight` text,
	`stock` integer DEFAULT 0 NOT NULL,
	`unlimited_stock` integer DEFAULT false NOT NULL,
	`created_at` text,
	FOREIGN KEY (`category_slug`) REFERENCES `categories`(`slug`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`brand_slug`) REFERENCES `brands`(`slug`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tea_category_slug`) REFERENCES `tea_categories`(`slug`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_slug_unique` ON `products` (`slug`);--> statement-breakpoint
CREATE TABLE `tea_categories` (
	`slug` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE `variation_attributes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`product_variation_id` integer,
	`attributeId` text NOT NULL,
	`value` text NOT NULL,
	`created_at` text,
	FOREIGN KEY (`product_variation_id`) REFERENCES `product_variations`(`id`) ON UPDATE no action ON DELETE cascade
);
