

// import db from "~/db";
// import { teaCategories } from "~/schema";
// import { eq } from "drizzle-orm";
// import { TeaCategory } from "~/types/index";

// export default async function getAllTeaCategories(): Promise<TeaCategory[]> {
//   try {
//     return await db
//       .select()
//       .from(teaCategories)
//       .where(eq(teaCategories.isActive, true));
//   } catch (error) {
//     console.error("Error fetching tea categories:", error);
//     return [];
//   }
// } 