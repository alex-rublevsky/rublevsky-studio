import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { orders } from "~/schema";
import { db } from "~/db";

export const APIRoute = createAPIFileRoute("/api/dashboard/orders")({
  GET: async ({ request, params }) => {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "https://tanstack.rublevsky.studio",
    };

    try {
      const ordersResult = await db.select().from(orders).all();

      if (!ordersResult || ordersResult.length === 0) {
        return json(
          { message: "No orders found" },
          {
            status: 404,
            headers: corsHeaders,
          }
        );
      }

      return json(ordersResult, { headers: corsHeaders });
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
