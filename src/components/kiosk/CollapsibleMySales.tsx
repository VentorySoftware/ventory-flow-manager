import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/enhanced-button'
import { Card } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import MySales from './MySales'
import { Receipt, ChevronLeft, ChevronRight, Pin, PinOff, TrendingUp, ShoppingBag } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CollapsibleMySalesProps {
  refreshTrigger?: number
}

const CollapsibleMySales = ({ refreshTrigger }: CollapsibleMySalesProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isPinned, setIsPinned] = useState(false)
  const [isUserInteracting, setIsUserInteracting] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const interactionTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Handle user interaction tracking
  const handleUserInteraction = useCallback(() => {
    setIsUserInteracting(true)
    
    // Clear existing timeout
    if (interactionTimeoutRef.current) {
      clearTimeout(interactionTimeoutRef.current)
    }
    
    // Set new timeout for 3 seconds of inactivity
    interactionTimeoutRef.current = setTimeout(() => {
      setIsUserInteracting(false)
    }, 3000)
  }, [])

  // Auto-collapse logic - improved to respect user interaction
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        !isPinned &&
        isExpanded &&
        !isUserInteracting &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsExpanded(false)
      }
    }

    if (isExpanded && !isPinned) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isExpanded, isPinned, isUserInteracting])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (interactionTimeoutRef.current) {
        clearTimeout(interactionTimeoutRef.current)
      }
    }
  }, [])

  const handleToggleExpansion = () => {
    setIsExpanded(!isExpanded)
  }

  const handleTogglePin = () => {
    setIsPinned(!isPinned)
    // If unpinning and expanded, we keep it expanded but it will auto-collapse on outside click
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative transition-all duration-300 ease-in-out",
        isExpanded ? "w-full" : "w-12"
      )}
    >
      {/* Collapsed State - Enhanced Design */}
      {!isExpanded && (
        <TooltipProvider>
          <Card className="h-full flex flex-col items-center justify-start relative overflow-hidden bg-gradient-to-b from-background to-muted/30 border-2 border-dashed border-muted-foreground/20 hover:border-primary/40 transition-all duration-300">
            {/* Decorative background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-2 left-1 text-2xl">📊</div>
              <div className="absolute bottom-2 right-1 text-2xl">💰</div>
            </div>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToggleExpansion}
                  className="w-8 h-10 p-0 mt-2 mb-3 hover:bg-primary/10 hover:scale-110 transition-all duration-200 relative z-10"
                >
                  <div className="flex flex-col items-center gap-0.5">
                    <Receipt className="h-4 w-4 text-primary" />
                    <TrendingUp className="h-3 w-3 text-muted-foreground" />
                  </div>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-medium">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  <span>Abrir Mis Ventas</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Consulta tus transacciones y filtros
                </p>
              </TooltipContent>
            </Tooltip>
            
            {/* Stylized vertical text */}
            <div className="flex-1 flex flex-col justify-center relative z-10">
              <div className="transform -rotate-90 text-xs font-medium text-primary whitespace-nowrap">
                MIS
              </div>
              <div className="transform -rotate-90 text-xs font-medium text-muted-foreground whitespace-nowrap mt-1">
                VENTAS
              </div>
            </div>
            
            {/* Visual indicator dots */}
            <div className="flex flex-col gap-1 mb-2 relative z-10">
              <div className="w-1 h-1 rounded-full bg-primary/60"></div>
              <div className="w-1 h-1 rounded-full bg-primary/40"></div>
              <div className="w-1 h-1 rounded-full bg-primary/20"></div>
            </div>
          </Card>
        </TooltipProvider>
      )}

      {/* Expanded State - Full Component */}
      {isExpanded && (
        <div className="w-full animate-fade-in">
          {/* Header with controls */}
          <Card className="mb-2 p-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                <span className="text-sm font-medium">Mis Ventas</span>
              </div>
              
              <div className="flex items-center gap-1">
                {/* Pin/Unpin Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleTogglePin}
                  className={cn(
                    "w-8 h-8 p-0",
                    isPinned 
                      ? "text-primary bg-primary/10 hover:bg-primary/20" 
                      : "hover:bg-muted"
                  )}
                  title={isPinned ? "Desanclar" : "Anclar panel"}
                >
                  {isPinned ? <Pin className="h-3 w-3" /> : <PinOff className="h-3 w-3" />}
                </Button>
                
                {/* Collapse Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToggleExpansion}
                  className="w-8 h-8 p-0 hover:bg-muted"
                  title="Colapsar panel"
                >
                  <ChevronLeft className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            {/* Pin status indicator */}
            {isPinned && (
              <div className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                <Pin className="h-3 w-3" />
                Panel anclado
              </div>
            )}
          </Card>

          {/* MySales Component with interaction tracking */}
          <div 
            className="h-[calc(100%-4rem)]"
            onClick={handleUserInteraction}
            onFocus={handleUserInteraction}
            onChange={handleUserInteraction}
          >
            <MySales refreshTrigger={refreshTrigger} />
          </div>
        </div>
      )}

      {/* Enhanced floating expand button */}
      {!isExpanded && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="default"
                size="sm"
                onClick={handleToggleExpansion}
                className="absolute -right-3 top-4 w-6 h-10 p-0 rounded-r-lg shadow-lg z-10 hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-r from-primary to-primary/80"
              >
                <ChevronRight className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <span>Expandir panel de ventas</span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  )
}

export default CollapsibleMySales
