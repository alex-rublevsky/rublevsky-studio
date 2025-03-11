// Add dynamic export
export const dynamic = "force-dynamic";

import { CartProvider } from "@/lib/context/CartContext";

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CartProvider initialProducts={[]}>{children}</CartProvider>;
}
