import { Button } from '@/components/ui/enhanced-button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Package, AlertTriangle } from 'lucide-react'
import ImageCarousel from '@/components/products/ImageCarousel'

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

interface ProductGridProps {
  products: Product[]
  onAddToCart: (product: Product, quantity?: number) => void
  selectedCategoryId?: string
}

const ProductGrid = ({ products, onAddToCart, selectedCategoryId }: ProductGridProps) => {
  // Filtrar solo productos activos y por categoría si está seleccionada
  const activeProducts = products.filter(product => {
    if (!product.is_active) return false
    if (selectedCategoryId && product.category_id !== selectedCategoryId) return false
    return true
  })
  
  if (activeProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
        <p className="text-lg text-muted-foreground">No se encontraron productos activos</p>
        <p className="text-sm text-muted-foreground">Los productos inactivos no se muestran en ventas</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {activeProducts.map((product) => (
        <Card 
          key={product.id} 
          className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1 border-2 hover:border-primary/50"
        >
          <CardContent className="p-4">
            {/* Imagen del producto - Clickeable */}
            <div 
              className="aspect-square bg-gradient-card rounded-lg mb-3 flex items-center justify-center overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform duration-200"
              onClick={() => onAddToCart(product)}
            >
              {product.image_urls && product.image_urls.length > 0 ? (
                <div className="w-full h-full pointer-events-none">
                  <ImageCarousel
                    images={product.image_urls}
                    primaryImage={product.primary_image_url || undefined}
                    productName={product.name}
                    size="md"
                    className="w-full h-full"
                    showControls={false}
                    aspectRatio="square"
                  />
                </div>
              ) : (
                <Package className="h-12 w-12 text-primary opacity-50" />
              )}
            </div>
            
            {/* Información del producto */}
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-sm leading-tight group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                  {product.stock <= product.alert_stock && product.stock > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      <AlertTriangle className="h-3 w-3 text-yellow-500" />
                      <span className="text-xs text-yellow-600">Stock Bajo</span>
                    </div>
                  )}
                </div>
                <Badge variant="outline" className="text-xs whitespace-nowrap">
                  {product.sku}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-primary">
                    ${product.price.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    por {product.unit}
                  </p>
                </div>
                
                <div className="text-right">
                  <p className="text-sm font-medium">
                    Stock: {product.stock}
                  </p>
                  <Badge 
                    variant={
                      product.stock === 0 ? "destructive" :
                      product.stock <= product.alert_stock ? "secondary" : 
                      "outline"
                    }
                    className="text-xs"
                  >
                    {product.stock === 0 ? "Agotado" : 
                     product.stock <= product.alert_stock ? "Stock Bajo" : 
                     "Disponible"}
                  </Badge>
                </div>
              </div>
              
              {/* Botón de agregar */}
              <Button 
                className="w-full mt-3 group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                variant="outline"
                size="sm"
                disabled={product.stock === 0}
                onClick={() => onAddToCart(product)}
              >
                <Plus className="h-4 w-4 mr-1" />
                {product.stock === 0 ? 'Agotado' : 'Agregar'}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default ProductGrid