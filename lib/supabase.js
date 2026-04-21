// Thin wrapper around the Supabase JS client. Exposes two globals:
//   window.sb                 — the configured Supabase client
//   window.gwclApi            — small helpers the React prototype can call
//
// Wiring happens in index.html (see SETUP.md). If config.js is missing the
// script no-ops gracefully so the mock-data prototype still runs.

(function () {
  const cfg = window.GWCL_CONFIG;
  if (!cfg || !cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY ||
      cfg.SUPABASE_URL.includes("YOUR-PROJECT")) {
    console.warn("[gwcl] lib/config.js not filled in — running in mock mode.");
    window.gwclApi = { enabled: false };
    return;
  }

  // supabase-js is loaded via <script> in index.html; it registers window.supabase
  const { createClient } = window.supabase;
  const sb = createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
  window.sb = sb;

  async function signInWithAzure() {
    return sb.auth.signInWithOAuth({ provider: "azure", options: { scopes: "email openid profile" } });
  }
  async function signOut() { return sb.auth.signOut(); }
  async function currentUser() { const { data } = await sb.auth.getUser(); return data.user; }

  async function listApplications() {
    const { data, error } = await sb
      .from("applications")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  }

  async function getApplication(id) {
    const { data, error } = await sb
      .from("applications")
      .select("*, application_staff(*), application_tools(*), application_projects(*), application_docs(*), audit_log(*)")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  }

  async function saveApplication(app) {
    const { data, error } = await sb.from("applications").upsert(app).select().single();
    if (error) throw error;
    return data;
  }

  async function uploadDoc(applicationId, docType, file) {
    const path = `${applicationId}/${docType}-${Date.now()}-${file.name}`;
    const { error: upErr } = await sb.storage.from("docs").upload(path, file, { upsert: true });
    if (upErr) throw upErr;
    const { error: dbErr } = await sb
      .from("application_docs")
      .upsert({ application_id: applicationId, doc_type: docType, file_path: path });
    if (dbErr) throw dbErr;
    return path;
  }

  window.gwclApi = {
    enabled: true,
    signInWithAzure, signOut, currentUser,
    listApplications, getApplication, saveApplication, uploadDoc,
  };
  console.info("[gwcl] Supabase client ready.");
})();
