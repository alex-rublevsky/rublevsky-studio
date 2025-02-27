PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_brands` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`image` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT '2025-02-27T00:04:52.609Z' NOT NULL,
	`updated_at` text
);
--> statement-breakpoint
INSERT INTO `__new_brands`("id", "name", "slug", "image", "is_active", "created_at", "updated_at") SELECT "id", "name", "slug", "image", "is_active", "created_at", "updated_at" FROM `brands`;--> statement-breakpoint
DROP TABLE `brands`;--> statement-breakpoint
ALTER TABLE `__new_brands` RENAME TO `brands`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `brands_slug_unique` ON `brands` (`slug`);--> statement-breakpoint
CREATE TABLE `__new_categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`image` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT '2025-02-27T00:04:52.608Z' NOT NULL,
	`updated_at` text
);
--> statement-breakpoint
INSERT INTO `__new_categories`("id", "name", "slug", "image", "is_active", "created_at", "updated_at") SELECT "id", "name", "slug", "image", "is_active", "created_at", "updated_at" FROM `categories`;--> statement-breakpoint
DROP TABLE `categories`;--> statement-breakpoint
ALTER TABLE `__new_categories` RENAME TO `categories`;--> statement-breakpoint
CREATE UNIQUE INDEX `categories_slug_unique` ON `categories` (`slug`);