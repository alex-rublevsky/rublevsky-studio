import getAllProducts from "@/lib/actions/products/getAllProducts";
import { CartProvider } from "@/lib/context/CartContext";
import { CartNav } from "@/components/ui/cart/CartNav";

export default async function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const productsData = await getAllProducts({ includePriceRange: true });

  return (
    <CartProvider initialProducts={productsData.products}>
      {children}
      <CartNav />
    </CartProvider>
  );
}
