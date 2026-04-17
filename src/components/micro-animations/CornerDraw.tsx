'use client';

import { motion } from 'framer-motion';

interface CornerDrawProps {
  color: string;
  size?: number;
  strokeWidth?: number;
  isHovered: boolean;
}

export function CornerDraw({ color, size = 24, strokeWidth = 2, isHovered }: CornerDrawProps) {
  const drawVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: { 
      pathLength: 1, 
      opacity: 1,
      transition: { 
        pathLength: { duration: 0.4, ease: [0.23, 1, 0.32, 1] as const },
        opacity: { duration: 0.1 }
      }
    }
  };

  return (
    <>
      {/* Top Left */}
      <motion.svg
        className="absolute top-3 left-3"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        initial="hidden"
        animate={isHovered ? "visible" : "hidden"}
      >
        <motion.path
          d={`M 0 ${size} L 0 0 L ${size} 0`}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          variants={drawVariants}
        />
      </motion.svg>

      {/* Top Right */}
      <motion.svg
        className="absolute top-3 right-3"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        initial="hidden"
        animate={isHovered ? "visible" : "hidden"}
      >
        <motion.path
          d={`M 0 0 L ${size} 0 L ${size} ${size}`}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          variants={drawVariants}
        />
      </motion.svg>

      {/* Bottom Left */}
      <motion.svg
        className="absolute bottom-3 left-3"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        initial="hidden"
        animate={isHovered ? "visible" : "hidden"}
      >
        <motion.path
          d={`M 0 0 L 0 ${size} L ${size} ${size}`}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          variants={drawVariants}
        />
      </motion.svg>

      {/* Bottom Right */}
      <motion.svg
        className="absolute bottom-3 right-3"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        initial="hidden"
        animate={isHovered ? "visible" : "hidden"}
      >
        <motion.path
          d={`M ${size} 0 L ${size} ${size} L 0 ${size}`}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          variants={drawVariants}
        />
      </motion.svg>
    </>
  );
}
