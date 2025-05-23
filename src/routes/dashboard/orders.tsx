import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "~/components/ui/shared/Badge";
import { Image } from "~/components/ui/shared/Image";
import { Switch } from "~/components/ui/shared/Switch";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { DEPLOY_URL } from "~/utils/store";

interface OrderAddress {
  id: number;
  orderId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  streetAddress: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  addressType: "shipping" | "billing" | "both";
}

interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  unitAmount: number;
  finalAmount: number;
  discountPercentage?: number;
  product: {
    name: string;
    images: string | null;
  };
  variation?: {
    id: number;
    sku: string;
  };
  attributes?: Record<string, string>;
}

interface Order {
  id: number;
  status: string;
  subtotalAmount: number;
  discountAmount: number;
  shippingAmount: number;
  totalAmount: number;
  currency: string;
  paymentMethod: string | null;
  paymentStatus: string;
  shippingMethod: string | null;
  notes: string | null;
  createdAt: number;
  completedAt: number | null;
  addresses: OrderAddress[];
  items: OrderItem[];
}

export const Route = createFileRoute("/dashboard/orders")({
  component: OrderList,
});

function OrderList() {
  const { isPending, data, isError, refetch } = useQuery<Order[]>({
    queryKey: ["dashboard-orders"],
    queryFn: () =>
      fetch(`${DEPLOY_URL}/api/dashboard/orders`).then((res) => res.json()),
  });

  const handleToggleStatus = async (orderId: number, currentStatus: string) => {
    try {
      // TODO: Implement actual status toggle API call
      toast.success("Order status updated");
      refetch(); // Refresh the orders list
    } catch (error) {
      console.error("Failed to update order status:", error);
      toast.error("Failed to update order status");
    }
  };
  //   try {
  //     const result = await toggleOrderStatus(orderId);
  //     if (result.success) {
  //       setOrders(
  //         orders.map((order) =>
  //           order.id === orderId
  //             ? {
  //                 ...order,
  //                 status: currentStatus === "pending" ? "processed" : "pending",
  //               }
  //             : order
  //         )
  //       );
  //       toast.success(result.message);
  //     } else {
  //       toast.error(result.message);
  //     }
  //   } catch (error) {
  //     console.error("Failed to update order status:", error);
  //     toast.error("Failed to update order status");
  //   }
  // };

  if (isPending) {
    return <div className="text-center py-4">Loading orders...</div>;
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-full w-full flex justify-center items-center">
        <p className="text-gray-500">No orders found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {data.map((order) => {
        const shippingAddress = order.addresses?.find(
          (addr) =>
            addr.addressType === "shipping" || addr.addressType === "both"
        );
        const billingAddress =
          order.addresses?.find((addr) => addr.addressType === "billing") ||
          shippingAddress;

        return (
          <div key={order.id} className="border rounded-lg p-6 space-y-6">
            {/* Order Header */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">Order #{order.id}</h3>
                <p className="text-sm text-gray-500">
                  {new Date(order.createdAt * 1000).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Badge
                  variant={
                    order.status === "processed"
                      ? "default"
                      : order.status === "pending"
                        ? "secondary"
                        : "outline"
                  }
                >
                  {order.status}
                </Badge>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    Mark as processed
                  </span>
                  <Switch
                    checked={order.status === "processed"}
                    onChange={() => handleToggleStatus(order.id, order.status)}
                  />
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Order Details */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Order Details</h4>
                  <div className="text-sm space-y-1">
                    <p>
                      <span className="text-gray-500">Payment Status:</span>{" "}
                      <span className="capitalize">{order.paymentStatus}</span>
                    </p>
                    <p>
                      <span className="text-gray-500">Payment Method:</span>{" "}
                      <span className="capitalize">
                        {order.paymentMethod || "Not specified"}
                      </span>
                    </p>
                    <p>
                      <span className="text-gray-500">Shipping Method:</span>{" "}
                      <span className="capitalize">
                        {order.shippingMethod || "Not specified"}
                      </span>
                    </p>
                    {order.completedAt && (
                      <p>
                        <span className="text-gray-500">Completed:</span>{" "}
                        {new Date(order.completedAt * 1000).toLocaleString()}
                      </p>
                    )}
                    {order.notes && (
                      <p>
                        <span className="text-gray-500">Notes:</span>{" "}
                        {order.notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Price Details */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Price Details</h4>
                  <div className="text-sm space-y-1">
                    <p>
                      <span className="text-gray-500">Subtotal:</span> $
                      {(order.subtotalAmount || 0).toFixed(2)}
                    </p>
                    {(order.discountAmount || 0) > 0 && (
                      <p>
                        <span className="text-gray-500">Discount:</span>{" "}
                        <span className="text-red-500">
                          -${(order.discountAmount || 0).toFixed(2)}
                        </span>
                      </p>
                    )}
                    <p>
                      <span className="text-gray-500">Shipping:</span> $
                      {(order.shippingAmount || 0).toFixed(2)}
                    </p>
                    <p className="font-medium">
                      <span className="text-gray-500">Total:</span>{" "}
                      {order.currency || "CAD"} $
                      {(order.totalAmount || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              {shippingAddress && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Shipping Address</h4>
                    <div className="text-sm space-y-1">
                      <p className="font-medium">
                        {shippingAddress.firstName} {shippingAddress.lastName}
                      </p>
                      <p>{shippingAddress.email}</p>
                      <p>{shippingAddress.phone}</p>
                      <p>{shippingAddress.streetAddress}</p>
                      <p>
                        {shippingAddress.city}
                        {shippingAddress.state && `, ${shippingAddress.state}`}
                      </p>
                      <p>{shippingAddress.zipCode}</p>
                      <p>{shippingAddress.country}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Billing Address - Only show if different from shipping */}
              {order.addresses?.length > 1 && billingAddress && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Billing Address</h4>
                    <div className="text-sm space-y-1">
                      <p className="font-medium">
                        {billingAddress.firstName} {billingAddress.lastName}
                      </p>
                      <p>{billingAddress.email}</p>
                      <p>{billingAddress.phone}</p>
                      <p>{billingAddress.streetAddress}</p>
                      <p>
                        {billingAddress.city}
                        {billingAddress.state && `, ${billingAddress.state}`}
                      </p>
                      <p>{billingAddress.zipCode}</p>
                      <p>{billingAddress.country}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Order Items */}
            <div>
              <h4 className="font-medium mb-3">
                Items ({order.items?.length || 0})
              </h4>
              <div className="space-y-3">
                {(order.items || []).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-4 p-4 bg-background border rounded-lg hover:border-primary/50 transition-colors"
                  >
                    <div className="relative w-20 h-20 shrink-0 bg-gray-100 rounded-md overflow-hidden">
                      {item.product.images ? (
                        <Image
                          src={`/${item.product.images.split(",").map((img) => img.trim())[0]}`}
                          alt={item.product.name}
                          className="object-cover"
                          sizes="5rem"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="grow min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div>
                          <div className="font-medium truncate">
                            {item.product.name}
                          </div>
                          {item.variation && (
                            <div className="text-sm text-gray-500">
                              SKU: {item.variation.sku}
                            </div>
                          )}
                          {item.attributes &&
                            Object.keys(item.attributes).length > 0 && (
                              <div className="text-sm text-gray-500">
                                {Object.entries(item.attributes)
                                  .map(([key, value]) => `${key}: ${value}`)
                                  .join(", ")}
                              </div>
                            )}
                          <div className="text-sm text-gray-500 mt-1">
                            Quantity: {item.quantity}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <div className="font-medium">
                            ${(item.finalAmount || 0).toFixed(2)}
                          </div>
                          {item.discountPercentage && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm line-through text-gray-500">
                                ${(item.unitAmount * item.quantity).toFixed(2)}
                              </span>
                              <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full">
                                {item.discountPercentage}% OFF
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
