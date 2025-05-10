

// import { eq } from "drizzle-orm";
// import db from "~/db";
// import { categories } from "~/schema";

// /**
//  * Server action to delete a category
//  * @param id - The ID of the category to delete
//  */
// export default async function deleteCategory(id: number): Promise<void> {
//   try {
//     // Delete the category (foreign key constraints will handle related data)
//     await db.delete(categories)
//       .where(eq(categories.id, id));
//   } catch (error) {
//     throw new Error(`Failed to delete category: ${(error as Error).message}`);
//   }
// } 