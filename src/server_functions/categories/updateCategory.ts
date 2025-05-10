
// import { eq } from "drizzle-orm";
// import db from "~/db";
// import { categories } from "~/schema";
// import { Category } from "~/types";

// interface UpdateCategoryData {
//   name: string;
//   slug: string;
//   image?: string | null;
//   isActive?: boolean;
// }

// /**
//  * Server action to update a category
//  * @param id - The ID of the category to update
//  * @param data - The category data to update
//  * @returns The updated category object
//  */
// export default async function updateCategory(id: number, data: UpdateCategoryData): Promise<Category> {
//   try {
//     if (!data.name || !data.slug) {
//       throw new Error("Name and slug are required");
//     }

//     // Fetch existing category and check for duplicate slug in a single query
//     const [category, duplicateSlug] = await Promise.all([
//       db.select().from(categories).where(eq(categories.id, id)).get(),
//       db.select().from(categories).where(eq(categories.slug, data.slug)).get()
//     ]);

//     if (!category) throw new Error("Category not found");
//     if (duplicateSlug && duplicateSlug.id !== id) {
//       throw new Error("A category with this slug already exists");
//     }

//     // Update category
//     await db.update(categories)
//       .set({
//         name: data.name,
//         slug: data.slug,
//         image: data.image || null,
//         isActive: data.isActive ?? category.isActive
//       })
//       .where(eq(categories.id, id));

//     // Fetch and return updated category
//     const updatedCategory = await db.select()
//       .from(categories)
//       .where(eq(categories.id, id))
//       .get();

//     return updatedCategory as Category;
//   } catch (error) {
//     throw new Error(`Failed to update category: ${(error as Error).message}`);
//   }
// } 