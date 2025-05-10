

// import { eq } from "drizzle-orm";
// import db from "~/db";
// import { categories } from "~/schema";
// import { Category } from "~/types";

// /**
//  * Server action to fetch all categories
//  * @param onlyActive - If true, only returns active categories
//  * @returns Array of category objects
//  */
// export default async function getAllCategories(onlyActive: boolean = false): Promise<Category[]> {
//   try {
//     // Fetch all categories with optional active filter
//     const allCategories = await db
//       .select()
//       .from(categories)
//       .where(onlyActive ? eq(categories.isActive, true) : undefined)
//       .all();

//     return allCategories;
//   } catch (error) {
//     console.error("Error fetching categories:", error);
//     throw new Error(`Failed to fetch categories: ${(error as Error).message}`);
//   }
// } 