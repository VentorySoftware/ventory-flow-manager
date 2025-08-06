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
import { User, Calendar, CreditCard, FileText, Receipt } from "lucide-react"

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">{sale.sale_number}</h3>
          <p className="text-muted-foreground">Detalles de la venta</p>
        </div>
        <Badge variant={getStatusColor(sale.status)}>
          {getStatusText(sale.status)}
        </Badge>
      </div>

      {/* Sale Information */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Cliente</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="font-medium">
                {sale.customers?.name || 'Cliente General'}
              </p>
              {sale.customers?.email && (
                <p className="text-sm text-muted-foreground">
                  {sale.customers.email}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Fecha y Hora</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{formatDate(sale.created_at)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5" />
              <span>Método de Pago</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium capitalize">{sale.payment_method}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Vendedor</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{sale.seller_name || 'N/A'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Receipt className="h-5 w-5" />
              <span>Total Items</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{totalItems} productos</p>
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      {sale.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Notas</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{sale.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Items */}
      <Card>
        <CardHeader>
          <CardTitle>Productos Vendidos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="text-right">Precio Unit.</TableHead>
                <TableHead className="text-right">Cantidad</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sale.sale_items?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.products.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.products.sku}
                  </TableCell>
                  <TableCell className="text-right">
                    ${item.unit_price.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.quantity}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ${item.subtotal.toFixed(2)}
                  </TableCell>
                </TableRow>
              )) || (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                    No se encontraron items para esta venta
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Total Summary */}
      <Card className="bg-accent/20">
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>${(sale.subtotal || calculatedSubtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>IVA (16%):</span>
              <span>${calculatedTax.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span className="text-primary">${sale.total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={onClose}>
          Cerrar
        </Button>
        <Button variant="business">
          Imprimir Recibo
        </Button>
      </div>
    </div>
  )
}

export default SaleDetails