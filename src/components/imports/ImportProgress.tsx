import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ImportProgressProps { jobId: string }

const ImportProgress = ({ jobId }: ImportProgressProps) => {
  const [job, setJob] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchJob = async () => {
      const { data } = await supabase.from('import_jobs').select('*').eq('id', jobId).single();
      if (mounted) setJob(data || null);
    };

    fetchJob();

    // Realtime updates
    const channel = supabase
      .channel(`import_jobs:${jobId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'import_jobs', filter: `id=eq.${jobId}` }, (payload) => {
        setJob(payload.new as any);
      })
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [jobId]);

  const percent = useMemo(() => {
    if (!job || !job.total_records) return 0;
    return Math.min(100, Math.round((job.processed_records / job.total_records) * 100));
  }, [job]);

  if (!job) return null;

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle>Progreso de Importación</CardTitle>
        <CardDescription>
          Estado: <span className="font-medium">{job.status}</span> · {job.processed_records}/{job.total_records}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Progress value={percent} />
        <div className="mt-2 text-sm text-muted-foreground">
          Éxitos: {job.successful_records} · Errores: {job.failed_records}
        </div>
      </CardContent>
    </Card>
  );
};

export default ImportProgress;
