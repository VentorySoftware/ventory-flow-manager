import { useEffect, useState } from 'react'
import { Package, Sparkles } from 'lucide-react'

interface LoginTransitionProps {
  onComplete: () => void
}

const LoginTransition = ({ onComplete }: LoginTransitionProps) => {
  const [stage, setStage] = useState(0)

  useEffect(() => {
    const timer1 = setTimeout(() => setStage(1), 500)  // Caja aparece
    const timer2 = setTimeout(() => setStage(2), 1200) // Caja se abre
    const timer3 = setTimeout(() => setStage(3), 1800) // Nombre sale
    const timer4 = setTimeout(() => setStage(4), 2800) // Sparkles
    const timer5 = setTimeout(() => onComplete(), 3500) // Completar

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(timer4)
      clearTimeout(timer5)
    }
  }, [onComplete])

  return (
    <div className="fixed inset-0 bg-gradient-dashboard flex items-center justify-center z-50 overflow-hidden">
      <div className="relative flex flex-col items-center">
        
        {/* Efectos de fondo */}
        <div className="absolute inset-0 -z-10">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-1 h-1 bg-primary rounded-full opacity-60 animate-pulse ${
                stage >= 3 ? 'animate-float' : ''
              }`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`
              }}
            />
          ))}
        </div>

        {/* Contenedor de la caja */}
        <div className="relative">
          
          {/* Caja cerrada/abriéndose */}
          <div className={`relative transition-all duration-1000 ${
            stage >= 1 ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
          }`}>
            
            {/* Base de la caja */}
            <div className={`w-32 h-20 bg-gradient-to-br from-primary-deep to-primary border-2 border-primary-glow rounded-lg shadow-2xl transition-all duration-800 ${
              stage >= 2 ? 'transform perspective-1000 rotateX-15' : ''
            }`}>
              {/* Detalles de la caja */}
              <div className="absolute inset-2 border border-primary-glow/30 rounded-md"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <Package className="h-8 w-8 text-primary-foreground opacity-80" />
              </div>
            </div>
            
            {/* Tapa de la caja */}
            <div className={`absolute -top-1 left-0 w-32 h-6 bg-gradient-to-br from-primary to-primary-glow border-2 border-primary-glow rounded-t-lg shadow-lg transition-all duration-1000 origin-bottom ${
              stage >= 2 ? 'transform -rotate-45 -translate-y-4 translate-x-4' : ''
            }`}>
              <div className="absolute inset-1 border border-primary-foreground/20 rounded-sm"></div>
            </div>

            {/* Luz interior de la caja */}
            {stage >= 2 && (
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                <div className="w-16 h-16 bg-gradient-radial from-primary-glow/60 to-transparent rounded-full animate-pulse"></div>
              </div>
            )}
          </div>

          {/* Nombre del sistema saliendo */}
          {stage >= 3 && (
            <div className={`absolute -top-20 left-1/2 transform -translate-x-1/2 transition-all duration-1000 ${
              stage >= 3 ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-75'
            }`}>
              <div className="text-center">
                <h1 className="text-4xl font-heading font-bold text-gradient mb-2 animate-glow">
                  Ventory Manager
                </h1>
                <p className="text-lg text-muted-foreground animate-fade-in">
                  Sistema Empresarial
                </p>
              </div>
            </div>
          )}

          {/* Sparkles alrededor */}
          {stage >= 4 && (
            <>
              {[...Array(8)].map((_, i) => (
                <Sparkles
                  key={i}
                  className={`absolute w-6 h-6 text-primary-glow animate-ping opacity-70`}
                  style={{
                    left: `${50 + Math.cos(i * Math.PI / 4) * 120}px`,
                    top: `${50 + Math.sin(i * Math.PI / 4) * 120}px`,
                    animationDelay: `${i * 200}ms`
                  }}
                />
              ))}
            </>
          )}
        </div>

        {/* Mensaje de bienvenida */}
        {stage >= 3 && (
          <div className={`mt-16 text-center transition-all duration-1000 delay-500 ${
            stage >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <p className="text-xl font-medium text-foreground mb-2">
              ¡Bienvenido!
            </p>
            <p className="text-muted-foreground">
              Accediendo a tu panel de control...
            </p>
            <div className="mt-4 flex justify-center">
              <div className="flex space-x-1">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-primary rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 200}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LoginTransition