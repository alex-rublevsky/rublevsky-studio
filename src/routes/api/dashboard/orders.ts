import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { orders } from "~/schema";
import { db } from "~/db";

export const APIRoute = createAPIFileRoute("/api/dashboard/orders")({
  GET: async ({ request, params }) => {
    // Add CORS headers to allow requests from localhost
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
    };

    try {
      const productsResult = await db.select().from(orders).all();

      if (!productsResult || productsResult.length === 0) {
        return json(
          { message: "No orders found" },
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
      console.error("Error fetching dashboard orders data:", error);
      return json(
        { error: "Failed to fetch dashboard orders data" },
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }
  },
});
