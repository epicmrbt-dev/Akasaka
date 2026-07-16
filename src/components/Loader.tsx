import { motion } from 'motion/react';

export default function Loader() {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="relative">
        {/* Sparkles rotating around the box */}
        <motion.div
          className="absolute -top-3 -left-3 w-4 h-4 bg-[#87CEEB] rounded-full"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5],
            x: [0, 20, 0, -20, 0],
            y: [0, -20, 0, 20, 0],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute -bottom-3 -right-3 w-4 h-4 bg-[#FFB6C1] rounded-full"
          animate={{
            scale: [1.2, 0.8, 1.2],
            opacity: [1, 0.4, 1],
            x: [0, -20, 0, 20, 0],
            y: [0, 20, 0, -20, 0],
          }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
        />

        {/* Bouncy cute stylized box */}
        <motion.div
          className="w-16 h-16 bg-gradient-to-tr from-[#87CEEB] to-[#FFB6C1] rounded-2xl flex items-center justify-center shadow-lg border-4 border-white dark:border-slate-800"
          animate={{
            y: [0, -12, 0],
            rotate: [0, 10, -10, 0],
            scale: [1, 1.05, 0.95, 1],
          }}
          transition={{
            duration: 1.6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {/* Box lock */}
          <div className="w-4 h-4 bg-yellow-300 rounded-sm border-2 border-white flex items-center justify-center shadow-inner">
            <div className="w-1 h-2 bg-amber-700 rounded-xs" />
          </div>
        </motion.div>
      </div>

      <motion.p
        className="mt-4 text-sm font-bold text-slate-500 dark:text-slate-400 tracking-wider"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        箱をあけています...
      </motion.p>
    </div>
  );
}
