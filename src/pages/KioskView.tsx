import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/enhanced-button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import KioskNavbar from '@/components/kiosk/KioskNavbar'
import ProductGrid from '@/components/kiosk/ProductGrid'
import SimpleCart from '@/components/kiosk/SimpleCart'
import { 
  Search, 
  ShoppingCart, 
  Package, 
  Calculator,
  QrCode
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

const KioskView = () => {
  const { user, hasRole } = useAuth()
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [showCalculator, setShowCalculator] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
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

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const cartTotal = cart.reduce((total, item) => total + (item.product.price * item.quantity), 0)
  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <KioskNavbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <KioskNavbar />
      
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
          
          {/* Panel de Productos - 2/3 del ancho en desktop */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Barra de búsqueda y acciones rápidas */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nombre o código..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 text-lg h-12"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="lg" onClick={() => setShowCalculator(!showCalculator)}>
                      <Calculator className="h-5 w-5" />
                    </Button>
                    <Button variant="outline" size="lg">
                      <QrCode className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Información rápida */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card className="text-center p-4">
                <Package className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">{products.length}</p>
                <p className="text-sm text-muted-foreground">Productos</p>
              </Card>
              <Card className="text-center p-4">
                <ShoppingCart className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">{cartItemsCount}</p>
                <p className="text-sm text-muted-foreground">En Carrito</p>
              </Card>
              <Card className="text-center p-4 sm:col-span-2">
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-3xl font-bold text-primary">${cartTotal.toFixed(2)}</p>
              </Card>
            </div>

            {/* Grid de productos */}
            <Card className="flex-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Productos Disponibles
                  <Badge variant="secondary">{filteredProducts.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="max-h-[60vh] overflow-y-auto">
                <ProductGrid 
                  products={filteredProducts}
                  onAddToCart={addToCart}
                />
              </CardContent>
            </Card>
          </div>

          {/* Panel del Carrito - 1/3 del ancho en desktop */}
          <div className="lg:col-span-1">
            <SimpleCart
              cart={cart}
              onUpdateQuantity={updateCartQuantity}
              onRemoveItem={removeFromCart}
              onClear={clearCart}
              total={cartTotal}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default KioskView