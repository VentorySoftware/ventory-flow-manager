import UserProfileDropdown from "@/components/UserProfileDropdown"
import NotificationPanel from "@/components/NotificationPanel"

const AppHeader = () => {
  return (
    <header className="h-16 bg-card/95 backdrop-blur-md border-b border-border/50 shadow-elegant sticky top-0 z-50">
      <div className="container-responsive h-full">
        <div className="flex justify-end items-center h-full">
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
