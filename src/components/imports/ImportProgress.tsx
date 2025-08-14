import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/enhanced-button";
import { useNotificationContext } from "@/contexts/NotificationContext";
import { AlertCircle, CheckCircle, Clock, XCircle, RefreshCw, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ImportProgressProps { jobId: string }

const ImportProgress = ({ jobId }: ImportProgressProps) => {
  const [job, setJob] = useState<any | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const { addNotification } = useNotificationContext();

  useEffect(() => {
    let mounted = true;

    const fetchJob = async () => {
      const { data } = await supabase.from('import_jobs').select('*').eq('id', jobId).single();
      if (mounted) setJob(data || null);
    };

    fetchJob();

    // Realtime updates with streaming progress
    const channel = supabase
      .channel(`import_jobs:${jobId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'import_jobs', 
        filter: `id=eq.${jobId}` 
      }, (payload) => {
        if (mounted) {
          setJob(payload.new as any);
          
          // Show notifications on status changes
          const newStatus = (payload.new as any)?.status;
          if (newStatus === 'completed') {
            addNotification({
              title: "Importación completada",
              message: `Procesados: ${(payload.new as any)?.successful_records} éxitos, ${(payload.new as any)?.failed_records} errores`,
              type: "success",
              category: "system"
            });
          } else if (newStatus === 'failed') {
            addNotification({
              title: "Importación falló",
              message: "Revisa los detalles del error",
              type: "error",
              category: "system"
            });
          }
        }
      })
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [jobId, addNotification]);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      const { error } = await supabase.functions.invoke('process-import', {
        body: { jobId }
      });
      
      if (error) throw error;
      
      addNotification({
        title: "Reintento iniciado",
        message: "La importación se está procesando nuevamente",
        type: "info",
        category: "system"
      });
    } catch (error) {
      addNotification({
        title: "Error al reintentar",
        message: (error as Error).message,
        type: "error",
        category: "system"
      });
    } finally {
      setIsRetrying(false);
    }
  };

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      const { error } = await supabase
        .from('import_jobs')
        .update({ status: 'cancelled' })
        .eq('id', jobId);
        
      if (error) throw error;
      
      addNotification({
        title: "Importación cancelada",
        message: "El proceso ha sido detenido",
        type: "info",
        category: "system"
      });
    } catch (error) {
      addNotification({
        title: "Error al cancelar",
        message: (error as Error).message,
        type: "error",
        category: "system"
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const percent = useMemo(() => {
    if (!job || !job.total_records) return 0;
    return Math.min(100, Math.round((job.processed_records / job.total_records) * 100));
  }, [job]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'processing': return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'cancelled': return <XCircle className="h-4 w-4 text-gray-500" />;
      default: return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'processing': return 'text-blue-600';
      case 'cancelled': return 'text-gray-600';
      default: return 'text-yellow-600';
    }
  };

  if (!job) return null;

  const canRetry = job.status === 'failed' || job.status === 'cancelled';
  const canCancel = job.status === 'pending' || job.status === 'processing';

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(job.status)}
              Progreso de Importación
            </CardTitle>
            <CardDescription>
              Estado: <span className={`font-medium ${getStatusColor(job.status)}`}>
                {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
              </span> · {job.processed_records}/{job.total_records} registros
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {canRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                disabled={isRetrying}
              >
                {isRetrying ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Reintentar
              </Button>
            )}
            {canCancel && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={isCancelling}
              >
                {isCancelling ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <X className="h-4 w-4" />
                )}
                Cancelar
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progreso</span>
            <span>{percent}%</span>
          </div>
          <Progress value={percent} className="h-2" />
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center p-2 bg-green-50 rounded">
            <div className="font-semibold text-green-700">{job.successful_records}</div>
            <div className="text-green-600">Éxitos</div>
          </div>
          <div className="text-center p-2 bg-red-50 rounded">
            <div className="font-semibold text-red-700">{job.failed_records}</div>
            <div className="text-red-600">Errores</div>
          </div>
          <div className="text-center p-2 bg-blue-50 rounded">
            <div className="font-semibold text-blue-700">{job.processed_records}</div>
            <div className="text-blue-600">Procesados</div>
          </div>
        </div>

        {job.error_summary && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {typeof job.error_summary === 'string' 
                ? job.error_summary 
                : job.error_summary.message || 'Error durante el procesamiento'
              }
            </AlertDescription>
          </Alert>
        )}

        {job.status === 'processing' && (
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <Clock className="h-4 w-4 animate-pulse" />
            Procesando en tiempo real...
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ImportProgress;
