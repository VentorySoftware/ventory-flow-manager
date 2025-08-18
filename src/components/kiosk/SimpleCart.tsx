import { useState } from 'react'
import { Button } from '@/components/ui/enhanced-button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useNotificationContext } from '@/contexts/NotificationContext'
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  DollarSign,
  CreditCard,
  Calculator,
  X,
  CheckCircle,
  Printer,
  PartyPopper
} from 'lucide-react'

interface Product {
  id: string
  name: string
  price: number
  stock: number
  sku: string
  unit: string
  alert_stock: number
}

interface CartItem {
  product: Product
  quantity: number
}

interface SaleData {
  id: string
  subtotal: number
  tax: number
  total: number
  payment_method: string
  status: string
  notes?: string | null
  created_at: string
  items: Array<{
    product: Product
    quantity: number
    unit_price: number
    subtotal: number
  }>
}

interface SimpleCartProps {
  cart: CartItem[]
  onUpdateQuantity: (productId: string, quantity: number) => void
  onRemoveItem: (productId: string) => void
  onClear: () => void
  total: number
  onRefreshProducts?: () => void
  onRefreshSales?: () => void
}

const SimpleCart = ({ cart, onUpdateQuantity, onRemoveItem, onClear, total, onRefreshProducts, onRefreshSales }: SimpleCartProps) => {
  const { user } = useAuth()
  const { toast } = useToast()
  const { addNotification } = useNotificationContext()
  const [paymentMethod, setPaymentMethod] = useState('efectivo')
  const [receivedAmount, setReceivedAmount] = useState('')
  const [processing, setProcessing] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const [saleData, setSaleData] = useState<SaleData | null>(null)
  const [celebrating, setCelebrating] = useState(false)

  const tax = total * 0.21 // 21% IVA
  const finalTotal = total + tax
  const change = receivedAmount ? Math.max(0, parseFloat(receivedAmount) - finalTotal) : 0

  const handleSale = async () => {
    if (cart.length === 0) {
      toast({
        title: "Error",
        description: "El carrito está vacío",
        variant: "destructive",
      })
      return
    }

    if (paymentMethod === 'efectivo' && (!receivedAmount || parseFloat(receivedAmount) < finalTotal)) {
      toast({
        title: "Error",
        description: "El monto recibido es insuficiente",
        variant: "destructive",
      })
      return
    }

    setProcessing(true)

    try {
      // Crear la venta
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert({
          seller_id: user?.id || null,
          subtotal: total,
          tax: tax,
          total: finalTotal,
          payment_method: paymentMethod,
          status: 'completed',
          notes: paymentMethod === 'efectivo' ? `Recibido: $${receivedAmount}, Vuelto: $${change.toFixed(2)}` : null
        })
        .select()
        .single()

      if (saleError) throw saleError

      // Crear los items de la venta
      const saleItems = cart.map(item => ({
        sale_id: sale.id,
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.product.price,
        subtotal: item.product.price * item.quantity
      }))

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItems)

      if (itemsError) throw itemsError

      // Actualizar stock de productos de forma segura
      for (const item of cart) {
        // Primero obtener el stock actual
        const { data: currentProduct, error: fetchError } = await supabase
          .from('products')
          .select('stock')
          .eq('id', item.product.id)
          .single()

        if (fetchError) throw fetchError

        const newStock = currentProduct.stock - item.quantity

        if (newStock < 0) {
          throw new Error(`Stock insuficiente para ${item.product.name}`)
        }

        // Actualizar con el stock calculado correctamente
        const { error: stockError } = await supabase
          .from('products')
          .update({ 
            stock: newStock
          })
          .eq('id', item.product.id)

        if (stockError) throw stockError

        // Verificar si el stock actualizado está bajo y notificar al administrador
        if (newStock <= item.product.alert_stock) {
          addNotification({
            title: 'Stock Bajo',
            message: `El producto "${item.product.name}" tiene solo ${newStock} unidades restantes`,
            type: 'warning',
            category: 'inventory',
            actionUrl: '/products',
            actionData: { productId: item.product.id }
          })
        }
      }

      // Preparar datos de la venta completada
      const completedSale: SaleData = {
        id: sale.id,
        subtotal: sale.subtotal,
        tax: sale.tax,
        total: sale.total,
        payment_method: sale.payment_method,
        status: sale.status,
        notes: sale.notes,
        created_at: sale.created_at,
        items: cart.map(item => ({
          product: item.product,
          quantity: item.quantity,
          unit_price: item.product.price,
          subtotal: item.product.price * item.quantity
        }))
      }

      setSaleData(completedSale)
      
      // Iniciar animación de celebración
      setCelebrating(true)
      setTimeout(() => setCelebrating(false), 3000)
      
      // Mostrar resumen de venta
      setShowSummary(true)

      // Limpiar carrito y formulario
      onClear()
      setReceivedAmount('')
      setPaymentMethod('efectivo')

      // Refrescar productos para actualizar stock en tiempo real
      if (onRefreshProducts) {
        onRefreshProducts()
      }

      // Refrescar ventas para mostrar la nueva venta
      if (onRefreshSales) {
        onRefreshSales()
      }

    } catch (error: any) {
      console.error('Error processing sale:', error)
      toast({
        title: "Error",
        description: "No se pudo procesar la venta",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  const handlePrintReceipt = () => {
    if (!saleData) return

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
            <div>Fecha: ${new Date(saleData.created_at).toLocaleString('es-MX')}</div>
            <div>Venta #: ${saleData.id.slice(-8).toUpperCase()}</div>
          </div>
          
          <div class="line"></div>
          
          <div class="items">
            ${saleData.items.map(item => `
              <div class="item">
                <span>${item.product.name}</span>
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
            <span>$${saleData.subtotal.toFixed(2)}</span>
          </div>
          <div class="item">
            <span>IVA (21%):</span>
            <span>$${saleData.tax.toFixed(2)}</span>
          </div>
          <div class="item total">
            <span>TOTAL:</span>
            <span>$${saleData.total.toFixed(2)}</span>
          </div>
          
          <div class="line"></div>
          
          <div class="item">
            <span>Método de Pago:</span>
            <span>${saleData.payment_method.toUpperCase()}</span>
          </div>
          
          ${saleData.notes ? `
            <div class="item">
              <span>Notas:</span>
            </div>
            <div style="margin: 5px 0; font-size: 11px;">${saleData.notes}</div>
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

  const closeSummary = () => {
    setShowSummary(false)
    setSaleData(null)
    setCelebrating(false)
  }

  return (
    <Card className="card-responsive h-full flex flex-col">
      <CardHeader className="p-responsive pb-3">
        <CardTitle className="flex items-center justify-between text-responsive-lg">
          <div className="flex items-center gap-2 sm:gap-3">
            <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
            <span>Carrito</span>
          </div>
          {cart.length > 0 && (
            <Button variant="ghost" size="sm" onClick={onClear} className="btn-touch">
              <Trash2 className="h-4 w-4 mr-2" />
              <span className="hide-mobile">Limpiar</span>
            </Button>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-responsive">
        {/* Items del carrito */}
        <div className="flex-1 space-y-3 scroll-area-mobile mb-4">
          {cart.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <ShoppingCart className="h-16 w-16 sm:h-20 sm:w-20 mx-auto mb-4 opacity-30" />
              <p className="text-responsive-base font-medium mb-2">Carrito vacío</p>
              <p className="text-responsive-sm text-muted-foreground">Agrega productos para comenzar</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.product.id} className="flex items-center gap-3 p-3 sm:p-4 bg-muted/50 rounded-lg sm:rounded-xl">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-responsive-sm truncate mb-1">{item.product.name}</p>
                  <p className="text-responsive-xs text-muted-foreground">${item.product.price.toFixed(2)} c/u</p>
                </div>
                
                <div className="flex items-center gap-1 sm:gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 sm:h-10 sm:w-10 p-0"
                    onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                  >
                    <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                  
                  <span className="w-8 sm:w-10 text-center text-responsive-sm font-medium">
                    {item.quantity}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 sm:h-10 sm:w-10 p-0"
                    onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                    disabled={item.quantity >= item.product.stock}
                  >
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 sm:h-10 sm:w-10 p-0 text-destructive ml-1 sm:ml-2"
                    onClick={() => onRemoveItem(item.product.id)}
                  >
                    <X className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>
                
                <div className="text-right min-w-0">
                  <p className="font-semibold text-responsive-sm">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Resumen y pago */}
        {cart.length > 0 && (
          <div className="space-y-4 border-t pt-4">
            {/* Totales */}
            <div className="space-y-2">
              <div className="flex justify-between text-responsive-sm">
                <span>Subtotal:</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-responsive-sm">
                <span>IVA (21%):</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-responsive-lg">
                <span>Total:</span>
                <span className="text-primary">${finalTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Método de pago */}
            <div className="space-y-2">
              <label className="text-responsive-sm font-medium">Método de Pago</label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="input-touch">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="efectivo">💵 Efectivo</SelectItem>
                  <SelectItem value="tarjeta">💳 Tarjeta</SelectItem>
                  <SelectItem value="transferencia">🏦 Transferencia</SelectItem>
                  <SelectItem value="cheque">📄 Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Cálculo de vuelto para efectivo */}
            {paymentMethod === 'efectivo' && (
              <div className="space-y-2">
                <label className="text-responsive-sm font-medium">Monto Recibido</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={receivedAmount}
                  onChange={(e) => setReceivedAmount(e.target.value)}
                  className="input-touch text-responsive-base"
                />
                {receivedAmount && parseFloat(receivedAmount) >= finalTotal && (
                  <div className="p-3 sm:p-4 bg-green-50 dark:bg-green-950 rounded-lg sm:rounded-xl">
                    <p className="text-responsive-sm text-green-800 dark:text-green-200">
                      <Calculator className="h-4 w-4 inline mr-2" />
                      Vuelto: <span className="font-bold text-responsive-lg">${change.toFixed(2)}</span>
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Botón de cobrar */}
            <Button 
              onClick={handleSale}
              disabled={processing || (paymentMethod === 'efectivo' && (!receivedAmount || parseFloat(receivedAmount) < finalTotal))}
              className="w-full h-touch-large text-responsive-base font-semibold"
              size="lg"
            >
              {processing ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-current"></div>
                  <span>Procesando...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 sm:h-6 sm:w-6" />
                  <span>COBRAR ${finalTotal.toFixed(2)}</span>
                </div>
              )}
            </Button>
          </div>
        )}
      </CardContent>

      {/* Modal de Resumen de Venta */}
      <Dialog open={showSummary} onOpenChange={() => {}}>
        <DialogContent className="modal-responsive">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center gap-2 text-responsive-lg">
              <CheckCircle className="h-6 w-6 text-green-500" />
              ¡Venta Completada!
            </DialogTitle>
          </DialogHeader>

          {/* Animación de celebración */}
          {celebrating && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="animate-bounce absolute top-4 left-4">
                <PartyPopper className="h-8 w-8 text-yellow-500" />
              </div>
              <div className="animate-bounce absolute top-8 right-6 animation-delay-300">
                <PartyPopper className="h-6 w-6 text-blue-500" />
              </div>
              <div className="animate-bounce absolute top-16 left-1/2 animation-delay-600">
                <PartyPopper className="h-7 w-7 text-red-500" />
              </div>
              <div className="animate-bounce absolute top-6 right-16 animation-delay-900">
                <PartyPopper className="h-5 w-5 text-purple-500" />
              </div>
              <div className="animate-bounce absolute top-20 left-8 animation-delay-1200">
                <PartyPopper className="h-6 w-6 text-green-500" />
              </div>
            </div>
          )}

          <div className="space-y-6 py-4">
            {saleData && (
              <>
                {/* Información de la venta */}
                <div className="text-center space-y-2">
                  <div className="text-sm text-muted-foreground">
                    Venta #{saleData.id.slice(-8).toUpperCase()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(saleData.created_at).toLocaleString('es-MX')}
                  </div>
                </div>

                {/* Productos vendidos */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Productos:</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {saleData.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <div className="flex-1">
                          <div className="font-medium">{item.product.name}</div>
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
                    <span>${saleData.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>IVA (21%):</span>
                    <span>${saleData.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span className="text-green-600">${saleData.total.toFixed(2)}</span>
                  </div>
                </div>

                <Separator />

                {/* Información de pago */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Método de Pago:</span>
                    <span className="capitalize font-medium">{saleData.payment_method}</span>
                  </div>
                  {saleData.notes && (
                    <div className="text-sm bg-muted/50 p-2 rounded">
                      <span className="font-medium">Detalles: </span>
                      {saleData.notes}
                    </div>
                  )}
                </div>

                {/* Botones de acción */}
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={handlePrintReceipt}
                    className="flex-1 flex items-center gap-2"
                  >
                    <Printer className="h-4 w-4" />
                    Imprimir Recibo
                  </Button>
                  <Button
                    variant="default"
                    onClick={closeSummary}
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
    </Card>
  )
}

export default SimpleCart