import ProductList from "@/components/ui/store/productList";
import db from "@/server/db";
import {
  products,
  productVariations,
  variationAttributes,
} from "@/server/schema";
import { eq } from "drizzle-orm";
import { Product } from "@/types";

export default async function StorePage() {
  // Fetch all products
  const productList = await db.select().from(products);

  // Fetch variations for products that have them
  const productsWithVariations = await Promise.all(
    productList.map(async (product: Product) => {
      if (product.hasVariations) {
        const variations = await db
          .select()
          .from(productVariations)
          .where(eq(productVariations.productId, product.id))
          .all();

        // Get attributes for each variation
        for (const variation of variations) {
          const attributes = await db
            .select()
            .from(variationAttributes)
            .where(eq(variationAttributes.productVariationId, variation.id))
            .all();

          variation.attributes = attributes;
        }

        return { ...product, variations };
      }

      return product;
    })
  );

  return (
    <div className="space-y-8">
      <ProductList title="Latest Products" data={productsWithVariations} />
    </div>
  );
}
