import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { categories } from "~/schema";
import { db } from "~/db";

export const APIRoute = createAPIFileRoute("/api/dashboard/categories")({
  GET: async ({ request, params }) => {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "https://tanstack.rublevsky.studio",
    };

    try {
      const categoriesResult = await db.select().from(categories).all();

      if (!categoriesResult || categoriesResult.length === 0) {
        return json(
          { message: "No categories found" },
          {
            status: 404,
            headers: corsHeaders,
          }
        );
      }

      return json(categoriesResult, { headers: corsHeaders });
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
