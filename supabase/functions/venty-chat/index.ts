import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const N8N_VENTY_WEBHOOK = Deno.env.get("N8N_VENTY_WEBHOOK") ?? Deno.env.get("venty_secret");

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, message } = await req.json();

    if (!user_id || !message) {
      return new Response(
        JSON.stringify({ error: "Faltan parámetros: user_id y message son requeridos" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!N8N_VENTY_WEBHOOK) {
      const err = "Falta configurar el secret N8N_VENTY_WEBHOOK o venty_secret en Secrets de Edge Functions";
      console.error(err);
      await supabase.from("venty_failures").insert({ user_id, message, error: err });
      return new Response(JSON.stringify({ error: err }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Forward to n8n with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000); // 20s

    let n8nResponseText = "";
    try {
      const n8nResp = await fetch(N8N_VENTY_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id, message }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      n8nResponseText = await n8nResp.text();

      if (!n8nResp.ok) {
        const err = `n8n error ${n8nResp.status}: ${n8nResponseText}`;
        console.error(err);
        await supabase.from("venty_failures").insert({ user_id, message, error: err });
        return new Response(JSON.stringify({ error: "n8n no respondió correctamente" }), {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } catch (e) {
      const err = `Timeout o fallo al contactar n8n: ${e?.message ?? e}`;
      console.error(err);
      await supabase.from("venty_failures").insert({ user_id, message, error: err });
      return new Response(JSON.stringify({ error: "No se pudo contactar n8n" }), {
        status: 504,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Try to parse JSON response and extract reply
    let reply: string | null = null;
    try {
      const parsed = JSON.parse(n8nResponseText);
      reply = parsed?.response ?? parsed?.reply ?? parsed?.generatedText ?? null;
    } catch {
      // If it's plain text, use that
      reply = n8nResponseText || null;
    }

    return new Response(JSON.stringify({ response: reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error en vent y-chat:", error);
    return new Response(JSON.stringify({ error: "Error interno" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
