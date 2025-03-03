CREATE TABLE `addresses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order_id` integer,
	`first_name` text,
	`last_name` text,
	`email` text,
	`phone` text,
	`street_address` text,
	`city` text,
	`state` text,
	`zip_code` text,
	`country` text,
	`created_at` text,
	`updated_at` text,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `blog_categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text,
	`updated_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `blog_categories_slug_unique` ON `blog_categories` (`slug`);--> statement-breakpoint
CREATE TABLE `blog_posts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`blog_category_id` integer,
	`product_id` integer,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`body` text NOT NULL,
	`images` text,
	`published_at` text,
	`last_edited_at` text,
	`created_at` text,
	`updated_at` text,
	FOREIGN KEY (`blog_category_id`) REFERENCES `blog_categories`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `blog_posts_slug_unique` ON `blog_posts` (`slug`);--> statement-breakpoint
CREATE TABLE `brands` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`image` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT '2025-03-03T01:51:26.667Z' NOT NULL,
	`updated_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `brands_slug_unique` ON `brands` (`slug`);--> statement-breakpoint
CREATE TABLE `categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`image` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT '2025-03-03T01:51:26.666Z' NOT NULL,
	`updated_at` text
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
	`created_at` text,
	`updated_at` text
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order_id` integer,
	`product_id` integer,
	`product_variation_id` integer,
	`quantity` integer DEFAULT 1 NOT NULL,
	`unit_amount` real,
	`total_amount` real,
	`attributes` text,
	`created_at` text,
	`updated_at` text,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_variation_id`) REFERENCES `product_variations`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer,
	`grand_total` real,
	`payment_method` text,
	`payment_status` text,
	`status` text DEFAULT 'new' NOT NULL,
	`currency` text,
	`shipping_amount` real,
	`shipping_method` text,
	`notes` text,
	`created_at` text,
	`updated_at` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
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
	`updated_at` text,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `product_variations_sku_unique` ON `product_variations` (`sku`);--> statement-breakpoint
CREATE TABLE `products` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`category_id` integer,
	`brand_id` integer,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`images` text,
	`description` text,
	`price` real DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`is_featured` integer DEFAULT false NOT NULL,
	`on_sale` integer DEFAULT false NOT NULL,
	`has_variations` integer DEFAULT false NOT NULL,
	`has_volume` integer DEFAULT false NOT NULL,
	`volume` text,
	`stock` integer DEFAULT 0 NOT NULL,
	`unlimited_stock` integer DEFAULT false NOT NULL,
	`created_at` text,
	`updated_at` text,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`brand_id`) REFERENCES `brands`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_slug_unique` ON `products` (`slug`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified_at` text,
	`password` text NOT NULL,
	`remember_token` text,
	`created_at` text,
	`updated_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `variation_attributes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`product_variation_id` integer,
	`name` text NOT NULL,
	`value` text NOT NULL,
	`created_at` text,
	`updated_at` text,
	FOREIGN KEY (`product_variation_id`) REFERENCES `product_variations`(`id`) ON UPDATE no action ON DELETE cascade
);
