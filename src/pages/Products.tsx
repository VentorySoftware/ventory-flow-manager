import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/enhanced-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useNotificationContext } from '@/contexts/NotificationContext'
import Navbar from '@/components/Navbar'
import { 
  Plus, 
  Search, 
  Package, 
  Edit, 
  Trash2, 
  AlertTriangle,
  TrendingUp,
  DollarSign,
  BarChart3,
  Calculator,
  Target
} from 'lucide-react'
import MassPriceUpdate from '@/components/products/MassPriceUpdate'
import ProfitAnalysis from '@/components/products/ProfitAnalysis'
import ImageUploader from '@/components/products/ImageUploader'
import ImageCarousel from '@/components/products/ImageCarousel'
import { CategorySelect } from '@/components/products/CategorySelect'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'

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

interface ProductFormData {
  name: string
  description: string
  sku: string
  price: string
  cost_price: string
  stock: string
  unit: string
  alert_stock: string
  is_active: boolean
  barcode: string
  weight_unit: boolean
  image_urls: string[]
  primary_image_url: string
  category_id: string
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [activeTab, setActiveTab] = useState('inventory')
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    sku: '',
    price: '',
    cost_price: '',
    stock: '',
    unit: 'unit',
    alert_stock: '10',
    is_active: true,
    barcode: '',
    weight_unit: false,
    image_urls: [],
    primary_image_url: '',
    category_id: ''
  })

  const { toast } = useToast()
  const { hasRole } = useAuth()
  const { addNotification } = useNotificationContext()

  useEffect(() => {
    fetchProducts()
  }, [])

  // Verificar productos con stock bajo y generar notificaciones
  useEffect(() => {
    if (products.length > 0 && hasRole('admin')) {
      const lowStockProductsForNotification = products.filter(product => 
        product.is_active && 
        product.stock <= product.alert_stock && 
        product.stock > 0
      )
      
      lowStockProductsForNotification.forEach(product => {
        addNotification({
          title: 'Stock Bajo',
          message: `${product.name} tiene solo ${product.stock} unidades restantes (Alerta: ${product.alert_stock})`,
          type: 'warning',
          category: 'inventory',
          actionUrl: '/products',
          actionData: { productId: product.id }
        })
      })
    }
  }, [products, hasRole, addNotification])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los productos',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.sku || !formData.price) {
      toast({
        title: 'Error',
        description: 'Nombre, SKU y precio son obligatorios',
        variant: 'destructive'
      })
      return
    }

    try {
      const productData = {
        name: formData.name,
        description: formData.description || null,
        sku: formData.sku,
        price: parseFloat(formData.price),
        cost_price: parseFloat(formData.cost_price) || 0,
        stock: parseInt(formData.stock) || 0,
        unit: formData.unit,
        alert_stock: parseInt(formData.alert_stock) || 10,
        is_active: formData.is_active,
        barcode: formData.barcode || null,
        weight_unit: formData.weight_unit,
        category_id: formData.category_id || null
      }

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id)

        if (error) throw error

        toast({
          title: 'Producto actualizado',
          description: 'El producto se actualizó correctamente'
        })
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData])

        if (error) throw error

        toast({
          title: 'Producto creado',
          description: 'El producto se creó correctamente'
        })

        addNotification({
          title: 'Nuevo Producto',
          message: `Se agregó "${formData.name}" al inventario`,
          type: 'success',
          category: 'inventory'
        })
      }

      setIsDialogOpen(false)
      setEditingProduct(null)
      setFormData({
        name: '',
        description: '',
        sku: '',
        price: '',
        cost_price: '',
        stock: '',
        unit: 'unit',
        alert_stock: '10',
        is_active: true,
        barcode: '',
        weight_unit: false,
        image_urls: [],
        primary_image_url: '',
        category_id: ''
      })
      fetchProducts()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al guardar el producto',
        variant: 'destructive'
      })
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description || '',
      sku: product.sku,
      price: product.price.toString(),
      cost_price: product.cost_price?.toString() || '',
      stock: product.stock.toString(),
      unit: product.unit,
      alert_stock: product.alert_stock.toString(),
      is_active: product.is_active,
      barcode: product.barcode || '',
      weight_unit: product.weight_unit,
      image_urls: product.image_urls || [],
      primary_image_url: product.primary_image_url || '',
      category_id: product.category_id || ''
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (product: Product) => {
    if (!hasRole('admin') && !hasRole('moderator')) {
      toast({
        title: 'Sin permisos',
        description: 'No tienes permisos para eliminar productos',
        variant: 'destructive'
      })
      return
    }

    if (!confirm(`¿Estás seguro de eliminar "${product.name}"?`)) return

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id)

      if (error) throw error

      toast({
        title: 'Producto eliminado',
        description: 'El producto se eliminó correctamente'
      })
      
      fetchProducts()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el producto',
        variant: 'destructive'
      })
    }
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const lowStockProducts = products.filter(product => product.stock <= product.alert_stock)
  const totalValue = products.reduce((sum, product) => sum + (product.price * product.stock), 0)
  const totalProducts = products.length

  const getStockBadge = (product: Product) => {
    if (product.stock === 0) return <Badge variant="destructive">Agotado</Badge>
    if (product.stock <= Math.floor(product.alert_stock * 0.5)) return <Badge variant="destructive">Crítico</Badge>
    if (product.stock <= product.alert_stock) return <Badge variant="secondary">Stock Bajo</Badge>
    return <Badge variant="outline">Normal</Badge>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Gestión de Productos
              </h1>
              <p className="text-muted-foreground mt-1">
                Administra tu inventario, precios y ganancias
              </p>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="inventory" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Inventario
              </TabsTrigger>
              <TabsTrigger value="pricing" className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Precios
              </TabsTrigger>
              <TabsTrigger value="profits" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Ganancias
              </TabsTrigger>
            </TabsList>

            <TabsContent value="inventory" className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Inventario</h2>
            <p className="text-muted-foreground">Gestiona tus productos</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="gradient" 
                className="shadow-elegant"
                onClick={() => {
                  setEditingProduct(null)
                  setFormData({
                    name: '',
                    description: '',
                    sku: '',
                    price: '',
                    cost_price: '',
                    stock: '',
                    unit: 'unit',
                    alert_stock: '10',
                    is_active: true,
                    barcode: '',
                    weight_unit: false,
                    image_urls: [],
                    primary_image_url: '',
                    category_id: ''
                  })
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Producto
              </Button>
            </DialogTrigger>
            
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                </DialogTitle>
                <DialogDescription>
                  {editingProduct 
                    ? 'Modifica la información del producto'
                    : 'Completa la información para crear un nuevo producto'
                  }
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Nombre del producto"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU *</Label>
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                      placeholder="Código único"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descripción del producto"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Precio de Venta *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cost_price">Precio de Costo</Label>
                    <Input
                      id="cost_price"
                      type="number"
                      step="0.01"
                      value={formData.cost_price}
                      onChange={(e) => setFormData(prev => ({ ...prev, cost_price: e.target.value }))}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="barcode">Código de Barras</Label>
                    <Input
                      id="barcode"
                      value={formData.barcode}
                      onChange={(e) => setFormData(prev => ({ ...prev, barcode: e.target.value }))}
                      placeholder="Código de barras"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock Inicial</Label>
                    <Input
                      id="stock"
                      type="number"
                      step={formData.weight_unit ? "0.1" : "1"}
                      value={formData.stock}
                      onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unidad de Medida</Label>
                    <select
                      id="unit"
                      value={formData.unit}
                      onChange={(e) => {
                        const isWeight = ['kg', 'gramos', 'lbs'].includes(e.target.value)
                        setFormData(prev => ({ 
                          ...prev, 
                          unit: e.target.value,
                          weight_unit: isWeight
                        }))
                      }}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="unit">Unidad</option>
                      <option value="kg">Kilogramos</option>
                      <option value="gramos">Gramos</option>
                      <option value="lbs">Libras</option>
                      <option value="litros">Litros</option>
                      <option value="cajas">Cajas</option>
                      <option value="paquetes">Paquetes</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="weight_unit">Tipo de Producto</Label>
                    <div className="flex items-center space-x-2 h-10">
                      <Switch
                        id="weight_unit"
                        checked={formData.weight_unit}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, weight_unit: checked }))}
                      />
                      <Label htmlFor="weight_unit" className="text-sm">
                        {formData.weight_unit ? 'Por Peso' : 'Por Unidad'}
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Los productos por peso permiten decimales en stock
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="alert_stock">Alerta de Stock</Label>
                    <Input
                      id="alert_stock"
                      type="number"
                      value={formData.alert_stock}
                      onChange={(e) => setFormData(prev => ({ ...prev, alert_stock: e.target.value }))}
                      placeholder="10"
                    />
                    <p className="text-xs text-muted-foreground">
                      Nivel mínimo para recibir alertas
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="is_active">Estado del Producto</Label>
                    <div className="flex items-center space-x-2 h-10">
                      <Switch
                        id="is_active"
                        checked={formData.is_active}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                      />
                      <Label htmlFor="is_active" className="text-sm">
                        {formData.is_active ? 'Activo' : 'Inactivo'}
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Los productos inactivos no aparecen en ventas
                    </p>
                  </div>
                </div>

                {/* Category Selection */}
                <CategorySelect
                  value={formData.category_id}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value || '' }))}
                  placeholder="Seleccionar categoría"
                />

                {/* Image Upload Section */}
                <ImageUploader
                  productId={editingProduct?.id}
                  images={formData.image_urls}
                  onImagesChange={(images) => setFormData(prev => ({ ...prev, image_urls: images }))}
                  primaryImage={formData.primary_image_url}
                  onPrimaryImageChange={(imageUrl) => setFormData(prev => ({ ...prev, primary_image_url: imageUrl }))}
                  maxImages={3}
                />

                <div className="flex justify-end space-x-3 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" variant="gradient">
                    {editingProduct ? 'Actualizar' : 'Crear'} Producto
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="shadow-soft hover-scale transition-smooth">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Productos
              </CardTitle>
              <Package className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{totalProducts}</div>
              <p className="text-xs text-muted-foreground">
                En inventario
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover-scale transition-smooth">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Valor Total
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                ${totalValue.toLocaleString('es-MX')}
              </div>
              <p className="text-xs text-muted-foreground">
                Valor del inventario
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover-scale transition-smooth">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Stock Bajo
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{lowStockProducts.length}</div>
              <p className="text-xs text-muted-foreground">
                Productos críticos
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover-scale transition-smooth">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Precio Promedio
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                ${totalProducts > 0 ? (products.reduce((sum, p) => sum + p.price, 0) / totalProducts).toFixed(2) : '0'}
              </div>
              <p className="text-xs text-muted-foreground">
                Por producto
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="shadow-soft">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar productos por nombre o SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle>Lista de Productos</CardTitle>
            <CardDescription>
              {filteredProducts.length} de {totalProducts} productos
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Cargando productos...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No hay productos para mostrar</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Stock Status</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Unidad</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id} className="hover:bg-muted/50">
                       <TableCell>
                         <div className="flex items-center gap-3">
                           {product.image_urls && product.image_urls.length > 0 ? (
                             <ImageCarousel
                               images={product.image_urls}
                               primaryImage={product.primary_image_url || undefined}
                               productName={product.name}
                               size="sm"
                               className="w-16 h-16"
                               showControls={false}
                             />
                           ) : (
                             <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                               <Package className="h-6 w-6 text-muted-foreground" />
                             </div>
                           )}
                           <div>
                             <div className="font-medium">{product.name}</div>
                             {product.description && (
                               <div className="text-sm text-muted-foreground">
                                 {product.description}
                               </div>
                             )}
                           </div>
                         </div>
                       </TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.sku}</Badge>
                      </TableCell>
                      <TableCell>
                        {product.categories ? (
                          <Badge variant="secondary">{product.categories.name}</Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">Sin categoría</span>
                        )}
                      </TableCell>
                      <TableCell className="font-mono">
                        ${product.price.toLocaleString('es-MX')}
                      </TableCell>
                      <TableCell className="font-mono">
                        {product.stock}
                        <div className="text-xs text-muted-foreground">
                          Alerta: {product.alert_stock}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStockBadge(product)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={product.is_active ? "default" : "secondary"}>
                          {product.is_active ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell>{product.unit}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {(hasRole('admin') || hasRole('moderator')) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(product)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
            </TabsContent>

            <TabsContent value="pricing">
              <MassPriceUpdate 
                products={filteredProducts} 
                onUpdate={fetchProducts}
              />
            </TabsContent>

            <TabsContent value="profits">
              <ProfitAnalysis />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

export default Products