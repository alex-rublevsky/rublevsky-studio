// import { createServerFn } from "@tanstack/react-start";
// import db from "~/db";
// import { products } from "~/schema";

// export const getProducts = createServerFn({ method: "GET" })
//   .handler(async () => {
//     try {
//       const result = await db.select().from(products).all();
//       console.log("Products fetched:", result);
//       return result;
//     } catch (error) {
//       console.error("Error fetching products:", error);
//       throw new Error("Failed to fetch store");
//     }
//   });
