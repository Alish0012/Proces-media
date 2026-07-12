'use client';

import { useRef, type MouseEvent } from 'react';
import { useMotionValue, useSpring } from 'framer-motion';

// Kart üzerinde imlecin konumuna göre hafif bir 3D eğim (tilt) üretir.
export function useTilt<T extends HTMLElement = HTMLDivElement>(max = 8) {
  const ref = useRef<T>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springRotateX = useSpring(rotateX, { stiffness: 250, damping: 20 });
  const springRotateY = useSpring(rotateY, { stiffness: 250, damping: 20 });

  function onMouseMove(e: MouseEvent<T>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    rotateX.set(py * -max);
    rotateY.set(px * max);
  }

  function onMouseLeave() {
    rotateX.set(0);
    rotateY.set(0);
  }

  return {
    ref,
    onMouseMove,
    onMouseLeave,
    style: { rotateX: springRotateX, rotateY: springRotateY, transformPerspective: 800 },
  };
}
