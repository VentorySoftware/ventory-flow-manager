import { motion } from 'framer-motion'
import { Package, LogOut } from 'lucide-react'
import { useEffect, useState } from 'react'

interface LogoutTransitionProps {
  onComplete: () => void
}

const LogoutTransition = ({ onComplete }: LogoutTransitionProps) => {
  const [stage, setStage] = useState(0)

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 100),   // Start animation
      setTimeout(() => setStage(2), 600),   // Logout message
      setTimeout(() => setStage(3), 1200),  // Complete logout
      setTimeout(() => onComplete(), 1800)  // Navigate to auth
    ]

    return () => timers.forEach(clearTimeout)
  }, [onComplete])

  return (
    <motion.div
      className="fixed inset-0 bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      
      {/* Main content */}
      <div className="relative flex flex-col items-center space-y-6 max-w-md mx-auto px-6">
        
        {/* Logo animation */}
        <motion.div
          className="relative"
          initial={{ scale: 1, rotate: 0 }}
          animate={{ 
            scale: stage >= 1 ? [1, 0.9, 1] : 1,
            rotate: stage >= 3 ? 180 : 0
          }}
          transition={{
            scale: { duration: 0.8, ease: "easeInOut" },
            rotate: { duration: 0.6, ease: "easeInOut" }
          }}
        >
          {/* Fading rings */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 1 }}
            animate={{ opacity: stage >= 2 ? 0 : 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-24 h-24 rounded-full border-2 border-muted animate-pulse" />
            <div className="absolute w-32 h-32 rounded-full border border-muted/50 animate-ping" />
          </motion.div>
          
          {/* Main logo */}
          <motion.div
            className="relative w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-elegant"
            animate={{
              backgroundColor: stage >= 2 ? "rgb(148 163 184)" : undefined
            }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: stage >= 2 ? 0 : 1 }}
              transition={{ duration: 0.3 }}
            >
              <Package className="h-8 w-8 text-primary-foreground" />
            </motion.div>
            
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: stage >= 2 ? 1 : 0,
                scale: stage >= 2 ? 1 : 0
              }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <LogOut className="h-8 w-8 text-white" />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Logout message */}
        <motion.div
          className="text-center space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: stage >= 2 ? 1 : 0,
            y: stage >= 2 ? 0 : 20
          }}
          transition={{
            duration: 0.5,
            delay: 0.1
          }}
        >
          <motion.h2 
            className="text-2xl font-heading font-semibold text-muted-foreground"
            animate={{
              color: stage >= 3 ? "rgb(100 116 139)" : undefined
            }}
            transition={{ duration: 0.4 }}
          >
            Cerrando Sesión...
          </motion.h2>
          
          <motion.p 
            className="text-muted-foreground text-sm"
            initial={{ opacity: 1 }}
            animate={{ opacity: stage >= 3 ? 0.5 : 1 }}
            transition={{ duration: 0.4 }}
          >
            Guardando configuración
          </motion.p>
        </motion.div>

        {/* Progress indicator */}
        <motion.div
          className="w-32 mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: stage >= 1 ? 1 : 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="w-full bg-muted rounded-full h-1 overflow-hidden">
            <motion.div
              className="h-full bg-muted-foreground rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: stage >= 1 ? "100%" : "0%" }}
              transition={{
                duration: 1.2,
                ease: "easeOut"
              }}
            />
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default LogoutTransition