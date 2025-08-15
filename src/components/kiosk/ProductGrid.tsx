import { Button } from '@/components/ui/enhanced-button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Package, AlertTriangle } from 'lucide-react'
import ImageCarousel from '@/components/products/ImageCarousel'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

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
    <TooltipProvider>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
        {activeProducts.map((product) => (
          <Card 
            key={product.id} 
            className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1 border-2 hover:border-primary/50 h-full relative"
          >
            <CardContent className="p-3 sm:p-4 flex flex-col justify-between h-full">
              {/* Imagen del producto */}
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
                  <Package className="h-16 w-16 sm:h-20 sm:w-20 text-primary opacity-50" />
                )}
              </div>
              
              {/* Información del producto */}
              <div className="flex flex-col flex-1 justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                      <h3 className="font-semibold text-sm sm:text-base leading-tight group-hover:text-primary transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                      {product.stock <= product.alert_stock && product.stock > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />
                          <span className="text-xs sm:text-sm text-yellow-600">Stock Bajo</span>
                        </div>
                      )}
                    </div>
                    {/* Quitar SKU */}
                    {/* <Badge variant="outline" className="text-xs whitespace-nowrap">
                      {product.sku}
                    </Badge> */}
                  </div>
                  
                  {/* Precio con tooltip y truncado */}
                  <div className="mt-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="text-xl sm:text-2xl font-bold text-primary truncate cursor-pointer select-text">
                          ${product.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </p>
                      </TooltipTrigger>
                      <TooltipContent>
                        <span className="font-mono text-base">
                          ${product.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </span>
                      </TooltipContent>
                    </Tooltip>
                    <p className="text-sm text-muted-foreground">
                      por {product.unit}
                    </p>
                  </div>
                  {/* Stock debajo del precio */}
                  <div className="mt-1">
                    <span className="text-sm text-muted-foreground block">
                      Stock: {product.stock}
                    </span>
                  </div>
                </div>
                {/* Botón de agregar alineado abajo */}
                <div className="mt-3 flex items-end">
                  <Button 
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all text-sm min-h-[44px]"
                    variant="outline"
                    size="default"
                    disabled={product.stock === 0 || !product.is_active}
                    onClick={() => onAddToCart(product)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    <span>{product.stock === 0 ? 'Agotado' : 'Agregar'}</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </TooltipProvider>
  )
}

export default ProductGrid