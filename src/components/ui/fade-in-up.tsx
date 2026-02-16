"use client";

import React from "react";
import { motion, useInView } from "framer-motion";

interface FadeInUpProps {
  children: React.ReactNode;
  className?: string;
  /** Delay in seconds before animation starts */
  delay?: number;
  /** Duration of the animation in seconds */
  duration?: number;
  /** How far (px) the element starts below its final position */
  offset?: number;
  /** Trigger animation only once when entering viewport */
  once?: boolean;
  /** IntersectionObserver margin — how early to trigger */
  margin?: string;
  /** HTML tag to render as */
  as?: "div" | "section" | "span" | "article" | "li";
}

const motionByTag = {
  div: motion.div,
  section: motion.section,
  span: motion.span,
  article: motion.article,
  li: motion.li,
} as const;

export function FadeInUp({
  children,
  className,
  delay = 0,
  duration = 0.6,
  offset = 30,
  once = true,
  margin = "-80px",
  as = "div",
}: FadeInUpProps) {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once, margin });

  const Component = motionByTag[as] ?? motion.div;

  return (
    <Component
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: offset }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: offset }}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1], // cubic-bezier for smooth deceleration
      }}
    >
      {children}
    </Component>
  );
}

/**
 * Stagger wrapper — wraps children and applies increasing delays.
 * Use with FadeInUp children to create staggered entrance effects.
 */
interface StaggerProps {
  children: React.ReactNode;
  className?: string;
  /** Base delay before first child starts */
  baseDelay?: number;
  /** Delay increment between each child */
  stagger?: number;
}

export function Stagger({
  children,
  className,
  baseDelay = 0,
  stagger = 0.1,
}: StaggerProps) {
  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement<FadeInUpProps>(child) && child.type === FadeInUp) {
          return React.cloneElement(child, {
            delay: baseDelay + index * stagger,
          });
        }
        return child;
      })}
    </div>
  );
}
