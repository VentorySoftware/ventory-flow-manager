import { useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import ventyBot from "@/assets/venty-bot.webp";

interface ChatMessage {
  id?: string;
  user_id: string;
  message: string;
  response?: string | null;
  created_at?: string;
}

const VentyWidget = () => {
  const { user, loading: authLoading } = useAuth();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const canChat = useMemo(() => !!user && !authLoading, [user, authLoading]);
  const endRef = useRef<HTMLDivElement>(null);
  const hasNew = useMemo(() => !open && messages.length > 0, [open, messages]);

  // Fetch history when opening
  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from("venty_messages")
        .select("id, user_id, message, response, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })
        .limit(100);
      if (error) {
        console.error("Error loading chat history:", error);
        return;
      }
      setMessages(data as ChatMessage[]);
    };

    if (open && user) {
      fetchHistory();
    }
  }, [open, user]);

  useEffect(() => {
    // Auto-scroll to bottom when messages change
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !user) return;
    const text = input.trim();
    setInput("");

    // Optimistic UI: add user's message
    const optimistic: ChatMessage = { user_id: user.id, message: text };
    setMessages((prev) => [...prev, optimistic]);

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("venty-chat", {
        body: { user_id: user.id, message: text },
      });

      if (error) throw error;

      const replyText: string | undefined = data?.response || data?.generatedText || data?.reply;
      if (!replyText) {
        toast({
          title: "Venty",
          description: "No se recibió una respuesta. Intenta nuevamente.",
        });
      }

      // Append assistant response
      setMessages((prev) => [...prev, { user_id: user.id, message: text, response: replyText ?? "" }]);

      // Optional: refresh from DB to reflect n8n persistence
      const { data: refreshed } = await supabase
        .from("venty_messages")
        .select("id, user_id, message, response, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })
        .limit(100);
      if (refreshed) setMessages(refreshed as ChatMessage[]);
    } catch (err: any) {
      console.error("Error sending to Venty:", err);
      toast({ title: "Error", description: "No pudimos contactar a Venty. Inténtalo más tarde." });
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!sending) handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-4 right-4 z-50">
        <div className="relative group">
          {/* Online pulse indicator */}
          {canChat && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3" aria-hidden="true">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/40" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
            </span>
          )}
          <Button
            variant="default"
            size="lg"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Cerrar chat Venty" : "Abrir chat Venty"}
            className={`rounded-full pl-3 pr-4 py-2 bg-gradient-primary text-primary-foreground shadow-lg ring-1 ring-primary/30 hover:ring-primary/50 hover:shadow-xl hover-scale transition-smooth ${hasNew ? 'animate-breathing-glow' : ''}`}
          >
            <img
              src={ventyBot}
              alt="Asistente Venty, chatbot inteligente"
              className="h-6 w-6 rounded-full ring-1 ring-primary/30 shadow-glow mr-2"
              loading="lazy"
              width={24}
              height={24}
            />
            <span className="font-medium">Venty</span>
          </Button>
        </div>
      </div>

      {/* Slide-over Chat Panel */}
      {open && (
        <div
          className="fixed inset-0 z-50 grid grid-cols-1 place-items-end pointer-events-none"
          aria-modal="true"
          role="dialog"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-background/60 backdrop-blur-sm animate-fade-in pointer-events-auto"
            onClick={() => setOpen(false)}
          />

          {/* Panel */}
          <section
            className="relative m-4 w-full max-w-md pointer-events-auto animate-slide-in-right"
          >
            <div className="rounded-xl border bg-background text-foreground shadow-xl overflow-hidden">
              <header className="flex items-center justify-between px-4 py-3 border-b">
                <div className="flex items-center gap-2">
                  <img src={ventyBot} alt="Venty asistente" className="h-6 w-6 rounded-full ring-1 ring-primary/30" width={24} height={24} loading="lazy" />
                  <h1 className="text-sm font-semibold">Venty</h1>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Cerrar">
                  <X />
                </Button>
              </header>

              <div className="h-[60vh] sm:h-[55vh] flex flex-col">
                <ScrollArea className="flex-1 px-4 py-3">
                  <div className="space-y-3">
                    {messages.length === 0 && (
                      <p className="text-sm text-muted-foreground">Empieza la conversación con Venty ✨</p>
                    )}
                    {messages.map((m, idx) => (
                      <div key={m.id ?? idx} className="space-y-2">
                        <article className="max-w-[85%] rounded-lg bg-muted px-3 py-2 text-sm">
                          <p className="whitespace-pre-wrap leading-relaxed">{m.message}</p>
                        </article>
                        {m.response && (
                          <article className="ml-auto max-w-[85%] rounded-lg bg-primary/10 px-3 py-2 text-sm">
                            <p className="whitespace-pre-wrap leading-relaxed">{m.response}</p>
                          </article>
                        )}
                      </div>
                    ))}
                    {sending && (
                      <p className="text-xs text-muted-foreground">Venty está pensando…</p>
                    )}
                    <div ref={endRef} />
                  </div>
                </ScrollArea>

                <footer className="border-t p-3">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder={canChat ? "Escribe tu mensaje…" : "Inicia sesión para chatear"}
                      value={input}
                      disabled={!canChat || sending}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={onKeyDown}
                      aria-label="Mensaje para Venty"
                    />
                    <Button onClick={handleSend} disabled={!canChat || sending || !input.trim()} aria-label="Enviar">
                      <Send />
                    </Button>
                  </div>
                </footer>
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
};

export default VentyWidget;
