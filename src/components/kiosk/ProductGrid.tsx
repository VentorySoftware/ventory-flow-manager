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
      <div className="grid-responsive-auto">
        {activeProducts.map((product) => (
          <Card 
            key={product.id} 
            className="group card-responsive hover:-translate-y-1 border-2 hover:border-primary/50 h-full relative"
          >
            <CardContent className="p-3 sm:p-4 lg:p-5 flex flex-col justify-between h-full">
               {/* Imagen del producto */}
               <div 
                 className="aspect-square bg-gradient-card rounded-lg mb-3 flex items-center justify-center overflow-hidden"
               >
                 {product.image_urls && product.image_urls.length > 0 ? (
                   <div className="w-full h-full">
                     <ImageCarousel
                       images={product.image_urls}
                       primaryImage={product.primary_image_url || undefined}
                       productName={product.name}
                       size="md"
                       className="w-full h-full"
                       showControls={product.image_urls.length > 1}
                       aspectRatio="square"
                     />
                   </div>
                 ) : (
                   <div 
                     className="w-full h-full flex items-center justify-center cursor-pointer transition-transform hover:scale-[1.02]"
                     onClick={() => onAddToCart(product)}
                   >
                     <Package className="h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20 text-primary opacity-50" />
                   </div>
                 )}
               </div>
              
              {/* Información del producto */}
              <div className="flex flex-col flex-1 justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-responsive-sm leading-tight group-hover:text-primary transition-colors line-clamp-2 mb-1">
                        {product.name}
                      </h3>
                      {product.stock <= product.alert_stock && product.stock > 0 && (
                        <div className="flex items-center gap-1 mb-2">
                          <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />
                          <span className="text-responsive-xs text-yellow-600">Stock Bajo</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Precio con tooltip y truncado */}
                  <div className="mt-2 mb-3">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="text-lg sm:text-xl lg:text-2xl font-bold text-primary truncate cursor-pointer select-text">
                          ${product.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </p>
                      </TooltipTrigger>
                      <TooltipContent>
                        <span className="font-mono text-base">
                          ${product.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </span>
                      </TooltipContent>
                    </Tooltip>
                    <p className="text-responsive-xs text-muted-foreground">
                      por {product.unit}
                    </p>
                  </div>
                  
                  {/* Stock debajo del precio */}
                  <div className="mb-3">
                    <span className="text-responsive-xs text-muted-foreground block">
                      Stock: {product.stock}
                    </span>
                  </div>
                </div>
                
                {/* Botón de agregar alineado abajo */}
                <div className="mt-auto">
                  <Button 
                    className="w-full btn-touch group-hover:bg-primary group-hover:text-primary-foreground transition-all text-responsive-sm"
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