import db from "@/server/db";
import { teaCategories } from "@/server/schema";
import { eq } from "drizzle-orm";

export default async function getAllTeaCategories() {
  try {
    const categories = await db
      .select()
      .from(teaCategories)
      .where(eq(teaCategories.isActive, true));

    return categories;
  } catch (error) {
    console.error("Error fetching tea categories:", error);
    return [];
  }
} 