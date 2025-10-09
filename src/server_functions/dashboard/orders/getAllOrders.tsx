import { createServerFn } from "@tanstack/react-start";
import { setResponseStatus } from "@tanstack/react-start/server";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { DB } from "~/db";
import type * as schema from "~/schema";
import { orders } from "~/schema";

export const getAllOrders = createServerFn({ method: "GET" }).handler(
	async () => {
		try {
			const db: DrizzleD1Database<typeof schema> = DB();
			const ordersResult = await db.select().from(orders).all();

			if (!ordersResult || ordersResult.length === 0) {
				setResponseStatus(404);
				throw new Error("No orders found");
			}

			return ordersResult;
		} catch (error) {
			console.error("Error fetching dashboard orders data:", error);
			setResponseStatus(500);
			throw new Error("Failed to fetch dashboard orders data");
		}
	},
);
