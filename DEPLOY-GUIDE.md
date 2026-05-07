# 🚀 Guia de Deploy — Marcus Andrei Portfolio

Stack: **HTML + React (CDN) + Three.js · Supabase · Netlify · GitHub**

---

## PASSO 1 — Supabase

### 1.1 Criar o projeto
1. Acesse [supabase.com](https://supabase.com) → faça login
2. **New project** → Nome: `portfolio-marcus` · Região: **South America (São Paulo)**
3. Gere senha forte e **salve**
4. Aguarde ~2 min

### 1.2 Pegar as chaves
**Settings → API**:
- Copie **Project URL** → vai virar `SUPABASE_URL` (env var)
- Copie **anon / public key** → vai virar `SUPABASE_ANON_KEY` (env var)

> ⚠️ **NUNCA** copie a `service_role` key. Ela é admin total e não deve sair do servidor.

### 1.3 Criar tabelas (SQL Editor → New query)

```sql
-- Perfil do portfólio
create table if not exists portfolio_profile (
  id uuid primary key default gen_random_uuid(),
  name text not null, headline text, tagline text, about text,
  location text, email text, github text, linkedin text,
  ui jsonb default '{}'::jsonb,
  updated_at timestamptz default now()
);

-- Projetos
create table if not exists portfolio_projects (
  id uuid primary key default gen_random_uuid(),
  title text not null, description text, tags text[] default '{}',
  year text, image_url text, sort_order int default 0,
  created_at timestamptz default now()
);

-- Skills
create table if not exists portfolio_skills (
  id uuid primary key default gen_random_uuid(),
  name text not null, category text, sort_order int default 0
);

-- Experiências
create table if not exists portfolio_experience (
  id uuid primary key default gen_random_uuid(),
  role text, company text, period text, description text,
  sort_order int default 0
);

-- Depoimentos
create table if not exists portfolio_testimonials (
  id uuid primary key default gen_random_uuid(),
  quote text, author text, role text, sort_order int default 0
);

-- RLS: leitura pública, escrita só autenticado
alter table portfolio_profile      enable row level security;
alter table portfolio_projects     enable row level security;
alter table portfolio_skills       enable row level security;
alter table portfolio_experience   enable row level security;
alter table portfolio_testimonials enable row level security;

create policy "public read profile"      on portfolio_profile      for select using (true);
create policy "auth write profile"       on portfolio_profile      for all    using (auth.role() = 'authenticated');
create policy "public read projects"     on portfolio_projects     for select using (true);
create policy "auth write projects"      on portfolio_projects     for all    using (auth.role() = 'authenticated');
create policy "public read skills"       on portfolio_skills       for select using (true);
create policy "auth write skills"        on portfolio_skills       for all    using (auth.role() = 'authenticated');
create policy "public read experience"   on portfolio_experience   for select using (true);
create policy "auth write experience"    on portfolio_experience   for all    using (auth.role() = 'authenticated');
create policy "public read testimonials" on portfolio_testimonials for select using (true);
create policy "auth write testimonials"  on portfolio_testimonials for all    using (auth.role() = 'authenticated');
```

### 1.4 Bucket de imagens
**Storage → New bucket**: nome `project-images` · **Public** ✅

### 1.5 Usuário admin
**Authentication → Users → Invite user** → seu email → confirme no link → defina senha.

---

## PASSO 2 — GitHub

```bash
git init
git add .
git commit -m "first commit: portfolio v3"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/portfolio.git
git push -u origin main
```

> ✅ O `.gitignore` já protege `.env` e `supabase-config.js` — **nenhuma chave vai pro GitHub**.

---

## PASSO 3 — Netlify

### 3.1 Conectar
1. [netlify.com](https://netlify.com) → **Sign up** com GitHub
2. **Add new site → Import an existing project → GitHub** → selecione o repo

### 3.2 Build settings (já no `netlify.toml`)
- **Build command:** `node build.js`
- **Publish directory:** `.`

### 3.3 ⚡ Variáveis de ambiente (PASSO CRÍTICO)
**Site settings → Environment variables → Add a variable**:

| Key                  | Value                              |
|----------------------|------------------------------------|
| `SUPABASE_URL`       | `https://xxxxxxxx.supabase.co`     |
| `SUPABASE_ANON_KEY`  | `eyJhbGciOi...` (anon key)         |

### 3.4 Deploy
**Deploy site** → ~30s → URL tipo `amazing-name-123.netlify.app` 🎉

A partir daí, **todo `git push`** no `main` dispara novo deploy automático.

---

## PASSO 4 — Domínio personalizado (opcional)

### Registrar
- **Registro.br** → `.com.br` ~R$40/ano
- **Namecheap** → `.com` ~US$10/ano

### Conectar
1. Netlify → **Domain settings → Add domain** → digite seu domínio
2. Netlify gera 4 nameservers (`dns1.netlify.app`, ...)
3. No registrador → DNS → trocar nameservers pelos do Netlify
4. Aguardar até 24h (geralmente <1h)
5. HTTPS automático via Let's Encrypt ✅

---

## 🔄 Fluxo completo

```
Você edita o admin do site
        ↓
Salva no Supabase (nuvem)
        ↓
Visitantes veem dados atualizados (sem deploy)
        ↓ (quando muda código)
git push
        ↓
Netlify roda `node build.js` (gera supabase-config.js com env vars)
        ↓
Deploy automático ✅
```

---

## 🛡️ Resumo de segurança

| Item                              | Status |
|-----------------------------------|--------|
| Chaves fora do repositório        | ✅ via env vars do Netlify |
| `.env` e `supabase-config.js` ignorados | ✅ no `.gitignore` |
| Row Level Security ativo          | ✅ leitura pública, escrita autenticada |
| HTTPS forçado (HSTS)              | ✅ via `netlify.toml` |
| Headers de segurança              | ✅ X-Frame-Options, nosniff, Referrer-Policy |
| Auth real (não senha hardcoded)   | ✅ Supabase Auth |

---

## 🐛 Troubleshooting

**`build.js: variáveis não definidas` no Netlify**
→ Vá em **Site settings → Environment variables** e confirme que `SUPABASE_URL` e `SUPABASE_ANON_KEY` estão definidos. Depois: **Deploys → Trigger deploy → Clear cache and deploy site**.

**Site carrega mas dados não aparecem**
→ Abra o DevTools (F12) → Console. Se ver erro 401/403 do Supabase, verifique:
1. As policies RLS foram criadas?
2. As env vars no Netlify estão corretas?

**Login não funciona em produção**
→ Verifique se o usuário existe em **Authentication → Users** e se confirmou o email.

---

## ✅ Próximos passos sugeridos
- [ ] Conectar domínio personalizado
- [ ] Adicionar Plausible Analytics (grátis, open-source, sem cookies)
- [ ] SEO: gerar `sitemap.xml` e `robots.txt`
- [ ] Formspree no formulário de contato
- [ ] Adicionar Open Graph image personalizada
