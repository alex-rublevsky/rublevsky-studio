// Add dynamic export
export const dynamic = "force-dynamic";

import { CartProvider } from "@/lib/context/CartContext";
import { CartNav } from "@/components/ui/cart/CartNav";

export default async function CheckoutLayout({
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
