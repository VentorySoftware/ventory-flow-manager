import { useRef, useState } from "react";
import { Button } from "@/components/ui/enhanced-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface ImportUploaderProps {
  importType: 'products' | 'stock' | 'users'
  onImportComplete: (jobId: string) => void
}

const ImportUploader = ({ importType, onImportComplete }: ImportUploaderProps) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: 'Autenticación requerida', description: 'Inicia sesión', variant: 'destructive' });
      return;
    }
    const file = fileRef.current?.files?.[0];
    if (!file) {
      toast({ title: 'Archivo requerido', description: 'Selecciona un archivo Excel/CSV' });
      return;
    }

    try {
      setUploading(true);
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!['xlsx','xls','csv'].includes(ext || '')) {
        toast({ title: 'Formato no soportado', description: 'Usa .xlsx, .xls o .csv', variant: 'destructive' });
        return;
      }

      const path = `${user.id}/${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage.from('imports').upload(path, file);
      if (upErr) throw upErr;

      // Crear job
      const { data: jobData, error: jobErr } = await supabase
        .from('import_jobs')
        .insert({
          user_id: user.id,
          import_type: importType,
          file_name: file.name,
          file_url: path,
          status: 'pending'
        })
        .select('id')
        .single();

      if (jobErr) throw jobErr;

      // Invocar función
      const { error: fnErr } = await supabase.functions.invoke('process-import', {
        body: { jobId: jobData.id },
      });
      if (fnErr) throw fnErr;

      toast({ title: 'Importación en curso', description: 'Puedes seguir el progreso abajo' });
      onImportComplete(jobData.id);
      if (fileRef.current) fileRef.current.value = '';
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Error al importar', description: err.message || 'Intenta nuevamente', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleUpload} className="space-y-3">
      <div className="space-y-2">
        <Label>Selecciona archivo (.xlsx / .xls / .csv)</Label>
        <Input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" />
      </div>
      <Button type="submit" disabled={uploading}>
        {uploading ? 'Subiendo...' : 'Subir y procesar'}
      </Button>
    </form>
  );
};

export default ImportUploader;
