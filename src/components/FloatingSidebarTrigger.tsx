import { Button } from "@/components/ui/button"
import { Menu, PackageOpen } from "lucide-react"
import { useSidebar } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

export function FloatingSidebarTrigger() {
  const { state } = useSidebar()

  // No mostrar el botón flotante ya que está integrado en la sidebar
  return null
}
