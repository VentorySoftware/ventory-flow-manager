import "https://deno.land/x/xhr@0.4.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as XLSX from "https://cdn.sheetjs.com/xlsx-0.20.2/package/xlsx.mjs";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helpers
function json(data: any, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { "Content-Type": "application/json", ...corsHeaders, ...(init.headers || {}) },
  });
}

function requireEnv(name: string) {
  const val = Deno.env.get(name);
  if (!val) throw new Error(`Missing env: ${name}`);
  return val;
}

function isEmail(str: string) {
  return /.+@.+\..+/.test(String(str || "").trim());
}

function parseNumber(n: any) {
  if (n === undefined || n === null || n === "") return NaN;
  const v = typeof n === "number" ? n : Number(String(n).replace(/,/g, "."));
  return Number.isFinite(v) ? v : NaN;
}

function passwordGen() {
  // Simple strong-ish password
  const base = crypto.getRandomValues(new Uint32Array(4)).join("");
  return `V3nt0ry!${base.slice(0, 8)}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { jobId } = await req.json();
    if (!jobId) return json({ error: "jobId requerido" }, { status: 400 });

    const SUPABASE_URL = requireEnv("SUPABASE_URL");
    const ANON_KEY = requireEnv("SUPABASE_ANON_KEY");
    const SERVICE_ROLE = requireEnv("SUPABASE_SERVICE_ROLE_KEY");

    const authHeader = req.headers.get("Authorization") ?? "";

    // User-scoped client (for RLS ownership checks if needed)
    const supabase = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    // Admin client for privileged operations (auth admin, cross-tenant updates)
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    // Fetch job
    const { data: job, error: jobErr } = await admin
      .from("import_jobs")
      .select("*")
      .eq("id", jobId)
      .single();
    if (jobErr || !job) throw new Error(`Job no encontrado: ${jobErr?.message}`);

    // Flip status to processing
    await admin.from("import_jobs").update({ status: "processing" }).eq("id", jobId);

    // We expect file_url to be a storage path like `${user_id}/filename.xlsx`
    const filePath: string = job.file_url;

    // Download file from storage
    const { data: fileBlob, error: dlErr } = await admin.storage.from("imports").download(filePath);
    if (dlErr) throw new Error(`No se pudo descargar el archivo: ${dlErr.message}`);

    const arrayBuf = await fileBlob.arrayBuffer();
    let rows: any[] = [];
    try {
      const wb = XLSX.read(arrayBuf, { type: "array" });
      const first = wb.SheetNames[0];
      const sheet = wb.Sheets[first];
      rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
    } catch (e) {
      throw new Error(`Error al leer Excel: ${(e as Error).message}`);
    }

    const total = rows.length;
    await admin.from("import_jobs").update({ total_records: total }).eq("id", jobId);

    let processed = 0, ok = 0, fail = 0;

    async function addRecord(rowIdx: number, row: any, status: string, error_message?: string, created_record_id?: string) {
      await admin.from("import_records").insert({
        import_job_id: jobId,
        row_number: rowIdx + 2, // +2 to account for header row in Excel (1) and 1-indexing
        record_data: row,
        status,
        error_message: error_message || null,
        created_record_id: created_record_id || null,
      });
    }

    // Validators
    async function validateCategory(name: string): Promise<string | null> {
      if (!name) return null;
      const { data, error } = await admin.from("categories").select("id").eq("name", name).maybeSingle();
      if (error) throw error;
      return data?.id ?? null;
    }

    async function productBySku(sku: string): Promise<string | null> {
      const { data, error } = await admin.from("products").select("id").eq("sku", sku).maybeSingle();
      if (error) throw error;
      return data?.id ?? null;
    }

    async function processProducts() {
      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        try {
          const name = String(r.name || r.Nombre || r.NOMBRE || "").trim();
          const sku = String(r.sku || r.SKU || "").trim();
          const price = parseNumber(r.price ?? r.Precio ?? r.precio);
          const stock = parseInt(String(r.stock ?? r.Stock ?? r.STOCK ?? "0"), 10) || 0;
          const categoryName = String(r.category || r.Categoria || r.categoria || "").trim();

          if (!name) throw new Error("Nombre es requerido");
          if (!sku) throw new Error("SKU es requerido");
          if (!Number.isFinite(price) || price < 0) throw new Error("Precio inválido");
          if (!Number.isFinite(stock) || stock < 0) throw new Error("Stock inválido");

          const existing = await productBySku(sku);
          if (existing) throw new Error("SKU ya existe");

          let category_id: string | null = null;
          if (categoryName) {
            category_id = await validateCategory(categoryName);
            if (!category_id) throw new Error(`Categoría no existe: ${categoryName}`);
          }

          const { data: inserted, error } = await admin
            .from("products")
            .insert({
              name,
              sku,
              price,
              stock,
              category_id,
              unit: "unit",
              is_active: true,
            })
            .select("id")
            .single();

          if (error) throw error;
          ok++;
          await addRecord(i, r, "success", undefined, inserted.id);
        } catch (e) {
          fail++;
          await addRecord(i, rows[i], "error", (e as Error).message);
        } finally {
          processed++;
          if (processed % 10 === 0 || processed === total) {
            await admin.from("import_jobs").update({ processed_records: processed, successful_records: ok, failed_records: fail }).eq("id", jobId);
          }
        }
      }
    }

    async function processStock() {
      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        try {
          const sku = String(r.sku || r.SKU || "").trim();
          const stock = parseInt(String(r.stock ?? r.Stock ?? r.STOCK ?? ""), 10);
          if (!sku) throw new Error("SKU es requerido");
          if (!Number.isFinite(stock)) throw new Error("Stock inválido");

          const pid = await productBySku(sku);
          if (!pid) throw new Error("Producto no encontrado por SKU");

          const { error } = await admin.from("products").update({ stock }).eq("id", pid);
          if (error) throw error;

          ok++;
          await addRecord(i, r, "success", undefined, pid);
        } catch (e) {
          fail++;
          await addRecord(i, r, "error", (e as Error).message);
        } finally {
          processed++;
          if (processed % 10 === 0 || processed === total) {
            await admin.from("import_jobs").update({ processed_records: processed, successful_records: ok, failed_records: fail }).eq("id", jobId);
          }
        }
      }
    }

    async function processUsers() {
      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        try {
          const email = String(r.email || r.Email || r.EMAIL || "").trim();
          const full_name = String(r.full_name || r.Nombre || r.name || "").trim();
          const role = String(r.role || r.Rol || r.ROL || "user").toLowerCase();
          if (!isEmail(email)) throw new Error("Email inválido");
          if (!full_name) throw new Error("Nombre es requerido");
          if (!["admin", "moderator", "user"].includes(role)) throw new Error("Rol inválido");

          const password = passwordGen();

          // Create auth user
          const { data: created, error: createErr } = await admin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name },
          });
          if (createErr) throw new Error(`Error creando usuario: ${createErr.message}`);
          const uid = created.user?.id;
          if (!uid) throw new Error("No se recibió ID de usuario");

          // Insert profile
          const { error: profErr } = await admin.from("profiles").insert({
            user_id: uid,
            full_name,
            email,
            is_active: true,
          });
          if (profErr) throw profErr;

          // Assign role
          const { error: roleErr } = await admin.from("user_roles").insert({ user_id: uid, role });
          if (roleErr) throw roleErr;

          ok++;
          await addRecord(i, r, "success", undefined, uid);
        } catch (e) {
          fail++;
          await addRecord(i, r, "error", (e as Error).message);
        } finally {
          processed++;
          if (processed % 5 === 0 || processed === total) {
            await admin.from("import_jobs").update({ processed_records: processed, successful_records: ok, failed_records: fail }).eq("id", jobId);
          }
        }
      }
    }

    // Background processing so we can respond immediately
    const task = (async () => {
      try {
        if (job.import_type === "products") await processProducts();
        else if (job.import_type === "stock") await processStock();
        else if (job.import_type === "users") await processUsers();

        await admin.from("import_jobs").update({
          status: "completed",
          processed_records: processed,
          successful_records: ok,
          failed_records: fail,
          completed_at: new Date().toISOString(),
          error_summary: { total, processed, ok, fail },
        }).eq("id", jobId);
      } catch (e) {
        await admin.from("import_jobs").update({
          status: "failed",
          processed_records: processed,
          successful_records: ok,
          failed_records: fail,
          completed_at: new Date().toISOString(),
          error_summary: { message: (e as Error).message },
        }).eq("id", jobId);
      }
    })();

    // Keep instance alive until finished
    // deno-lint-ignore no-explicit-any
    (globalThis as any).EdgeRuntime?.waitUntil?.(task);

    return json({ ok: true, message: "Procesamiento iniciado" }, { status: 202 });
  } catch (error) {
    console.error("process-import error", error);
    return json({ error: (error as Error).message }, { status: 500 });
  }
});
