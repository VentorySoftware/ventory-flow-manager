import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/enhanced-button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { supabase } from '@/integrations/supabase/client'
import { TrendingUp, DollarSign, BarChart3, Calendar } from 'lucide-react'

interface Sale {
  id: string
  total: number
  created_at: string
  sale_items: {
    quantity: number
    unit_price: number
    product: {
      name: string
      cost_price: number
      sku: string
    }
  }[]
}

interface ProfitData {
  product_name: string
  sku: string
  total_sold: number
  revenue: number
  cost: number
  profit: number
  margin_percentage: number
}

const ProfitAnalysis = () => {
  const [sales, setSales] = useState<Sale[]>([])
  const [profitData, setProfitData] = useState<ProfitData[]>([])
  const [period, setPeriod] = useState('today')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSalesData()
  }, [period])

  const getDateRange = () => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    switch (period) {
      case 'today':
        return { start: today, end: new Date() }
      case 'week':
        const weekStart = new Date(today)
        weekStart.setDate(today.getDate() - 7)
        return { start: weekStart, end: new Date() }
      case 'month':
        const monthStart = new Date(today)
        monthStart.setDate(today.getDate() - 30)
        return { start: monthStart, end: new Date() }
      case 'year':
        const yearStart = new Date(today)
        yearStart.setDate(today.getDate() - 365)
        return { start: yearStart, end: new Date() }
      default:
        return { start: today, end: new Date() }
    }
  }

  const fetchSalesData = async () => {
    try {
      setLoading(true)
      const { start, end } = getDateRange()

      const { data, error } = await supabase
        .from('sales')
        .select(`
          id,
          total,
          created_at,
          sale_items (
            quantity,
            unit_price,
            product:products (
              name,
              cost_price,
              sku
            )
          )
        `)
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString())
        .order('created_at', { ascending: false })

      if (error) throw error

      setSales(data || [])
      calculateProfitData(data || [])
    } catch (error) {
      console.error('Error fetching sales data:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateProfitData = (salesData: Sale[]) => {
    const productMap = new Map<string, ProfitData>()

    salesData.forEach(sale => {
      sale.sale_items.forEach(item => {
        const product = item.product
        const key = product.sku
        const revenue = item.quantity * item.unit_price
        const cost = item.quantity * (product.cost_price || 0)
        const profit = revenue - cost

        if (productMap.has(key)) {
          const existing = productMap.get(key)!
          existing.total_sold += item.quantity
          existing.revenue += revenue
          existing.cost += cost
          existing.profit += profit
          existing.margin_percentage = existing.revenue > 0 ? (existing.profit / existing.revenue) * 100 : 0
        } else {
          productMap.set(key, {
            product_name: product.name,
            sku: product.sku,
            total_sold: item.quantity,
            revenue,
            cost,
            profit,
            margin_percentage: revenue > 0 ? (profit / revenue) * 100 : 0
          })
        }
      })
    })

    const sortedData = Array.from(productMap.values())
      .sort((a, b) => b.profit - a.profit)
    
    setProfitData(sortedData)
  }

  const totals = profitData.reduce((acc, item) => ({
    revenue: acc.revenue + item.revenue,
    cost: acc.cost + item.cost,
    profit: acc.profit + item.profit
  }), { revenue: 0, cost: 0, profit: 0 })

  const overallMargin = totals.revenue > 0 ? (totals.profit / totals.revenue) * 100 : 0

  const getPeriodLabel = () => {
    switch (period) {
      case 'today': return 'Hoy'
      case 'week': return 'Últimos 7 días'
      case 'month': return 'Últimos 30 días'
      case 'year': return 'Último año'
      default: return 'Período'
    }
  }

  const getMarginBadge = (margin: number) => {
    if (margin >= 50) return <Badge className="bg-green-500">Excelente</Badge>
    if (margin >= 30) return <Badge className="bg-blue-500">Bueno</Badge>
    if (margin >= 15) return <Badge className="bg-yellow-500">Regular</Badge>
    if (margin >= 0) return <Badge className="bg-orange-500">Bajo</Badge>
    return <Badge variant="destructive">Pérdida</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Análisis de Ganancias</h2>
          <p className="text-muted-foreground">Rentabilidad por producto - {getPeriodLabel()}</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Hoy</SelectItem>
            <SelectItem value="week">7 días</SelectItem>
            <SelectItem value="month">30 días</SelectItem>
            <SelectItem value="year">1 año</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ingresos</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${totals.revenue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Costos</CardTitle>
            <BarChart3 className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${totals.cost.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ganancia</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ${totals.profit.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Margen</CardTitle>
            <Calendar className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {overallMargin.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profit Table */}
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle>Rentabilidad por Producto</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Calculando ganancias...</p>
            </div>
          ) : profitData.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No hay datos de ventas para el período seleccionado</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Vendido</TableHead>
                  <TableHead className="text-right">Ingresos</TableHead>
                  <TableHead className="text-right">Costos</TableHead>
                  <TableHead className="text-right">Ganancia</TableHead>
                  <TableHead className="text-right">Margen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profitData.map((item, index) => (
                  <TableRow key={item.sku}>
                    <TableCell className="font-medium">{item.product_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.sku}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {item.total_sold}
                    </TableCell>
                    <TableCell className="text-right font-mono text-green-600">
                      ${item.revenue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-right font-mono text-red-600">
                      ${item.cost.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-right font-mono text-blue-600">
                      ${item.profit.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-right">
                      {getMarginBadge(item.margin_percentage)}
                      <div className="text-xs text-muted-foreground mt-1">
                        {item.margin_percentage.toFixed(1)}%
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default ProfitAnalysis