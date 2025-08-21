import { useState, useEffect } from "react"
import { Button } from "@/components/ui/enhanced-button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import {
  Plus,
  Search,
  Eye,
  ShoppingCart,
  DollarSign,
  Calendar,
  Users,
  Receipt,
  Filter
} from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useNavigate } from "react-router-dom"
import { demoSales, demoProducts, demoCustomers } from "@/lib/demo-data"
import NewSaleForm from "@/components/sales/NewSaleForm"
import SaleDetails from "@/components/sales/SaleDetails"

interface Sale {
  id: string
  sale_number: string
  total: number
  status: string
  payment_method: string
  notes: string | null
  created_at: string
  customer_id: string | null
  seller_name?: string
  customers?: {
    name: string
    email: string | null
  }
  sale_items?: {
    id: string
    quantity: number
    unit_price: number
    subtotal: number
    products: {
      name: string
      sku: string
    }
  }[]
}

const Sales = () => {
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [isNewSaleOpen, setIsNewSaleOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const { toast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    fetchSales()
  }, [])

  const fetchSales = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          customers (
            name,
            email
          ),
          sale_items (
            id,
            quantity,
            unit_price,
            subtotal,
            products (
              name,
              sku
            )
          )
        `)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      // Get seller information for each sale
      const transformedSales = await Promise.all((data || []).map(async (sale) => {
        let sellerName = 'N/A'
        
        if (sale.seller_id) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('user_id', sale.seller_id)
            .single()
          
          sellerName = profile?.full_name || 'N/A'
        }
        
        return {
          ...sale,
          sale_number: `V${sale.id.slice(-8).toUpperCase()}`,
          seller_name: sellerName
        }
      }))
      
      setSales(transformedSales)
      
    } catch (error) {
      console.error('Error fetching sales:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las ventas",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredSales = sales.filter(sale => {
    const matchesSearch = sale.sale_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sale.customers?.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || sale.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0)
  const todaySales = sales.filter(sale => {
    const today = new Date().toDateString()
    const saleDate = new Date(sale.created_at).toDateString()
    return today === saleDate
  }).reduce((sum, sale) => sum + sale.total, 0)

  const handleViewDetails = (sale: Sale) => {
    setSelectedSale(sale)
    setIsDetailsOpen(true)
  }

  const handleNewSale = () => {
    navigate('/caja')
  }

  const handleSaleCreated = () => {
    fetchSales()
    setIsNewSaleOpen(false)
    toast({
      title: "Éxito",
      description: "Venta registrada correctamente",
    })
  }

  if (loading) {
    return (
      <div className="bg-background">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Cargando ventas...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-background">
      <div className="bg-gradient-dashboard p-2 sm:p-4 lg:p-6 animate-fade-in">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Ventas</h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                Gestiona y registra las ventas de tu negocio
              </p>
            </div>
            <Button 
              onClick={handleNewSale}
              variant="gradient" 
              size="lg"
              className="flex items-center space-x-2 w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Nueva Venta</span>
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-3 sm:gap-4 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Ventas Hoy
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  ${todaySales.toLocaleString('es-MX')}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Ingresos del día actual
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Ventas
                </CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {sales.length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Ventas registradas
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Ingresos Totales
                </CardTitle>
                <Receipt className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  ${totalSales.toLocaleString('es-MX')}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Acumulado total
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card className="shadow-soft">
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <span className="text-lg sm:text-xl">Lista de Ventas</span>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
                  <div className="relative flex-1 sm:flex-none">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar venta o cliente..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 w-full sm:w-64 lg:w-80"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-input rounded-md bg-background text-sm"
                  >
                    <option value="all">Todos los estados</option>
                    <option value="completed">Completada</option>
                    <option value="pending">Pendiente</option>
                    <option value="cancelled">Cancelada</option>
                  </select>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 sm:p-6">
              <div className="rounded-md border overflow-x-auto">
                <Table className="min-w-[800px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Número</TableHead>
                      <TableHead className="hidden sm:table-cell">Cliente</TableHead>
                      <TableHead className="hidden lg:table-cell">Vendedor</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead className="hidden md:table-cell">Estado</TableHead>
                      <TableHead className="hidden lg:table-cell">Método</TableHead>
                      <TableHead className="hidden sm:table-cell">Fecha</TableHead>
                      <TableHead className="text-right w-[80px]">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSales.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8">
                            <div className="flex flex-col items-center space-y-2">
                              <ShoppingCart className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                              <p className="text-muted-foreground text-sm sm:text-base">No se encontraron ventas</p>
                            </div>
                          </TableCell>
                        </TableRow>
                    ) : (
                      filteredSales.map((sale) => (
                        <TableRow key={sale.id} className="hover:bg-accent/50">
                          <TableCell className="font-medium text-xs sm:text-sm">{sale.sale_number}</TableCell>
                          <TableCell className="hidden sm:table-cell text-sm">{sale.customers?.name || 'Cliente General'}</TableCell>
                          <TableCell className="hidden lg:table-cell text-sm">{sale.seller_name || 'N/A'}</TableCell>
                          <TableCell className="font-semibold text-sm">
                            ${sale.total.toLocaleString('es-MX')}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Badge 
                              variant={
                                sale.status === 'completed' ? 'default' :
                                sale.status === 'pending' ? 'secondary' : 'destructive'
                              }
                              className="text-xs"
                            >
                              {sale.status === 'completed' ? 'OK' :
                               sale.status === 'pending' ? 'Pend.' : 'Cancel.'}
                            </Badge>
                          </TableCell>
                          <TableCell className="capitalize text-xs hidden lg:table-cell">{sale.payment_method}</TableCell>
                          <TableCell className="text-xs hidden sm:table-cell">
                            {new Date(sale.created_at).toLocaleDateString('es-MX')}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetails(sale)}
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span className="sr-only">Ver detalles</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* New Sale Dialog */}
      <Dialog open={isNewSaleOpen} onOpenChange={setIsNewSaleOpen}>
        <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nueva Venta</DialogTitle>
            <DialogDescription>
              Registra una nueva venta en el sistema
            </DialogDescription>
          </DialogHeader>
          <NewSaleForm 
            onSaleCreated={handleSaleCreated}
            onCancel={() => setIsNewSaleOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Sale Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-3xl w-[95vw] max-h-[90vh] overflow-y-auto">

          <DialogHeader>
            <DialogTitle>Detalles de Venta</DialogTitle>
            <DialogDescription>
              Información completa de la venta
            </DialogDescription>
          </DialogHeader>
          {selectedSale && (
            <SaleDetails 
              sale={selectedSale}
              onClose={() => setIsDetailsOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Sales