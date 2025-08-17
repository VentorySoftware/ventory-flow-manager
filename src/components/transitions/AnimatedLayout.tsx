import { motion, AnimatePresence } from 'framer-motion'
import { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'

interface AnimatedLayoutProps {
  children: ReactNode
}

const pageVariants = {
  initial: {
    opacity: 0,
    scale: 0.96,
    filter: "blur(4px)"
  },
  in: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)"
  },
  out: {
    opacity: 0,
    scale: 1.04,
    filter: "blur(4px)"
  }
}

const pageTransition = {
  type: "tween" as const,
  ease: [0.4, 0, 0.2, 1] as const,
  duration: 0.4
}

const staggerVariants = {
  initial: { opacity: 0 },
  in: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  },
  out: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1
    }
  }
}

const childVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.95
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 200,
      damping: 25
    }
  },
  out: {
    opacity: 0,
    y: -10,
    scale: 1.05,
    transition: {
      duration: 0.2
    }
  }
}

const AnimatedLayout = ({ children }: AnimatedLayoutProps) => {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        className="min-h-screen"
      >
        <motion.div
          variants={staggerVariants}
          initial="initial"
          animate="in"
          exit="out"
          className="h-full"
        >
          {/* Wrap children to enable stagger animation */}
          <motion.div variants={childVariants}>
            {children}
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default AnimatedLayout