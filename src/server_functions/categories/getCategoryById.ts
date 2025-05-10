

// import { eq } from "drizzle-orm";
// import db from "~/db";
// import { categories } from "~/schema";
// import { Category } from "~/types";

// /**
//  * Server action to fetch a category by its ID
//  * @param id - The ID of the category to fetch
//  * @returns The category object or null if not found
//  */
// export default async function getCategoryById(id: number): Promise<Category | null> {
//   try {
//     if (!id) {
//       throw new Error("Category ID is required");
//     }
    
//     // Get category by ID
//     const category = await db
//       .select()
//       .from(categories)
//       .where(eq(categories.id, id))
//       .get();
    
//     if (!category) {
//       return null;
//     }
    
//     return category;
//   } catch (error) {
//     console.error("Error fetching category:", error);
//     throw new Error(`Failed to fetch category: ${(error as Error).message}`);
//   }
// } 