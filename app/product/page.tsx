"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ProductRedirectPage() {
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
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-lg">Redirecting...</p>
      </div>
    </main>
  );
}
