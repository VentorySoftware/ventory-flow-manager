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
  return (
    <Card className="shadow-soft h-full">
      <CardHeader>
        <CardTitle>Plantillas</CardTitle>
        <CardDescription>Descarga CSV compatibles con Excel.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button variant="outline" className="w-full" onClick={() => download(
          "plantilla_productos.csv",
          "name,sku,price,stock,category\nEjemplo Producto,ABC123,199.99,10,Celulares\n"
        )}>
          Descargar plantilla de Productos
        </Button>
        <Button variant="outline" className="w-full" onClick={() => download(
          "plantilla_stock.csv",
          "sku,stock\nABC123,25\n"
        )}>
          Descargar plantilla de Stock
        </Button>
        <Button variant="outline" className="w-full" onClick={() => download(
          "plantilla_usuarios.csv",
          "email,full_name,role\nusuario@example.com,Nombre Apellido,user\n"
        )}>
          Descargar plantilla de Usuarios
        </Button>
      </CardContent>
    </Card>
  );
};

export default TemplateDownloader;
