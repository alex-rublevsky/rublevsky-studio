import { createFileRoute } from "@tanstack/react-router";
import { Link } from "~/components/ui/shared/Link";
import React, { useState, useEffect } from "react";
import { useCart, CartProvider } from "~/lib/cartContext";
import { Button } from "~/components/ui/shared/Button";
import { toast } from "sonner";
import { createOrder } from "~/server_functions/order/createOrder";
import { Image } from "~/components/ui/shared/Image";
import { getAttributeDisplayName } from "~/lib/productAttributes";
import { AddressFields } from "~/components/ui/shared/AddressFields";
import NeumorphismCard from "~/components/ui/shared/NeumorphismCard";
import { Checkbox } from "~/components/ui/shared/Checkbox";
import { Textarea } from "~/components/ui/shared/TextArea";

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

export const Route = createFileRoute("/store/checkout")({
  component: CheckoutPage,
});

function CheckoutPage() {
  return (
    <CartProvider>
      <CheckoutScreen />
    </CartProvider>
  );
}

function CheckoutScreen() {
  const { cart, clearCart, products } = useCart();
  const formRef = React.useRef<HTMLFormElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [useSeparateBilling, setUseSeparateBilling] = useState(false);
  const [showFormError, setShowFormError] = useState(false);
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

  // Wait for cart and products to be loaded
  useEffect(() => {
    if (cart.items.length > 0 && products.length > 0) {
    }
  }, [cart.items.length, products.length]);

  // Check if required fields are filled
  const isFormValid = () => {
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

    return requiredFields.every((field) =>
      customerInfo.shippingAddress[field as keyof Address]?.trim()
    );
  };

  // Reset form error state when fields are filled
  useEffect(() => {
    if (showFormError && isFormValid()) {
      setShowFormError(false);
    }
  }, [customerInfo.shippingAddress, showFormError]);

  // Handle button click with proper validation feedback
  const handleButtonClick = () => {
    if (!isFormValid()) {
      setShowFormError(true);
      // Reset error state after 3 seconds
      setTimeout(() => setShowFormError(false), 3000);

      // Use the existing form submit logic for validation and field focus
      const formElement = formRef.current;
      if (formElement) {
        formElement.requestSubmit();
      }
    } else if (cart.items.length === 0) {
      toast.error("Your cart is empty");
    } else {
      // If all validation passes, submit the form
      const formElement = formRef.current;
      if (formElement) {
        formElement.requestSubmit();
      }
    }
  };

  // Get dynamic button text based on validation state
  const getButtonText = () => {
    if (isLoading) return "Processing...";
    if (showFormError) return "Please fill up the form";
    if (cart.items.length === 0) return "Cart is empty";
    return "Place Order";
  };

  // Get dynamic button variant based on state
  const getButtonVariant = () => {
    if (showFormError || cart.items.length === 0) return "destructive";
    return "default";
  };

  // Only redirect if cart is empty AND cart has been loaded AND order is not complete
  //   useEffect(() => {
  //     if (isCartLoaded && cart.items.length === 0 && !isOrderComplete) {
  //       router.push("/store");
  //     }
  //   }, [cart.items.length, router, isCartLoaded, isOrderComplete]);

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

    // Combined field definitions with display names
    const requiredFields = {
      firstName: "First Name",
      lastName: "Last Name",
      email: "Email",
      phone: "Phone Number",
      streetAddress: "Street Address",
      city: "City",
      country: "Country",
      zipCode: "ZIP/Postal Code",
    } as const;

    const missingFields = Object.entries(requiredFields).filter(
      ([field]) => !customerInfo.shippingAddress[field as keyof Address]
    );

    if (missingFields.length > 0) {
      // Trigger button error state
      setShowFormError(true);

      // Get the friendly names directly from the missingFields entries
      const missingFieldNames = missingFields.map(
        ([, displayName]) => displayName
      );

      toast.error(
        `Please fill in all required fields: ${missingFieldNames.join(", ")}`
      );

      // Focus the first missing field using the form ref
      if (formRef.current) {
        const firstMissingFieldId = missingFields[0][0];
        const firstMissingField = formRef.current.querySelector(
          `input[name="${firstMissingFieldId}"]`
        ) as HTMLInputElement;

        if (firstMissingField) {
          firstMissingField.focus();
          firstMissingField.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }

      // Reset error state after 3 seconds
      setTimeout(() => setShowFormError(false), 3000);
      return;
    }

    // If form is valid but cart is empty
    if (cart.items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsLoading(true);

    try {
      // Pass products from context to createOrder
      const result = await createOrder(customerInfo, cart.items, products);

      if (!result.success) {
        throw new Error(result.message);
      }

      // If order was created successfully, send the email
      const emailResponse = await fetch("/api/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: customerInfo.shippingAddress.firstName,
          lastName: customerInfo.shippingAddress.lastName,
          email: customerInfo.shippingAddress.email,
          orderItems: cart.items.map((item) => ({
            productName: item.productName,
            quantity: item.quantity,
            price: item.price,
            discount: item.discount,
            image: item.image
              ? `https://assets.rublevsky.studio/${item.image}`
              : undefined,
          })),
          orderId: result.orderId,
          subtotal,
          totalDiscount,
          orderTotal: total,
          shippingAddress: customerInfo.shippingAddress,
          billingAddress: customerInfo.billingAddress,
          shippingMethod: customerInfo.shippingMethod,
          notes: customerInfo.notes,
        }),
      });

      const emailResult = await emailResponse.json();

      //   if (!emailResult.success) {
      //     console.error("Failed to send confirmation email:", emailResult.error);
      //     // Show warning but don't prevent order completion
      //     toast.warning(
      //       "Order placed but confirmation email could not be sent. Our team will contact you shortly.",
      //       {
      //         duration: 5000,
      //       }
      //     );
      //   }

      // Show success toast
      toast.success("Order placed successfully!", {
        duration: 3000,
      });

      //   // Redirect to order page immediately
      //   router.replace(`/order/${result.orderId}?new=true`);

      // Clear the cart after redirect is initiated
      clearCart();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to place order. Please try again.",
        {
          duration: 5000,
        }
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
    <div className="w-full px-4 pt-10 pb-20">
      <div className="max-w-[2000px] mx-auto">
        <h2 className="mb-4">Checkout</h2>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Customer Information Form - Left Side */}
          <div className="flex-1">
            <form ref={formRef} onSubmit={handleSubmit}>
             
                <p className="mb-8">
                  You will be contacted regarding payment options after placing
                  your order.
                </p>
             
              <div className="mb-8">
                <h2 className="!text-lg font-bold mb-4">Shipping Address</h2>
                <AddressFields
                  values={customerInfo.shippingAddress}
                  onChange={handleAddressChange("shipping")}
                />
                <div className="mb-6">
                  <label className="flex items-center space-x-2">
                    <Checkbox
                      checked={useSeparateBilling}
                      onCheckedChange={(checked: boolean) => {
                        setUseSeparateBilling(checked);
                        if (checked && !customerInfo.billingAddress) {
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
                  <div className="">
                    <h3 className="mb-4">Billing Address</h3>
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
                <div className="mt-12">
                  <h3 className=" mb-4">Additional Information</h3>
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
                        variant={
                          customerInfo.shippingMethod === "standard"
                            ? "default"
                            : "outline"
                        }
                        className="flex-1"
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
                        variant={
                          customerInfo.shippingMethod === "pickup"
                            ? "default"
                            : "outline"
                        }
                        className="flex-1"
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
                    <Textarea
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
          <div className="lg:w-[27rem] lg:sticky lg:top-4 lg:self-start">
            <NeumorphismCard className="">
              <h5>Summary</h5>
              <div className="flex justify-between items-baseline my-2">
                <span>Subtotal</span>
                <span>CA${subtotal.toFixed(2)}</span>
              </div>
              {totalDiscount > 0 && (
                <div className="flex justify-between items-baseline my-2 text-red-600">
                  <span>Discount</span>
                  <span>-CA${totalDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-baseline mb-4">
                <p>Shipping</p>
                <p className="text-right text-muted-foreground">
                  To be discussed after order
                </p>
              </div>
              <div className="flex justify-between items-baseline text-xl mb-2 border-t pt-4">
                <span>Total</span>
                <h3 className="">CA${total.toFixed(2)}</h3>
              </div>
              <Button
                onClick={handleButtonClick}
                disabled={isLoading || cart.items.length === 0}
                variant={getButtonVariant()}
                className="w-full transition-all duration-300 ease-in-out disabled:cursor-not-allowed"
              >
                {getButtonText()}
              </Button>
              <div className="mt-6 pt-4 border-t">
                <h6>Order Items</h6>
                {cart.items.map((item) => (
                  <div
                    key={`${item.productId}-${item.variationId || "default"}`}
                    className="flex items-start gap-3 py-2"
                  >
                    {/* Product image */}
                    <div className="shrink-0 relative w-16 h-16 bg-muted rounded overflow-hidden">
                      {item.image ? (
                        <Image
                          src={`/${item.image}`}
                          alt={item.productName}
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          No image
                        </div>
                      )}
                    </div>
                    {/* Product info */}
                    <div className="grow">
                      <Link
                        href={`/store/${item.productId}`}
                        className="blurLink"
                        id={`product-${item.productId}`}
                      >
                        {item.productName}
                      </Link>
                      {item.attributes &&
                        Object.keys(item.attributes).length > 0 && (
                          <p className="text-sm text-muted-foreground">
                            {Object.entries(item.attributes)
                              .map(
                                ([key, value]) =>
                                  `${getAttributeDisplayName(key)}: ${value}`
                              )
                              .join(", ")}
                          </p>
                        )}
                      <p className="text-sm text-muted-foreground">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    {/* Price */}
                    <div className="text-right">
                      {item.discount ? (
                        <>
                          <p className="text-sm font-medium line-through text-muted-foreground">
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
            </NeumorphismCard>
          </div>
        </div>
      </div>
    </div>
  );
}
