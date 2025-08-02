import { Button } from "@/components/ui/enhanced-button"
import { Badge } from "@/components/ui/badge"
import ThemeToggle from "@/components/ThemeToggle"
import {
  Store,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  Crown,
  Shield,
  User
} from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"

const Navbar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, userRole, userProfile, signOut, hasRole } = useAuth()

  const navigation = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/" },
    { name: "Productos", icon: Package, path: "/products" },
    { name: "Ventas", icon: ShoppingCart, path: "/sales" },
    ...(hasRole('admin') ? [{ name: "Usuarios", icon: Users, path: "/users" }] : []),
    { name: "Reportes", icon: BarChart3, path: "/reports" },
  ]

  const handleSignOut = async () => {
    await signOut()
    navigate('/auth')
  }

  const getRoleIcon = () => {
    switch (userRole) {
      case 'admin':
        return <Crown className="h-3 w-3" />
      case 'moderator':
        return <Shield className="h-3 w-3" />
      default:
        return <User className="h-3 w-3" />
    }
  }

  const getRoleDisplayName = () => {
    switch (userRole) {
      case 'admin':
        return 'Admin'
      case 'moderator':
        return 'Vendedor'
      default:
        return 'Usuario'
    }
  }

  return (
    <nav className="bg-card border-b border-border shadow-soft">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Store className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">Ventory</span>
            </div>
          </div>

          {/* Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => (
              <Button
                key={item.name}
                variant={location.pathname === item.path ? "business" : "ghost"}
                size="sm"
                className="flex items-center space-x-2"
                onClick={() => navigate(item.path)}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Button>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                3
              </Badge>
            </Button>
            
            <ThemeToggle />
            
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
            
            <div className="h-6 w-px bg-border" />
            
            {/* User Info */}
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="flex items-center space-x-1">
                {getRoleIcon()}
                <span className="text-xs">{getRoleDisplayName()}</span>
              </Badge>
              <span className="text-sm text-muted-foreground hidden lg:block">
                {userProfile?.full_name || user?.email}
              </span>
            </div>
            
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar