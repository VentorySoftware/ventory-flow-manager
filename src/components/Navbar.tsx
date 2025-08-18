import { Button } from "@/components/ui/enhanced-button"
import UserProfileDropdown from "@/components/UserProfileDropdown"
import NotificationPanel from "@/components/NotificationPanel"
import {
  PackageOpen,
  Package,
  ShoppingCart,
  LayoutGrid,
  Tags,
  Receipt,
  BarChart3,
  Menu,
  X
} from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

const Navbar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { hasRole } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigation = [
    { name: "Caja", icon: LayoutGrid, path: "/caja" },
    { name: "Mis Ventas", icon: Receipt, path: "/my-sales" },
    ...(hasRole('admin') ? [
      { name: "Reportes", icon: BarChart3, path: "/reports" },
      { name: "Productos", icon: Package, path: "/products" },
      { name: "Categorías", icon: Tags, path: "/categories" },
      { name: "Ventas", icon: ShoppingCart, path: "/sales" },
    ] : []),
  ]

  return (
    <nav className="bg-card/95 backdrop-blur-md border-b border-border/50 shadow-elegant sticky top-0 z-50">
      <div className="container-responsive">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="flex items-center space-x-2 sm:space-x-3 hover-scale transition-smooth">
              <div className="h-7 w-7 sm:h-8 sm:w-8 lg:h-10 lg:w-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow animate-glow">
                <PackageOpen className="h-3 w-3 sm:h-4 sm:w-4 lg:h-6 lg:w-6 text-primary-foreground" />
              </div>
              <span className="text-sm sm:text-base lg:text-lg xl:text-xl font-heading font-bold text-gradient hide-mobile">
                Ventory Manager
              </span>
              <span className="text-xs font-heading font-bold text-gradient show-mobile">
                Ventory
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            {navigation.map((item, index) => (
              <Button
                key={item.name}
                variant={location.pathname === item.path ? "business" : "ghost"}
                size="sm"
                className="nav-item-responsive hover-scale transition-smooth"
                onClick={() => navigate(item.path)}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <item.icon className="h-4 w-4" />
                <span className="ml-2">{item.name}</span>
              </Button>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4">
            {/* Mobile menu button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden btn-touch">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Abrir menú</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0">
                <SheetHeader className="p-4 sm:p-6 border-b">
                  <SheetTitle className="flex items-center gap-3 text-left">
                    <div className="h-8 w-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                      <PackageOpen className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <span className="text-lg font-bold">Ventory Manager</span>
                  </SheetTitle>
                </SheetHeader>
                <div className="p-4 sm:p-6 space-y-2">
                  {navigation.map((item) => (
                    <Button
                      key={item.name}
                      variant={location.pathname === item.path ? "business" : "ghost"}
                      className="w-full justify-start space-x-3 h-12 text-left"
                      onClick={() => {
                        navigate(item.path)
                        setMobileMenuOpen(false)
                      }}
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="text-base">{item.name}</span>
                    </Button>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
            
            {/* User Profile Dropdown */}
            <UserProfileDropdown />
            
            {/* Notifications */}
            <NotificationPanel />
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar