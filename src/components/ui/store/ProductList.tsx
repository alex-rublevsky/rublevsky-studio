import { Product } from "~/types";
import { motion, AnimatePresence } from "motion/react";
import ProductCard from "./ProductCard";

interface ProductListProps {
  data: Product[];
}

export default function ProductList({ data }: ProductListProps) {
  return (
    <AnimatePresence mode="popLayout">
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-6 gap-x-3 sm:gap-4 mb-20"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.07,
              delayChildren: 0.3,
            },
          },
        }}
        initial="hidden"
        animate="visible"
      >
        {data.length === 0 ? (
          <motion.p
            variants={{
              hidden: { opacity: 0, filter: "blur(12px)", y: 12 },
              visible: {
                opacity: 1,
                filter: "blur(0px)",
                y: 0,
                transition: {
                  type: "spring",
                  bounce: 0.3,
                  duration: 1,
                },
              },
            }}
            className="text-center text-lg col-span-full"
          >
            No products found.
          </motion.p>
        ) : (
          data.map((product) => (
            <motion.div
              key={product.id}
              layout
              variants={{
                hidden: { opacity: 0, filter: "blur(12px)", y: 12 },
                visible: {
                  opacity: 1,
                  filter: "blur(0px)",
                  y: 0,
                  transition: {
                    type: "spring",
                    bounce: 0.3,
                    duration: 1,
                  },
                },
              }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))
        )}
      </motion.div>
    </AnimatePresence>
  );
}
