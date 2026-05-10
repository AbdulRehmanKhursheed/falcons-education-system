'use client';

import { motion, type Variants } from 'framer-motion';
import { type ReactNode } from 'react';

const RISE_EASE = [0.22, 1, 0.36, 1] as const;

const riseVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: RISE_EASE } },
};

type FadeInProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
  once?: boolean;
};

export function FadeIn({ children, delay = 0, className, once = true }: FadeInProps) {
  return (
    <motion.div
      className={className}
      variants={riseVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: 0.2 }}
      transition={{ delay, duration: 0.7, ease: RISE_EASE }}
    >
      {children}
    </motion.div>
  );
}

type StaggerProps = {
  children: ReactNode;
  className?: string;
  gap?: number;
  once?: boolean;
};

export function Stagger({ children, className, gap = 0.08, once = true }: StaggerProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: 0.15 }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: gap } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={riseVariants}>
      {children}
    </motion.div>
  );
}
