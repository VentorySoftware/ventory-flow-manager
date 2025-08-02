import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "@/components/Navbar"
import Dashboard from "@/components/Dashboard"
import { useAuth } from "@/contexts/AuthContext"

const Index = () => {
  const { hasRole, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !hasRole('admin')) {
      // Si no es admin (es vendedor), redirigir al modo kiosco
      navigate('/kiosk')
    }
  }, [hasRole, loading, navigate])

  // Si está cargando o no es admin, no mostrar nada (se redirigirá)
  if (loading || !hasRole('admin')) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Dashboard />
    </div>
  );
};

export default Index;
