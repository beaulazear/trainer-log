import { motion } from 'motion/react';

interface CircularProgressProps {
  hours: number;
  total: number;
}

export function CircularProgress({ hours, total }: CircularProgressProps) {
  const percentage = Math.min((hours / total) * 100, 100);
  const circumference = 2 * Math.PI * 120; // radius = 120
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Enhanced color system with multiple gradients
  const getColorScheme = () => {
    if (percentage >= 100) {
      return {
        gradient: ['#FFD700', '#FFA500', '#FF69B4'],
        glow: 'rgba(255, 215, 0, 0.6)',
        shadow: 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.8))'
      };
    }
    if (percentage >= 83) {
      return {
        gradient: ['#9333EA', '#C026D3', '#EC4899'],
        glow: 'rgba(147, 51, 234, 0.5)',
        shadow: 'drop-shadow(0 0 16px rgba(147, 51, 234, 0.7))'
      };
    }
    if (percentage >= 50) {
      return {
        gradient: ['#3B82F6', '#6366F1', '#8B5CF6'],
        glow: 'rgba(59, 130, 246, 0.5)',
        shadow: 'drop-shadow(0 0 16px rgba(99, 102, 241, 0.7))'
      };
    }
    if (percentage >= 17) {
      return {
        gradient: ['#06B6D4', '#3B82F6', '#6366F1'],
        glow: 'rgba(6, 182, 212, 0.5)',
        shadow: 'drop-shadow(0 0 12px rgba(6, 182, 212, 0.6))'
      };
    }
    return {
      gradient: ['#EC4899', '#F472B6', '#FB7185'],
      glow: 'rgba(236, 72, 153, 0.4)',
      shadow: 'drop-shadow(0 0 10px rgba(236, 72, 153, 0.5))'
    };
  };

  const colorScheme = getColorScheme();

  return (
    <div className="flex justify-center">
      <motion.div
        className="relative w-72 h-72"
        animate={{
          scale: percentage >= 100 ? [1, 1.05, 1] : 1
        }}
        transition={{
          duration: 2,
          repeat: percentage >= 100 ? Infinity : 0,
          ease: "easeInOut"
        }}
      >
        {/* Outer glow ring */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, ${colorScheme.glow} 0%, transparent 70%)`,
            filter: 'blur(20px)',
            opacity: 0.6,
          }}
        />

        <svg className="w-full h-full transform -rotate-90 relative z-10">
          <defs>
            {/* Animated gradient */}
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colorScheme.gradient[0]}>
                <animate
                  attributeName="stop-color"
                  values={`${colorScheme.gradient[0]};${colorScheme.gradient[1]};${colorScheme.gradient[0]}`}
                  dur="3s"
                  repeatCount="indefinite"
                />
              </stop>
              <stop offset="50%" stopColor={colorScheme.gradient[1]}>
                <animate
                  attributeName="stop-color"
                  values={`${colorScheme.gradient[1]};${colorScheme.gradient[2]};${colorScheme.gradient[1]}`}
                  dur="3s"
                  repeatCount="indefinite"
                />
              </stop>
              <stop offset="100%" stopColor={colorScheme.gradient[2]}>
                <animate
                  attributeName="stop-color"
                  values={`${colorScheme.gradient[2]};${colorScheme.gradient[0]};${colorScheme.gradient[2]}`}
                  dur="3s"
                  repeatCount="indefinite"
                />
              </stop>
            </linearGradient>

            {/* Shimmer effect */}
            <linearGradient id="shimmer" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255,255,255,0)" />
              <stop offset="50%" stopColor="rgba(255,255,255,0.3)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              <animateTransform
                attributeName="gradientTransform"
                type="translate"
                from="-1 0"
                to="1 0"
                dur="2s"
                repeatCount="indefinite"
              />
            </linearGradient>
          </defs>

          {/* Background circle with subtle animation */}
          <motion.circle
            cx="144"
            cy="144"
            r="120"
            stroke="#E5E7EB"
            strokeWidth="18"
            fill="none"
            initial={{ opacity: 0.5 }}
            animate={{ opacity: [0.5, 0.7, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />

          {/* Progress circle */}
          <motion.circle
            cx="144"
            cy="144"
            r="120"
            stroke="url(#progressGradient)"
            strokeWidth="18"
            fill="none"
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            style={{
              strokeDasharray: circumference,
              filter: colorScheme.shadow,
            }}
          />

          {/* Shimmer overlay */}
          {percentage > 0 && (
            <motion.circle
              cx="144"
              cy="144"
              r="120"
              stroke="url(#shimmer)"
              strokeWidth="18"
              fill="none"
              strokeLinecap="round"
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: circumference - (percentage / 100) * circumference,
              }}
            />
          )}
        </svg>

        {/* Center text with enhanced animation */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5, type: "spring" }}
            className="text-center"
          >
            <motion.div
              className="text-6xl font-bold text-gray-900 mb-1"
              animate={percentage >= 100 ? {
                scale: [1, 1.1, 1],
              } : {}}
              transition={{
                duration: 1.5,
                repeat: percentage >= 100 ? Infinity : 0,
                ease: "easeInOut"
              }}
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {hours.toFixed(1)}
            </motion.div>
            <div className="text-gray-500 text-lg font-medium">/ {total} hours</div>

            {/* Progress percentage indicator */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="mt-2 px-4 py-1 bg-gradient-to-r rounded-full text-sm font-semibold"
              style={{
                background: `linear-gradient(90deg, ${colorScheme.gradient[0]}, ${colorScheme.gradient[2]})`,
                color: 'white',
                boxShadow: `0 2px 10px ${colorScheme.glow}`,
              }}
            >
              {Math.round(percentage)}%
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
