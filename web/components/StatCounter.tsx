'use client';

import { useEffect, useRef } from 'react';
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';

export default function StatCounter({
  value,
  suffix = '',
  label,
  color = 'brand',
}: {
  value: number;
  suffix?: string;
  label: string;
  color?: 'brand' | 'accent';
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { duration: 1500, bounce: 0 });

  useEffect(() => {
    if (isInView) motionValue.set(value);
  }, [isInView, motionValue, value]);

  useEffect(() => {
    return spring.on('change', (latest) => {
      if (ref.current) ref.current.textContent = Math.floor(latest).toString();
    });
  }, [spring]);

  return (
    <motion.div whileHover={{ scale: 1.06 }} className="text-center">
      <div
        className={`text-4xl font-bold sm:text-5xl ${
          color === 'accent' ? 'text-accent-400' : 'text-white'
        }`}
      >
        <span ref={ref}>0</span>
        {suffix}
      </div>
      <p className="mt-2 text-sm text-white/50">{label}</p>
    </motion.div>
  );
}
