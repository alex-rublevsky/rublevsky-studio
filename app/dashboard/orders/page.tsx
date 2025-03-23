export const dynamic = "force-dynamic";

import { Suspense } from "react";
import getAllOrders from "@/lib/actions/orders/getAllOrders";
import { OrderList } from "@/app/dashboard/orders/OrderList";

export const metadata = {
  title: "Orders | Dashboard",
};

export default async function OrdersPage() {
  const orders = await getAllOrders();

  return (
    <div className="space-y-8">
      <Suspense fallback={<div>Loading orders...</div>}>
        <OrderList initialOrders={orders} />
      </Suspense>
    </div>
  );
}
