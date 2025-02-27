"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function ProductRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");

  useEffect(() => {
    if (slug) {
      // Redirect to the dynamic route
      router.replace(`/product/${slug}`);
    } else {
      // If no slug is provided, redirect to the store page
      router.replace("/store");
    }
  }, [slug, router]);

  // Show a loading state while redirecting
  return (
    <div className="text-center">
      <p className="text-lg">Redirecting...</p>
    </div>
  );
}

export default function ProductRedirectPage() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <Suspense
        fallback={
          <div className="text-center">
            <p className="text-lg">Loading...</p>
          </div>
        }
      >
        <ProductRedirect />
      </Suspense>
    </main>
  );
}
