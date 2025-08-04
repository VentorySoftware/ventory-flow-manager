import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/enhanced-button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Receipt, 
  Calendar,
  DollarSign,
  ArrowLeft,
  Printer,
  Eye
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
  sale_items: SaleItem[]
}

interface SalesPanelProps {
  refreshTrigger?: number // Para forzar refresco cuando cambie
}

const SalesPanel = ({ refreshTrigger }: SalesPanelProps) => {
  const { user } = useAuth()
  const { toast } = useToast()
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    if (user) {
      fetchUserSales()
    }
  }, [user, refreshTrigger]) // Agregar refreshTrigger como dependencia

  const fetchUserSales = async () => {
    try {
      setLoading(true)
      
      // Obtener las ventas del usuario logueado con los items
      const { data: salesData, error } = await supabase
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
              sku
            )
          )
        `)
        .order('created_at', { ascending: false })
        .limit(20) // Últimas 20 ventas

      if (error) throw error

      setSales(salesData || [])
      
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
  }

  const handleViewSale = (sale: Sale) => {
    setSelectedSale(sale)
    setShowDetails(true)
  }

  const handlePrintReceipt = (sale: Sale) => {
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
  }

  const getPaymentMethodIcon = (method: string) => {
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
  }

  const closeDetails = () => {
    setShowDetails(false)
    setSelectedSale(null)
  }

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
          {/* Lista de ventas */}
          <div className="flex-1 space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
            {sales.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Receipt className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No hay ventas registradas</p>
                <p className="text-sm">Las ventas aparecerán aquí</p>
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
                      <Calendar className="h-3 w-3" />
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

export default SalesPanel