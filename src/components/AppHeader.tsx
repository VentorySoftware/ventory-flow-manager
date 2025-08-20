import { PackageOpen } from "lucide-react"
import UserProfileDropdown from "@/components/UserProfileDropdown"
import NotificationPanel from "@/components/NotificationPanel"
import { SidebarTrigger } from "@/components/ui/sidebar"

const AppHeader = () => {
  return (
    <header className="h-16 bg-card/95 backdrop-blur-md border-b border-border/50 shadow-elegant sticky top-0 z-50">
      <div className="container-responsive h-full">
        <div className="flex justify-between items-center h-full">
          {/* Left side - Sidebar trigger + Logo */}
          <div className="flex items-center gap-4">
            <SidebarTrigger className="h-9 w-9" />
            
            {/* Logo visible only on mobile when sidebar is closed */}
            <div className="flex items-center gap-3 lg:hidden">
              <div className="h-8 w-8 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow animate-glow">
                <PackageOpen className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-heading font-bold text-gradient">
                  Ventory
                </span>
              </div>
            </div>
          </div>

          {/* Right side - User actions */}
          <div className="flex items-center gap-2">
            <UserProfileDropdown />
            <NotificationPanel />
          </div>
        </div>
      </div>
    </header>
  )
}

export default AppHeader