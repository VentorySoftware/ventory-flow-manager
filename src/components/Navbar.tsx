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
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="flex items-center space-x-2 sm:space-x-3 hover-scale transition-smooth">
              <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow animate-glow">
                <PackageOpen className="h-4 w-4 sm:h-6 sm:w-6 text-primary-foreground" />
              </div>
              <span className="text-lg sm:text-xl font-heading font-bold text-gradient hidden xs:block">
                Ventory Manager
              </span>
              <span className="text-lg font-heading font-bold text-gradient xs:hidden">
                VM
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-2">
            {navigation.map((item, index) => (
              <Button
                key={item.name}
                variant={location.pathname === item.path ? "business" : "ghost"}
                size="sm"
                className="flex items-center space-x-2 hover-scale transition-smooth"
                onClick={() => navigate(item.path)}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Button>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Mobile menu button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Abrir menú</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] sm:w-[350px]">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <PackageOpen className="h-5 w-5" />
                    Ventory Manager
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-2">
                  {navigation.map((item) => (
                    <Button
                      key={item.name}
                      variant={location.pathname === item.path ? "business" : "ghost"}
                      className="w-full justify-start space-x-2"
                      onClick={() => {
                        navigate(item.path)
                        setMobileMenuOpen(false)
                      }}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
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