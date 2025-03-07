"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/context/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { createOrder } from "@/lib/actions/cart/createOrder";
import Image from "next/image";

interface CustomerInfo {
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

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isCartLoaded, setIsCartLoaded] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    streetAddress: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      (field) => !customerInfo[field as keyof CustomerInfo]
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
      // Pass customer info to createOrder
      const result = await createOrder(cart.items, customerInfo);

      if (result.success) {
        toast.success("Order placed successfully!");
        clearCart();

        // Redirect to order confirmation page
        router.push(`/orders/confirmation?orderId=${result.orderId}`);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to place order. Please try again.");
      console.error("Checkout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate cart total
  const subtotal = cart.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const total = subtotal;

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
                <h2 className="text-xl font-bold mb-4">Delivery details</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label htmlFor="firstName" className="block mb-2">
                      First Name
                    </label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={customerInfo.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block mb-2">
                      Last Name
                    </label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={customerInfo.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label htmlFor="email" className="block mb-2">
                      Email
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={customerInfo.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block mb-2">
                      Phone
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={customerInfo.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label htmlFor="streetAddress" className="block mb-2">
                    Address
                  </label>
                  <Input
                    id="streetAddress"
                    name="streetAddress"
                    value={customerInfo.streetAddress}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label htmlFor="state" className="block mb-2">
                      State
                    </label>
                    <Input
                      id="state"
                      name="state"
                      value={customerInfo.state}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="city" className="block mb-2">
                      City
                    </label>
                    <Input
                      id="city"
                      name="city"
                      value={customerInfo.city}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="country" className="block mb-2">
                      Country
                    </label>
                    <Input
                      id="country"
                      name="country"
                      value={customerInfo.country}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="zipCode" className="block mb-2">
                      ZIP code
                    </label>
                    <Input
                      id="zipCode"
                      name="zipCode"
                      value={customerInfo.zipCode}
                      onChange={handleInputChange}
                      required
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
                    <div className="flex-shrink-0 relative w-16 h-16 bg-gray-100 rounded overflow-hidden">
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
                    <div className="flex-grow">
                      <p className="font-medium">{item.productName}</p>

                      {item.attributes &&
                        Object.keys(item.attributes).length > 0 && (
                          <p className="text-sm text-gray-500">
                            {Object.entries(item.attributes)
                              .map(([key, value]) => `${key}: ${value}`)
                              .join(", ")}
                          </p>
                        )}
                      <p className="text-sm text-gray-500">
                        Quantity: {item.quantity}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p className="font-medium">
                        CA${(item.price * item.quantity).toFixed(2)}
                      </p>
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
