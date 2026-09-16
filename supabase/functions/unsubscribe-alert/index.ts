import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return response({ ok: true });
  if (req.method !== "POST") return response({ ok: false, error: "Method not allowed" }, 405);

  try {
    const { token } = await req.json();
    if (!token) return response({ ok: false, error: "Missing unsubscribe token" }, 400);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceKey) return response({ ok: false, error: "Supabase configuration is missing" }, 500);

    const db = createClient(supabaseUrl, serviceKey);
    const { data: alert, error: findError } = await db
      .from("stock_alerts")
      .select("id, brand, email")
      .eq("unsubscribe_token", token)
      .maybeSingle();

    if (findError) throw findError;
    if (!alert) return response({ ok: false, error: "This unsubscribe link is invalid or has already been removed" }, 404);

    const { error: deleteError } = await db
      .from("stock_alerts")
      .delete()
      .eq("id", alert.id);

    if (deleteError) throw deleteError;
    return response({ ok: true, brand: alert.brand ?? "your selected brand" });
  } catch (error) {
    console.error("Unsubscribe error:", error);
    return response({ ok: false, error: error instanceof Error ? error.message : "Could not unsubscribe" }, 500);
  }
});
