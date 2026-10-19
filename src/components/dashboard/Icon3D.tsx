'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';

export type Icon3DName =
  | 'bag'
  | 'calendar'
  | 'fire'
  | 'gym'
  | 'macros'
  | 'meals'
  | 'rocket'
  | 'setting'
  | 'sun'
  | 'target'
  | 'trash';

/** A 3dicons.co icon (CC0) that floats gently and tilts on hover. */
export function Icon3D({
  name,
  size,
  delay = 0,
  className = '',
}: {
  name: Icon3DName;
  size: number;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.span
      aria-hidden="true"
      className={`inline-block shrink-0 ${className}`}
      animate={reduce ? undefined : { y: [0, -5, 0] }}
      transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay }}
      whileHover={reduce ? undefined : { rotate: 8, scale: 1.1 }}
    >
      <Image src={`/icons3d/${name}.webp`} alt="" width={size} height={size} sizes={`${size}px`} />
    </motion.span>
  );
}
