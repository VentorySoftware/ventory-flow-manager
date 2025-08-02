import { useState, useEffect } from "react"
import { Button } from "@/components/ui/enhanced-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Minus, Search, X } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { demoProducts, demoCustomers } from "@/lib/demo-data"

interface Product {
  id: string
  name: string
  sku: string
  price: number
  stock: number
  unit: string
}

interface Customer {
  id: string
  name: string
  email: string | null
}

interface SaleItem {
  productId: string
  productName: string
  sku: string
  price: number
  quantity: number
  subtotal: number
  availableStock: number
}

interface NewSaleFormProps {
  onSaleCreated: () => void
  onCancel: () => void
}

const NewSaleForm = ({ onSaleCreated, onCancel }: NewSaleFormProps) => {
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [saleItems, setSaleItems] = useState<SaleItem[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<string>("")
  const [paymentMethod, setPaymentMethod] = useState<string>("efectivo")
  const [notes, setNotes] = useState<string>("")
  const [productSearch, setProductSearch] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const { toast } = useToast()

  useEffect(() => {
    fetchProducts()
    fetchCustomers()
  }, [])

  useEffect(() => {
    if (productSearch.trim()) {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        product.sku.toLowerCase().includes(productSearch.toLowerCase())
      )
      setSearchResults(filtered.slice(0, 5))
    } else {
      setSearchResults([])
    }
  }, [productSearch, products])

  const fetchProducts = async () => {
    try {
      // Use demo data for now
      setProducts(demoProducts as any)
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const fetchCustomers = async () => {
    try {
      // Use demo data for now
      setCustomers(demoCustomers as any)
    } catch (error) {
      console.error('Error fetching customers:', error)
    }
  }

  const addProductToSale = (product: Product) => {
    const existingItem = saleItems.find(item => item.productId === product.id)
    
    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        updateQuantity(product.id, existingItem.quantity + 1)
      } else {
        toast({
          title: "Stock insuficiente",
          description: `No hay suficiente stock para ${product.name}`,
          variant: "destructive",
        })
      }
    } else {
      const newItem: SaleItem = {
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        price: product.price,
        quantity: 1,
        subtotal: product.price,
        availableStock: product.stock
      }
      setSaleItems([...saleItems, newItem])
    }
    setProductSearch("")
    setSearchResults([])
  }

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(productId)
      return
    }

    setSaleItems(items =>
      items.map(item =>
        item.productId === productId
          ? { ...item, quantity: newQuantity, subtotal: item.price * newQuantity }
          : item
      )
    )
  }

  const removeItem = (productId: string) => {
    setSaleItems(items => items.filter(item => item.productId !== productId))
  }

  const calculateTotals = () => {
    const subtotal = saleItems.reduce((sum, item) => sum + item.subtotal, 0)
    const tax = subtotal * 0.16 // 16% IVA
    const total = subtotal + tax
    return { subtotal, tax, total }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (saleItems.length === 0) {
      toast({
        title: "Error",
        description: "Debe agregar al menos un producto",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    
    try {
      const { subtotal, tax, total } = calculateTotals()
      
      // Crear la venta
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert({
          customer_id: selectedCustomer || null,
          subtotal,
          tax,
          total,
          payment_method: paymentMethod,
          notes: notes || null,
          status: 'completed'
        })
        .select()
        .single()

      if (saleError) throw saleError

      // Crear los items de venta
      const saleItemsData = saleItems.map(item => ({
        sale_id: sale.id,
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: item.price,
        subtotal: item.subtotal
      }))

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItemsData)

      if (itemsError) throw itemsError

      onSaleCreated()
      
    } catch (error) {
      console.error('Error creating sale:', error)
      toast({
        title: "Error",
        description: "No se pudo registrar la venta",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const { subtotal, tax, total } = calculateTotals()

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer Selection */}
      <div className="space-y-2">
        <Label htmlFor="customer">Cliente (Opcional)</Label>
        <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar cliente o venta general" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Cliente General</SelectItem>
            {customers.map(customer => (
              <SelectItem key={customer.id} value={customer.id}>
                {customer.name} {customer.email && `(${customer.email})`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Product Search */}
      <div className="space-y-2">
        <Label>Agregar Productos</Label>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar productos por nombre o SKU..."
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            className="pl-8"
          />
          {searchResults.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-lg">
              {searchResults.map(product => (
                <div
                  key={product.id}
                  className="p-3 hover:bg-accent cursor-pointer border-b last:border-b-0"
                  onClick={() => addProductToSale(product)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        SKU: {product.sku} • Stock: {product.stock} {product.unit}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${product.price}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sale Items */}
      {saleItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Productos en la Venta</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Subtotal</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {saleItems.map((item) => (
                  <TableRow key={item.productId}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
                        <Badge variant="outline" className="text-xs">
                          Stock: {item.availableStock}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>${item.price}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          disabled={item.quantity >= item.availableStock}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">${item.subtotal.toFixed(2)}</TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.productId)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Payment Method */}
      <div className="space-y-2">
        <Label htmlFor="payment">Método de Pago</Label>
        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="efectivo">Efectivo</SelectItem>
            <SelectItem value="tarjeta">Tarjeta</SelectItem>
            <SelectItem value="transferencia">Transferencia</SelectItem>
            <SelectItem value="cheque">Cheque</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notas (Opcional)</Label>
        <Textarea
          id="notes"
          placeholder="Notas adicionales sobre la venta..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </div>

      {/* Total Summary */}
      {saleItems.length > 0 && (
        <Card className="bg-accent/20">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>IVA (16%):</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button 
          type="submit" 
          variant="gradient" 
          disabled={loading || saleItems.length === 0}
        >
          {loading ? "Procesando..." : "Registrar Venta"}
        </Button>
      </div>
    </form>
  )
}

export default NewSaleForm