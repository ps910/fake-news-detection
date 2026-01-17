import { motion, AnimatePresence } from 'framer-motion'
import { pageVariants, staggerContainer, staggerItem } from '../../utils/animations'

/**
 * Page wrapper with enter/exit animations
 */
export function PageTransition({ children, className = '' }) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * Fade in wrapper
 */
export function FadeIn({ children, delay = 0, duration = 0.5, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * Slide up animation wrapper
 */
export function SlideUp({ children, delay = 0, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        delay, 
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * Scale in animation wrapper
 */
export function ScaleIn({ children, delay = 0, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        delay, 
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * Stagger children wrapper
 */
export function StaggerContainer({ children, className = '', staggerDelay = 0.1 }) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={{
        initial: {},
        animate: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: 0.1,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * Stagger item wrapper
 */
export function StaggerItem({ children, className = '' }) {
  return (
    <motion.div
      variants={staggerItem}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * Hover scale wrapper
 */
export function HoverScale({ children, scale = 1.02, className = '' }) {
  return (
    <motion.div
      whileHover={{ scale }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * Animate on scroll (viewport entry)
 */
export function AnimateOnScroll({ 
  children, 
  className = '',
  animation = 'fadeUp',
  delay = 0,
  threshold = 0.1
}) {
  const animations = {
    fadeUp: {
      hidden: { opacity: 0, y: 30 },
      visible: { opacity: 1, y: 0 }
    },
    fadeIn: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 }
    },
    scaleIn: {
      hidden: { opacity: 0, scale: 0.9 },
      visible: { opacity: 1, scale: 1 }
    },
    slideLeft: {
      hidden: { opacity: 0, x: -30 },
      visible: { opacity: 1, x: 0 }
    },
    slideRight: {
      hidden: { opacity: 0, x: 30 },
      visible: { opacity: 1, x: 0 }
    }
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: threshold }}
      transition={{ 
        delay, 
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      variants={animations[animation]}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * Animated counter
 */
export function AnimatedCounter({ value, duration = 2, className = '' }) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={className}
    >
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {value}
      </motion.span>
    </motion.span>
  )
}

/**
 * Floating animation wrapper
 */
export function Float({ children, duration = 3, y = 10, className = '' }) {
  return (
    <motion.div
      animate={{ y: [0, -y, 0] }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * Pulse animation wrapper
 */
export function Pulse({ children, className = '' }) {
  return (
    <motion.div
      animate={{ scale: [1, 1.05, 1] }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * Shake animation wrapper (for errors)
 */
export function Shake({ children, trigger, className = '' }) {
  return (
    <motion.div
      animate={trigger ? { x: [0, -10, 10, -10, 10, 0] } : {}}
      transition={{ duration: 0.5 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * Success animation with checkmark
 */
export function SuccessCheck({ show, size = 60 }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          className="inline-flex items-center justify-center"
        >
          <svg width={size} height={size} viewBox="0 0 50 50">
            <motion.circle
              cx="25"
              cy="25"
              r="23"
              fill="none"
              stroke="#22c55e"
              strokeWidth="2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5 }}
            />
            <motion.path
              d="M14 27 L22 35 L36 18"
              fill="none"
              stroke="#22c55e"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            />
          </svg>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * Loading spinner with animation
 */
export function AnimatedSpinner({ size = 40, className = '' }) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: 'linear',
      }}
      className={className}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 50 50" className="w-full h-full">
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="80 200"
          className="opacity-25"
        />
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="40 200"
          className="opacity-75"
        />
      </svg>
    </motion.div>
  )
}

export { AnimatePresence }
