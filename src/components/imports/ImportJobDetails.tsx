import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/enhanced-button";

interface Props { jobId: string }

const ImportJobDetails = ({ jobId }: Props) => {
  const [records, setRecords] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('import_records').select('*').eq('import_job_id', jobId).order('row_number');
      setRecords(data || []);
    };
    load();
  }, [jobId]);

  const downloadResults = () => {
    const headers = ['row_number','status','error_message','created_record_id','record_data'];
    const lines = [headers.join(',')].concat(
      records.map(r => [r.row_number, r.status, JSON.stringify(r.error_message||''), r.created_record_id||'', JSON.stringify(r.record_data||{})].join(','))
    );
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `import_job_${jobId}_results.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="shadow-soft">
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Detalles del Job</CardTitle>
        <Button size="sm" variant="outline" onClick={downloadResults}>Descargar resultados</Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#Fila</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Error</TableHead>
                <TableHead>Creado/Actualizado ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.row_number}</TableCell>
                  <TableCell>{r.status}</TableCell>
                  <TableCell className="max-w-[400px] truncate" title={r.error_message}>{r.error_message}</TableCell>
                  <TableCell className="truncate max-w-[280px]" title={r.created_record_id}>{r.created_record_id}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImportJobDetails;
