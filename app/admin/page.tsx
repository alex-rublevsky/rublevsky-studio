"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getAdminProducts } from "@/lib/actions/product.actions";

interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalBrands: number;
  totalOrders: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalCategories: 0,
    totalBrands: 0,
    totalOrders: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        // Use server action instead of fetch
        const data = await getAdminProducts();
        setStats({
          ...stats,
          totalProducts: data.products.length,
        });
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const adminSections = [
    {
      title: "Products",
      description: "Manage your store products",
      count: stats.totalProducts,
      icon: "📦",
      link: "/admin/products",
    },
    {
      title: "Categories",
      description: "Organize products into categories",
      count: stats.totalCategories,
      icon: "🗂️",
      link: "/admin/categories",
    },
    {
      title: "Brands",
      description: "Manage product brands",
      count: stats.totalBrands,
      icon: "🏷️",
      link: "/admin/brands",
    },
    {
      title: "Orders",
      description: "View and manage customer orders",
      count: stats.totalOrders,
      icon: "🛒",
      link: "/admin/orders",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-500">Loading dashboard data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {adminSections.map((section) => (
            <Link
              key={section.title}
              href={section.link}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl">{section.icon}</div>
                <div className="text-2xl font-bold text-blue-600">
                  {section.count}
                </div>
              </div>
              <h2 className="text-xl font-semibold mb-2">{section.title}</h2>
              <p className="text-gray-600">{section.description}</p>
            </Link>
          ))}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/products?action=new"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-center"
          >
            Add New Product
          </Link>
          <Link
            href="/admin/categories?action=new"
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-center"
          >
            Add New Category
          </Link>
          <Link
            href="/admin/brands?action=new"
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 text-center"
          >
            Add New Brand
          </Link>
          <Link
            href="/admin/orders"
            className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 text-center"
          >
            View Orders
          </Link>
        </div>
      </div>
    </div>
  );
}
