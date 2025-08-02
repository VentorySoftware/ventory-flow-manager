import { useState, useEffect } from "react"
import { Button } from "@/components/ui/enhanced-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Package, ShoppingCart, Users, Eye, BarChart3 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { demoSales } from "@/lib/demo-data"

const Dashboard = () => {
  const navigate = useNavigate()
  const [dashboardData, setDashboardData] = useState({
    todaySales: 0,
    totalProducts: 0,
    totalSales: 0,
    lowStockProducts: 0,
    totalSalesAmount: 0,
    recentSales: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch today's sales
      const today = new Date().toISOString().split('T')[0]
      const { data: todaySalesData, error: salesError } = await supabase
        .from('sales')
        .select('total')
        .gte('created_at', `${today}T00:00:00`)
        .lte('created_at', `${today}T23:59:59`)
      
      if (salesError) throw salesError
      
      const todaySales = todaySalesData?.reduce((sum, sale) => sum + sale.total, 0) || 0

      // Fetch total products and low stock
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('stock')
      
      if (productsError) throw productsError
      
      const totalProducts = productsData?.length || 0
      const lowStockProducts = productsData?.filter(product => product.stock < 10).length || 0

      // Fetch all sales for total amount and count
      const { data: allSalesData, error: allSalesError } = await supabase
        .from('sales')
        .select('total')
      
      if (allSalesError) throw allSalesError
      
      const totalSalesAmount = allSalesData?.reduce((sum, sale) => sum + sale.total, 0) || 0
      const totalSales = allSalesData?.length || 0

      // Fetch recent sales
      const { data: recentSalesData, error: recentSalesError } = await supabase
        .from('sales')
        .select(`
          *,
          customers (
            name,
            email
          )
        `)
        .order('created_at', { ascending: false })
        .limit(3)
      
      if (recentSalesError) throw recentSalesError

      const recentSales = recentSalesData?.map(sale => ({
        ...sale,
        sale_number: `V${sale.id.slice(-8).toUpperCase()}`
      })) || []

      setDashboardData({
        todaySales,
        totalProducts,
        totalSales,
        lowStockProducts,
        totalSalesAmount,
        recentSales
      })
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const stats = [
    {
      title: "Ventas Hoy",
      value: `$${dashboardData.todaySales.toLocaleString('es-MX')}`,
      description: "Ingresos del día actual",
      icon: ShoppingCart,
      trend: "up"
    },
    {
      title: "Productos en Stock",
      value: dashboardData.totalProducts.toString(),
      description: `${dashboardData.lowStockProducts} productos con stock bajo`,
      icon: Package,
      trend: dashboardData.lowStockProducts > 0 ? "warning" : "neutral"
    },
    {
      title: "Total de Ventas",
      value: `$${dashboardData.totalSalesAmount.toLocaleString('es-MX')}`,
      description: `${dashboardData.totalSales} ventas registradas`,
      icon: TrendingUp,
      trend: "up"
    },
    {
      title: "Sistema Activo",
      value: "✓",
      description: "Todos los módulos funcionando",
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dashboard p-6 animate-fade-in">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Cargando dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

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
              {dashboardData.recentSales.length > 0 ? (
                dashboardData.recentSales.map((sale: any) => (
                  <div key={sale.id} className="flex items-center justify-between p-3 rounded-md bg-accent/50">
                    <div className="flex items-center space-x-3">
                      <ShoppingCart className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium text-foreground">Venta {sale.sale_number}</p>
                        <p className="text-sm text-muted-foreground">
                          Cliente: {sale.customers?.name || 'Cliente General'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-foreground">${sale.total.toLocaleString('es-MX')}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(sale.created_at).toLocaleDateString('es-MX')}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No hay ventas recientes</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => navigate('/sales')}
                  >
                    Crear primera venta
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard