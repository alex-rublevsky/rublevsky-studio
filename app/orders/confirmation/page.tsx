"use client";

import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OrderConfirmationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  // Redirect to homepage if no order ID is provided
  useEffect(() => {
    if (!orderId) {
      router.push("/");
    }
  }, [orderId, router]);

  if (!orderId) {
    return null;
  }

  return (
    <main className="max-w-3xl mx-auto my-16 px-4">
      <div className="flex flex-col items-center text-center">
        <CheckCircle2 className="w-16 h-16 text-green-500 mb-6" />

        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          Thank You for Your Order!
        </h1>
        <p className="text-gray-600 mb-8">
          Your order #{orderId} has been placed successfully.
        </p>

        <div className="w-full max-w-md p-6 border border-gray-200 rounded-lg mb-8">
          <h2 className="text-lg font-medium mb-4">Order Summary</h2>
          <p className="text-gray-600 mb-2">
            We've sent a confirmation email with all the details of your order.
          </p>
          <p className="text-gray-600">
            You can check the status of your order anytime in your account.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild>
            <Link href="/store">Continue Shopping</Link>
          </Button>

          {/* Add this button once you implement the order details page */}
          {/* <Button variant="outline" asChild>
            <Link href={`/orders/${orderId}`}>
              View Order Details
            </Link>
          </Button> */}
        </div>
      </div>
    </main>
  );
}
