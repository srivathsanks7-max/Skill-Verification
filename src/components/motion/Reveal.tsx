'use client';

import React from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';

type Direction = 'up' | 'down' | 'left' | 'right' | 'scale' | 'none';

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  direction?: Direction;
  delay?: number;
  duration?: number;
  distance?: number;
  once?: boolean;
  amount?: number;
  as?: 'div' | 'section' | 'span' | 'header' | 'li';
}

const offsets: Record<Direction, { x?: number; y?: number; scale?: number }> = {
  up: { y: 28 },
  down: { y: -28 },
  left: { x: 28 },
  right: { x: -28 },
  scale: { scale: 0.92 },
  none: {},
};

/**
 * Fades + slides an element in once it scrolls into view.
 * Wrap any section/card with this instead of the old `.reveal-up` CSS class
 * to get scroll-triggered (not just mount-triggered) motion.
 */
export default function Reveal({
  children,
  className = '',
  direction = 'up',
  delay = 0,
  duration = 0.7,
  distance,
  once = true,
  amount = 0.2,
  as = 'div',
}: RevealProps) {
  const prefersReduced = useReducedMotion();
  const offset = offsets[direction];
  const initial = prefersReduced
    ? { opacity: 0 }
    : {
        opacity: 0,
        x: offset.x !== undefined ? (distance ?? offset.x) : 0,
        y: offset.y !== undefined ? (distance ?? offset.y) : 0,
        scale: offset.scale ?? 1,
      };

  const variants: Variants = {
    hidden: initial,
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      transition: {
        duration: prefersReduced ? 0.2 : duration,
        delay,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  const MotionTag = motion[as as 'div'];

  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={variants}
    >
      {children}
    </MotionTag>
  );
}
