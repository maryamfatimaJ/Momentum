import React from 'react';
import { motion } from 'motion/react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', showText = true }) => {
  const dimensions = size === 'sm' ? 'w-6 h-6' : size === 'lg' ? 'w-10 h-10' : 'w-8 h-8';
  const textSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl';

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`} id="momentum-logo">
      <div className={`relative ${dimensions} flex items-center justify-center`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm"
        >
          {/* Continuous curved momentum wave path */}
          <motion.path
            d="M 12 70 C 25 70, 32 30, 50 30 C 68 30, 75 70, 88 25"
            stroke="url(#momentumGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.4, ease: "easeInOut" }}
          />
          {/* Accent forward momentum dot */}
          <motion.circle
            cx="88"
            cy="25"
            r="5"
            fill="#63C7D8"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1.2, duration: 0.3, type: "spring" }}
          />
          <defs>
            <linearGradient id="momentumGradient" x1="12" y1="70" x2="88" y2="25" gradientUnits="userSpaceOnUse">
              <stop stopColor="#3FB7CB" />
              <stop offset="0.5" stopColor="#63C7D8" />
              <stop offset="1" stopColor="#C7B8FF" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {showText && (
        <span className={`font-semibold tracking-tight ${textSize} text-[#1E293B] dark:text-slate-100`}>
          MOMENTUM
        </span>
      )}
    </div>
  );
};
