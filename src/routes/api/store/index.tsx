import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { products, categories, teaCategories } from "~/schema";
import { db } from "~/db";

export const APIRoute = createAPIFileRoute("/api/store")({
  GET: async ({ request, params }) => {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "https://tanstack.rublevsky.studio",
    };

    try {
      const productsResult = await db.select().from(products).all();
      const categoriesResult = await db.select().from(categories).all();
      const teaCategoriesResult = await db.select().from(teaCategories).all();

      if (!productsResult || productsResult.length === 0) {
        return json(
          { message: "No products found" },
          {
            status: 404,
            headers: corsHeaders,
          }
        );
      }

      const result = {
        products: productsResult,
        categories: categoriesResult,
        teaCategories: teaCategoriesResult,
      };

      return json(result, { headers: corsHeaders });
    } catch (error) {
      console.error("Error fetching store data:", error);
      return json(
        { error: "Failed to fetch store data" },
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }
  },
});
