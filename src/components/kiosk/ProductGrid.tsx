import { Button } from '@/components/ui/enhanced-button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Package } from 'lucide-react'

interface Product {
  id: string
  name: string
  price: number
  stock: number
  sku: string
  unit: string
}

interface ProductGridProps {
  products: Product[]
  onAddToCart: (product: Product, quantity?: number) => void
}

const ProductGrid = ({ products, onAddToCart }: ProductGridProps) => {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
        <p className="text-lg text-muted-foreground">No se encontraron productos</p>
        <p className="text-sm text-muted-foreground">Intenta con otro término de búsqueda</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map((product) => (
        <Card 
          key={product.id} 
          className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer border-2 hover:border-primary/50"
          onClick={() => onAddToCart(product)}
        >
          <CardContent className="p-4">
            {/* Imagen placeholder o icono */}
            <div className="aspect-square bg-gradient-card rounded-lg mb-3 flex items-center justify-center">
              <Package className="h-12 w-12 text-primary opacity-50" />
            </div>
            
            {/* Información del producto */}
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-sm leading-tight group-hover:text-primary transition-colors">
                  {product.name}
                </h3>
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
                    variant={product.stock > 10 ? "secondary" : product.stock > 0 ? "destructive" : "outline"}
                    className="text-xs"
                  >
                    {product.stock > 10 ? "Disponible" : product.stock > 0 ? "Poco stock" : "Agotado"}
                  </Badge>
                </div>
              </div>
              
              {/* Botón de agregar */}
              <Button 
                className="w-full mt-3 group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                variant="outline"
                size="sm"
                disabled={product.stock === 0}
                onClick={(e) => {
                  e.stopPropagation()
                  onAddToCart(product)
                }}
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