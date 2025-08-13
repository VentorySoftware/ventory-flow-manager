import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";

interface ImportHistoryProps { onSelectJob: (id: string) => void }

const ImportHistory = ({ onSelectJob }: ImportHistoryProps) => {
  const { hasRole, user } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const query = supabase.from('import_jobs').select('*').order('created_at', { ascending: false }).limit(50);
      const { data } = hasRole('admin') ? await query : await query.eq('user_id', user?.id);
      setJobs(data || []);
    };
    load();
  }, [hasRole, user?.id]);

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle>Historial de Importaciones</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Archivo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Progreso</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((j) => (
                <TableRow key={j.id} className="cursor-pointer" onClick={() => onSelectJob(j.id)}>
                  <TableCell>{new Date(j.created_at).toLocaleString()}</TableCell>
                  <TableCell className="capitalize">{j.import_type}</TableCell>
                  <TableCell className="truncate max-w-[220px]" title={j.file_name}>{j.file_name}</TableCell>
                  <TableCell>{j.status}</TableCell>
                  <TableCell>{j.processed_records}/{j.total_records}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImportHistory;
