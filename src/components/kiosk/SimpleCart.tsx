import { useState } from 'react'
import { Button } from '@/components/ui/enhanced-button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  DollarSign,
  CreditCard,
  Calculator,
  X
} from 'lucide-react'

interface Product {
  id: string
  name: string
  price: number
  stock: number
  sku: string
  unit: string
}

interface CartItem {
  product: Product
  quantity: number
}

interface SimpleCartProps {
  cart: CartItem[]
  onUpdateQuantity: (productId: string, quantity: number) => void
  onRemoveItem: (productId: string) => void
  onClear: () => void
  total: number
}

const SimpleCart = ({ cart, onUpdateQuantity, onRemoveItem, onClear, total }: SimpleCartProps) => {
  const { user } = useAuth()
  const { toast } = useToast()
  const [paymentMethod, setPaymentMethod] = useState('efectivo')
  const [receivedAmount, setReceivedAmount] = useState('')
  const [processing, setProcessing] = useState(false)

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

      // Actualizar stock de productos
      for (const item of cart) {
        const { error: stockError } = await supabase
          .from('products')
          .update({ 
            stock: item.product.stock - item.quantity 
          })
          .eq('id', item.product.id)

        if (stockError) throw stockError
      }

      toast({
        title: "¡Venta realizada!",
        description: `Venta completada por $${finalTotal.toFixed(2)}`,
      })

      // Limpiar carrito y formulario
      onClear()
      setReceivedAmount('')
      setPaymentMethod('efectivo')

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

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Carrito
          </div>
          {cart.length > 0 && (
            <Button variant="ghost" size="sm" onClick={onClear}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        {/* Items del carrito */}
        <div className="flex-1 space-y-3 max-h-64 overflow-y-auto mb-4">
          {cart.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Carrito vacío</p>
              <p className="text-sm">Agrega productos para comenzar</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.product.id} className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{item.product.name}</p>
                  <p className="text-xs text-muted-foreground">${item.product.price.toFixed(2)} c/u</p>
                </div>
                
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  
                  <span className="w-8 text-center text-sm font-medium">
                    {item.quantity}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                    disabled={item.quantity >= item.product.stock}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-destructive"
                    onClick={() => onRemoveItem(item.product.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                
                <div className="text-right min-w-0">
                  <p className="font-semibold text-sm">
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
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>IVA (21%):</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span className="text-primary">${finalTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Método de pago */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Método de Pago</label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
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
                <label className="text-sm font-medium">Monto Recibido</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={receivedAmount}
                  onChange={(e) => setReceivedAmount(e.target.value)}
                  className="text-lg"
                />
                {receivedAmount && parseFloat(receivedAmount) >= finalTotal && (
                  <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <p className="text-sm text-green-800 dark:text-green-200">
                      <Calculator className="h-4 w-4 inline mr-1" />
                      Vuelto: <span className="font-bold text-lg">${change.toFixed(2)}</span>
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Botón de cobrar */}
            <Button 
              onClick={handleSale}
              disabled={processing || (paymentMethod === 'efectivo' && (!receivedAmount || parseFloat(receivedAmount) < finalTotal))}
              className="w-full h-12 text-lg font-semibold"
              size="lg"
            >
              {processing ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  Procesando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  COBRAR ${finalTotal.toFixed(2)}
                </div>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default SimpleCart