import { motion } from 'framer-motion'
import { Package, CheckCircle, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'

interface LoginTransitionProps {
  userName?: string
  userRole?: string
  onComplete: () => void
}

const LoginTransition = ({ userName, userRole, onComplete }: LoginTransitionProps) => {
  const [stage, setStage] = useState(0)
  
  const welcomeText = `¡Bienvenido${userName ? `, ${userName}` : ''}!`
  const roleText = userRole === 'admin' ? 'Administrador del Sistema' : 
                   userRole === 'moderator' ? 'Moderador' : 'Usuario'

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 200),   // Logo animation
      setTimeout(() => setStage(2), 800),   // Welcome text
      setTimeout(() => setStage(3), 1400),  // Role badge
      setTimeout(() => setStage(4), 2000),  // System ready
      setTimeout(() => onComplete(), 2600)  // Complete
    ]

    return () => timers.forEach(clearTimeout)
  }, [onComplete])

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center z-50">
      
      {/* Animated background particles */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${20 + Math.random() * 60}%`,
            top: `${20 + Math.random() * 60}%`,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: stage >= 1 ? [0, 0.6, 0] : 0,
            scale: stage >= 1 ? [0, 1, 0] : 0
          }}
          transition={{
            duration: 3,
            delay: Math.random() * 2,
            repeat: Infinity,
            repeatDelay: Math.random() * 4
          }}
        >
          <Sparkles className="h-3 w-3 text-primary/40" />
        </motion.div>
      ))}

      {/* Main content */}
      <div className="relative flex flex-col items-center space-y-8 max-w-md mx-auto px-6">
        
        {/* Logo with success animation */}
        <motion.div
          className="relative"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ 
            scale: stage >= 1 ? 1 : 0,
            rotate: stage >= 1 ? 0 : -180
          }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 20,
            duration: 0.6
          }}
        >
          {/* Success rings */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: stage >= 1 ? 1 : 0 }}
          >
            <motion.div
              className="w-32 h-32 rounded-full border-2 border-success/20"
              animate={{ 
                scale: stage >= 1 ? [1, 1.1, 1] : 1,
                opacity: stage >= 1 ? [0.2, 0.6, 0.2] : 0
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="absolute w-40 h-40 rounded-full border border-success/10"
              animate={{ 
                scale: stage >= 1 ? [1, 1.2, 1] : 1,
                opacity: stage >= 1 ? [0.1, 0.3, 0.1] : 0
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
            />
          </motion.div>
          
          {/* Main logo */}
          <motion.div
            className="relative w-20 h-20 bg-gradient-primary rounded-3xl flex items-center justify-center shadow-glow"
            animate={{
              boxShadow: stage >= 1 ? [
                "0 0 20px hsl(239 84% 67% / 0.3)",
                "0 0 40px hsl(239 84% 67% / 0.5)",
                "0 0 20px hsl(239 84% 67% / 0.3)"
              ] : "0 0 20px hsl(239 84% 67% / 0.3)"
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Package className="h-10 w-10 text-primary-foreground" />
          </motion.div>
          
          {/* Success checkmark */}
          <motion.div
            className="absolute -bottom-2 -right-2 w-8 h-8 bg-success rounded-full flex items-center justify-center shadow-lg"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ 
              scale: stage >= 1 ? 1 : 0,
              rotate: stage >= 1 ? 0 : -180
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25,
              delay: 0.3
            }}
          >
            <CheckCircle className="h-5 w-5 text-success-foreground" />
          </motion.div>
        </motion.div>

        {/* Welcome message */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ 
            opacity: stage >= 2 ? 1 : 0,
            y: stage >= 2 ? 0 : 30
          }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 25,
            delay: 0.2
          }}
        >
          <motion.h1 
            className="text-3xl sm:text-4xl font-heading font-bold text-gradient mb-4"
            animate={{
              backgroundPosition: stage >= 2 ? ['0% 50%', '100% 50%', '0% 50%'] : '0% 50%'
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {welcomeText}
          </motion.h1>
          
          {/* Role badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: stage >= 3 ? 1 : 0,
              scale: stage >= 3 ? 1 : 0.8
            }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 25,
              delay: 0.1
            }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
              <motion.div
                className="w-2 h-2 bg-success rounded-full"
                animate={{
                  scale: stage >= 3 ? [1, 1.2, 1] : 1,
                  opacity: stage >= 3 ? [0.6, 1, 0.6] : 0.6
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <span className="text-sm font-medium text-primary">{roleText}</span>
            </div>
          </motion.div>
        </motion.div>

        {/* System status */}
        <motion.div
          className="text-center space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: stage >= 4 ? 1 : 0,
            y: stage >= 4 ? 0 : 20
          }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 25,
            delay: 0.1
          }}
        >
          <div className="space-y-2">
            <div className="text-success font-semibold text-lg">¡Acceso Autorizado!</div>
            <div className="text-muted-foreground text-sm">Iniciando Ventory Manager...</div>
          </div>
          
          <div className="w-48 mx-auto">
            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-success rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: stage >= 4 ? "100%" : "0%" }}
                transition={{
                  duration: 0.8,
                  ease: "easeOut"
                }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default LoginTransition