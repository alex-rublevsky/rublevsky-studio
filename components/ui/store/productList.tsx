"use client";

import { Product } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "./productCard";

interface ProductListProps {
  data: Product[];
}

export default function ProductList({ data }: ProductListProps) {
  return (
    <div>
      <AnimatePresence mode="popLayout">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {data.length === 0 ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center text-lg col-span-full"
            >
              No products found.
            </motion.p>
          ) : (
            data.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))
          )}
        </div>
      </AnimatePresence>
    </div>
  );
}
