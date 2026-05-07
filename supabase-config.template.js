
const SUPABASE_URL = "__SUPABASE_URL__";
const SUPABASE_ANON_KEY = "__SUPABASE_ANON_KEY__";

// ============================================================
// Cliente Supabase leve (sem SDK — funciona com fetch puro)
// ============================================================

const supabase = {
  _url: SUPABASE_URL,
  _key: SUPABASE_ANON_KEY,
  _token: null,

  _headers(extra = {}) {
    const h = {
      "Content-Type": "application/json",
      "apikey": this._key,
      "Prefer": "return=representation",
      ...extra,
    };
    if (this._token) h["Authorization"] = `Bearer ${this._token}`;
    return h;
  },

  async from(table) {
    const base = `${this._url}/rest/v1/${table}`;
    return {
      select: async (cols = "*") => {
        const r = await fetch(`${base}?select=${cols}&order=sort_order`, { headers: supabase._headers() });
        return r.ok ? r.json() : [];
      },
      upsert: async (data) => {
        const r = await fetch(base, {
          method: "POST",
          headers: supabase._headers({ "Prefer": "resolution=merge-duplicates,return=representation" }),
          body: JSON.stringify(Array.isArray(data) ? data : [data]),
        });
        return r.ok;
      },
      insert: async (data) => {
        const r = await fetch(base, {
          method: "POST",
          headers: supabase._headers(),
          body: JSON.stringify(data),
        });
        return r.ok;
      },
      update: async (id, data) => {
        const r = await fetch(`${base}?id=eq.${id}`, {
          method: "PATCH",
          headers: supabase._headers(),
          body: JSON.stringify(data),
        });
        return r.ok;
      },
      delete: async (id) => {
        const r = await fetch(`${base}?id=eq.${id}`, {
          method: "DELETE",
          headers: supabase._headers(),
        });
        return r.ok;
      },
    };
  },

  async signIn(email, password) {
    const r = await fetch(`${this._url}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "apikey": this._key },
      body: JSON.stringify({ email, password }),
    });
    if (!r.ok) return null;
    const data = await r.json();
    this._token = data.access_token;
    sessionStorage.setItem("sb_token", this._token);
    return data;
  },

  async signOut() {
    await fetch(`${this._url}/auth/v1/logout`, {
      method: "POST",
      headers: this._headers(),
    });
    this._token = null;
    sessionStorage.removeItem("sb_token");
  },

  restoreSession() {
    const t = sessionStorage.getItem("sb_token");
    if (t) this._token = t;
    return !!t;
  },

  async uploadImage(file, path) {
    const r = await fetch(`${this._url}/storage/v1/object/project-images/${path}`, {
      method: "POST",
      headers: { "apikey": this._key, "Authorization": `Bearer ${this._token}` },
      body: file,
    });
    if (!r.ok) return null;
    return `${this._url}/storage/v1/object/public/project-images/${path}`;
  },

  isConfigured() {
    return this._url && this._key && !this._url.startsWith("__");
  },
};

// Tenta restaurar sessão ao carregar
supabase.restoreSession();

// Disponível globalmente
window.supabase = supabase;
window.SUPABASE_CONFIGURED = supabase.isConfigured();
