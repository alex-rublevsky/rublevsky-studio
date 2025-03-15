export const dynamic = "force-dynamic";

import { Suspense } from "react";
import getAllOrders from "@/lib/actions/orders/getAllOrders";
import { OrderList } from "@/app/admin/orders/OrderList";

export const metadata = {
  title: "Orders | Admin",
};

export default async function OrdersPage() {
  const orders = await getAllOrders();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Orders</h1>
      </div>
      <Suspense fallback={<div>Loading orders...</div>}>
        <OrderList initialOrders={orders} />
      </Suspense>
    </div>
  );
}
