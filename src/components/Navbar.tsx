import { Button } from "@/components/ui/enhanced-button"
import { Badge } from "@/components/ui/badge"
import ThemeToggle from "@/components/ThemeToggle"
import NotificationPanel from "@/components/NotificationPanel"
import {
  PackageOpen,
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
    { name: "Clientes", icon: Users, path: "/customers" },
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
            <div className="flex items-center space-x-2">
              <NotificationPanel />
              <ThemeToggle />
              <Button variant="ghost" size="sm" className="hover-scale transition-smooth">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="h-6 w-px bg-border/50" />
            
            {/* User Info */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Badge 
                  variant="outline" 
                  className="flex items-center space-x-1 bg-gradient-card border-primary/20 hover-scale transition-smooth"
                >
                  {getRoleIcon()}
                  <span className="text-xs font-medium">{getRoleDisplayName()}</span>
                </Badge>
                <span className="text-sm font-medium text-muted-foreground hidden lg:block">
                  {userProfile?.full_name || user?.email}
                </span>
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSignOut}
                className="hover-scale transition-smooth border-destructive/20 hover:border-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Salir
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar