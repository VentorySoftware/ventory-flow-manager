import UserProfileDropdown from "@/components/UserProfileDropdown"
import NotificationPanel from "@/components/NotificationPanel"

const AppHeader = () => {
  return (
    <header className="h-16 bg-sidebar/95 backdrop-blur-md border-b border-sidebar-border shadow-elegant sticky top-0 z-50">
      <div className="h-full px-6">
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
