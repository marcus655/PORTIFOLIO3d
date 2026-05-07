<div align="center">

# ⚡ Marcus Andrei — Portfólio

### Desenvolvedor Java em formação · Site pessoal interativo com 3D

[![Deploy Status](https://api.netlify.com/api/v1/badges/PLACEHOLDER/deploy-status)](https://app.netlify.com/sites/SEU-SITE/deploys)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
[![HTML](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)]()
[![React](https://img.shields.io/badge/React_18-61DAFB?style=flat-square&logo=react&logoColor=black)]()
[![Three.js](https://img.shields.io/badge/Three.js-000000?style=flat-square&logo=three.js&logoColor=white)]()
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)]()
[![Netlify](https://img.shields.io/badge/Netlify-00C7B7?style=flat-square&logo=netlify&logoColor=white)]()

**[🌐 Ver demo ao vivo](https://seu-site.netlify.app)** ·
**[📖 Guia de Deploy](DEPLOY-GUIDE.md)** ·
**[🐛 Reportar bug](../../issues)**

</div>

---

## 🎯 Sobre o projeto

Portfólio pessoal **one-page** com identidade visual marcante: cena 3D interativa no hero, animações suaves baseadas em scroll, e um painel administrativo completo para editar todo o conteúdo em tempo real **sem precisar mexer no código**.

Construído **sem framework pesado nem bundler** — apenas HTML + React via CDN + Three.js. Filosofia: simples, rápido, manutenível.

```
┌─────────────────────────────────────────────────────────────┐
│  Visitante acessa o site                                    │
│         ↓                                                   │
│  Hero 3D animado (Three.js) + dados do Supabase em tempo real│
│         ↓                                                   │
│  Você acessa /login → painel admin → edita conteúdo         │
│         ↓                                                   │
│  Mudanças aparecem para todos os visitantes instantaneamente│
└─────────────────────────────────────────────────────────────┘
```

---

## ✨ O que tem na página

### 🎨 Hero 3D interativo
Cena Three.js com **terreno wireframe ondulante** que reage ao mouse, partículas animadas em espiral, esfera wireframe central pulsante e estrelas em parallax. Click em qualquer lugar dispara uma onda de choque.

### 📜 Seções
| # | Seção | O que tem |
|---|-------|-----------|
| 01 | **About** | Bio + foto de perfil com efeito orbital + dados de contato |
| 02 | **Projects** | Grid de cards com tilt 3D, modal de detalhes, tags, links GitHub/projeto |
| 03 | **Stack** | Skills agrupadas por categoria com fundo de DNA helix 3D rotativo |
| 04 | **Timeline** | Trajetória profissional/acadêmica em layout vertical |
| 05 | **Reviews** | Depoimentos (opcional) |
| 06 | **Connect** | Formulário de contato (Formspree) ou email direto |

### 🖱️ Micro-interações
- **Cursor customizado** com ring que cresce em elementos clicáveis
- **Cards com tilt 3D** seguindo o mouse + glow radial
- **Botões magnéticos** que atraem o cursor
- **Scroll reveal** suave em todos os elementos
- **Loading screen** com barra de progresso animada

### 🔐 Painel admin (protegido por login Supabase)
- CRUD completo de projetos, skills, experiências, depoimentos
- Upload de imagens para Supabase Storage
- Reordenação drag & drop
- Edição visual com preview em tempo real
- Auto-save em nuvem
- Acesso via `/login.html` ou digitando `admin` em qualquer página

---

## 🧩 Stack técnica

| Camada | Tecnologia | Por quê |
|--------|------------|---------|
| **Frontend** | HTML + React 18 (CDN) + Babel-in-browser | Zero build complexity, edição direta |
| **3D / animação** | Three.js 0.160 | Cenas WebGL leves e performáticas |
| **Tipografia** | Space Grotesk + JetBrains Mono | Tech vibe, hierarquia clara |
| **Banco de dados** | Supabase (PostgreSQL) | Free tier generoso, REST + Auth integrados |
| **Autenticação** | Supabase Auth (email/senha) | Sem reinventar a roda |
| **Storage** | Supabase Storage | CDN automática para imagens |
| **Hospedagem** | Netlify | Deploy automático via GitHub, HTTPS grátis |
| **Build** | Node.js script (`build.js`) | Injeta env vars no config sem bundler |

---

## 📁 Estrutura do projeto

```
.
├── 📄 index.html                    # Página principal (portfólio + cena 3D)
├── 📄 login.html                    # Tela de login do admin
├── 📄 portfolio-v3.jsx              # Componentes React do portfólio
├── 📄 portfolio-data.jsx            # Camada de dados (Supabase + cache)
├── 📄 admin-panel.jsx               # Painel admin (CRUD)
├── 📄 supabase-config.template.js   # Template do client Supabase
├── 📄 build.js                      # Gera supabase-config.js a partir de env vars
├── 📄 netlify.toml                  # Config do Netlify (build + headers de segurança)
├── 📄 package.json                  # Scripts npm
├── 📄 .env.example                  # Modelo de variáveis de ambiente
├── 📄 .gitignore                    # Protege .env, supabase-config.js, etc.
├── 📄 LICENSE                       # MIT
├── 📄 DEPLOY-GUIDE.md               # Guia detalhado de deploy passo a passo
├── 📄 README.md                     # Este arquivo
└── 📁 uploads/                      # Imagens estáticas
```

> ⚠️ `supabase-config.js` é **gerado pelo build** — nunca commitado.

---

## 🔐 Segurança e proteção de dados

### Como as chaves do Supabase são protegidas

```
┌──────────────────────────────────────────────────────────┐
│  1. Você define no Netlify:                              │
│     SUPABASE_URL e SUPABASE_ANON_KEY (env vars)          │
│         ↓                                                │
│  2. No deploy, Netlify roda: node build.js               │
│         ↓                                                │
│  3. build.js lê as env vars e gera supabase-config.js    │
│         ↓                                                │
│  4. Site é publicado com as chaves embutidas             │
│                                                          │
│  ❌ supabase-config.js NUNCA vai para o GitHub           │
│  ❌ .env NUNCA vai para o GitHub                         │
│  ✅ Repositório público fica sem chaves                  │
└──────────────────────────────────────────────────────────┘
```

### Camadas de segurança aplicadas

- ✅ **Variáveis de ambiente no Netlify** — chaves fora do código
- ✅ **`.gitignore` completo** — protege `.env`, `supabase-config.js`, arquivos de IDE/OS
- ✅ **Row Level Security (RLS)** — leitura pública, escrita só com autenticação
- ✅ **Supabase Auth real** — sem senha hardcoded no código
- ✅ **HTTPS forçado (HSTS)** — `max-age=31536000`
- ✅ **Headers de segurança** — `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`
- ✅ **HTTPS automático** — Let's Encrypt via Netlify

> **Nota técnica:** a `anon key` do Supabase é **desenhada para uso no cliente** — não é uma "senha secreta". O que protege os dados de verdade é o **RLS** ativado nas tabelas. A `service_role key` (essa sim secreta) **não é usada** neste projeto.

---

## 🚀 Quick start

### 1. Clonar
```bash
git clone https://github.com/SEU_USUARIO/portfolio.git
cd portfolio
```

### 2. Configurar Supabase
Siga o **[DEPLOY-GUIDE.md](DEPLOY-GUIDE.md) → Passo 1** para criar projeto, tabelas, RLS, bucket de imagens e usuário admin.

### 3. Configurar `.env` local
```bash
cp .env.example .env
# Edite .env com suas chaves
```

### 4. Rodar localmente
```bash
node build.js          # gera supabase-config.js
npx serve .            # ou python3 -m http.server 8000
```
Abra `http://localhost:3000`.

### 5. Deploy
Veja a seção **[Deploy](#-deploy-passo-a-passo)** abaixo.

---

## 🌐 Deploy passo a passo

Guia completo e detalhado: **[DEPLOY-GUIDE.md](DEPLOY-GUIDE.md)**

Resumo:

```
GitHub → Netlify → Supabase
   ↓        ↓         ↓
 código   deploy   dados em
 versionado auto    nuvem
```

1. **Push pro GitHub** — repositório público sem chaves expostas
2. **Conectar ao Netlify** — auto-deploy a cada push no `main`
3. **Configurar env vars no Netlify** — `SUPABASE_URL` e `SUPABASE_ANON_KEY`
4. **Done** — Netlify roda `node build.js` e publica

---

## 🖥️ Comandos úteis

```bash
# Rodar localmente (gera config + servidor)
npm run dev

# Apenas gerar supabase-config.js a partir do .env
npm run build

# Push para o GitHub (dispara deploy no Netlify)
git add .
git commit -m "feat: descrição do que mudou"
git push
```

---

## 🎨 Customizando

### Trocar cores
Em `index.html`, no final:
```jsx
<PortfolioV3 accentColor="#ff00aa" bgColor="#0a0514" />
```

### Editar conteúdo
1. Acesse `/login.html` no seu site
2. Faça login com o usuário admin do Supabase
3. Painel abre automaticamente — edite tudo visualmente

### Editar dados padrão (fallback)
Em `index.html`, procure por `DEFAULT_DATA` (~linha 60).

---

## 🐛 Troubleshooting

| Problema | Solução |
|----------|---------|
| Build falha no Netlify com `variáveis não definidas` | Site settings → Environment variables → adicione `SUPABASE_URL` e `SUPABASE_ANON_KEY` |
| Site carrega mas dados não aparecem | DevTools (F12) → Console. Erro 401/403? Verifique RLS no Supabase |
| Login não funciona em produção | Authentication → Users → confirme se o usuário existe e o email foi confirmado |
| Página em branco local | Rodou `node build.js` antes de servir? |

---

## 🗺️ Roadmap

- [ ] Domínio personalizado (.com.br)
- [ ] Plausible Analytics (grátis, sem cookies)
- [ ] `sitemap.xml` + `robots.txt` para SEO
- [ ] Open Graph image personalizada
- [ ] Modo escuro/claro tweakable
- [ ] Blog (MDX → Supabase)
- [ ] i18n (PT/EN)

---

## 🤝 Contribuindo

Este é um portfólio pessoal, mas o código é aberto sob licença MIT — sinta-se à vontade para se inspirar, forkar, adaptar.

Encontrou um bug ou tem uma sugestão? Abra uma [issue](../../issues).

---

## 📄 Licença

Distribuído sob a licença **MIT**. Veja [`LICENSE`](LICENSE) para mais informações.

---

## 📬 Contato

<div align="center">

**Marcus Andrei** — Desenvolvedor Java em formação · Irecê, Bahia 🇧🇷

[![Email](https://img.shields.io/badge/Email-marcus.andrei@email.com-EA4335?style=flat-square&logo=gmail&logoColor=white)](mailto:marcus.andrei@email.com)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-marcusandrei-0A66C2?style=flat-square&logo=linkedin&logoColor=white)](https://linkedin.com/in/marcusandrei)
[![GitHub](https://img.shields.io/badge/GitHub-marcusandrei-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/marcusandrei)

---

<sub>Construído com ☕, muito CSS e Three.js · © 2025 Marcus Andrei · MIT License</sub>

</div>
