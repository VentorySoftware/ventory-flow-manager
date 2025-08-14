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
  // Plantilla productos - SOLO HEADERS, sin datos de ejemplo
  const productsTemplate = [
    {
      name: "",
      sku: "",
      price: "",
      cost_price: "",
      stock: "",
      unit: "",
      category: "",
      description: "",
      barcode: "",
      alert_stock: "",
      weight_unit: "",
      is_active: ""
    }
  ];

  // Plantilla stock - SOLO HEADERS, sin datos de ejemplo
  const stockTemplate = [
    { 
      sku: "", 
      stock: "" 
    }
  ];

  // Plantilla usuarios - SOLO HEADERS, sin datos de ejemplo
  const usersTemplate = [
    { 
      email: "", 
      full_name: "", 
      role: "" 
    }
  ];

  return (
    <Card className="shadow-soft h-full">
      <CardHeader>
        <CardTitle>Plantillas de Importación</CardTitle>
        <CardDescription>
          Descarga plantillas Excel en blanco. Solo contienen headers - completa con tus datos y vuelve a importar.
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
            <strong>12 columnas:</strong> name, sku, price, cost_price, stock, unit, category, description, barcode, alert_stock, weight_unit, is_active
          </p>
          <p className="text-xs text-yellow-600 ml-4">
            ⚠️ Plantilla vacía - completa cada fila con un nuevo producto
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
            <strong>2 columnas:</strong> sku (debe existir en productos), stock (cantidad nueva)
          </p>
          <p className="text-xs text-yellow-600 ml-4">
            ⚠️ Plantilla vacía - completa con SKUs existentes y nuevas cantidades
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
            <strong>3 columnas:</strong> email, full_name, role (user/moderator/admin)
          </p>
          <p className="text-xs text-yellow-600 ml-4">
            ⚠️ Plantilla vacía - completa cada fila con un nuevo usuario
          </p>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">📋 Instrucciones de uso:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Descarga la plantilla correspondiente (solo headers, sin datos)</li>
            <li>• Completa cada fila con un nuevo registro</li>
            <li>• Cada columna debe coincidir exactamente con el campo de la entidad</li>
            <li>• Guarda como CSV y vuelve a importar al sistema</li>
            <li>• El sistema validará formato y valores durante el procesamiento</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default TemplateDownloader;
