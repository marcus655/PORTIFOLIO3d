// portfolio-data.jsx
// Fonte de dados do portfólio — carrega do Supabase, localStorage como fallback.

const DEFAULT_DATA = {
  name: "Marcus Andrei",
  headline: "Desenvolvedor Java Júnior",
  tagline: "// em transição para o IFBA — aprendendo, construindo, evoluindo",
  about: "Sou estudante de desenvolvimento em início de carreira. Atualmente curso ADS em EAD há mais de um ano e estou em processo de transferência para o IFBA de Irecê–BA para reiniciar a formação em busca de um ensino de maior qualidade. Trabalho como auxiliar administrativo e, nesse meio tempo, desenvolvo tanto o site institucional quanto o sistema interno da empresa em que atuo — levando código do zero à produção e aprendendo no processo.",
  location: "Irecê — Bahia",
  email: "marcus.andrei@email.com",
  github: "github.com/marcusandrei",
  linkedin: "linkedin.com/in/marcusandrei",
  photo: null,        // URL da foto de perfil
  cvUrl: null,        // URL do PDF do currículo
  formspreeId: "",   // ID do Formspree para formulário de contato

  skills: [
    { name: "Java", category: "Backend" },
    { name: "Spring Boot", category: "Backend" },
    { name: "MySQL", category: "Database" },
    { name: "HTML / CSS", category: "Frontend" },
    { name: "JavaScript", category: "Frontend" },
    { name: "Git & GitHub", category: "Ferramentas" },
    { name: "POO", category: "Fundamentos" },
    { name: "REST APIs", category: "Backend" },
  ],

  experience: [
    {
      role: "Auxiliar Administrativo & Desenvolvedor",
      company: "Empresa atual",
      period: "Atualmente",
      description: "Atuo como auxiliar administrativo e, em paralelo, desenvolvo o site institucional e o sistema interno da empresa. Responsável pelo projeto do zero — levantamento de requisitos, modelagem, código e deploy.",
    },
    {
      role: "Estudante de ADS — IFBA Irecê (em transição)",
      company: "Instituto Federal da Bahia — Campus Irecê",
      period: "Em breve",
      description: "Em processo de transferência para iniciar a graduação em Análise e Desenvolvimento de Sistemas no IFBA, em busca de um ensino presencial e de maior qualidade.",
    },
    {
      role: "Estudante de ADS — EAD",
      company: "Graduação EAD",
      period: "2024 — 2026",
      description: "Mais de um ano cursando Análise e Desenvolvimento de Sistemas na modalidade EAD. Estou saindo para recomeçar presencialmente no IFBA.",
    },
  ],

  projects: [
    { id: "p1", title: "Sistema Interno da Empresa", tags: ["Java", "Spring Boot", "MySQL"], description: "Sistema de gestão interno que estou desenvolvendo para a empresa onde trabalho. Cadastros, controle de processos e relatórios.", year: "2026", image: null, github: "", link: "" },
    { id: "p2", title: "Site Institucional", tags: ["HTML", "CSS", "JavaScript"], description: "Site da empresa onde trabalho. Vitrine digital com informações, serviços e contato.", year: "2026", image: null, github: "", link: "" },
    { id: "p3", title: "Portfólio 3D", tags: ["HTML", "CSS", "Three.js"], description: "Este portfólio que você está vendo. Interface com efeitos 3D, cursor custom e painel administrativo.", year: "2026", image: null, github: "", link: "" },
    { id: "p4", title: "TaskFlow API", tags: ["Java", "Spring Boot"], description: "Estudo prático: API REST para gerenciamento de tarefas com autenticação JWT e documentação Swagger.", year: "2025", image: null, github: "", link: "" },
    { id: "p5", title: "Biblioteca Online", tags: ["Java", "Spring MVC"], description: "Sistema web de estudo para cadastro e empréstimo de livros. CRUD completo e controle de usuários.", year: "2025", image: null, github: "", link: "" },
    { id: "p6", title: "Calculadora Financeira", tags: ["Java", "JavaFX"], description: "App desktop para calcular juros e financiamentos. Projeto feito para praticar orientação a objetos.", year: "2024", image: null, github: "", link: "" },
    { id: "p7", title: "To-do CLI", tags: ["Java"], description: "Gerenciador de tarefas pelo terminal com persistência em arquivo. Exercício para praticar I/O em Java.", year: "2024", image: null, github: "", link: "" },
  ],

  testimonials: [],

  ui: {
    heroCtaPrimary: "EXPLORAR PROJETOS ▶",
    heroCtaSecondary: "→ ENTRAR EM CONTATO",
    statusBadge: "● DISPONÍVEL",
    aboutTitle: "Em construção.\nSempre aprendendo.",
    projectsTitle: "Meus projetos.",
    skillsTitle: "Stack em estudo.",
    experienceTitle: "Trajetória.",
    testimonialsTitle: "Recomendações.",
    contactTitle: "Vamos\nconversar.",
    contactSubtitle: "Aberto para oportunidades, projetos freela e networking.",
    footerTag: "build.v3.synthgrid",
  },
};

