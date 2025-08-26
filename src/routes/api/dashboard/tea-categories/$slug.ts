import { json } from '@tanstack/react-start'
import { createAPIFileRoute } from '@tanstack/react-start/api'
import { teaCategories } from '~/schema'
import { db } from '~/db'
import { eq } from 'drizzle-orm'
import { TeaCategoryFormData } from '~/types'

// Extract CORS headers to reduce duplication
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const APIRoute = createAPIFileRoute('/api/dashboard/tea-categories/$slug')({
  PUT: async ({ request, params }) => {
    try {
      const slug = params.slug;
      const teaCategoryData: TeaCategoryFormData = await request.json();
      console.log('Updating tea category with slug:', slug, 'data:', JSON.stringify(teaCategoryData, null, 2));

      // Validate required fields
      if (!teaCategoryData.name || !teaCategoryData.slug) {
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
        .from(teaCategories)
        .where(eq(teaCategories.slug, slug))
        .limit(1);

      if (existingCategory.length === 0) {
        return json(
          { error: "Tea category not found" },
          {
            status: 404,
            headers: CORS_HEADERS,
          }
        );
      }

      // If slug is being changed, check for duplicate
      if (slug !== teaCategoryData.slug) {
        const duplicateCheck = await db
          .select({ slug: teaCategories.slug })
          .from(teaCategories)
          .where(eq(teaCategories.slug, teaCategoryData.slug))
          .limit(1);

        if (duplicateCheck.length > 0) {
          return json(
            { error: "A tea category with this slug already exists" },
            {
              status: 409,
              headers: CORS_HEADERS,
            }
          );
        }
      }

      // Update the tea category
      const updateResult = await db
        .update(teaCategories)
        .set({
          name: teaCategoryData.name,
          slug: teaCategoryData.slug,
          isActive: teaCategoryData.isActive ?? true,
        })
        .where(eq(teaCategories.slug, slug))
        .returning();

      return json(
        {
          message: "Tea category updated successfully",
          teaCategory: updateResult[0],
        },
        {
          headers: CORS_HEADERS,
        }
      );
    } catch (error) {
      console.error('Error updating tea category:', error);
      return json(
        { error: 'Failed to update tea category' },
        {
          status: 500,
          headers: CORS_HEADERS,
        }
      );
    }
  },

  DELETE: async ({ request, params }) => {
    try {
      const slug = params.slug;
      console.log('Deleting tea category with slug:', slug);

      // Check if category exists
      const existingCategory = await db
        .select()
        .from(teaCategories)
        .where(eq(teaCategories.slug, slug))
        .limit(1);

      if (existingCategory.length === 0) {
        return json(
          { error: "Tea category not found" },
          {
            status: 404,
            headers: CORS_HEADERS,
          }
        );
      }

      // Delete the tea category (this will cascade delete related records due to foreign key constraints)
      await db
        .delete(teaCategories)
        .where(eq(teaCategories.slug, slug));

      return json(
        {
          message: "Tea category deleted successfully",
        },
        {
          headers: CORS_HEADERS,
        }
      );
    } catch (error) {
      console.error('Error deleting tea category:', error);
      return json(
        { error: 'Failed to delete tea category' },
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
