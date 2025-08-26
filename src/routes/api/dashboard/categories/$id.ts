import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { categories } from "~/schema";
import { db } from "~/db";
import { eq } from "drizzle-orm";
import { CategoryFormData } from "~/types";

// Extract CORS headers to reduce duplication
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const APIRoute = createAPIFileRoute("/api/dashboard/categories/$id")({
  PUT: async ({ request, params }) => {
    try {
      const id = parseInt(params.id);
      const categoryData: CategoryFormData = await request.json();
      console.log('Updating category with id:', id, 'data:', JSON.stringify(categoryData, null, 2));

      if (isNaN(id)) {
        return json(
          { error: "Invalid category ID" },
          {
            status: 400,
            headers: CORS_HEADERS,
          }
        );
      }

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

      // Check if category exists
      const existingCategory = await db
        .select()
        .from(categories)
        .where(eq(categories.id, id))
        .limit(1);

      if (existingCategory.length === 0) {
        return json(
          { error: "Category not found" },
          {
            status: 404,
            headers: CORS_HEADERS,
          }
        );
      }

      // If slug is being changed, check for duplicate
      if (existingCategory[0].slug !== categoryData.slug) {
        const duplicateCheck = await db
          .select({ slug: categories.slug })
          .from(categories)
          .where(eq(categories.slug, categoryData.slug))
          .limit(1);

        if (duplicateCheck.length > 0) {
          return json(
            { error: "A category with this slug already exists" },
            {
              status: 409,
              headers: CORS_HEADERS,
            }
          );
        }
      }

      // Update the category
      const updateResult = await db
        .update(categories)
        .set({
          name: categoryData.name,
          slug: categoryData.slug,
          image: categoryData.image || null,
          isActive: categoryData.isActive ?? true,
        })
        .where(eq(categories.id, id))
        .returning();

      return json(
        {
          message: "Category updated successfully",
          category: updateResult[0],
        },
        {
          headers: CORS_HEADERS,
        }
      );
    } catch (error) {
      console.error('Error updating category:', error);
      return json(
        { error: 'Failed to update category' },
        {
          status: 500,
          headers: CORS_HEADERS,
        }
      );
    }
  },

  DELETE: async ({ request, params }) => {
    try {
      const id = parseInt(params.id);
      console.log('Deleting category with id:', id);

      if (isNaN(id)) {
        return json(
          { error: "Invalid category ID" },
          {
            status: 400,
            headers: CORS_HEADERS,
          }
        );
      }

      // Check if category exists
      const existingCategory = await db
        .select()
        .from(categories)
        .where(eq(categories.id, id))
        .limit(1);

      if (existingCategory.length === 0) {
        return json(
          { error: "Category not found" },
          {
            status: 404,
            headers: CORS_HEADERS,
          }
        );
      }

      // Delete the category
      await db
        .delete(categories)
        .where(eq(categories.id, id));

      return json(
        {
          message: "Category deleted successfully",
        },
        {
          headers: CORS_HEADERS,
        }
      );
    } catch (error) {
      console.error('Error deleting category:', error);
      return json(
        { error: 'Failed to delete category' },
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
