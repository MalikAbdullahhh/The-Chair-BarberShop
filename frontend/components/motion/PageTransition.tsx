"use client";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

const label = (p: string) =>
  p === "/"
    ? "THE CHAIR"
    : (p.split("/").filter(Boolean).pop() || "THE CHAIR")
        .split("-")
        .join(" ")
        .toUpperCase();

export function PageTransition({ children }: { children: React.ReactNode }) {
  const p = usePathname();
  return (
    <div key={p} className="relative w-full">
      <motion.div
        className="route-wipe"
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0 }}
        transition={{ duration: 0.72, ease: [0.76, 0, 0.24, 1] }}
      >
        <motion.span
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: [0, 1, 0], y: [18, 0, -14] }}
          transition={{ duration: 0.62, ease: [0.16, 1, 0.3, 1] }}
        >
          {label(p)}
        </motion.span>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.58, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </div>
  );
}

