import { Button } from "@/components/ui/enhanced-button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import * as ExcelJS from 'exceljs';

// Función para generar archivo Excel nativo (.xlsx)
async function generateExcelTemplate(fileName: string, headers: string[]) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Datos');
  
  // Agregar headers en la primera fila
  worksheet.addRow(headers);
  
  // Estilo para los headers
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };
  
  // Ajustar ancho de columnas automáticamente
  headers.forEach((header, index) => {
    const column = worksheet.getColumn(index + 1);
    column.width = Math.max(header.length + 2, 12);
  });
  
  // Generar buffer del archivo Excel
  const buffer = await workbook.xlsx.writeBuffer();
  
  // Descargar archivo
  const blob = new Blob([buffer], { 
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

const TemplateDownloader = () => {
  // Headers para plantilla de productos - mapeo exacto a campos de entidad
  const productHeaders = [
    'name',           // Nombre del producto (texto)
    'sku',            // Código único del producto (texto)
    'price',          // Precio de venta (número)
    'cost_price',     // Precio de costo (número)
    'stock',          // Cantidad en inventario (número entero)
    'unit',           // Unidad de medida (texto: "unit", "kg", "liter", etc.)
    'category',       // Nombre de la categoría (debe existir)
    'description',    // Descripción del producto (texto opcional)
    'barcode',        // Código de barras (texto opcional)
    'alert_stock',    // Alerta de stock mínimo (número entero)
    'weight_unit',    // Si se vende por peso (true/false)
    'is_active'       // Si está activo (true/false)
  ];

  // Headers para plantilla de stock - actualización de inventario
  const stockHeaders = [
    'sku',            // SKU del producto (debe existir en productos)
    'stock'           // Nueva cantidad en stock (número entero)
  ];

  // Headers para plantilla de usuarios - perfiles y roles
  const userHeaders = [
    'email',          // Email del usuario (único)
    'full_name',      // Nombre completo
    'role'            // Rol: user, moderator, admin
  ];

  return (
    <Card className="shadow-soft h-full">
      <CardHeader>
        <CardTitle>Plantillas de Importación Excel</CardTitle>
        <CardDescription>
          Descarga plantillas Excel (.xlsx) nativas. Solo contienen headers en fila 1 - completa las filas siguientes con tus datos.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Button 
            variant="outline" 
            className="w-full justify-start" 
            onClick={() => generateExcelTemplate("plantilla_productos.xlsx", productHeaders)}
          >
            📦 Descargar plantilla de Productos (.xlsx)
          </Button>
          <p className="text-xs text-muted-foreground ml-4">
            <strong>12 columnas:</strong> name, sku, price, cost_price, stock, unit, category, description, barcode, alert_stock, weight_unit, is_active
          </p>
          <p className="text-xs text-green-600 ml-4">
            ✅ Excel nativo - headers en fila 1, filas vacías para completar
          </p>
        </div>
        
        <div className="space-y-2">
          <Button 
            variant="outline" 
            className="w-full justify-start" 
            onClick={() => generateExcelTemplate("plantilla_stock.xlsx", stockHeaders)}
          >
            📊 Descargar plantilla de Stock (.xlsx)
          </Button>
          <p className="text-xs text-muted-foreground ml-4">
            <strong>2 columnas:</strong> sku (debe existir en productos), stock (cantidad nueva)
          </p>
          <p className="text-xs text-green-600 ml-4">
            ✅ Excel nativo - headers en fila 1, filas vacías para completar
          </p>
        </div>
        
        <div className="space-y-2">
          <Button 
            variant="outline" 
            className="w-full justify-start" 
            onClick={() => generateExcelTemplate("plantilla_usuarios.xlsx", userHeaders)}
          >
            👥 Descargar plantilla de Usuarios (.xlsx)
          </Button>
          <p className="text-xs text-muted-foreground ml-4">
            <strong>3 columnas:</strong> email, full_name, role (user/moderator/admin)
          </p>
          <p className="text-xs text-green-600 ml-4">
            ✅ Excel nativo - headers en fila 1, filas vacías para completar
          </p>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">📋 Instrucciones de uso:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Descarga la plantilla Excel (.xlsx) correspondiente</li>
            <li>• La fila 1 contiene los headers de columna</li>
            <li>• Completa las filas 2, 3, 4... con nuevos registros</li>
            <li>• Cada columna corresponde exactamente a un campo de la entidad</li>
            <li>• Guarda el archivo Excel y súbelo al sistema para importar</li>
            <li>• El sistema validará formato y valores durante el procesamiento</li>
          </ul>
        </div>

        <div className="mt-4 p-3 bg-yellow-50 rounded border border-yellow-200">
          <h5 className="font-medium text-yellow-900 mb-1">⚠️ Formato requerido:</h5>
          <p className="text-sm text-yellow-800">
            Archivo Excel nativo (.xlsx) con headers en fila 1 y datos en filas siguientes. 
            No usar CSV ni separadores dentro de celdas.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TemplateDownloader;
