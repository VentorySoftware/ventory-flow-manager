import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/enhanced-button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import ProductGrid from '@/components/kiosk/ProductGrid'
import SimpleCart from '@/components/kiosk/SimpleCart'
import { CategoryFilter } from '@/components/kiosk/CategoryFilter'
import { 
  Search, 
  ShoppingCart, 
  Package, 
  Calculator,
  X
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface Product {
  id: string
  name: string
  price: number
  stock: number
  sku: string
  unit: string
  alert_stock: number
  is_active: boolean
  category_id: string | null
  image_urls: string[]
  primary_image_url: string | null
}

interface CartItem {
  product: Product
  quantity: number
}

const KioskView = () => {
  const { user, hasRole } = useAuth()
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>()
  const [showCalculator, setShowCalculator] = useState(false)
  const [calculatorDisplay, setCalculatorDisplay] = useState('0')
  const [calculatorPrevValue, setCalculatorPrevValue] = useState('')
  const [calculatorOperation, setCalculatorOperation] = useState('')
  const [waitingForNext, setWaitingForNext] = useState(false)
  const [salesRefreshTrigger, setSalesRefreshTrigger] = useState(0)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name
          )
        `)
        .gt('stock', 0)
        .order('name')

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const addToCart = (product: Product, quantity: number = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id)
      
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity
        if (newQuantity > product.stock) {
          toast({
            title: "Stock insuficiente",
            description: `Solo hay ${product.stock} unidades disponibles`,
            variant: "destructive",
          })
          return prevCart
        }
        return prevCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: newQuantity }
            : item
        )
      } else {
        if (quantity > product.stock) {
          toast({
            title: "Stock insuficiente",
            description: `Solo hay ${product.stock} unidades disponibles`,
            variant: "destructive",
          })
          return prevCart
        }
        return [...prevCart, { product, quantity }]
      }
    })
  }

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId))
  }

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }

    setCart(prevCart => 
      prevCart.map(item => {
        if (item.product.id === productId) {
          if (quantity > item.product.stock) {
            toast({
              title: "Stock insuficiente",
              description: `Solo hay ${item.product.stock} unidades disponibles`,
              variant: "destructive",
            })
            return item
          }
          return { ...item, quantity }
        }
        return item
      })
    )
  }

  const clearCart = () => {
    setCart([])
  }

  const refreshSales = () => {
    setSalesRefreshTrigger(prev => prev + 1)
  }

  // Funciones de la calculadora
  const handleCalculatorInput = (value: string) => {
    if (waitingForNext) {
      setCalculatorDisplay(value)
      setWaitingForNext(false)
    } else {
      setCalculatorDisplay(calculatorDisplay === '0' ? value : calculatorDisplay + value)
    }
  }

  const handleCalculatorOperation = (nextOperation: string) => {
    const inputValue = parseFloat(calculatorDisplay)

    if (calculatorPrevValue === '') {
      setCalculatorPrevValue(calculatorDisplay)
    } else if (calculatorOperation) {
      const currentValue = parseFloat(calculatorPrevValue)
      let result = currentValue

      switch (calculatorOperation) {
        case '+':
          result = currentValue + inputValue
          break
        case '-':
          result = currentValue - inputValue
          break
        case '*':
          result = currentValue * inputValue
          break
        case '/':
          result = currentValue / inputValue
          break
        default:
          return
      }

      setCalculatorDisplay(String(result))
      setCalculatorPrevValue(String(result))
    }

    setWaitingForNext(true)
    setCalculatorOperation(nextOperation)
  }

  const handleCalculatorEquals = () => {
    const inputValue = parseFloat(calculatorDisplay)
    const currentValue = parseFloat(calculatorPrevValue)

    if (calculatorPrevValue !== '' && calculatorOperation) {
      let result = currentValue

      switch (calculatorOperation) {
        case '+':
          result = currentValue + inputValue
          break
        case '-':
          result = currentValue - inputValue
          break
        case '*':
          result = currentValue * inputValue
          break
        case '/':
          result = currentValue / inputValue
          break
        default:
          return
      }

      setCalculatorDisplay(String(result))
      setCalculatorPrevValue('')
      setCalculatorOperation('')
      setWaitingForNext(true)
    }
  }

  const handleCalculatorClear = () => {
    setCalculatorDisplay('0')
    setCalculatorPrevValue('')
    setCalculatorOperation('')
    setWaitingForNext(false)
  }

  const copyCalculatorResult = () => {
    navigator.clipboard.writeText(calculatorDisplay)
    toast({
      title: "Copiado",
      description: "Resultado copiado al portapapeles",
    })
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const cartTotal = cart.reduce((total, item) => total + (item.product.price * item.quantity), 0)
  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container-responsive py-responsive">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-responsive min-h-[calc(100vh-8rem)]">
          
          {/* Panel de Productos - 2/3 del ancho en desktop */}
          <div className="xl:col-span-2 space-y-4 order-2 xl:order-1">
            
            {/* Barra de búsqueda y acciones rápidas */}
            <Card className="card-responsive">
              <CardHeader className="p-responsive pb-3">
                <div className="flex-responsive">
                  <div className="relative flex-1 min-w-0">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nombre o código..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 sm:pl-12 input-touch text-responsive-sm"
                    />
                  </div>
                  <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                    <Button 
                      variant="outline" 
                      size="default" 
                      className="btn-touch flex-1 sm:flex-none text-responsive-sm" 
                      onClick={() => setShowCalculator(!showCalculator)}
                    >
                      <Calculator className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="ml-2">Calculadora</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Información rápida */}
            <div className="grid-responsive-2">
              <Card className="card-responsive text-center p-responsive">
                <Package className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 mx-auto mb-3 text-primary" />
                <p className="text-responsive-xl font-bold">{products.length}</p>
                <p className="text-responsive-xs text-muted-foreground mt-1">Productos Disponibles</p>
              </Card>
              <Card className="card-responsive text-center p-responsive">
                <ShoppingCart className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 mx-auto mb-3 text-primary" />
                <p className="text-responsive-xl font-bold">{cartItemsCount}</p>
                <p className="text-responsive-xs text-muted-foreground mt-1">Items en Carrito</p>
              </Card>
            </div>

            {/* Total destacado */}
            <Card className="card-responsive text-center p-6 sm:p-8 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
              <p className="text-responsive-sm text-muted-foreground mb-2">Total del Carrito</p>
              <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary">${cartTotal.toFixed(2)}</p>
            </Card>

            {/* Filtro de categorías */}
            <CategoryFilter
              selectedCategoryId={selectedCategoryId}
              onCategoryChange={setSelectedCategoryId}
            />

            {/* Grid de productos */}
            <Card className="card-responsive flex-1">
              <CardHeader className="p-responsive">
                <CardTitle className="flex items-center gap-3 text-responsive-lg">
                  <Package className="h-5 w-5 sm:h-6 sm:w-6" />
                  <span>Productos Disponibles</span>
                  <Badge variant="secondary" className="ml-auto text-responsive-xs">{filteredProducts.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="scroll-area-mobile p-responsive">
                <ProductGrid 
                  products={filteredProducts}
                  onAddToCart={addToCart}
                  selectedCategoryId={selectedCategoryId}
                />
              </CardContent>
            </Card>
          </div>

          {/* Panel del Carrito - 1/3 del ancho en desktop */}
          <div className="xl:col-span-1 order-1 xl:order-2">
            <SimpleCart
              cart={cart}
              onUpdateQuantity={updateCartQuantity}
              onRemoveItem={removeFromCart}
              onClear={clearCart}
              total={cartTotal}
              onRefreshProducts={fetchProducts}
              onRefreshSales={refreshSales}
            />
          </div>
        </div>
      </div>

      {/* Modal de Calculadora */}
      <Dialog open={showCalculator} onOpenChange={setShowCalculator}>
        <DialogContent className="modal-responsive">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-responsive-base">
              <Calculator className="h-5 w-5" />
              Calculadora
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 sm:space-y-6">
            {/* Display */}
            <div className="p-4 sm:p-6 bg-muted rounded-lg sm:rounded-xl">
              <div className="text-right">
                {calculatorOperation && calculatorPrevValue && (
                  <div className="text-responsive-xs text-muted-foreground">
                    {calculatorPrevValue} {calculatorOperation}
                  </div>
                )}
                <div className="text-2xl sm:text-3xl lg:text-4xl font-mono font-bold">{calculatorDisplay}</div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={copyCalculatorResult}
                className="mt-3 w-full btn-touch text-responsive-sm"
              >
                Copiar resultado
              </Button>
            </div>

            {/* Botones */}
            <div className="grid grid-cols-4 gap-2 sm:gap-3">
              {/* Fila 1 */}
              <Button variant="outline" onClick={handleCalculatorClear} className="btn-touch text-responsive-sm">
                C
              </Button>
              <Button variant="outline" onClick={() => {
                setCalculatorDisplay(calculatorDisplay.slice(0, -1) || '0')
              }} className="btn-touch text-responsive-sm">
                ⌫
              </Button>
              <Button variant="outline" onClick={() => handleCalculatorOperation('/')} className="btn-touch text-responsive-sm">
                ÷
              </Button>
              <Button variant="outline" onClick={() => handleCalculatorOperation('*')} className="btn-touch text-responsive-sm">
                ×
              </Button>

              {/* Fila 2-5 */}
              {[
                ['7', '8', '9', '-'],
                ['4', '5', '6', '+'],
                ['1', '2', '3'],
                ['0', '0', '.']
              ].map((row, rowIndex) => (
                row.map((btn, btnIndex) => {
                  if (rowIndex === 2 && btnIndex === 3) {
                    return (
                      <Button 
                        key={`${rowIndex}-${btnIndex}`}
                        variant="default" 
                        onClick={handleCalculatorEquals} 
                        className="btn-touch row-span-2 text-responsive-sm"
                      >
                        =
                      </Button>
                    )
                  }
                  if (rowIndex === 3 && btnIndex === 0) {
                    return (
                      <Button 
                        key={`${rowIndex}-${btnIndex}`}
                        variant="outline" 
                        onClick={() => handleCalculatorInput('0')} 
                        className="btn-touch col-span-2 text-responsive-sm"
                      >
                        0
                      </Button>
                    )
                  }
                  if (rowIndex === 3 && btnIndex === 1) return null
                  if (rowIndex === 3 && btnIndex === 2) {
                    return (
                      <Button 
                        key={`${rowIndex}-${btnIndex}`}
                        variant="outline" 
                        onClick={() => handleCalculatorInput('.')} 
                        className="btn-touch text-responsive-sm"
                      >
                        .
                      </Button>
                    )
                  }
                  
                  return (
                    <Button 
                      key={`${rowIndex}-${btnIndex}`}
                      variant="outline" 
                      onClick={() => ['7','8','9','4','5','6','1','2','3'].includes(btn) 
                        ? handleCalculatorInput(btn) 
                        : handleCalculatorOperation(btn)
                      } 
                      className="btn-touch text-responsive-sm"
                    >
                      {btn}
                    </Button>
                  )
                })
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default KioskView