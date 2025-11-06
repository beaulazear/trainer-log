import { motion } from 'motion/react';
import { Trophy, Share2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface MilestoneCelebrationProps {
  hours: number;
  onClose: () => void;
}

export function MilestoneCelebration({ hours, onClose }: MilestoneCelebrationProps) {
  const [confetti, setConfetti] = useState<Array<{ id: number; left: number; delay: number }>>([]);

  useEffect(() => {
    // Generate confetti pieces
    const pieces = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
    }));
    setConfetti(pieces);
  }, []);

  const getMessage = () => {
    switch (hours) {
      case 50:
        return "You're off to a great start! 🌟";
      case 100:
        return "One-third complete! You're on fire! 🔥";
      case 150:
        return "Halfway there! The finish line is in sight! 🎯";
      case 200:
        return "Two-thirds done! You're crushing it! 💪";
      case 250:
        return "So close! The final stretch! 🚀";
      case 300:
        return "CERTIFICATION COMPLETE! You did it! 🎓";
      default:
        return "Amazing progress! Keep going! ✨";
    }
  };

  const handleShare = () => {
    // Share functionality would go here
    alert('Share functionality coming soon!');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      {/* Confetti */}
      {confetti.map((piece) => (
        <motion.div
          key={piece.id}
          initial={{ y: -20, opacity: 1, rotate: 0 }}
          animate={{
            y: typeof window !== 'undefined' ? window.innerHeight + 20 : 800,
            opacity: 0,
            rotate: 360,
          }}
          transition={{
            duration: 3,
            delay: piece.delay,
            ease: 'linear',
          }}
          className="absolute w-3 h-3 rounded-sm"
          style={{
            left: `${piece.left}%`,
            backgroundColor: ['#EC4899', '#A855F7', '#3B82F6', '#06B6D4', '#8B5CF6'][
              Math.floor(Math.random() * 5)
            ],
          }}
        />
      ))}

      {/* Celebration Card */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', delay: 0.2 }}
        className="relative bg-white rounded-3xl p-8 mx-6 max-w-sm w-full text-center shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
          className="mb-6"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-4">
            <Trophy className="w-12 h-12 text-white" />
          </div>
        </motion.div>

        <h2 className="text-gray-900 mb-3">
          YOU HIT {hours} HOURS!
        </h2>

        <p className="text-gray-600 mb-8">
          {getMessage()}
        </p>

        {/* Achievement Badge */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 mb-6">
          <div className="text-5xl mb-2">🏆</div>
          <div className="text-gray-700">Achievement Unlocked</div>
          <div className="text-sm text-gray-500 mt-1">
            {hours === 300 ? 'Master Trainer' : `${hours} Hour Milestone`}
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleShare}
            className="w-full py-3 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
          >
            <Share2 className="w-5 h-5" />
            <span>Share Your Progress</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all"
          >
            Continue
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
