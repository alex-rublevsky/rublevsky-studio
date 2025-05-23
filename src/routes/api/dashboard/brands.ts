import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { categories, teaCategories, brands } from "~/schema";
import { db } from "~/db";

export const APIRoute = createAPIFileRoute("/api/dashboard/products")({
  GET: async ({ request, params }) => {
    // Add CORS headers to allow requests from localhost
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
    };

    try {
      const productsResult = await db.select().from(brands).all();

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
      };

      return json(result, { headers: corsHeaders });
    } catch (error) {
      console.error("Error fetching dashboard brands data:", error);
      return json(
        { error: "Failed to fetch dashboard brands data" },
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }
  },
});
