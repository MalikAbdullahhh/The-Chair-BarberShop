"use client";
import { motion, useReducedMotion } from "framer-motion";

/*
 * The mask (which is visible) observes the viewport and drives the child via variants.
 * Observing the clipped child itself never fires: a span translated fully outside an
 * overflow:hidden mask never intersects, so the text stayed hidden (notably on mobile).
 */

export function RevealText({ children, className = "", delay = 0 }: { children: string; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <span className={`reveal-text ${className}`} aria-label={children}>
      {children.split(" ").map((word, i) => (
        <motion.span
          className="reveal-word-mask"
          key={`${word}-${i}`}
          aria-hidden
          initial={reduce ? false : "hidden"}
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.span
            variants={{ hidden: { y: "115%", rotate: 2 }, show: { y: 0, rotate: 0 } }}
            transition={{ duration: 0.72, delay: delay + i * 0.045, ease: [0.2, 0.8, 0.2, 1] }}
          >
            {word}&nbsp;
          </motion.span>
        </motion.span>
      ))}
    </span>
  );
}

export function RevealLines({ lines }: { lines: string[] }) {
  const reduce = useReducedMotion();
  return (
    <>
      {lines.map((line, i) => (
        <motion.span
          className="display-line"
          key={line}
          initial={reduce ? false : "hidden"}
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
        >
          <motion.span
            variants={{ hidden: { y: "108%" }, show: { y: 0 } }}
            transition={{ duration: 0.8, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
          >
            {line}
          </motion.span>
        </motion.span>
      ))}
    </>
  );
}
