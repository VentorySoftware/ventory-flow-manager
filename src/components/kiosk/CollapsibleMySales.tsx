import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/enhanced-button'
import { Card } from '@/components/ui/card'
import MySales from './MySales'
import { Receipt, ChevronLeft, ChevronRight, Pin, PinOff } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CollapsibleMySalesProps {
  refreshTrigger?: number
}

const CollapsibleMySales = ({ refreshTrigger }: CollapsibleMySalesProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isPinned, setIsPinned] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Auto-collapse when clicking outside (only if not pinned)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        !isPinned &&
        isExpanded &&
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
  }, [isExpanded, isPinned])

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
      {/* Collapsed State - Trigger Button */}
      {!isExpanded && (
        <Card className="h-full flex flex-col items-center justify-start p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleExpansion}
            className="w-8 h-8 p-0 mb-2 hover:bg-primary/10"
            title="Expandir Mis Ventas"
          >
            <Receipt className="h-4 w-4" />
          </Button>
          
          {/* Vertical text indicator */}
          <div className="writing-mode-vertical-rl text-xs text-muted-foreground transform rotate-180">
            Mis Ventas
          </div>
        </Card>
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

          {/* MySales Component */}
          <div className="h-[calc(100%-4rem)]">
            <MySales refreshTrigger={refreshTrigger} />
          </div>
        </div>
      )}

      {/* Floating expand button when collapsed (alternative trigger) */}
      {!isExpanded && (
        <Button
          variant="default"
          size="sm"
          onClick={handleToggleExpansion}
          className="absolute -right-3 top-4 w-6 h-8 p-0 rounded-r-md shadow-md z-10 hover:shadow-lg transition-all"
          title="Expandir Mis Ventas"
        >
          <ChevronRight className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
}

export default CollapsibleMySales
