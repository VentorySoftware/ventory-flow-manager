import { Button } from "@/components/ui/enhanced-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Package, ShoppingCart, Users, Eye, BarChart3 } from "lucide-react"
import { useNavigate } from "react-router-dom"

const Dashboard = () => {
  const navigate = useNavigate()
  const stats = [
    {
      title: "Ventas Hoy",
      value: "$12,450",
      description: "+20.1% desde ayer",
      icon: ShoppingCart,
      trend: "up"
    },
    {
      title: "Productos en Stock",
      value: "324",
      description: "5 productos con stock bajo",
      icon: Package,
      trend: "warning"
    },
    {
      title: "Total de Ventas",
      value: "$45,231",
      description: "+180.1% desde el mes pasado",
      icon: TrendingUp,
      trend: "up"
    },
    {
      title: "Usuarios Activos",
      value: "8",
      description: "3 administradores, 5 empleados",
      icon: Users,
      trend: "neutral"
    }
  ]

  const quickActions = [
    { title: "Nueva Venta", icon: ShoppingCart, variant: "gradient" as const, action: () => navigate('/sales') },
    { title: "Agregar Producto", icon: Package, variant: "business" as const, action: () => navigate('/products') },
    { title: "Ver Reportes", icon: BarChart3, variant: "secondary" as const, action: () => navigate('/reports') },
    { title: "Stock Bajo", icon: Eye, variant: "outline" as const, action: () => navigate('/products') }
  ]

  return (
    <div className="min-h-screen bg-gradient-dashboard p-6 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Resumen general de tu negocio
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card key={index} className="shadow-soft hover:shadow-elegant transition-smooth">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Acciones Rápidas</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action, index) => (
              <Card key={index} className="shadow-soft hover:shadow-elegant transition-smooth cursor-pointer" onClick={action.action}>
                <CardContent className="flex flex-col items-center justify-center p-6 space-y-3">
                  <action.icon className="h-8 w-8 text-primary" />
                  <span className="font-medium text-foreground">{action.title}</span>
                  <Button variant={action.variant} size="sm" className="w-full">
                    Ir
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-foreground">Actividad Reciente</CardTitle>
            <CardDescription>
              Últimas transacciones y movimientos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-md bg-accent/50">
                <div className="flex items-center space-x-3">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Venta #001234</p>
                    <p className="text-sm text-muted-foreground">Cliente: Juan Pérez</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-foreground">$2,450</p>
                  <p className="text-sm text-muted-foreground">Hace 2h</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-md bg-accent/50">
                <div className="flex items-center space-x-3">
                  <Package className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Producto agregado</p>
                    <p className="text-sm text-muted-foreground">Laptop HP EliteBook</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-foreground">+15 unidades</p>
                  <p className="text-sm text-muted-foreground">Hace 4h</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-md bg-accent/50">
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Nuevo usuario</p>
                    <p className="text-sm text-muted-foreground">María González - Empleado</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-foreground">Activo</p>
                  <p className="text-sm text-muted-foreground">Ayer</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard