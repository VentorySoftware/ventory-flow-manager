import { motion } from 'framer-motion'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/enhanced-button'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import ImageCarousel from '@/components/products/ImageCarousel'
import { 
  Package, 
  Edit, 
  Trash2, 
  Copy, 
  DollarSign, 
  Barcode, 
  Scale, 
  AlertTriangle,
  Tag,
  Calendar,
  TrendingUp,
  Eye,
  X
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'

interface Product {
  id: string
  name: string
  description: string | null
  sku: string
  price: number
  cost_price: number
  stock: number
  unit: string
  alert_stock: number
  is_active: boolean
  barcode: string | null
  weight_unit: boolean
  image_urls: string[]
  primary_image_url: string | null
  category_id: string | null
  categories?: {
    id: string
    name: string
  }
  created_at: string
  updated_at: string
}

interface ProductDetailViewProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
  canEdit?: boolean
  canDelete?: boolean
}

const ProductDetailView = ({ 
  product, 
  isOpen, 
  onClose, 
  onEdit, 
  onDelete,
  canEdit = false,
  canDelete = false 
}: ProductDetailViewProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  if (!product) return null

  const profit = product.cost_price ? product.price - product.cost_price : 0
  const profitMargin = product.cost_price ? ((profit / product.price) * 100) : 0
  const totalValue = product.price * product.stock

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  }

  const handleDuplicate = async () => {
    try {
      setIsLoading(true)
      const duplicatedProduct = {
        name: `${product.name} (Copia)`,
        description: product.description,
        sku: `${product.sku}-COPY`,
        price: product.price,
        cost_price: product.cost_price,
        stock: 0, // Start with 0 stock for safety
        unit: product.unit,
        alert_stock: product.alert_stock,
        is_active: false, // Start inactive for review
        barcode: null, // Clear barcode to avoid conflicts
        weight_unit: product.weight_unit,
        category_id: product.category_id,
        image_urls: product.image_urls,
        primary_image_url: product.primary_image_url
      }

      const { error } = await supabase
        .from('products')
        .insert([duplicatedProduct])

      if (error) throw error

      toast({
        title: "Producto duplicado",
        description: "Se creó una copia del producto (inactiva para revisión)"
      })
      
      onClose()
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo duplicar el producto",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStockStatus = () => {
    if (product.stock === 0) return { variant: 'destructive' as const, label: 'Agotado', icon: AlertTriangle }
    if (product.stock <= Math.floor(product.alert_stock * 0.5)) return { variant: 'destructive' as const, label: 'Crítico', icon: AlertTriangle }
    if (product.stock <= product.alert_stock) return { variant: 'secondary' as const, label: 'Stock Bajo', icon: AlertTriangle }
    return { variant: 'outline' as const, label: 'Normal', icon: Package }
  }

  const stockStatus = getStockStatus()
  const StockIcon = stockStatus.icon

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] p-0 gap-0 overflow-hidden">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="flex flex-col h-full"
        >
          {/* Header */}
          <motion.div 
            variants={itemVariants}
            className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b px-6 py-4"
          >
            <DialogHeader className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <DialogTitle className="text-2xl font-bold text-gradient">
                      {product.name}
                    </DialogTitle>
                    <Badge variant={product.is_active ? "default" : "secondary"}>
                      {product.is_active ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Tag className="h-4 w-4" />
                    <span className="font-mono text-sm">{product.sku}</span>
                    {product.categories && (
                      <>
                        <Separator orientation="vertical" className="h-4" />
                        <Badge variant="outline">{product.categories.name}</Badge>
                      </>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DialogHeader>
          </motion.div>

          {/* Content */}
          <ScrollArea className="flex-1 px-6 pb-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
              
              {/* Main Content - Left Column (2/3) */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Product Header Card */}
                <motion.div variants={itemVariants}>
                  <Card className="shadow-elegant border-2 border-primary/10">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          {product.image_urls && product.image_urls.length > 0 ? (
                            <ImageCarousel
                              images={product.image_urls}
                              primaryImage={product.primary_image_url || undefined}
                              productName={product.name}
                              size="lg"
                              className="w-48 h-48 rounded-2xl shadow-glow"
                            />
                          ) : (
                            <div className="w-48 h-48 bg-gradient-subtle rounded-2xl flex items-center justify-center border border-border shadow-soft">
                              <Package className="h-16 w-16 text-muted-foreground/50" />
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 space-y-4">
                          <div>
                            <h3 className="text-xl font-semibold mb-2">Información General</h3>
                            {product.description && (
                              <p className="text-muted-foreground leading-relaxed">
                                {product.description}
                              </p>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-muted-foreground">Precio de Venta</p>
                              <p className="text-2xl font-bold text-success">
                                ${product.price.toLocaleString('es-MX')}
                                <span className="text-sm font-normal text-muted-foreground ml-1">
                                  /{product.unit}
                                </span>
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-muted-foreground">Stock Disponible</p>
                              <div className="flex items-center gap-2">
                                <p className="text-2xl font-bold">
                                  {product.stock}
                                </p>
                                <Badge variant={stockStatus.variant} className="flex items-center gap-1">
                                  <StockIcon className="h-3 w-3" />
                                  {stockStatus.label}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Financial Details */}
                  <motion.div variants={itemVariants}>
                    <Card className="h-full shadow-soft hover-scale transition-smooth">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <DollarSign className="h-5 w-5 text-success" />
                          Información Financiera
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Precio de Costo:</span>
                            <span className="font-mono font-medium">
                              {product.cost_price ? `$${product.cost_price.toLocaleString('es-MX')}` : 'No definido'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Ganancia por Unidad:</span>
                            <span className={`font-mono font-medium ${profit > 0 ? 'text-success' : 'text-muted-foreground'}`}>
                              ${profit.toLocaleString('es-MX')}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Margen de Ganancia:</span>
                            <span className={`font-mono font-medium ${profitMargin > 0 ? 'text-success' : 'text-muted-foreground'}`}>
                              {profitMargin.toFixed(1)}%
                            </span>
                          </div>
                          <Separator />
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Valor Total en Stock:</span>
                            <span className="font-mono font-bold text-primary">
                              ${totalValue.toLocaleString('es-MX')}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Technical Details */}
                  <motion.div variants={itemVariants}>
                    <Card className="h-full shadow-soft hover-scale transition-smooth">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Package className="h-5 w-5 text-primary" />
                          Detalles Técnicos
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Unidad de Medida:</span>
                            <Badge variant="outline" className="font-mono">
                              {product.unit}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Alerta de Stock:</span>
                            <span className="font-mono font-medium">
                              {product.alert_stock} unidades
                            </span>
                          </div>
                          {product.barcode && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground flex items-center gap-1">
                                <Barcode className="h-3 w-3" />
                                Código de Barras:
                              </span>
                              <span className="font-mono text-sm">
                                {product.barcode}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                              <Scale className="h-3 w-3" />
                              Venta por Peso:
                            </span>
                            <Badge variant={product.weight_unit ? "default" : "outline"}>
                              {product.weight_unit ? "Sí" : "No"}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </div>

              {/* Actions Sidebar - Right Column (1/3) */}
              <motion.div variants={itemVariants} className="space-y-6">
                
                {/* Quick Actions */}
                <Card className="shadow-elegant">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {canEdit && (
                      <Button
                        variant="outline"
                        size="default"
                        onClick={() => onEdit(product)}
                        className="w-full justify-start hover-scale"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar Producto
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="default"
                      onClick={handleDuplicate}
                      disabled={isLoading}
                      className="w-full justify-start hover-scale"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      {isLoading ? 'Duplicando...' : 'Duplicar Producto'}
                    </Button>

                    {canDelete && (
                      <Button
                        variant="outline"
                        size="default"
                        onClick={() => onDelete(product)}
                        className="w-full justify-start text-destructive hover:text-destructive hover-scale"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar Producto
                      </Button>
                    )}
                  </CardContent>
                </Card>

                {/* Timestamps */}
                <Card className="shadow-soft">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      Historial
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Creado:</p>
                      <p className="font-medium">
                        {new Date(product.created_at).toLocaleString('es-MX')}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Última actualización:</p>
                      <p className="font-medium">
                        {new Date(product.updated_at).toLocaleString('es-MX')}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Performance Metrics */}
                {profit > 0 && (
                  <Card className="shadow-soft bg-gradient-subtle">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <TrendingUp className="h-5 w-5 text-success" />
                        Rendimiento
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-success">
                          {profitMargin.toFixed(1)}%
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Margen de ganancia
                        </p>
                      </div>
                      <div className="text-center pt-2">
                        <p className="text-lg font-semibold">
                          ${(profit * product.stock).toLocaleString('es-MX')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Ganancia potencial total
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            </div>
          </ScrollArea>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}

export default ProductDetailView