import { useState, useEffect, useMemo, useCallback } from 'react'
import { Button } from '@/components/ui/enhanced-button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import { format, startOfDay, endOfDay } from 'date-fns'
import { 
  Receipt, 
  Calendar as CalendarIcon,
  DollarSign,
  Filter,
  Printer,
  Search,
  X
} from 'lucide-react'

interface SaleItem {
  id: string
  product_id: string
  quantity: number
  unit_price: number
  subtotal: number
  products: {
    name: string
    sku: string
    category_id: string | null
    categories?: {
      id: string
      name: string
    } | null
  }
}

interface Sale {
  id: string
  subtotal: number
  tax: number
  total: number
  payment_method: string
  status: string
  notes?: string | null
  created_at: string
  seller_name?: string
  sale_items: SaleItem[]
}

interface Category {
  id: string
  name: string
}

interface MySalesProps {
  refreshTrigger?: number
}

const MySales = ({ refreshTrigger }: MySalesProps) => {
  const { user } = useAuth()
  const { toast } = useToast()
  const [sales, setSales] = useState<Sale[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  
  // Filtros
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')
  const [singleDate, setSingleDate] = useState<Date | undefined>()
  const [dateFrom, setDateFrom] = useState<Date | undefined>()
  const [dateTo, setDateTo] = useState<Date | undefined>()
  const [searchTerm, setSearchTerm] = useState('')

  // Optimized useEffect - only fetch categories once
  useEffect(() => {
    if (user) {
      fetchCategories()
    }
  }, [user])

  // Separate useEffect for initial sales fetch
  useEffect(() => {
    if (user) {
      fetchUserSales()
    }
  }, [user, refreshTrigger])

  // Optimized fetchCategories with useCallback
  const fetchCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }, [])

  // Optimized fetchUserSales with useCallback
  const fetchUserSales = useCallback(async () => {
    try {
      setLoading(true)
      
      let query = supabase
        .from('sales')
        .select(`
          id,
          subtotal,
          tax,
          total,
          payment_method,
          status,
          notes,
          created_at,
          sale_items (
            id,
            product_id,
            quantity,
            unit_price,
            subtotal,
            products (
              name,
              sku,
              category_id,
              categories (
                id,
                name
              )
            )
          )
        `)
        .order('created_at', { ascending: false })

      // Aplicar filtros de fecha
      if (singleDate) {
        const startDate = startOfDay(singleDate).toISOString()
        const endDate = endOfDay(singleDate).toISOString()
        query = query.gte('created_at', startDate).lte('created_at', endDate)
      } else if (dateFrom || dateTo) {
        if (dateFrom) {
          query = query.gte('created_at', startOfDay(dateFrom).toISOString())
        }
        if (dateTo) {
          query = query.lte('created_at', endOfDay(dateTo).toISOString())
        }
      }

      const { data: salesData, error } = await query

      if (error) throw error

      let filteredSales = salesData || []

      // Filtrar por categoría si está seleccionada
      if (selectedCategoryId) {
        filteredSales = filteredSales.filter(sale =>
          sale.sale_items.some(item => 
            item.products.category_id === selectedCategoryId
          )
        )
      }

      // Filtrar por término de búsqueda
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        filteredSales = filteredSales.filter(sale =>
          sale.id.toLowerCase().includes(searchLower) ||
          sale.sale_items.some(item => 
            item.products.name.toLowerCase().includes(searchLower) ||
            item.products.sku.toLowerCase().includes(searchLower)
          )
        )
      }

      setSales(filteredSales)
      
    } catch (error: any) {
      console.error('Error fetching sales:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las ventas",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [selectedCategoryId, singleDate, dateFrom, dateTo, searchTerm])

  // Trigger filter-based refetch when filters change
  useEffect(() => {
    if (user) {
      fetchUserSales()
    }
  }, [fetchUserSales, user])

  // Optimized handlers with useCallback
  const handleViewSale = useCallback((sale: Sale) => {
    setSelectedSale(sale)
    setShowDetails(true)
  }, [])

  const handlePrintReceipt = useCallback((sale: Sale) => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Recibo de Venta</title>
          <style>
            body { 
              font-family: 'Courier New', monospace; 
              margin: 20px; 
              max-width: 300px; 
              font-size: 12px; 
              line-height: 1.4;
            }
            .header { text-align: center; margin-bottom: 20px; }
            .title { font-size: 16px; font-weight: bold; }
            .line { border-bottom: 1px dashed #000; margin: 10px 0; }
            .item { display: flex; justify-content: space-between; margin: 5px 0; }
            .total { font-weight: bold; font-size: 14px; }
            .footer { text-align: center; margin-top: 20px; font-size: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">VENTORY MANAGER</div>
            <div>Sistema de Gestión</div>
            <div>Fecha: ${new Date(sale.created_at).toLocaleString('es-MX')}</div>
            <div>Venta #: ${sale.id.slice(-8).toUpperCase()}</div>
          </div>
          
          <div class="line"></div>
          
          <div class="items">
            ${sale.sale_items.map(item => `
              <div class="item">
                <span>${item.products.name}</span>
              </div>
              <div class="item">
                <span>${item.quantity} x $${item.unit_price.toFixed(2)}</span>
                <span>$${item.subtotal.toFixed(2)}</span>
              </div>
            `).join('')}
          </div>
          
          <div class="line"></div>
          
          <div class="item">
            <span>Subtotal:</span>
            <span>$${sale.subtotal.toFixed(2)}</span>
          </div>
          <div class="item">
            <span>IVA (21%):</span>
            <span>$${sale.tax.toFixed(2)}</span>
          </div>
          <div class="item total">
            <span>TOTAL:</span>
            <span>$${sale.total.toFixed(2)}</span>
          </div>
          
          <div class="line"></div>
          
          <div class="item">
            <span>Método de Pago:</span>
            <span>${sale.payment_method.toUpperCase()}</span>
          </div>
          
          ${sale.notes ? `
            <div class="item">
              <span>Notas:</span>
            </div>
            <div style="margin: 5px 0; font-size: 11px;">${sale.notes}</div>
          ` : ''}
          
          <div class="footer">
            <div>¡Gracias por su compra!</div>
            <div>Powered by Ventory Manager</div>
          </div>
        </body>
      </html>
    `

    printWindow.document.write(receiptHTML)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
  }, [])

  const getPaymentMethodIcon = useCallback((method: string) => {
    switch (method) {
      case 'efectivo':
        return '💵'
      case 'tarjeta':
        return '💳'
      case 'transferencia':
        return '🏦'
      case 'cheque':
        return '📄'
      default:
        return '💰'
    }
  }, [])

  const closeDetails = useCallback(() => {
    setShowDetails(false)
    setSelectedSale(null)
  }, [])

  const clearAllFilters = useCallback(() => {
    setSelectedCategoryId('')
    setSingleDate(undefined)
    setDateFrom(undefined)
    setDateTo(undefined)
    setSearchTerm('')
  }, [])

  // Memoized calculations to prevent unnecessary re-renders
  const hasActiveFilters = useMemo(() => {
    return !!(selectedCategoryId || singleDate || dateFrom || dateTo || searchTerm)
  }, [selectedCategoryId, singleDate, dateFrom, dateTo, searchTerm])

  if (loading) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Mis Ventas
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Mis Ventas
            </div>
            <Badge variant="secondary">{sales.length}</Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col">
          {/* Filtros */}
          <div className="space-y-4 mb-4 p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span className="text-sm font-medium">Filtros</span>
              </div>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                  <X className="h-3 w-3" />
                  Limpiar
                </Button>
              )}
            </div>

            {/* Búsqueda */}
            <div className="space-y-2">
              <Label className="text-xs">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                <Input
                  placeholder="ID venta, producto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-7 h-8 text-sm"
                />
              </div>
            </div>

            {/* Categoría */}
            <div className="space-y-2">
              <Label className="text-xs">Categoría</Label>
              <Select value={selectedCategoryId || "all"} onValueChange={(value) => setSelectedCategoryId(value === "all" ? "" : value)}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-1 gap-2">
              {/* Fecha específica */}
              <div className="space-y-2">
                <Label className="text-xs">Fecha específica</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal h-8 text-sm",
                        !singleDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-3 w-3" />
                      {singleDate ? format(singleDate, "dd/MM/yyyy") : "Seleccionar día"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={singleDate}
                      onSelect={(date) => {
                        setSingleDate(date)
                        if (date) {
                          setDateFrom(undefined)
                          setDateTo(undefined)
                        }
                      }}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                {singleDate && (
                  <Button variant="ghost" size="sm" onClick={() => setSingleDate(undefined)} className="w-full h-6 text-xs">
                    Limpiar fecha
                  </Button>
                )}
              </div>

              {/* Rango de fechas */}
              <div className="space-y-2">
                <Label className="text-xs">Rango de fechas</Label>
                <div className="grid grid-cols-2 gap-1">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal h-8 text-xs",
                          !dateFrom && "text-muted-foreground"
                        )}
                        disabled={!!singleDate}
                      >
                        {dateFrom ? format(dateFrom, "dd/MM") : "Desde"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateFrom}
                        onSelect={setDateFrom}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal h-8 text-xs",
                          !dateTo && "text-muted-foreground"
                        )}
                        disabled={!!singleDate}
                      >
                        {dateTo ? format(dateTo, "dd/MM") : "Hasta"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateTo}
                        onSelect={setDateTo}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                {(dateFrom || dateTo) && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setDateFrom(undefined)
                      setDateTo(undefined)
                    }} 
                    className="w-full h-6 text-xs"
                  >
                    Limpiar rango
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Lista de ventas */}
          <div className="flex-1 space-y-3 max-h-[calc(100vh-450px)] overflow-y-auto">
            {sales.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Receipt className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No se encontraron ventas</p>
                <p className="text-sm">
                  {hasActiveFilters ? "Intenta ajustar los filtros" : "Las ventas aparecerán aquí"}
                </p>
              </div>
            ) : (
              sales.map((sale) => (
                <div 
                  key={sale.id} 
                  className="p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted/70 transition-colors"
                  onClick={() => handleViewSale(sale)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="text-xs font-mono text-muted-foreground">
                        #{sale.id.slice(-6).toUpperCase()}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {getPaymentMethodIcon(sale.payment_method)} {sale.payment_method}
                      </Badge>
                    </div>
                    <div className="text-sm font-semibold text-green-600">
                      ${sale.total.toFixed(2)}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="h-3 w-3" />
                      {new Date(sale.created_at).toLocaleDateString('es-MX')}
                    </div>
                    <div>
                      {sale.sale_items.length} {sale.sale_items.length === 1 ? 'producto' : 'productos'}
                    </div>
                  </div>

                  <div className="mt-2 text-xs text-muted-foreground">
                    {sale.sale_items.slice(0, 2).map((item, index) => (
                      <div key={index}>
                        {item.quantity}x {item.products.name}
                      </div>
                    ))}
                    {sale.sale_items.length > 2 && (
                      <div>... y {sale.sale_items.length - 2} más</div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Detalles de Venta */}
      <Dialog open={showDetails} onOpenChange={() => {}}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Detalles de Venta
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {selectedSale && (
              <>
                {/* Información de la venta */}
                <div className="text-center space-y-2">
                  <div className="text-sm text-muted-foreground">
                    Venta #{selectedSale.id.slice(-8).toUpperCase()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(selectedSale.created_at).toLocaleString('es-MX')}
                  </div>
                  <Badge variant="outline" className="flex items-center gap-1 w-fit mx-auto">
                    {getPaymentMethodIcon(selectedSale.payment_method)}
                    <span className="capitalize">{selectedSale.payment_method}</span>
                  </Badge>
                </div>

                {/* Productos vendidos */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Productos:</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {selectedSale.sale_items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <div className="flex-1">
                          <div className="font-medium">{item.products.name}</div>
                          <div className="text-muted-foreground text-xs">
                            {item.quantity} x ${item.unit_price.toFixed(2)}
                          </div>
                        </div>
                        <div className="font-semibold">
                          ${item.subtotal.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Totales */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>${selectedSale.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>IVA (21%):</span>
                    <span>${selectedSale.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span className="text-green-600">${selectedSale.total.toFixed(2)}</span>
                  </div>
                </div>

                {selectedSale.notes && (
                  <>
                    <Separator />
                    <div className="text-sm bg-muted/50 p-2 rounded">
                      <span className="font-medium">Detalles: </span>
                      {selectedSale.notes}
                    </div>
                  </>
                )}

                {/* Botones de acción */}
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => handlePrintReceipt(selectedSale)}
                    className="flex-1 flex items-center gap-2"
                  >
                    <Printer className="h-4 w-4" />
                    Imprimir
                  </Button>
                  <Button
                    variant="default"
                    onClick={closeDetails}
                    className="flex-1"
                  >
                    Cerrar
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default MySales