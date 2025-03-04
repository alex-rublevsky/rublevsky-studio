"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Add dark class to body for admin pages
  useEffect(() => {
    document.body.classList.add("dark");

    // Cleanup function to remove the class when navigating away
    return () => {
      document.body.classList.remove("dark");
    };
  }, []);

  const adminLinks = [
    { name: "Dashboard", path: "/admin" },
    { name: "Products", path: "/admin/products" },
    { name: "Categories", path: "/admin/categories" },
    { name: "Brands", path: "/admin/brands" },
    { name: "Blog", path: "/admin/blog" },
    { name: "Orders", path: "/admin/orders" },
    { name: "Customers", path: "/admin/customers" },
  ];

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <nav className="bg-card border-b border-border shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {adminLinks.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      pathname === item.path
                        ? "border-primary text-foreground"
                        : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center">
              <Link
                href="/"
                className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium"
              >
                Back to Site
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-8 pb-24 px-4 sm:px-8">
        <div className="w-full">{children}</div>
      </main>
    </div>
  );
}
