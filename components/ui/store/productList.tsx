import { Product, ProductVariation, VariationAttribute } from "@/types";
import ProductCard from "./productCard";

// Extended product interface with variations
interface ProductWithVariations extends Product {
  variations?: ProductVariationWithAttributes[];
}

interface ProductVariationWithAttributes extends ProductVariation {
  attributes: VariationAttribute[];
}

function ProductList({
  title,
  data,
}: {
  title: string;
  data: ProductWithVariations[];
}) {
  return (
    <section className="w-full">
      <h2 className="mb-8">{title}</h2>

      {/* Product grid - responsive layout matching the Laravel example */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mx-auto items-start">
        {data.map((product: ProductWithVariations) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </section>
  );
}
export default ProductList;
