import { json } from '@tanstack/react-start'
import { createAPIFileRoute } from '@tanstack/react-start/api'
import { teaCategories } from '~/schema'
import { db } from '~/db'
import { eq } from 'drizzle-orm'
import { TeaCategoryFormData } from '~/types'

// Extract CORS headers to reduce duplication
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const APIRoute = createAPIFileRoute('/api/dashboard/tea-categories')({
  GET: async ({ request, params }) => {
    try {
      const teaCategoriesResult = await db.select().from(teaCategories).all();

      if (!teaCategoriesResult || teaCategoriesResult.length === 0) {
        return json(
          { message: "No tea categories found" },
          {
            status: 404,
            headers: CORS_HEADERS,
          }
        );
      }

      return json(teaCategoriesResult, { headers: CORS_HEADERS });
    } catch (error) {
      console.error("Error fetching dashboard tea categories data:", error);
      return json(
        { error: "Failed to fetch dashboard tea categories data" },
        {
          status: 500,
          headers: CORS_HEADERS,
        }
      );
    }
  },

  POST: async ({ request }) => {
    try {
      const teaCategoryData: TeaCategoryFormData = await request.json();
      console.log('Creating tea category with data:', JSON.stringify(teaCategoryData, null, 2));

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

      // Check for duplicate slug
      const existingCategory = await db
        .select({ slug: teaCategories.slug })
        .from(teaCategories)
        .where(eq(teaCategories.slug, teaCategoryData.slug))
        .limit(1);

      if (existingCategory.length > 0) {
        return json(
          { error: "A tea category with this slug already exists" },
          {
            status: 409,
            headers: CORS_HEADERS,
          }
        );
      }

      // Insert the tea category
      const insertResult = await db
        .insert(teaCategories)
        .values({
          name: teaCategoryData.name,
          slug: teaCategoryData.slug,
          isActive: teaCategoryData.isActive ?? true,
        })
        .returning();

      return json(
        {
          message: "Tea category created successfully",
          teaCategory: insertResult[0],
        },
        {
          headers: CORS_HEADERS,
        }
      );
    } catch (error) {
      console.error('Error creating tea category:', error);
      return json(
        { error: 'Failed to create tea category' },
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
