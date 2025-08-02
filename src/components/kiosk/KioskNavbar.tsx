import { Button } from '@/components/ui/enhanced-button'
import UserProfileDropdown from '@/components/UserProfileDropdown'
import NotificationPanel from '@/components/NotificationPanel'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Settings, 
  Home,
  ArrowLeft
} from 'lucide-react'

const KioskNavbar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { hasRole } = useAuth()

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        
        {/* Logo y título */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <ShoppingCart className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold">Modo Caja</h1>
          </div>
        </div>

        {/* Navegación central */}
        <div className="hidden md:flex items-center space-x-2">
          {hasRole('admin') && (
            <Button
              variant={location.pathname === '/' ? "default" : "ghost"}
              onClick={() => navigate('/')}
              className="flex items-center space-x-2"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard Admin</span>
            </Button>
          )}
          
          <Button
            variant={location.pathname === '/kiosk' ? "default" : "ghost"}
            onClick={() => navigate('/kiosk')}
            className="flex items-center space-x-2"
          >
            <ShoppingCart className="h-4 w-4" />
            <span>Punto de Venta</span>
          </Button>
        </div>

        {/* Acciones del usuario */}
        <div className="flex items-center space-x-4">
          <UserProfileDropdown />
          <NotificationPanel />
        </div>
      </div>
    </nav>
  )
}

export default KioskNavbar