const LS_KEY = "marcus_portfolio_data_v2";

// ─── LocalStorage helpers ───────────────────────────────────────────────────

function lsLoad() {
  try {
    localStorage.removeItem("marcus_portfolio_data_v1");
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    return { ...DEFAULT_DATA, ...p, ui: { ...DEFAULT_DATA.ui, ...(p.ui || {}) } };
  } catch { return null; }
}

function lsSave(data) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(data)); } catch {}
}

// ─── Supabase helpers ────────────────────────────────────────────────────────

async function sbLoad() {
  if (!window.supabase || !window.SUPABASE_CONFIGURED) return null;
  try {
    const sb = window.supabase;
    const headers = {
      "Content-Type": "application/json",
      "apikey": sb._key,
    };
    if (sb._token) headers["Authorization"] = `Bearer ${sb._token}`;

    const [profileRes, projectsRes, skillsRes, expRes, testRes] = await Promise.all([
      fetch(`${sb._url}/rest/v1/portfolio_profile?select=*&limit=1`, { headers }),
      fetch(`${sb._url}/rest/v1/portfolio_projects?select=*&order=sort_order`, { headers }),
      fetch(`${sb._url}/rest/v1/portfolio_skills?select=*&order=sort_order`, { headers }),
      fetch(`${sb._url}/rest/v1/portfolio_experience?select=*&order=sort_order`, { headers }),
      fetch(`${sb._url}/rest/v1/portfolio_testimonials?select=*&order=sort_order`, { headers }),
    ]);

    if (!profileRes.ok) return null;

    const [profiles, projects, skills, experience, testimonials] = await Promise.all([
      profileRes.json(), projectsRes.json(), skillsRes.json(), expRes.json(), testRes.json(),
    ]);

    const profile = profiles[0];
    if (!profile) return null;

    return {
      ...DEFAULT_DATA,
      name: profile.name || DEFAULT_DATA.name,
      headline: profile.headline || DEFAULT_DATA.headline,
      tagline: profile.tagline || DEFAULT_DATA.tagline,
      about: profile.about || DEFAULT_DATA.about,
      location: profile.location || DEFAULT_DATA.location,
      email: profile.email || DEFAULT_DATA.email,
      github: profile.github || DEFAULT_DATA.github,
      linkedin: profile.linkedin || DEFAULT_DATA.linkedin,
      photo: profile.photo || null,
      cvUrl: profile.cv_url || null,
      formspreeId: profile.formspree_id || "",
      ui: { ...DEFAULT_DATA.ui, ...(profile.ui || {}) },
      projects: projects.length > 0 ? projects.map(p => ({
        id: p.id, title: p.title, tags: p.tags || [], description: p.description,
        year: p.year, image: p.image_url || null, github: p.github_url || "", link: p.project_link || "",
      })) : DEFAULT_DATA.projects,
      skills: skills.length > 0 ? skills.map(s => ({ name: s.name, category: s.category })) : DEFAULT_DATA.skills,
      experience: experience.length > 0 ? experience.map(x => ({ role: x.role, company: x.company, period: x.period, description: x.description })) : DEFAULT_DATA.experience,
      testimonials: testimonials.map(t => ({ quote: t.quote, author: t.author, role: t.role })),
    };
  } catch (e) {
    console.warn("Supabase load failed, using local data", e);
    return null;
  }
}

