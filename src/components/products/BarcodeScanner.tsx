import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/enhanced-button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, Scan, Plus } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'

interface Product {
  id: string
  name: string
  sku: string
  barcode: string | null
  price: number
  stock: number
  unit: string
  is_active: boolean
  weight_unit: boolean
}

interface BarcodeScannerProps {
  onProductFound: (product: Product, quantity?: number) => void
  onProductNotFound?: (searchTerm: string) => void
  placeholder?: string
  autoFocus?: boolean
}

const BarcodeScanner = ({ 
  onProductFound, 
  onProductNotFound, 
  placeholder = "Escanear código de barras o buscar por SKU...",
  autoFocus = true
}: BarcodeScannerProps) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [quantity, setQuantity] = useState('1')
  const [isListening, setIsListening] = useState(false)

  useEffect(() => {
    if (searchTerm.trim()) {
      searchProducts()
    } else {
      setSearchResults([])
    }
  }, [searchTerm])

  const searchProducts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .or(`name.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%,barcode.ilike.%${searchTerm}%`)
        .limit(10)

      if (error) throw error
      setSearchResults(data || [])

      // Si hay una coincidencia exacta por código de barras o SKU, seleccionar automáticamente
      const exactMatch = data?.find(p => 
        p.barcode === searchTerm || 
        p.sku.toLowerCase() === searchTerm.toLowerCase()
      )

      if (exactMatch && searchTerm.length >= 6) { // Códigos de barras típicamente >= 6 dígitos
        handleProductSelect(exactMatch)
      }
    } catch (error) {
      console.error('Error searching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProductSelect = (product: Product) => {
    const qty = product.weight_unit ? parseFloat(quantity) : parseInt(quantity)
    onProductFound(product, qty || 1)
    setSearchTerm('')
    setQuantity('1')
    setSearchResults([])
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchResults.length === 1) {
      handleProductSelect(searchResults[0])
    } else if (e.key === 'Enter' && searchResults.length === 0 && searchTerm.trim()) {
      onProductNotFound?.(searchTerm)
    }
  }

  const handleScannerInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    
    // Detectar entrada de escáner (típicamente muy rápida)
    if (value.length > 5 && !isListening) {
      setIsListening(true)
      setTimeout(() => {
        setIsListening(false)
      }, 100)
    }
  }

  return (
    <div className="space-y-4">
      <Card className="shadow-soft">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Scan className="h-5 w-5" />
            Lector de Códigos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Input */}
          <div className="space-y-2">
            <Label htmlFor="barcode-search">Código de Barras / SKU</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="barcode-search"
                value={searchTerm}
                onChange={handleScannerInput}
                onKeyPress={handleKeyPress}
                placeholder={placeholder}
                className={`pl-10 ${isListening ? 'ring-2 ring-primary' : ''}`}
                autoFocus={autoFocus}
              />
              {loading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                </div>
              )}
            </div>
          </div>

          {/* Quantity Input */}
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Label htmlFor="quantity">Cantidad</Label>
              <Input
                id="quantity"
                type="number"
                step="0.1"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Card className="shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Resultados ({searchResults.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {searchResults.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 cursor-pointer transition-colors"
                onClick={() => handleProductSelect(product)}
              >
                <div className="flex-1">
                  <div className="font-medium">{product.name}</div>
                  <div className="text-sm text-muted-foreground flex gap-2">
                    <span>SKU: {product.sku}</span>
                    {product.barcode && <span>• Código: {product.barcode}</span>}
                    <span>• Stock: {product.stock} {product.unit}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">${product.price.toFixed(2)}</div>
                  <div className="flex gap-1">
                    <Badge variant="outline" className="text-xs">
                      {product.unit}
                    </Badge>
                    {product.weight_unit && (
                      <Badge variant="secondary" className="text-xs">
                        Peso
                      </Badge>
                    )}
                  </div>
                </div>
                <Button size="sm" variant="ghost" className="ml-2">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* No Results */}
      {searchTerm.trim() && searchResults.length === 0 && !loading && (
        <Card className="shadow-soft">
          <CardContent className="text-center py-6">
            <p className="text-muted-foreground mb-3">
              No se encontraron productos para "{searchTerm}"
            </p>
            {onProductNotFound && (
              <Button 
                variant="outline" 
                onClick={() => onProductNotFound(searchTerm)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Crear producto
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default BarcodeScanner