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
} from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"

const Navbar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { hasRole } = useAuth()

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
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 hover-scale transition-smooth">
              <div className="h-10 w-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow animate-glow">
                <PackageOpen className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-heading font-bold text-gradient">
                Ventory Manager
              </span>
            </div>
          </div>

          {/* Navigation */}
          <div className="hidden md:flex items-center space-x-2">
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
          <div className="flex items-center space-x-4">
            
            {/* User Profile Dropdown */}
            <UserProfileDropdown />
            
            {/* Notifications - A la derecha del usuario */}
            <NotificationPanel />
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar