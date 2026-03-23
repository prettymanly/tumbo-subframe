"use client";
import { FC, ReactNode, useRef, useState, useEffect, useCallback } from "react";
import { motion, MotionValue, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface TextRevealByWordProps {
  text: string;
  className?: string;
}

const TextRevealByWord: FC<TextRevealByWordProps> = ({
  text,
  className,
}) => {
  const targetRef = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: targetRef,
  });
  const words = text.split(" ");

  return (
    <div ref={targetRef} className={cn("relative z-0 h-[200vh]", className)}>
      <div
        className={
          "sticky top-0 mx-auto flex h-[50%] max-w-4xl items-center bg-transparent px-[1rem] py-[5rem]"
        }
      >
        <p
          ref={targetRef}
          className={
            "flex flex-wrap p-5 text-2xl font-bold text-black/20 dark:text-white/20 md:p-8 md:text-3xl lg:p-10 lg:text-4xl xl:text-5xl"
          }
        >
          {words.map((word, i) => {
            const start = i / words.length;
            const end = start + 1 / words.length;
            return (
              <Word key={i} progress={scrollYProgress} range={[start, end]}>
                {word}
              </Word>
            );
          })}
        </p>
      </div>
    </div>
  );
};

/**
 * TextRevealInline — word-by-word opacity reveal driven by scroll position,
 * designed to sit inside a card/container without creating extra height.
 * Uses manual scroll tracking for reliability across all layout contexts.
 */
interface TextRevealInlineProps {
  text: string;
  className?: string;
}

const TextRevealInline: FC<TextRevealInlineProps> = ({ text, className }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = useState(0);

  const updateProgress = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight;
    // Start revealing when top of element hits 50% of viewport
    // Fully revealed when top of element hits 25% of viewport
    const startY = vh * 0.5;
    const endY = vh * 0.25;
    const raw = (startY - rect.top) / (startY - endY);
    setProgress(Math.max(0, Math.min(1, raw)));
  }, []);

  useEffect(() => {
    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    return () => window.removeEventListener("scroll", updateProgress);
  }, [updateProgress]);

  const words = text.split(" ");

  return (
    <div ref={ref} className={className}>
      <p className="flex flex-wrap m-0" style={{ gap: "0 6px" }}>
        {words.map((word, i) => {
          const wordStart = i / words.length;
          const wordEnd = wordStart + 1 / words.length;
          // Map overall progress to per-word opacity
          const wordProgress = Math.max(0, Math.min(1, (progress - wordStart) / (wordEnd - wordStart)));
          const opacity = 0.2 + 0.8 * wordProgress;
          return (
            <span key={i} style={{ opacity, transition: "opacity 0.05s ease" }}>
              {word}
            </span>
          );
        })}
      </p>
    </div>
  );
};

interface WordProps {
  children: ReactNode;
  progress: MotionValue<number>;
  range: [number, number];
}

const Word: FC<WordProps> = ({ children, progress, range }) => {
  const opacity = useTransform(progress, range, [0, 1]);
  return (
    <span className="xl:lg-3 relative mx-1 lg:mx-2.5">
      <span className={"absolute opacity-30"}>{children}</span>
      <motion.span
        style={{ opacity: opacity }}
        className={"text-black dark:text-white"}
      >
        {children}
      </motion.span>
    </span>
  );
};

export { TextRevealByWord, TextRevealInline };
