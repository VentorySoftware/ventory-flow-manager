import { Button } from "@/components/ui/button"
import { PanelLeft } from "lucide-react"
import { useSidebar } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

export function FloatingSidebarTrigger() {
  const { toggleSidebar, state } = useSidebar()

  // Mostrar el botón flotante cuando el sidebar esté colapsado
  if (state === "expanded") {
    return null
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "fixed top-3 left-3 z-[100]",
        "h-9 w-9",
        "bg-card/90 backdrop-blur-sm",
        "border border-border/30",
        "shadow-lg hover:shadow-xl",
        "transition-all duration-200 ease-in-out",
        "hover:scale-105 hover:bg-accent",
        "rounded-lg",
        "flex items-center justify-center"
      )}
      onClick={toggleSidebar}
      title="Abrir menú"
    >
      <PanelLeft className="h-4 w-4" />
      <span className="sr-only">Abrir sidebar</span>
    </Button>
  )
}
