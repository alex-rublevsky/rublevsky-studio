"use client";

// Add dynamic export
export const dynamic = "force-dynamic";

import React, { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/shared/button";
import { CheckCircle } from "lucide-react";

function OrderConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  // Redirect to store if no order ID is provided
  useEffect(() => {
    if (!orderId) {
      router.push("/store");
    }
  }, [orderId, router]);

  // Don't render anything if there's no order ID
  if (!orderId) {
    return null;
  }

  return (
    <div className="container max-w-4xl py-16">
      <div className="bg-white p-8 rounded-lg border text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>

        <h1 className="text-3xl font-bold mb-4">Thank You for Your Order!</h1>

        <p className="text-lg mb-6">
          Your order #{orderId} has been successfully placed.
        </p>

        <p className="mb-8 text-gray-600">
          We'll be in touch shortly to discuss shipping details and finalize
          your order. A confirmation email will be sent to the address you
          provided.
        </p>

        <div className="flex justify-center gap-4">
          <Button asChild variant="outline">
            <Link href="/store">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrderConfirmationContent />
    </Suspense>
  );
}
