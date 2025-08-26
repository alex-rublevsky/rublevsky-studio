import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { categories } from "~/schema";
import { db } from "~/db";
import { eq } from "drizzle-orm";
import { CategoryFormData } from "~/types";

// Extract CORS headers to reduce duplication
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const APIRoute = createAPIFileRoute("/api/dashboard/categories")({
  GET: async ({ request, params }) => {
    try {
      const categoriesResult = await db.select().from(categories).all();

      if (!categoriesResult || categoriesResult.length === 0) {
        return json(
          { message: "No categories found" },
          {
            status: 404,
            headers: CORS_HEADERS,
          }
        );
      }

      return json(categoriesResult, { headers: CORS_HEADERS });
    } catch (error) {
      console.error("Error fetching dashboard categories data:", error);
      return json(
        { error: "Failed to fetch dashboard categories data" },
        {
          status: 500,
          headers: CORS_HEADERS,
        }
      );
    }
  },

  POST: async ({ request }) => {
    try {
      const categoryData: CategoryFormData = await request.json();
      console.log('Creating category with data:', JSON.stringify(categoryData, null, 2));

      // Validate required fields
      if (!categoryData.name || !categoryData.slug) {
        return json(
          {
            error: "Missing required fields: name and slug are required",
          },
          {
            status: 400,
            headers: CORS_HEADERS,
          }
        );
      }

      // Check for duplicate slug
      const existingCategory = await db
        .select({ slug: categories.slug })
        .from(categories)
        .where(eq(categories.slug, categoryData.slug))
        .limit(1);

      if (existingCategory.length > 0) {
        return json(
          { error: "A category with this slug already exists" },
          {
            status: 409,
            headers: CORS_HEADERS,
          }
        );
      }

      // Insert the category
      const insertResult = await db
        .insert(categories)
        .values({
          name: categoryData.name,
          slug: categoryData.slug,
          image: categoryData.image || null,
          isActive: categoryData.isActive ?? true,
        })
        .returning();

      return json(
        {
          message: "Category created successfully",
          category: insertResult[0],
        },
        {
          headers: CORS_HEADERS,
        }
      );
    } catch (error) {
      console.error('Error creating category:', error);
      return json(
        { error: 'Failed to create category' },
        {
          status: 500,
          headers: CORS_HEADERS,
        }
      );
    }
  },

  OPTIONS: async ({ request }) => {
    return new Response(null, {
      status: 200,
      headers: CORS_HEADERS,
    });
  },
});
