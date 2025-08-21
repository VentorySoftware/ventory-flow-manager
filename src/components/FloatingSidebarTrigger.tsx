import { Button } from "@/components/ui/button"
import { Menu, PackageOpen } from "lucide-react"
import { useSidebar } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

export function FloatingSidebarTrigger() {
  const { toggleSidebar, state } = useSidebar()

  // Mostrar el botón flotante cuando el sidebar esté colapsado
  if (state === "expanded") {
    return null
  }

  return (
    <div
      className={cn(
        "fixed top-3 left-3 z-[100]",
        "flex items-center gap-2",
        "bg-card/90 backdrop-blur-sm",
        "border border-border/30",
        "shadow-lg hover:shadow-xl",
        "transition-all duration-200 ease-in-out",
        "rounded-lg p-2"
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-8 w-8",
          "hover:bg-accent",
          "rounded-md"
        )}
        onClick={toggleSidebar}
        title="Abrir menú"
      >
        <Menu className="h-4 w-4" />
        <span className="sr-only">Abrir sidebar</span>
      </Button>
      
      {/* Logo de Ventory */}
      <div className="h-6 w-6 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow animate-glow">
        <PackageOpen className="h-3 w-3 text-primary-foreground" />
      </div>
    </div>
  )
}
