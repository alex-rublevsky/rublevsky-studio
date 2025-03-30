import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/shared/button";
import { CheckCircle, Clock } from "lucide-react";
import getOrderById from "@/lib/actions/orders/getOrderById";
import { getAttributeDisplayName } from "@/lib/utils/productAttributes";
import NeumorphismCard from "@/components/ui/shared/neumorphism-card";
import { Badge } from "@/components/ui/shared/badge";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  originalPrice?: number;
  discount?: number;
  image?: string;
  attributes?: Record<string, string>;
}

interface OrderPageProps {
  params: { id: string };
  searchParams: { new?: string };
}

function getFirstImage(images: string | null): string | null {
  if (!images) return null;
  return images.split(",")[0].trim();
}

export default async function OrderPage({
  params,
  searchParams,
}: OrderPageProps) {
  const orderId = parseInt(params.id, 10);
  const isNewOrder = searchParams.new === "true";

  if (isNaN(orderId)) {
    notFound();
  }

  const order = await getOrderById(orderId);

  if (!order) {
    notFound();
  }

  const shippingAddress = order.addresses.find(
    (addr) => addr.addressType === "shipping" || addr.addressType === "both"
  );

  if (!shippingAddress) {
    throw new Error("No shipping address found for order");
  }

  return (
    <section className="py-16">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            {isNewOrder ? (
              <CheckCircle className="h-16 w-16 text-green-500" />
            ) : (
              <Clock className="h-16 w-16 text-muted" />
            )}
          </div>

          <h3 className="mb-3 text-muted-foreground">
            {isNewOrder ? "Thank You for Your Order!" : "Order Details"}
          </h3>

          <div className="flex justify-center gap-8">
            {" "}
            <p className="text-muted-foreground mb-2">Order #{order.id}</p>
            <p className="text-muted-foreground">
              Placed on {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* What Happens Next Section - Only shown for new orders */}
        {isNewOrder && (
          <NeumorphismCard className="space-y-4">
            <h2 className="font-semibold text-lg">What happens next?</h2>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>You will receive an order confirmation email shortly.</li>
              <li>
                Our team will review your order and contact you to discuss
                shipping options and costs.
              </li>
              <li>
                Once shipping is arranged, we will send you payment details.
              </li>
              <li>
                After payment is confirmed, your order will be prepared for
                shipping.
              </li>
            </ol>
          </NeumorphismCard>
        )}

        {/* Order Items Section */}
        <div className="space-y-4">
          <div className="space-y-4">
            {order.items.map((item) => (
              <NeumorphismCard key={item.id} className="flex gap-4">
                {item.product.images && (
                  <div className="w-20 h-fit flex-shrink-0">
                    <div className="relative w-full pb-[100%]">
                      <Image
                        src={`/${getFirstImage(item.product.images)}`}
                        alt={item.product.name}
                        fill
                        className="object-contain rounded-md"
                      />
                    </div>
                  </div>
                )}
                <div className="flex-grow min-w-0">
                  <h6 className="font-medium break-words">
                    {item.product.name}
                  </h6>
                  <p className="text-sm text-muted-foreground">
                    Quantity: {item.quantity}
                  </p>
                  {Object.entries(item.attributes).length > 0 && (
                    <div className="flex flex-wrap gap-6 mt-1">
                      {Object.entries(item.attributes).map(([key, value]) => (
                        <span
                          key={key}
                          className="text-sm text-muted-foreground"
                        >
                          {getAttributeDisplayName(key)}: {value}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col justify-end text-right shrink-0">
                  {item.discountPercentage ? (
                    <>
                      <Badge variant="greenOutline" className="mb-1 self-end">
                        -{item.discountPercentage}%
                      </Badge>
                      <p className="line-through text-muted-foreground">
                        CA${(item.unitAmount * item.quantity).toFixed(2)}
                      </p>
                    </>
                  ) : null}
                  <h6 className="">CA${item.finalAmount.toFixed(2)}</h6>
                </div>
              </NeumorphismCard>
            ))}
          </div>
        </div>

        {/* Order Summary Section */}
        <NeumorphismCard className="">
          <div className="space-y-2">
            <div className="flex justify-between">
              <p>Subtotal</p>
              <p>CA${order.subtotalAmount.toFixed(2)}</p>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <p>Discount</p>
                <Badge variant="green">
                  -CA${order.discountAmount.toFixed(2)}
                </Badge>
              </div>
            )}
            <div className="flex justify-between ">
              <p>Shipping</p>
              <p className="text-muted-foreground">
                {order.shippingAmount
                  ? `CA$${order.shippingAmount.toFixed(2)}`
                  : "To be determined"}
              </p>
            </div>
            <div className="flex justify-between items-baseline text-lg pt-2 border-t">
              <h5>Total</h5>
              <h3>CA${order.totalAmount.toFixed(2)}</h3>
            </div>
          </div>
        </NeumorphismCard>

        {/* Shipping Address Section */}
        <div className="border-t pt-6">
          <h2 className="font-semibold text-lg mb-4">Shipping Address</h2>
          <div className="text-">
            <p>
              {shippingAddress.firstName} {shippingAddress.lastName}
            </p>
            <p>{shippingAddress.streetAddress}</p>
            <p>
              {shippingAddress.city}, {shippingAddress.state}{" "}
              {shippingAddress.zipCode}
            </p>
            <p>{shippingAddress.country}</p>
            <p className="mt-2">{shippingAddress.email}</p>
            <p>{shippingAddress.phone}</p>
          </div>
        </div>

        {/* Actions Section */}
        <div className="flex justify-center gap-4">
          <Button asChild variant="outline">
            <Link href="/store">Continue Shopping</Link>
          </Button>
          {!isNewOrder && (
            <Button asChild variant="outline">
              <Link href="mailto:support@rublevsky.studio">
                Contact Support
              </Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
