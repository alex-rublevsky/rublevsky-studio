import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { categories } from "~/schema";
import { db } from "~/db";

export const APIRoute = createAPIFileRoute("/api/dashboard/categories")({
  GET: async ({ request, params }) => {
    // Add CORS headers to allow requests from localhost
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
    };

    try {
      const productsResult = await db.select().from(categories).all();

      if (!productsResult || productsResult.length === 0) {
        return json(
          { message: "No categories found" },
          {
            status: 404,
            headers: corsHeaders,
          }
        );
      }

      return json(productsResult, { headers: corsHeaders });
    } catch (error) {
      console.error("Error fetching dashboard categories data:", error);
      return json(
        { error: "Failed to fetch dashboard categories data" },
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }
  },
});
