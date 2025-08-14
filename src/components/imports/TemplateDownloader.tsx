import { Button } from "@/components/ui/enhanced-button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

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
  const productsTemplate = `name,sku,price,cost_price,stock,unit,category,description,barcode,alert_stock,weight_unit,is_active
Smartphone Samsung Galaxy,SAMS-001,299999.99,150000.00,25,unit,Celulares,Smartphone de alta gama con cámara triple,7890123456789,5,false,true
Laptop Lenovo ThinkPad,LENO-001,1299999.99,800000.00,10,unit,Computadoras,Laptop empresarial con procesador Intel i7,7890123456790,3,false,true
Auriculares Bluetooth,AURI-001,89999.99,45000.00,50,unit,Accesorios,Auriculares inalámbricos con cancelación de ruido,7890123456791,10,false,true`;

  const stockTemplate = `sku,stock
SAMS-001,30
LENO-001,15
AURI-001,75`;

  const usersTemplate = `email,full_name,role
juan.perez@empresa.com,Juan Pérez López,user
ana.garcia@empresa.com,Ana García Rodríguez,moderator
admin@empresa.com,Administrador Sistema,admin`;

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
            productsTemplate
          )}>
            📦 Descargar plantilla de Productos
          </Button>
          <p className="text-xs text-muted-foreground ml-4">
            Campos: name, sku, price, cost_price, stock, unit, category, description, barcode, alert_stock, weight_unit, is_active
          </p>
        </div>
        
        <div className="space-y-2">
          <Button variant="outline" className="w-full justify-start" onClick={() => download(
            "plantilla_stock.csv",
            stockTemplate
          )}>
            📊 Descargar plantilla de Stock
          </Button>
          <p className="text-xs text-muted-foreground ml-4">
            Campos: sku (debe existir), stock (cantidad nueva)
          </p>
        </div>
        
        <div className="space-y-2">
          <Button variant="outline" className="w-full justify-start" onClick={() => download(
            "plantilla_usuarios.csv",
            usersTemplate
          )}>
            👥 Descargar plantilla de Usuarios
          </Button>
          <p className="text-xs text-muted-foreground ml-4">
            Campos: email, full_name, role (user/moderator/admin)
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TemplateDownloader;
