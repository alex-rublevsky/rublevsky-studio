import getAllProducts from "@/lib/actions/products/getAllProducts";
import { CartProvider } from "@/lib/context/CartContext";
import { CartNav } from "@/components/ui/cart/CartNav";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch all products for stock validation
  const products = await getAllProducts({});

  return (
    <CartProvider initialProducts={products.products}>
      {children}
      <CartNav />
    </CartProvider>
  );
}
