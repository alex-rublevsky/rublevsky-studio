"use client";

import { useState } from "react";
import type { OrderWithDetails } from "@/lib/actions/orders/getAllOrders";
import toggleOrderStatus from "@/lib/actions/orders/toggleOrderStatus";
import { OrangeToggle } from "@/components/ui/toggle";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

// Format price as Canadian dollars
const formatPrice = (price: number | null): string => {
  if (price === null) return "CAD $0.00";
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(price);
};

interface OrderListProps {
  initialOrders: OrderWithDetails[];
}

export function OrderList({ initialOrders }: OrderListProps) {
  const [orders, setOrders] = useState(initialOrders);

  const handleToggleStatus = async (orderId: number, currentStatus: string) => {
    try {
      const result = await toggleOrderStatus(orderId);

      if (result.success) {
        setOrders(
          orders.map((order) => {
            if (order.id === orderId) {
              return {
                ...order,
                status: order.status === "pending" ? "processed" : "pending",
              };
            }
            return order;
          })
        );
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to update order status");
    }
  };

  return (
    <div className="rounded-md border">
      <div className="relative w-full overflow-auto">
        <table className="w-full caption-bottom text-sm">
          <thead className="[&_tr]:border-b">
            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Order ID
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Customer
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Items
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Total
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Status
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Date
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Processed
              </th>
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {orders.map((order) => (
              <tr
                key={order.id}
                className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
              >
                <td className="p-4 align-middle font-medium">#{order.id}</td>
                <td className="p-4 align-middle">
                  <div>
                    {order.address.firstName} {order.address.lastName}
                    <div className="text-sm text-muted-foreground">
                      {order.address.email}
                    </div>
                  </div>
                </td>
                <td className="p-4 align-middle">
                  <ul className="space-y-1">
                    {order.items.map((item) => (
                      <li key={item.id} className="flex items-center gap-2">
                        <span>{item.quantity}x</span>
                        <span className="font-medium">{item.product.name}</span>
                        {item.variation && (
                          <Badge variant="outline" className="text-xs">
                            {item.variation.sku}
                          </Badge>
                        )}
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="p-4 align-middle">
                  {formatPrice(order.grandTotal)}
                </td>
                <td className="p-4 align-middle">
                  <Badge
                    variant={
                      order.status === "processed" ? "default" : "secondary"
                    }
                  >
                    {order.status}
                  </Badge>
                </td>
                <td className="p-4 align-middle">
                  {new Date(order.createdAt || "").toLocaleDateString()}
                </td>
                <td className="p-4 align-middle">
                  <OrangeToggle
                    checked={order.status === "processed"}
                    onChange={() => handleToggleStatus(order.id, order.status)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
