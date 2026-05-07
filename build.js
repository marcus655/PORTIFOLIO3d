#!/usr/bin/env node
/**
 * build.js
 * ----------------------------------------------------------------------------
 * Gera `supabase-config.js` a partir de variáveis de ambiente no momento do
 * deploy (Netlify). Assim, as chaves NUNCA ficam commitadas no repositório.
 *
 * Em produção (Netlify):
 *   Configure em Site settings → Environment variables:
 *     SUPABASE_URL       = https://xxxxx.supabase.co
 *     SUPABASE_ANON_KEY  = eyJhbGciOi...
 *
 * Em desenvolvimento local:
 *   Crie um arquivo `.env` (não commitado) com as mesmas variáveis,
 *   ou rode:  SUPABASE_URL=... SUPABASE_ANON_KEY=... node build.js
 * ----------------------------------------------------------------------------
 */

const fs = require("fs");
const path = require("path");

// Carrega .env local se existir (sem dependências externas)
const envFile = path.join(__dirname, ".env");
if (fs.existsSync(envFile)) {
  fs.readFileSync(envFile, "utf-8")
    .split("\n")
    .forEach((line) => {
      const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
      }
    });
}

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("\n❌  build.js: variáveis SUPABASE_URL e SUPABASE_ANON_KEY não definidas.");
  console.error("    No Netlify: Site settings → Environment variables");
  console.error("    Local:      crie um arquivo .env (veja .env.example)\n");
  process.exit(1);
}

const banner = `// ============================================================
// supabase-config.js  —  GERADO AUTOMATICAMENTE por build.js
// NÃO EDITE este arquivo. Edite as variáveis de ambiente.
// Gerado em: ${new Date().toISOString()}
// ============================================================
`;

const template = fs.readFileSync(
  path.join(__dirname, "supabase-config.template.js"),
  "utf-8"
);

const output = banner + template
  .replace("__SUPABASE_URL__", SUPABASE_URL)
  .replace("__SUPABASE_ANON_KEY__", SUPABASE_ANON_KEY);

fs.writeFileSync(path.join(__dirname, "supabase-config.js"), output);

console.log("✅  supabase-config.js gerado com sucesso.");
console.log("    URL:", SUPABASE_URL);
console.log("    KEY:", SUPABASE_ANON_KEY.slice(0, 20) + "...");
