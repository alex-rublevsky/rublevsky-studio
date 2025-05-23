import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { brands } from "~/schema";
import { db } from "~/db";

export const APIRoute = createAPIFileRoute("/api/dashboard/brands")({
  GET: async ({ request, params }) => {
    // Add CORS headers to allow requests from localhost
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
    };

    try {
      const brandsResult = await db.select().from(brands).all();

      if (!brandsResult || brandsResult.length === 0) {
        return json(
          { message: "No brands found" },
          {
            status: 404,
            headers: corsHeaders,
          }
        );
      }

      return json(brandsResult, { headers: corsHeaders });
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