async function sbSave(data) {
  if (!window.supabase || !window.SUPABASE_CONFIGURED || !window.supabase._token) return false;
  try {
    const sb = window.supabase;
    const headers = {
      "Content-Type": "application/json",
      "apikey": sb._key,
      "Authorization": `Bearer ${sb._token}`,
      "Prefer": "resolution=merge-duplicates,return=minimal",
    };

    // 1. Upsert profile (fixed id "main")
    await fetch(`${sb._url}/rest/v1/portfolio_profile`, {
      method: "POST", headers,
      body: JSON.stringify([{
        id: "00000000-0000-0000-0000-000000000001",
        name: data.name, headline: data.headline, tagline: data.tagline,
        about: data.about, location: data.location, email: data.email,
        github: data.github, linkedin: data.linkedin,
        photo: data.photo || null,
        cv_url: data.cvUrl || null,
        formspree_id: data.formspreeId || "",
        ui: data.ui || {},
        updated_at: new Date().toISOString(),
      }]),
    });

    // 2. Replace projects: delete all then insert
    await fetch(`${sb._url}/rest/v1/portfolio_projects?id=neq.00000000-0000-0000-0000-000000000000`, {
      method: "DELETE", headers,
    });
    if (data.projects.length > 0) {
      await fetch(`${sb._url}/rest/v1/portfolio_projects`, {
        method: "POST",
        headers: { ...headers, Prefer: "return=minimal" },
        body: JSON.stringify(data.projects.map((p, i) => ({
          title: p.title, description: p.description, tags: p.tags || [],
          year: p.year, image_url: p.image || null,
          github_url: p.github || "", project_link: p.link || "",
          sort_order: i,
        }))),
      });
    }

    // 3. Replace skills
    await fetch(`${sb._url}/rest/v1/portfolio_skills?id=neq.00000000-0000-0000-0000-000000000000`, {
      method: "DELETE", headers,
    });
    if (data.skills.length > 0) {
      await fetch(`${sb._url}/rest/v1/portfolio_skills`, {
        method: "POST",
        headers: { ...headers, Prefer: "return=minimal" },
        body: JSON.stringify(data.skills.map((s, i) => ({ name: s.name, category: s.category, sort_order: i }))),
      });
    }

    // 4. Replace experience
    await fetch(`${sb._url}/rest/v1/portfolio_experience?id=neq.00000000-0000-0000-0000-000000000000`, {
      method: "DELETE", headers,
    });
    if (data.experience.length > 0) {
      await fetch(`${sb._url}/rest/v1/portfolio_experience`, {
        method: "POST",
        headers: { ...headers, Prefer: "return=minimal" },
        body: JSON.stringify(data.experience.map((x, i) => ({ role: x.role, company: x.company, period: x.period, description: x.description, sort_order: i }))),
      });
    }

    // 5. Replace testimonials
    await fetch(`${sb._url}/rest/v1/portfolio_testimonials?id=neq.00000000-0000-0000-0000-000000000000`, {
      method: "DELETE", headers,
    });
    if (data.testimonials.length > 0) {
      await fetch(`${sb._url}/rest/v1/portfolio_testimonials`, {
        method: "POST",
        headers: { ...headers, Prefer: "return=minimal" },
        body: JSON.stringify(data.testimonials.map((t, i) => ({ quote: t.quote, author: t.author, role: t.role, sort_order: i }))),
      });
    }

    return true;
  } catch (e) {
    console.error("Supabase save failed", e);
    return false;
  }
}

// ─── Upload de imagem para Supabase Storage ─────────────────────────────────

async function uploadImageToSupabase(file) {
  if (!window.supabase || !window.SUPABASE_CONFIGURED || !window.supabase._token) return null;
  const sb = window.supabase;
  const path = `projects/${Date.now()}-${file.name.replace(/[^a-z0-9.]/gi, "_")}`;
  const r = await fetch(`${sb._url}/storage/v1/object/project-images/${path}`, {
    method: "POST",
    headers: { "apikey": sb._key, "Authorization": `Bearer ${sb._token}`, "Content-Type": file.type },
    body: file,
  });
  if (!r.ok) return null;
  return `${sb._url}/storage/v1/object/public/project-images/${path}`;
}

// ─── Evento global para sincronização ───────────────────────────────────────

function notifyDataChanged(data) {
  window.dispatchEvent(new CustomEvent("portfolio-data-changed", { detail: data }));
}

async function saveData(data) {
  lsSave(data);
  notifyDataChanged(data);
  const ok = await sbSave(data);
  if (ok) console.log("✅ Salvo no Supabase");
  else console.log("💾 Salvo localmente (Supabase indisponível ou não autenticado)");
}

async function resetData() {
  localStorage.removeItem(LS_KEY);
  notifyDataChanged(DEFAULT_DATA);
}

// ─── Hook principal ──────────────────────────────────────────────────────────

function usePortfolioData() {
  const [data, setDataState] = React.useState(() => lsLoad() || DEFAULT_DATA);
  const [loading, setLoading] = React.useState(true);

  // Carrega do Supabase na montagem
  React.useEffect(() => {
    sbLoad().then(sbData => {
      if (sbData) {
        setDataState(sbData);
        lsSave(sbData);
      }
      setLoading(false);
    });
  }, []);

  // Escuta mudanças locais
  React.useEffect(() => {
    const handler = (e) => setDataState(e.detail);
    window.addEventListener("portfolio-data-changed", handler);
    return () => window.removeEventListener("portfolio-data-changed", handler);
  }, []);

  const setData = async (newData) => {
    setDataState(newData);
    await saveData(newData);
  };

  return [data, setData, loading];
}

Object.assign(window, {
  DEFAULT_DATA, lsLoad, lsSave, sbLoad, sbSave,
  saveData, resetData, usePortfolioData, uploadImageToSupabase,
});
