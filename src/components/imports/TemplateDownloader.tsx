import { Button } from "@/components/ui/enhanced-button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// Función para convertir array de objetos a CSV
function arrayToCSV(data: any[]): string {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escapar comillas y envolver en comillas si contiene comas, comillas o saltos de línea
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');
  
  return csvContent;
}

function download(name: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

const TemplateDownloader = () => {
  // Plantilla productos - mapeo exacto a campos de la entidad products
  const productsTemplate = [
    {
      name: "Smartphone Samsung Galaxy S23",
      sku: "SAMS-S23-001",
      price: 299999.99,
      cost_price: 150000.00,
      stock: 25,
      unit: "unit",
      category: "Celulares",
      description: "Smartphone de alta gama con cámara triple de 108MP",
      barcode: "7890123456789",
      alert_stock: 5,
      weight_unit: false,
      is_active: true
    },
    {
      name: "Laptop Lenovo ThinkPad X1",
      sku: "LENO-X1-001", 
      price: 1299999.99,
      cost_price: 800000.00,
      stock: 10,
      unit: "unit",
      category: "Computadoras",
      description: "Laptop empresarial con procesador Intel i7 de 11va gen",
      barcode: "7890123456790",
      alert_stock: 3,
      weight_unit: false,
      is_active: true
    }
  ];

  // Plantilla stock - mapeo exacto para actualización de inventario
  const stockTemplate = [
    { sku: "SAMS-S23-001", stock: 30 },
    { sku: "LENO-X1-001", stock: 15 },
    { sku: "AURI-BT-001", stock: 75 }
  ];

  // Plantilla usuarios - mapeo exacto a profiles y user_roles
  const usersTemplate = [
    { 
      email: "juan.perez@empresa.com", 
      full_name: "Juan Pérez López", 
      role: "user" 
    },
    { 
      email: "ana.garcia@empresa.com", 
      full_name: "Ana García Rodríguez", 
      role: "moderator" 
    },
    { 
      email: "admin@empresa.com", 
      full_name: "Administrador del Sistema", 
      role: "admin" 
    }
  ];

  return (
    <Card className="shadow-soft h-full">
      <CardHeader>
        <CardTitle>Plantillas de Importación</CardTitle>
        <CardDescription>
          Descarga plantillas CSV con formato exacto requerido. Cada columna corresponde a un campo de la entidad.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Button variant="outline" className="w-full justify-start" onClick={() => download(
            "plantilla_productos.csv",
            arrayToCSV(productsTemplate)
          )}>
            📦 Descargar plantilla de Productos
          </Button>
          <p className="text-xs text-muted-foreground ml-4">
            12 campos mapeados: name, sku, price, cost_price, stock, unit, category, description, barcode, alert_stock, weight_unit, is_active
          </p>
        </div>
        
        <div className="space-y-2">
          <Button variant="outline" className="w-full justify-start" onClick={() => download(
            "plantilla_stock.csv",
            arrayToCSV(stockTemplate)
          )}>
            📊 Descargar plantilla de Stock
          </Button>
          <p className="text-xs text-muted-foreground ml-4">
            2 campos mapeados: sku (debe existir en productos), stock (cantidad nueva)
          </p>
        </div>
        
        <div className="space-y-2">
          <Button variant="outline" className="w-full justify-start" onClick={() => download(
            "plantilla_usuarios.csv",
            arrayToCSV(usersTemplate)
          )}>
            👥 Descargar plantilla de Usuarios
          </Button>
          <p className="text-xs text-muted-foreground ml-4">
            3 campos mapeados: email, full_name, role (user/moderator/admin)
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TemplateDownloader;
