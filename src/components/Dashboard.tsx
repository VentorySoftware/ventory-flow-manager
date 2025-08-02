import { useState, useEffect } from "react"
import { Button } from "@/components/ui/enhanced-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, Package, ShoppingCart, Users, Eye, BarChart3, AlertTriangle, DollarSign, Calendar } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"

const Dashboard = () => {
  const navigate = useNavigate()
  const [dashboardData, setDashboardData] = useState({
    todaySales: 0,
    totalProducts: 0,
    totalSales: 0,
    totalCustomers: 0,
    lowStockProducts: 0,
    totalSalesAmount: 0,
    recentSales: [],
    topProducts: [],
    salesChart: [],
    stockChart: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Today's sales
      const today = new Date().toISOString().split('T')[0]
      const { data: todaySalesData } = await supabase
        .from('sales')
        .select('total')
        .gte('created_at', `${today}T00:00:00`)
        .lte('created_at', `${today}T23:59:59`)
      
      const todaySales = todaySalesData?.reduce((sum, sale) => sum + sale.total, 0) || 0

      // Products data
      const { data: productsData } = await supabase
        .from('products')
        .select('stock, price, name')
      
      const totalProducts = productsData?.length || 0
      const lowStockProducts = productsData?.filter(product => product.stock <= 10).length || 0

      // Sales data
      const { data: allSalesData } = await supabase
        .from('sales')
        .select('total, created_at')
      
      const totalSalesAmount = allSalesData?.reduce((sum, sale) => sum + sale.total, 0) || 0
      const totalSales = allSalesData?.length || 0

      // Customers count
      const { data: customersData } = await supabase
        .from('customers')
        .select('id')
      
      const totalCustomers = customersData?.length || 0

      // Recent sales with customer info
      const { data: recentSalesData } = await supabase
        .from('sales')
        .select(`
          *,
          customers (
            name,
            email
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5)

      const recentSales = recentSalesData?.map(sale => ({
        ...sale,
        sale_number: `V${sale.id.slice(-8).toUpperCase()}`
      })) || []

      // Top products by stock value
      const topProducts = productsData
        ?.map(product => ({
          name: product.name,
          value: product.stock * product.price,
          stock: product.stock
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5) || []

      // Sales chart data (last 7 days)
      const salesChart = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        
        const daySales = allSalesData?.filter(sale => 
          sale.created_at.split('T')[0] === dateStr
        ).reduce((sum, sale) => sum + sale.total, 0) || 0
        
        salesChart.push({
          date: date.toLocaleDateString('es-MX', { weekday: 'short' }),
          sales: daySales
        })
      }

      // Stock status chart
      const stockChart = [
        { name: 'Stock Normal', value: productsData?.filter(p => p.stock > 10).length || 0, color: '#22c55e' },
        { name: 'Stock Bajo', value: productsData?.filter(p => p.stock > 0 && p.stock <= 10).length || 0, color: '#f59e0b' },
        { name: 'Agotado', value: productsData?.filter(p => p.stock === 0).length || 0, color: '#ef4444' }
      ]

      setDashboardData({
        todaySales,
        totalProducts,
        totalSales,
        totalCustomers,
        lowStockProducts,
        totalSalesAmount,
        recentSales,
        topProducts,
        salesChart,
        stockChart
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
      color: "text-green-500",
      change: "+12.5%"
    },
    {
      title: "Total Productos",
      value: dashboardData.totalProducts.toString(),
      description: "Productos en inventario",
      icon: Package,
      color: "text-blue-500",
      change: "+2.1%"
    },
    {
      title: "Ventas Totales",
      value: dashboardData.totalSales.toString(),
      description: "Ventas registradas",
      icon: BarChart3,
      color: "text-purple-500",
      change: "+8.3%"
    },
    {
      title: "Stock Bajo",
      value: dashboardData.lowStockProducts.toString(),
      description: "Productos críticos",
      icon: AlertTriangle,
      color: "text-orange-500",
      change: "-5.2%"
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dashboard p-6 animate-fade-in">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Cargando dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-dashboard p-6 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Welcome Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Resumen general de tu negocio - {new Date().toLocaleDateString('es-MX', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card key={index} className="shadow-elegant hover-scale transition-smooth">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="flex items-center space-x-2 text-xs">
                  <span className="text-muted-foreground">{stat.description}</span>
                  <Badge variant="outline" className="text-xs">
                    {stat.change}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 md:grid-cols-2">
          
          {/* Sales Chart */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span>Ventas Últimos 7 Días</span>
              </CardTitle>
              <CardDescription>
                Tendencia de ventas diarias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={dashboardData.salesChart}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    formatter={(value) => [`$${value.toLocaleString('es-MX')}`, 'Ventas']}
                    labelFormatter={(label) => `Día: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Stock Status Chart */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-primary" />
                <span>Estado del Inventario</span>
              </CardTitle>
              <CardDescription>
                Distribución del stock por estado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={dashboardData.stockChart}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {dashboardData.stockChart.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Top Products */}
        <div className="grid gap-6 md:grid-cols-2">
          
          {/* Recent Sales */}
          <Card className="shadow-elegant">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  <span>Ventas Recientes</span>
                </CardTitle>
                <CardDescription>
                  Últimas transacciones realizadas
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/sales')}
              >
                <Eye className="h-4 w-4 mr-2" />
                Ver todas
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {dashboardData.recentSales.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No hay ventas recientes</p>
                </div>
              ) : (
                dashboardData.recentSales.map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div className="space-y-1">
                      <p className="font-medium text-sm">{sale.sale_number}</p>
                      <p className="text-xs text-muted-foreground">
                        {sale.customers?.name || 'Cliente General'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(sale.created_at).toLocaleDateString('es-MX')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">
                        ${sale.total.toLocaleString('es-MX')}
                      </p>
                      <Badge variant={sale.status === 'completed' ? 'default' : 'secondary'}>
                        {sale.status === 'completed' ? 'Completada' : 'Pendiente'}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card className="shadow-elegant">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5 text-primary" />
                  <span>Productos Top</span>
                </CardTitle>
                <CardDescription>
                  Mayor valor en inventario
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/products')}
              >
                <Eye className="h-4 w-4 mr-2" />
                Ver todos
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {dashboardData.topProducts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No hay productos registrados</p>
                </div>
              ) : (
                dashboardData.topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div className="space-y-1">
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Stock: {product.stock} unidades
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">
                        ${product.value.toLocaleString('es-MX')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Valor total
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>
              Tareas más frecuentes del sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <Button 
                variant="outline" 
                className="h-20 flex-col space-y-2"
                onClick={() => navigate('/sales')}
              >
                <ShoppingCart className="h-6 w-6" />
                <span>Nueva Venta</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col space-y-2"
                onClick={() => navigate('/products')}
              >
                <Package className="h-6 w-6" />
                <span>Agregar Producto</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col space-y-2"
                onClick={() => navigate('/users')}
              >
                <Users className="h-6 w-6" />
                <span>Gestionar Usuarios</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col space-y-2"
                onClick={() => navigate('/products')}
              >
                <BarChart3 className="h-6 w-6" />
                <span>Ver Reportes</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard