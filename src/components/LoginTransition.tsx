import { useEffect, useState } from 'react'
import { Package } from 'lucide-react'

interface LoginTransitionProps {
  onComplete: () => void
}

const LoginTransition = ({ onComplete }: LoginTransitionProps) => {
  const [stage, setStage] = useState(0)
  const [typedText, setTypedText] = useState('')
  
  const fullText = "Ventory Manager"
  const subtitle = "Sistema Empresarial"

  useEffect(() => {
    // Stage 1: Logo aparece con breathing
    const timer1 = setTimeout(() => setStage(1), 200)
    
    // Stage 2: Empieza typewriter effect
    const timer2 = setTimeout(() => setStage(2), 800)
    
    // Stage 3: Subtítulo aparece
    const timer3 = setTimeout(() => setStage(3), 2200)
    
    // Stage 4: Fade out y completar
    const timer4 = setTimeout(() => setStage(4), 3000)
    const timer5 = setTimeout(() => onComplete(), 3500)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(timer4)
      clearTimeout(timer5)
    }
  }, [onComplete])

  // Typewriter effect
  useEffect(() => {
    if (stage >= 2) {
      let currentIndex = 0
      const typeTimer = setInterval(() => {
        if (currentIndex <= fullText.length) {
          setTypedText(fullText.slice(0, currentIndex))
          currentIndex++
        } else {
          clearInterval(typeTimer)
        }
      }, 80)
      
      return () => clearInterval(typeTimer)
    }
  }, [stage])

  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-50 overflow-hidden">
      
      {/* Subtle floating particles */}
      <div className="absolute inset-0">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-1 h-1 bg-primary/20 rounded-full transition-all duration-1000 ${
              stage >= 1 ? 'animate-float opacity-40' : 'opacity-0'
            }`}
            style={{
              left: `${20 + Math.random() * 60}%`,
              top: `${20 + Math.random() * 60}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative flex flex-col items-center space-y-6">
        
        {/* Logo with breathing effect */}
        <div className={`relative transition-all duration-1000 ${
          stage >= 1 ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        } ${stage === 4 ? 'scale-105 opacity-0' : ''}`}>
          
          {/* Breathing glow rings */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`w-24 h-24 rounded-full bg-gradient-primary/10 animate-pulse ${
              stage >= 1 ? 'animate-breathing-slow' : ''
            }`} />
            <div className={`absolute w-32 h-32 rounded-full bg-gradient-primary/5 animate-pulse ${
              stage >= 1 ? 'animate-breathing-slower' : ''
            }`} />
          </div>
          
          {/* Logo container */}
          <div className={`relative w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow transition-all duration-300 ${
            stage >= 1 ? 'animate-breathing-glow' : ''
          }`}>
            <Package className="h-8 w-8 text-primary-foreground" />
          </div>
        </div>

        {/* Company name with typewriter */}
        <div className={`text-center transition-all duration-500 ${
          stage >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        } ${stage === 4 ? 'opacity-0 -translate-y-2' : ''}`}>
          
          <h1 className="text-4xl font-heading font-bold text-gradient mb-2">
            {typedText}
            <span className={`inline-block w-0.5 h-8 bg-primary ml-1 ${
              stage >= 2 && typedText.length < fullText.length ? 'animate-pulse' : 'opacity-0'
            }`} />
          </h1>
          
          {/* Subtitle */}
          <p className={`text-lg text-muted-foreground transition-all duration-500 delay-300 ${
            stage >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}>
            {subtitle}
          </p>
        </div>

        {/* Loading indicator */}
        <div className={`flex items-center space-x-2 transition-all duration-500 delay-500 ${
          stage >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        } ${stage === 4 ? 'opacity-0' : ''}`}>
          <div className="text-sm text-muted-foreground">Accediendo</div>
          <div className="flex space-x-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"
                style={{ animationDelay: `${i * 200}ms` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginTransition