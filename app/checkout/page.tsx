"use client";
//TODO: update input to include label

// Add dynamic export
export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/context/CartContext";
import { Button } from "@/components/ui/shared/button";
import { Input } from "@/components/ui/shared/input";
import { toast } from "sonner";
import { createOrder } from "@/lib/actions/cart/createOrder";
import Image from "next/image";
import { getAttributeDisplayName } from "@/lib/utils/productAttributes";
import { AddressFields } from "@/components/ui/checkout/AddressFields";
import { cn } from "@/lib/utils";

interface Address {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  streetAddress: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

interface CustomerInfo {
  shippingAddress: Address;
  billingAddress?: Address;
  notes?: string;
  shippingMethod?: string;
}

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isCartLoaded, setIsCartLoaded] = useState(false);
  const [useSeparateBilling, setUseSeparateBilling] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    shippingAddress: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      streetAddress: "",
      city: "",
      state: "",
      country: "",
      zipCode: "",
    },
    notes: "",
    shippingMethod: "standard",
  });

  // Wait for cart to be loaded from cookies before checking if it's empty
  useEffect(() => {
    // Set a small delay to ensure cart is loaded from cookies
    const timer = setTimeout(() => {
      setIsCartLoaded(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Only redirect if cart is empty AND cart has been loaded
  useEffect(() => {
    if (isCartLoaded && cart.items.length === 0) {
      router.push("/store");
    }
  }, [cart.items.length, router, isCartLoaded]);

  const handleAddressChange =
    (addressType: "shipping" | "billing") => (name: string, value: string) => {
      setCustomerInfo((prev) => ({
        ...prev,
        [addressType === "shipping" ? "shippingAddress" : "billingAddress"]: {
          ...(addressType === "shipping"
            ? prev.shippingAddress
            : prev.billingAddress || prev.shippingAddress),
          [name]: value,
        },
      }));
    };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setCustomerInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "streetAddress",
      "city",
      "country",
      "zipCode",
    ];

    const missingFields = requiredFields.filter(
      (field) => !customerInfo.shippingAddress[field as keyof Address]
    );

    if (missingFields.length > 0) {
      toast.error(
        `Please fill in all required fields: ${missingFields.join(", ")}`
      );
      return;
    }

    if (cart.items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsLoading(true);

    try {
      // First create the order
      const result = await createOrder(customerInfo, cart.items);

      if (!result.success) {
        throw new Error(result.message);
      }

      // If order was created successfully, send the email
      try {
        await fetch("/api/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firstName: customerInfo.shippingAddress.firstName,
            lastName: customerInfo.shippingAddress.lastName,
            email: customerInfo.shippingAddress.email,
            orderItems: cart.items.map((item) => ({
              name: item.productName,
              quantity: item.quantity,
              price: item.discount
                ? (item.price * (1 - item.discount / 100)).toFixed(2)
                : item.price.toFixed(2),
              originalPrice: item.price.toFixed(2),
              discount: item.discount,
              image: item.image
                ? `https://assets.rublevsky.studio/${item.image}`
                : undefined,
            })),
            subtotal: subtotal.toFixed(2),
            totalDiscount: totalDiscount.toFixed(2),
            orderTotal: total.toFixed(2),
          }),
        });
      } catch (emailError) {
        console.error("Failed to send email:", emailError);
        // Don't throw here - we still want to proceed with redirect even if email fails
      }

      // Clear the cart and show success message
      toast.success("Order placed successfully!");
      clearCart();

      // Redirect to order confirmation page
      router.push(`/orders/confirmation?orderId=${result.orderId}`);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to place order. Please try again."
      );
      console.error("Checkout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate cart totals
  const subtotal = cart.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Calculate total discounts
  const totalDiscount = cart.items.reduce((total, item) => {
    if (item.discount) {
      const itemDiscount = item.price * item.quantity * (item.discount / 100);
      return total + itemDiscount;
    }
    return total;
  }, 0);

  const total = subtotal - totalDiscount;

  return (
    <div className="w-full px-4 py-10">
      <div className="max-w-[2000px] mx-auto">
        <h2 className="">Checkout</h2>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Customer Information Form - Left Side */}
          <div className="flex-1">
            <form onSubmit={handleSubmit}>
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4">Payment Information</h2>
                <p className="text-gray-700">
                  You will be contacted regarding payment options after placing
                  your order.
                </p>
              </div>

              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4">Shipping Address</h2>
                <AddressFields
                  values={customerInfo.shippingAddress}
                  onChange={handleAddressChange("shipping")}
                />

                <div className="mb-6">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={useSeparateBilling}
                      onChange={(e) => {
                        setUseSeparateBilling(e.target.checked);
                        if (e.target.checked && !customerInfo.billingAddress) {
                          setCustomerInfo((prev) => ({
                            ...prev,
                            billingAddress: { ...prev.shippingAddress },
                          }));
                        }
                      }}
                      className="form-checkbox"
                    />
                    <span>Use different billing address</span>
                  </label>
                </div>

                {useSeparateBilling && (
                  <div className="mt-6 p-4 border rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">
                      Billing Address
                    </h3>
                    <AddressFields
                      values={
                        customerInfo.billingAddress ||
                        customerInfo.shippingAddress
                      }
                      onChange={handleAddressChange("billing")}
                      required={useSeparateBilling}
                    />
                  </div>
                )}

                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Additional Information
                  </h3>

                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">
                      Shipping Method
                    </label>
                    <div className="flex gap-4">
                      <Button
                        type="button"
                        onClick={() =>
                          setCustomerInfo((prev) => ({
                            ...prev,
                            shippingMethod: "standard",
                          }))
                        }
                        className={cn(
                          "flex-1",
                          customerInfo.shippingMethod === "standard"
                            ? "bg-primary"
                            : "bg-secondary hover:bg-secondary/80"
                        )}
                      >
                        Standard Shipping
                      </Button>
                      <Button
                        type="button"
                        onClick={() =>
                          setCustomerInfo((prev) => ({
                            ...prev,
                            shippingMethod: "pickup",
                          }))
                        }
                        className={cn(
                          "flex-1",
                          customerInfo.shippingMethod === "pickup"
                            ? "bg-primary"
                            : "bg-secondary hover:bg-secondary/80"
                        )}
                      >
                        Local Pickup
                      </Button>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label
                      className="block text-sm font-medium mb-2"
                      htmlFor="notes"
                    >
                      Order Notes
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={customerInfo.notes}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full p-2 border rounded-md"
                      placeholder="Any special instructions for your order?"
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Order Summary - Right Side */}
          <div className="lg:w-[27rem]">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h5>Summary</h5>

              <div className="flex justify-between my-2">
                <span>Subtotal</span>
                <span>CA${subtotal.toFixed(2)}</span>
              </div>

              {totalDiscount > 0 && (
                <div className="flex justify-between my-2 text-red-600">
                  <span>Discount</span>
                  <span>-CA${totalDiscount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between mb-4">
                <span>Shipping</span>
                <span className="text-right">
                  To be discussed
                  <br />
                  after order
                </span>
              </div>

              <div className="flex justify-between text-xl mb-6 border-t pt-4">
                <span>Total</span>
                <span className="font-bold">CA${total.toFixed(2)}</span>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={cart.items.length === 0 || isLoading}
                className="w-full"
              >
                {isLoading ? "Processing..." : "Place Order"}
              </Button>

              <div className="mt-6 pt-4 border-t">
                <h6>Order Items</h6>

                {cart.items.map((item) => (
                  <div
                    key={`${item.productId}-${item.variationId || "default"}`}
                    className="flex items-start gap-3 py-2"
                  >
                    {/* Product image */}
                    <div className="shrink-0 relative w-16 h-16 bg-gray-100 rounded overflow-hidden">
                      {item.image ? (
                        <Image
                          src={`/${item.image}`}
                          alt={item.productName}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No image
                        </div>
                      )}
                    </div>

                    {/* Product info */}
                    <div className="grow">
                      <p className="font-medium">{item.productName}</p>

                      {item.attributes &&
                        Object.keys(item.attributes).length > 0 && (
                          <p className="text-sm text-gray-500">
                            {Object.entries(item.attributes)
                              .map(
                                ([key, value]) =>
                                  `${getAttributeDisplayName(key)}: ${value}`
                              )
                              .join(", ")}
                          </p>
                        )}
                      <p className="text-sm text-gray-500">
                        Quantity: {item.quantity}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      {item.discount ? (
                        <>
                          <p className="text-sm font-medium line-through text-gray-500">
                            CA${(item.price * item.quantity).toFixed(2)}
                          </p>
                          <div className="flex items-center justify-end gap-2">
                            <p className="text-sm font-medium">
                              CA$
                              {(
                                item.price *
                                (1 - item.discount / 100) *
                                item.quantity
                              ).toFixed(2)}
                            </p>
                            <span className="text-xs text-red-600">
                              {item.discount}% OFF
                            </span>
                          </div>
                        </>
                      ) : (
                        <p className="text-sm font-medium">
                          CA${(item.price * item.quantity).toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
