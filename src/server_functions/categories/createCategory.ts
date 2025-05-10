

// import { eq } from "drizzle-orm";
// import db from "~/db";
// import { categories } from "~/schema";

// interface CreateCategoryData {
//   name: string;
//   slug: string;
//   image?: string | null;
//   isActive?: boolean;
// }

// /**
//  * Server action to create a new category
//  * @param data - The category data to create
//  */
// export default async function createCategory(data: CreateCategoryData): Promise<void> {
//   try {
//     if (!data.name || !data.slug) {
//       throw new Error("Name and slug are required");
//     }

//     // Check if slug already exists
//     const existingCategory = await db
//       .select()
//       .from(categories)
//       .where(eq(categories.slug, data.slug))
//       .get();

//     if (existingCategory) {
//       throw new Error("A category with this slug already exists");
//     }

//     // Create category
//     await db.insert(categories)
//       .values({
//         name: data.name,
//         slug: data.slug,
//         image: data.image || null,
//         isActive: data.isActive ?? true
//       });
//   } catch (error) {
//     throw new Error(`Failed to create category: ${(error as Error).message}`);
//   }
// } 