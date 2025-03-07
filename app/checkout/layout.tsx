import getAllProducts from "@/lib/actions/products/getAllProducts";
import { CartProvider } from "@/lib/context/CartContext";

export default async function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch all products for stock validation
  const products = await getAllProducts({});

  return <CartProvider initialProducts={products}>{children}</CartProvider>;
}
