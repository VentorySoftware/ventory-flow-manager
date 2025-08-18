import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/enhanced-button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { User, Calendar, CreditCard, FileText, Receipt, Printer, Download, X, Package, DollarSign, Hash } from "lucide-react"
import { motion } from "framer-motion"

interface Sale {
  id: string
  sale_number: string
  total: number
  subtotal?: number
  tax?: number
  status: string
  payment_method: string
  notes: string | null
  created_at: string
  customer_id: string | null
  seller_name?: string
  customers?: {
    name: string
    email: string | null
  }
  sale_items?: {
    id: string
    quantity: number
    unit_price: number
    subtotal: number
    products: {
      name: string
      sku: string
    }
  }[]
}

interface SaleDetailsProps {
  sale: Sale
  onClose: () => void
}

const SaleDetails = ({ sale, onClose }: SaleDetailsProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default'
      case 'pending':
        return 'secondary'
      case 'cancelled':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completada'
      case 'pending':
        return 'Pendiente'
      case 'cancelled':
        return 'Cancelada'
      default:
        return status
    }
  }

  const totalItems = sale.sale_items?.reduce((sum, item) => sum + item.quantity, 0) || 0
  const calculatedSubtotal = sale.sale_items?.reduce((sum, item) => sum + item.subtotal, 0) || 0
  const calculatedTax = sale.tax || (calculatedSubtotal * 0.16)

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 15, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut" as const
      }
    }
  }

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div 
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-background to-accent/5 p-6 border shadow-lg"
        variants={itemVariants}
      >
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                <Receipt className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  {sale.sale_number}
                </h2>
                <p className="text-muted-foreground">Detalles de la venta</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={getStatusColor(sale.status)} className="px-3 py-1">
                {getStatusText(sale.status)}
              </Badge>
              <Badge variant="outline" className="px-3 py-1">
                <Package className="h-3 w-3 mr-1" />
                {totalItems} productos
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-primary mb-1">
              ${sale.total.toFixed(2)}
            </div>
            <p className="text-sm text-muted-foreground">Total de la venta</p>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
      </motion.div>

      {/* Sale Information */}
      <motion.div 
        className="grid gap-4 lg:grid-cols-3"
        variants={itemVariants}
      >
        <motion.div variants={itemVariants}>
          <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-card to-card/50 hover:shadow-xl transition-all duration-300 group">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-3 text-base">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 group-hover:scale-105 transition-transform">
                  <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <span>Cliente</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <p className="font-semibold text-lg">
                  {sale.customers?.name || 'Cliente General'}
                </p>
                {sale.customers?.email && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-primary"></span>
                    {sale.customers.email}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-card to-card/50 hover:shadow-xl transition-all duration-300 group">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-3 text-base">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 group-hover:scale-105 transition-transform">
                  <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <span>Fecha y Hora</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="font-semibold text-lg">{formatDate(sale.created_at)}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-card to-card/50 hover:shadow-xl transition-all duration-300 group">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-3 text-base">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 group-hover:scale-105 transition-transform">
                  <CreditCard className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <span>Método de Pago</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="font-semibold text-lg capitalize">{sale.payment_method}</p>
            </CardContent>
          </Card>
        </motion.div>

        {sale.seller_name && (
          <motion.div variants={itemVariants}>
            <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-card to-card/50 hover:shadow-xl transition-all duration-300 group">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-3 text-base">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 group-hover:scale-105 transition-transform">
                    <User className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <span>Vendedor</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="font-semibold text-lg">{sale.seller_name}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>

      {/* Notes */}
      {sale.notes && (
        <motion.div variants={itemVariants}>
          <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-card to-card/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-3 text-lg">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                  <FileText className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <span>Notas Adicionales</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-base leading-relaxed bg-accent/20 p-4 rounded-xl">{sale.notes}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Items */}
      <motion.div variants={itemVariants}>
        <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-card to-card/50 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-accent/10 to-accent/5 border-b border-border/50">
            <CardTitle className="flex items-center space-x-3 text-lg">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <span>Productos Vendidos</span>
              <Badge variant="outline" className="ml-auto">
                {totalItems} items
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table className="min-w-[640px]">
                <TableHeader>
                  <TableRow className="border-b border-border/50">
                    <TableHead className="font-semibold">Producto</TableHead>
                    <TableHead className="font-semibold">SKU</TableHead>
                    <TableHead className="text-right font-semibold">Precio Unit.</TableHead>
                    <TableHead className="text-right font-semibold">Cantidad</TableHead>
                    <TableHead className="text-right font-semibold">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sale.sale_items?.map((item, index) => (
                    <motion.tr 
                      key={item.id}
                      className="border-b border-border/30 hover:bg-accent/30 transition-colors"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <TableCell className="font-medium py-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-primary"></div>
                          {item.products.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <Badge variant="outline" className="font-mono text-xs">
                          {item.products.sku}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${item.unit_price.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary" className="px-2 py-1">
                          {item.quantity}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-bold text-primary pr-6">
                        ${item.subtotal.toFixed(2)}
                      </TableCell>
                    </motion.tr>
                  )) || (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        <div className="flex flex-col items-center space-y-2">
                          <Package className="h-8 w-8 text-muted-foreground/50" />
                          <p>No se encontraron items para esta venta</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Total Summary */}
      <motion.div variants={itemVariants}>
        <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-primary/5 to-accent/10 overflow-hidden">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Resumen de Pago</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 px-4 rounded-xl bg-background/50">
                  <span className="text-base">Subtotal:</span>
                  <span className="font-semibold">${(sale.subtotal || calculatedSubtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-2 px-4 rounded-xl bg-background/50">
                  <span className="text-base">IVA (16%):</span>
                  <span className="font-semibold">${calculatedTax.toFixed(2)}</span>
                </div>
                <Separator className="my-4" />
                <div className="flex justify-between items-center py-3 px-4 rounded-xl bg-primary/10 border border-primary/20">
                  <span className="text-xl font-bold">Total:</span>
                  <span className="text-2xl font-bold text-primary">${sale.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Actions */}
      <motion.div 
        className="flex flex-col sm:flex-row justify-between gap-4 pt-4"
        variants={itemVariants}
      >
        <Button 
          variant="outline" 
          onClick={onClose} 
          className="w-full sm:w-auto hover-scale"
        >
          <X className="h-4 w-4 mr-2" />
          Cerrar
        </Button>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            variant="secondary" 
            className="w-full sm:w-auto hover-scale"
          >
            <Download className="h-4 w-4 mr-2" />
            Descargar PDF
          </Button>
          <Button 
            variant="business" 
            className="w-full sm:w-auto hover-scale"
          >
            <Printer className="h-4 w-4 mr-2" />
            Imprimir Recibo
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default SaleDetails