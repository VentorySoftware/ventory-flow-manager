import { useState } from 'react'
import { Button } from '@/components/ui/enhanced-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { TrendingUp, DollarSign } from 'lucide-react'

interface Product {
  id: string
  name: string
  sku: string
  price: number
  unit: string
}

interface MassPriceUpdateProps {
  products: Product[]
  onUpdate: () => void
}

const MassPriceUpdate = ({ products, onUpdate }: MassPriceUpdateProps) => {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [percentage, setPercentage] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(products.map(p => p.id))
    } else {
      setSelectedProducts([])
    }
  }

  const handleSelectProduct = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts(prev => [...prev, productId])
    } else {
      setSelectedProducts(prev => prev.filter(id => id !== productId))
    }
  }

  const calculateNewPrice = (currentPrice: number) => {
    const percentageNum = parseFloat(percentage) || 0
    return currentPrice * (1 + percentageNum / 100)
  }

  const handleUpdatePrices = async () => {
    if (selectedProducts.length === 0) {
      toast({
        title: 'Error',
        description: 'Selecciona al menos un producto',
        variant: 'destructive'
      })
      return
    }

    if (!percentage || parseFloat(percentage) === 0) {
      toast({
        title: 'Error',
        description: 'Ingresa un porcentaje válido',
        variant: 'destructive'
      })
      return
    }

    try {
      setLoading(true)
      
      // Call the database function for mass price update
      const { data, error } = await supabase.rpc('update_prices_by_percentage', {
        product_ids: selectedProducts,
        percentage_increase: parseFloat(percentage)
      })

      if (error) throw error

      toast({
        title: 'Precios actualizados',
        description: `Se actualizaron ${data[0]?.updated_count || selectedProducts.length} productos correctamente`,
      })

      setSelectedProducts([])
      setPercentage('')
      onUpdate()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'No se pudieron actualizar los precios',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const selectedProductsData = products.filter(p => selectedProducts.includes(p.id))

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Actualización Masiva de Precios
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Percentage Input */}
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <Label htmlFor="percentage">Porcentaje de Aumento/Reducción</Label>
            <Input
              id="percentage"
              type="number"
              step="0.1"
              value={percentage}
              onChange={(e) => setPercentage(e.target.value)}
              placeholder="Ej: 10 para +10%, -5 para -5%"
            />
          </div>
          <Button
            onClick={handleUpdatePrices}
            disabled={loading || selectedProducts.length === 0 || !percentage}
            variant="gradient"
          >
            {loading ? 'Actualizando...' : 'Aplicar Cambios'}
          </Button>
        </div>

        {/* Preview */}
        {percentage && selectedProducts.length > 0 && (
          <div className="bg-muted/30 rounded-lg p-4">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Vista Previa ({selectedProducts.length} productos)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {selectedProductsData.slice(0, 6).map(product => (
                <div key={product.id} className="text-sm">
                  <span className="font-medium">{product.name}</span>
                  <div className="text-muted-foreground">
                    ${product.price.toFixed(2)} → ${calculateNewPrice(product.price).toFixed(2)}
                  </div>
                </div>
              ))}
              {selectedProductsData.length > 6 && (
                <div className="text-sm text-muted-foreground">
                  +{selectedProductsData.length - 6} productos más...
                </div>
              )}
            </div>
          </div>
        )}

        {/* Product Selection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Seleccionar Productos</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="select-all"
                checked={selectedProducts.length === products.length}
                onCheckedChange={handleSelectAll}
              />
              <Label htmlFor="select-all" className="text-sm">
                Seleccionar todos ({products.length})
              </Label>
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto border rounded-lg">
            {products.map(product => (
              <div
                key={product.id}
                className="flex items-center justify-between p-3 border-b last:border-b-0 hover:bg-muted/30"
              >
                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={selectedProducts.includes(product.id)}
                    onCheckedChange={(checked) => handleSelectProduct(product.id, checked as boolean)}
                  />
                  <div>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-muted-foreground">
                      SKU: {product.sku} • ${product.price.toFixed(2)}
                    </div>
                  </div>
                </div>
                <Badge variant="outline">{product.unit}</Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default MassPriceUpdate