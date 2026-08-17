"use client";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";

function Word({ word, index, total, progress }: { word: string; index: number; total: number; progress: any }) {
  const start = (index / total) * 0.72;
  const end = start + 0.26;
  const opacity = useTransform(progress, [start, end], [0.18, 1]);
  const y = useTransform(progress, [start, end], [8, 0]);
  return (
    <motion.span style={{ opacity, y }} className="scroll-word-span">
      {word}{" "}
    </motion.span>
  );
}

export function ScrollWords({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.35"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 65,
    damping: 22,
    mass: 0.15,
    restDelta: 0.001
  });

  const words = text.split(" ");
  return (
    <p ref={ref} className="scroll-words">
      {words.map((w, i) => (
        <Word
          key={`${w}-${i}`}
          word={w}
          index={i}
          total={words.length}
          progress={smoothProgress}
        />
      ))}
    </p>
  );
}

