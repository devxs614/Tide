'use client';

// The visual end of a focus block (v2.1 F-06): a soft glow in the primary
// color that rises and fades twice, 1.2 seconds a pulse, never faster than
// once a second and never a flash. At motion Off there's no movement, only
// a still highlight around the screen.
import { motion } from 'framer-motion';
import { duration } from '@/lib/motion/tokens';
import { useMotionLevel } from '@/lib/motion/useMotionLevel';

export function EndGlow() {
  const level = useMotionLevel();
  if (level === 'off') return <div aria-hidden className="pointer-events-none fixed inset-0 z-[var(--z-raised)] rounded-none border-4 border-primary" />;
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[var(--z-raised)] bg-primary"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0.35, 0, 0.35, 0] }}
      transition={{ duration: duration.scenic * 2, ease: 'easeInOut' }}
    />
  );
}
