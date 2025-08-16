import { useEffect, useState } from 'react'
import { Package, CheckCircle, Sparkles } from 'lucide-react'

interface SystemEntryAnimationProps {
  userName?: string
  userRole?: string
  onComplete: () => void
}

const SystemEntryAnimation = ({ userName, userRole, onComplete }: SystemEntryAnimationProps) => {
  const [stage, setStage] = useState(0)
  const [typedText, setTypedText] = useState('')
  
  const welcomeText = `¡Bienvenido${userName ? `, ${userName}` : ''}!`
  const roleText = userRole === 'admin' ? 'Administrador del Sistema' : 
                   userRole === 'moderator' ? 'Moderador' : 'Usuario'

  useEffect(() => {
    // Stage 1: Logo expansion with success indicator
    const timer1 = setTimeout(() => setStage(1), 300)
    
    // Stage 2: Welcome text typewriter
    const timer2 = setTimeout(() => setStage(2), 1000)
    
    // Stage 3: Role and system ready
    const timer3 = setTimeout(() => setStage(3), 2000)
    
    // Stage 4: System access granted
    const timer4 = setTimeout(() => setStage(4), 2800)
    
    // Stage 5: Fade out and complete
    const timer5 = setTimeout(() => setStage(5), 3400)
    const timer6 = setTimeout(() => onComplete(), 4000)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(timer4)
      clearTimeout(timer5)
      clearTimeout(timer6)
    }
  }, [onComplete])

  // Typewriter effect for welcome text
  useEffect(() => {
    if (stage >= 2) {
      let currentIndex = 0
      const typeTimer = setInterval(() => {
        if (currentIndex <= welcomeText.length) {
          setTypedText(welcomeText.slice(0, currentIndex))
          currentIndex++
        } else {
          clearInterval(typeTimer)
        }
      }, 60)
      
      return () => clearInterval(typeTimer)
    }
  }, [stage, welcomeText])

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center z-50 overflow-hidden">
      
      {/* Success sparkles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className={`absolute transition-all duration-1000 ${
              stage >= 1 ? 'opacity-60 animate-float' : 'opacity-0'
            }`}
            style={{
              left: `${15 + Math.random() * 70}%`,
              top: `${15 + Math.random() * 70}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          >
            <Sparkles className="h-3 w-3 text-primary/40" />
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="relative flex flex-col items-center space-y-8 max-w-md mx-auto px-6">
        
        {/* Success logo animation */}
        <div className={`relative transition-all duration-1000 ${
          stage >= 1 ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
        } ${stage === 5 ? 'scale-110 opacity-0' : ''}`}>
          
          {/* Success ring animations */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`w-32 h-32 rounded-full border-2 border-success/20 transition-all duration-1000 ${
              stage >= 1 ? 'animate-pulse scale-100' : 'scale-50'
            }`} />
            <div className={`absolute w-40 h-40 rounded-full border border-success/10 transition-all duration-1500 ${
              stage >= 1 ? 'animate-ping scale-100' : 'scale-50'
            }`} style={{ animationIterationCount: '3' }} />
          </div>
          
          {/* Logo with success indicator */}
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-primary rounded-3xl flex items-center justify-center shadow-glow animate-breathing-glow">
              <Package className="h-10 w-10 text-primary-foreground" />
            </div>
            
            {/* Success checkmark */}
            <div className={`absolute -bottom-2 -right-2 w-8 h-8 bg-success rounded-full flex items-center justify-center shadow-lg transition-all duration-500 ${
              stage >= 1 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
            }`}>
              <CheckCircle className="h-5 w-5 text-success-foreground" />
            </div>
          </div>
        </div>

        {/* Welcome message with typewriter */}
        <div className={`text-center transition-all duration-700 ${
          stage >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        } ${stage === 5 ? 'opacity-0 -translate-y-4' : ''}`}>
          
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-gradient mb-3">
            {typedText}
            <span className={`inline-block w-0.5 h-8 bg-primary ml-1 ${
              stage >= 2 && typedText.length < welcomeText.length ? 'animate-pulse' : 'opacity-0'
            }`} />
          </h1>
          
          {/* Role indicator */}
          <div className={`transition-all duration-500 delay-300 ${
            stage >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
          }`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
              <span className="text-sm font-medium text-primary">{roleText}</span>
            </div>
          </div>
        </div>

        {/* System access status */}
        <div className={`text-center space-y-4 transition-all duration-700 delay-100 ${
          stage >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        } ${stage === 5 ? 'opacity-0' : ''}`}>
          
          {/* Access granted message */}
          <div className="space-y-2">
            <div className="text-success font-semibold text-lg">¡Acceso Autorizado!</div>
            <div className="text-muted-foreground text-sm">Iniciando Ventory Manager...</div>
          </div>
          
          {/* Progress indicator */}
          <div className="w-48 mx-auto">
            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-success rounded-full transition-all duration-1500 ease-out" 
                   style={{ 
                     width: stage >= 4 ? '100%' : '0%'
                   }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SystemEntryAnimation