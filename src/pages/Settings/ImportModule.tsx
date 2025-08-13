import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNotificationContext } from "@/contexts/NotificationContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TemplateDownloader from "@/components/imports/TemplateDownloader";
import ImportUploader from "@/components/imports/ImportUploader";
import ImportProgress from "@/components/imports/ImportProgress";
import ImportHistory from "@/components/imports/ImportHistory";
import ImportJobDetails from "@/components/imports/ImportJobDetails";

const ImportModule = () => {
  const { hasRole } = useAuth();
  const { addNotification } = useNotificationContext();
  const [activeType, setActiveType] = useState<"products"|"stock"|"users">("products");
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Importación de Datos | Ventory";
  }, []);

  const onImportComplete = (jobId: string) => {
    setCurrentJobId(jobId);
    addNotification({
      title: "Importación iniciada",
      message: `Tarea #${jobId.slice(0,8)} en proceso` ,
      type: "info",
      category: "system",
      actionUrl: "/settings"
    });
  };

  if (!hasRole("admin")) {
    return (
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Acceso restringido</CardTitle>
          <CardDescription>Solo administradores pueden usar el módulo de importación.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Importación de Datos</CardTitle>
          <CardDescription>
            Carga archivos Excel para productos, stock y usuarios. Descarga plantillas, sube el archivo y sigue el progreso.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Tabs value={activeType} onValueChange={(v) => setActiveType(v as any)}>
                <TabsList className="flex flex-wrap gap-2">
                  <TabsTrigger value="products">Productos</TabsTrigger>
                  <TabsTrigger value="stock">Stock</TabsTrigger>
                  <TabsTrigger value="users">Usuarios</TabsTrigger>
                </TabsList>
                <TabsContent value="products">
                  <ImportUploader importType="products" onImportComplete={onImportComplete} />
                </TabsContent>
                <TabsContent value="stock">
                  <ImportUploader importType="stock" onImportComplete={onImportComplete} />
                </TabsContent>
                <TabsContent value="users">
                  <ImportUploader importType="users" onImportComplete={onImportComplete} />
                </TabsContent>
              </Tabs>

              {currentJobId && (
                <div className="space-y-4">
                  <ImportProgress jobId={currentJobId} />
                  <ImportJobDetails jobId={currentJobId} />
                </div>
              )}
            </div>
            <div className="lg:col-span-1">
              <TemplateDownloader />
            </div>
          </div>
        </CardContent>
      </Card>

      <ImportHistory onSelectJob={(id) => setCurrentJobId(id)} />
    </div>
  );
};

export default ImportModule;
