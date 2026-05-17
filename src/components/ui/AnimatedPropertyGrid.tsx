import { motion, AnimatePresence } from "framer-motion";
import type { ReactNode } from "react";

const containerVariants = {
  enter: {
    opacity: 0,
    x: 20,
  },
  center: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.28,
      ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
      when: "beforeChildren" as const,
      staggerChildren: 0.048,
      delayChildren: 0.04,
    },
  },
  exit: {
    opacity: 0,
    x: -18,
    transition: {
      duration: 0.18,
      ease: "easeIn" as const,
    },
  },
};

const itemVariants = {
  enter: { opacity: 0, y: 18, scale: 0.975 },
  center: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.38,
      ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
    },
  },
};

interface AnimatedPropertyGridProps<T extends { id: string }> {
  items: T[];
  pageKey: string | number;
  renderItem: (item: T, index: number) => ReactNode;
  gridClassName: string;
  className?: string;
}

function AnimatedPropertyGrid<T extends { id: string }>({
  items,
  pageKey,
  renderItem,
  gridClassName,
  className = "",
}: AnimatedPropertyGridProps<T>) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pageKey}
        className={`${gridClassName} ${className}`}
        variants={containerVariants}
        initial="enter"
        animate="center"
        exit="exit"
      >
        {items.map((item, i) => (
          <motion.div key={item.id} variants={itemVariants} className="h-full">
            {renderItem(item, i)}
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  );
}

export default AnimatedPropertyGrid;
