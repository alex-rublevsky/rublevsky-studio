import { CartProvider } from "@/lib/context/CartContext";
import { CartNav } from "@/components/ui/cart/CartNav";

export default async function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      {children}
      <CartNav />
    </CartProvider>
  );
}
