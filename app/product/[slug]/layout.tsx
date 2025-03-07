import getAllProducts from "@/lib/actions/products/getAllProducts";
import { CartProvider } from "@/lib/context/CartContext";
import { CartNav } from "@/components/ui/cart/CartNav";

export default async function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch all products for stock validation
  const products = await getAllProducts({});

  return (
    <CartProvider initialProducts={products}>
      {children}
      <CartNav />
    </CartProvider>
  );
}
