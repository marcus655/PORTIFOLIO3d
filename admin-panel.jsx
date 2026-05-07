// Admin panel — overlays on the portfolio, allows editing all data.

function AdminPanel({ onClose, accentColor = "#a3e635", bgColor = "#0a0a0a", textColor = "#e5e5e5" }) {
  const [data, setData] = usePortfolioData();
  const [tab, setTab] = React.useState("profile");
  const [draft, setDraft] = React.useState(data);
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [previewing, setPreviewing] = React.useState(false);

  React.useEffect(() => { setDraft(data); }, [JSON.stringify(data)]);

  const save = async () => {
    setSaving(true);
    await setData(draft);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Preview: temporarily apply draft data to live view
  const togglePreview = () => {
    if (!previewing) {
      window.dispatchEvent(new CustomEvent("portfolio-data-changed", { detail: draft }));
      setPreviewing(true);
    } else {
      window.dispatchEvent(new CustomEvent("portfolio-data-changed", { detail: data }));
      setPreviewing(false);
    }
  };

  const panelStyle = {
    position: "fixed", inset: 0, zIndex: 10000,
    background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "'JetBrains Mono', monospace",
  };
  const cardStyle = {
    width: "min(960px, 92vw)", maxHeight: "88vh",
    background: bgColor, color: textColor,
    border: `1px solid ${accentColor}40`,
    borderRadius: 4, display: "flex", flexDirection: "column",
    boxShadow: `0 0 60px ${accentColor}20`,
  };
  const headerStyle = {
    padding: "16px 24px", borderBottom: `1px solid ${accentColor}30`,
    display: "flex", alignItems: "center", justifyContent: "space-between",
  };
  const tabsStyle = { display: "flex", gap: 4, padding: "12px 24px 0", borderBottom: `1px solid ${accentColor}20` };
  const tabStyle = (active) => ({
    padding: "8px 14px", cursor: "pointer", fontSize: 12,
    background: active ? accentColor : "transparent",
    color: active ? "#000" : textColor,
    border: `1px solid ${active ? accentColor : accentColor + "30"}`,
    borderBottom: "none",
    borderRadius: "4px 4px 0 0",
    fontFamily: "inherit",
  });
  const bodyStyle = { padding: 24, overflowY: "auto", flex: 1 };
  const footerStyle = {
    padding: 16, borderTop: `1px solid ${accentColor}30`,
    display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12,
  };
  const inputStyle = {
    width: "100%", background: "#000", color: textColor,
    border: `1px solid ${accentColor}40`, padding: "8px 10px",
    fontFamily: "inherit", fontSize: 13, borderRadius: 2, outline: "none",
  };
  const labelStyle = { fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: accentColor, marginBottom: 4, display: "block" };
  const btn = (variant = "ghost") => ({
    padding: "8px 16px", fontSize: 12, cursor: "pointer", fontFamily: "inherit",
    border: `1px solid ${accentColor}`,
    background: variant === "primary" ? accentColor : "transparent",
    color: variant === "primary" ? "#000" : accentColor,
    borderRadius: 2, letterSpacing: 1, textTransform: "uppercase",
  });

  // Compat: se dado antigo tiver skills com level, ignora. Se não tiver ui, herda default.
  const draftSafe = draft && typeof draft === "object" ? draft : data;
  const update = (patch) => setDraft({ ...draftSafe, ...patch });

  const renderProfile = () => (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={labelStyle}>Nome</label>
          <input style={inputStyle} value={draft.name} onChange={e => update({ name: e.target.value })} />
        </div>
        <div>
          <label style={labelStyle}>Localização</label>
          <input style={inputStyle} value={draft.location} onChange={e => update({ location: e.target.value })} />
        </div>
      </div>
      <div>
        <label style={labelStyle}>Headline</label>
        <input style={inputStyle} value={draft.headline} onChange={e => update({ headline: e.target.value })} />
      </div>
      <div>
        <label style={labelStyle}>Tagline</label>
        <input style={inputStyle} value={draft.tagline} onChange={e => update({ tagline: e.target.value })} />
      </div>
      <div>
        <label style={labelStyle}>Sobre</label>
        <textarea style={{ ...inputStyle, minHeight: 120, resize: "vertical" }} value={draft.about} onChange={e => update({ about: e.target.value })} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={labelStyle}>Email</label>
          <input style={inputStyle} value={draft.email} onChange={e => update({ email: e.target.value })} />
        </div>
        <div>
          <label style={labelStyle}>GitHub</label>
          <input style={inputStyle} value={draft.github} onChange={e => update({ github: e.target.value })} />
        </div>
        <div>
          <label style={labelStyle}>LinkedIn</label>
          <input style={inputStyle} value={draft.linkedin} onChange={e => update({ linkedin: e.target.value })} />
        </div>
        <div>
          <label style={labelStyle}>URL do CV (PDF)</label>
          <input style={inputStyle} placeholder="https://..." value={draft.cvUrl || ""} onChange={e => update({ cvUrl: e.target.value })} />
        </div>
      </div>
      <div>
        <label style={labelStyle}>ID do Formspree (formulário de contato)</label>
        <input style={inputStyle} placeholder="ex: xpzgkjvw" value={draft.formspreeId || ""} onChange={e => update({ formspreeId: e.target.value })} />
        <div style={{ fontSize: 10, color: "#888", marginTop: 4 }}>Crie gratuitamente em formspree.io → pegue o ID do endpoint</div>
      </div>
      <div>
        <label style={labelStyle}>Foto de perfil</label>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          {draft.photo && <img src={draft.photo} style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover", border: `2px solid ${accentColor}` }} />}
          <label style={{ ...btn(), cursor: "pointer" }}>
            {draft.photo ? "trocar foto" : "upload foto"}
            <input type="file" accept="image/*" style={{ display: "none" }} onChange={async e => {
              const file = e.target.files[0];
              if (!file) return;
              let url = null;
              if (window.SUPABASE_CONFIGURED && window.supabase._token) url = await uploadImageToSupabase(file);
              if (!url) url = await new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(file); });
              update({ photo: url });
            }} />
          </label>
          {draft.photo && <button style={btn()} onClick={() => update({ photo: null })}>remover</button>}
        </div>
      </div>
      <div style={{ borderTop: `1px solid ${accentColor}20`, paddingTop: 14 }}>
        <label style={labelStyle}>Segurança — Trocar senha</label>
        <div style={{ fontSize: 11, color: "#888", lineHeight: 1.6, marginBottom: 8 }}>A senha é gerenciada diretamente no Supabase. Para trocar:</div>
        <a href="https://supabase.com" target="_blank" rel="noopener" style={{ ...btn(), textDecoration: "none", display: "inline-block" }}>→ Abrir Supabase Auth</a>
        <div style={{ fontSize: 10, color: "#666", marginTop: 6 }}>Authentication → Users → clique no seu usuário → Send recovery email</div>
      </div>
    </div>
  );

  const handleImageUpload = async (idx, file) => {
    // Tenta upload no Supabase Storage; fallback para base64
    let imageUrl = null;
    if (window.SUPABASE_CONFIGURED && window.supabase._token) {
      imageUrl = await uploadImageToSupabase(file);
    }
    if (!imageUrl) {
      // Fallback base64
      imageUrl = await new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    }
    const list = [...draft.projects];
    list[idx] = { ...list[idx], image: imageUrl };
    update({ projects: list });
  };

  const renderProjects = () => (
    <div style={{ display: "grid", gap: 14 }}>
      {draft.projects.map((p, i) => (
        <div key={p.id} style={{ border: `1px solid ${accentColor}30`, padding: 14, borderRadius: 2 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ color: accentColor, fontSize: 11 }}>#{i + 1} — {p.id}</span>
            <button style={btn()} onClick={() => update({ projects: draft.projects.filter(x => x.id !== p.id) })}>remover</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10, marginBottom: 8 }}>
            <input style={inputStyle} placeholder="Título" value={p.title} onChange={e => { const l = [...draft.projects]; l[i] = { ...p, title: e.target.value }; update({ projects: l }); }} />
            <input style={inputStyle} placeholder="Ano" value={p.year} onChange={e => { const l = [...draft.projects]; l[i] = { ...p, year: e.target.value }; update({ projects: l }); }} />
          </div>
          <input style={{ ...inputStyle, marginBottom: 8 }} placeholder="Tags (vírgula)" value={p.tags.join(", ")} onChange={e => { const l = [...draft.projects]; l[i] = { ...p, tags: e.target.value.split(",").map(s => s.trim()).filter(Boolean) }; update({ projects: l }); }} />
          <textarea style={{ ...inputStyle, minHeight: 60, marginBottom: 8 }} placeholder="Descrição" value={p.description} onChange={e => { const l = [...draft.projects]; l[i] = { ...p, description: e.target.value }; update({ projects: l }); }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
            <input style={inputStyle} placeholder="Link GitHub (opcional)" value={p.github || ""} onChange={e => { const l = [...draft.projects]; l[i] = { ...p, github: e.target.value }; update({ projects: l }); }} />
            <input style={inputStyle} placeholder="Link do projeto (opcional)" value={p.link || ""} onChange={e => { const l = [...draft.projects]; l[i] = { ...p, link: e.target.value }; update({ projects: l }); }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <label style={{ ...btn(), display: "inline-block" }}>
              {p.image ? "trocar imagem" : "upload imagem"}
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => e.target.files[0] && handleImageUpload(i, e.target.files[0])} />
            </label>
            {p.image && (
              <>
                <img src={p.image} style={{ width: 50, height: 50, objectFit: "cover", borderRadius: 2 }} />
                <button style={btn()} onClick={() => { const l = [...draft.projects]; l[i] = { ...p, image: null }; update({ projects: l }); }}>limpar</button>
              </>
            )}
          </div>
        </div>
      ))}
      <button style={{ ...btn("primary"), padding: 12 }} onClick={() => update({ projects: [...draft.projects, { id: "p" + Date.now(), title: "Novo projeto", tags: [], description: "", year: new Date().getFullYear().toString(), image: null }] })}>+ adicionar projeto</button>
    </div>
  );

  const renderSkills = () => (
    <div style={{ display: "grid", gap: 10 }}>
      <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>Organize suas habilidades por categoria (ex: Backend, Frontend, Ferramentas).</div>
      {draft.skills.map((s, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr auto", gap: 8, alignItems: "center" }}>
          <input style={inputStyle} placeholder="Skill (ex: Java)" value={s.name} onChange={e => { const l = [...draft.skills]; l[i] = { ...s, name: e.target.value }; update({ skills: l }); }} />
          <input style={inputStyle} placeholder="Categoria" value={s.category} onChange={e => { const l = [...draft.skills]; l[i] = { ...s, category: e.target.value }; update({ skills: l }); }} />
          <button style={btn()} onClick={() => update({ skills: draft.skills.filter((_, j) => j !== i) })}>×</button>
        </div>
      ))}
      <button style={btn("primary")} onClick={() => update({ skills: [...draft.skills, { name: "Nova skill", category: "Outro" }] })}>+ skill</button>
    </div>
  );

  const renderExperience = () => (
    <div style={{ display: "grid", gap: 14 }}>
      {draft.experience.map((x, i) => (
        <div key={i} style={{ border: `1px solid ${accentColor}30`, padding: 14, borderRadius: 2, display: "grid", gap: 8 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 8 }}>
            <input style={inputStyle} placeholder="Cargo" value={x.role} onChange={e => { const l = [...draft.experience]; l[i] = { ...x, role: e.target.value }; update({ experience: l }); }} />
            <input style={inputStyle} placeholder="Empresa" value={x.company} onChange={e => { const l = [...draft.experience]; l[i] = { ...x, company: e.target.value }; update({ experience: l }); }} />
            <input style={inputStyle} placeholder="Período" value={x.period} onChange={e => { const l = [...draft.experience]; l[i] = { ...x, period: e.target.value }; update({ experience: l }); }} />
            <button style={btn()} onClick={() => update({ experience: draft.experience.filter((_, j) => j !== i) })}>×</button>
          </div>
          <textarea style={{ ...inputStyle, minHeight: 60 }} value={x.description} onChange={e => { const l = [...draft.experience]; l[i] = { ...x, description: e.target.value }; update({ experience: l }); }} />
        </div>
      ))}
      <button style={btn("primary")} onClick={() => update({ experience: [...draft.experience, { role: "", company: "", period: "", description: "" }] })}>+ experiência</button>
    </div>
  );

  const renderTestimonials = () => (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ fontSize: 11, color: "#888" }}>Quando você tiver depoimentos reais, adicione aqui. Enquanto a lista estiver vazia, a seção não aparece no site.</div>
      {draft.testimonials.map((t, i) => (
        <div key={i} style={{ border: `1px solid ${accentColor}30`, padding: 14, borderRadius: 2, display: "grid", gap: 8 }}>
          <textarea style={{ ...inputStyle, minHeight: 60 }} placeholder="Depoimento" value={t.quote} onChange={e => { const l = [...draft.testimonials]; l[i] = { ...t, quote: e.target.value }; update({ testimonials: l }); }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 8 }}>
            <input style={inputStyle} placeholder="Autor" value={t.author} onChange={e => { const l = [...draft.testimonials]; l[i] = { ...t, author: e.target.value }; update({ testimonials: l }); }} />
            <input style={inputStyle} placeholder="Cargo" value={t.role} onChange={e => { const l = [...draft.testimonials]; l[i] = { ...t, role: e.target.value }; update({ testimonials: l }); }} />
            <button style={btn()} onClick={() => update({ testimonials: draft.testimonials.filter((_, j) => j !== i) })}>×</button>
          </div>
        </div>
      ))}
      <button style={btn("primary")} onClick={() => update({ testimonials: [...draft.testimonials, { quote: "", author: "", role: "" }] })}>+ depoimento</button>
    </div>
  );

  const updateUi = (patch) => update({ ui: { ...(draft.ui || {}), ...patch } });
  const renderUi = () => {
    const ui = draft.ui || {};
    const fields = [
      ["heroCtaPrimary", "Botão CTA principal (hero)"],
      ["heroCtaSecondary", "Botão CTA secundário (hero)"],
      ["statusBadge", "Badge de status"],
      ["aboutTitle", "Título da seção Sobre (use \\n para nova linha)"],
      ["projectsTitle", "Título da seção Projetos"],
      ["skillsTitle", "Título da seção Skills"],
      ["experienceTitle", "Título da seção Trajetória"],
      ["testimonialsTitle", "Título da seção Depoimentos"],
      ["contactTitle", "Título da seção Contato (use \\n)"],
      ["contactSubtitle", "Subtítulo do contato"],
      ["footerTag", "Tag do rodapé"],
    ];
    return (
      <div style={{ display: "grid", gap: 12 }}>
        <div style={{ fontSize: 11, color: "#888" }}>Edite todos os textos fixos da interface. Use <code style={{ color: accentColor }}>\n</code> para quebrar linha em títulos.</div>
        {fields.map(([k, label]) => (
          <div key={k}>
            <label style={labelStyle}>{label}</label>
            {k.endsWith("Title") || k === "contactSubtitle"
              ? <textarea style={{ ...inputStyle, minHeight: 50, resize: "vertical" }} value={ui[k] || ""} onChange={e => updateUi({ [k]: e.target.value })} />
              : <input style={inputStyle} value={ui[k] || ""} onChange={e => updateUi({ [k]: e.target.value })} />
            }
          </div>
        ))}
      </div>
    );
  };

  const tabs = [
    { id: "profile", label: "perfil", render: renderProfile },
    { id: "projects", label: `projetos (${draft.projects.length})`, render: renderProjects },
    { id: "skills", label: `stack (${draft.skills.length})`, render: renderSkills },
    { id: "experience", label: `xp (${draft.experience.length})`, render: renderExperience },
    { id: "testimonials", label: `reviews (${draft.testimonials.length})`, render: renderTestimonials },
    { id: "ui", label: "textos", render: renderUi },
  ];

  return (
    <div style={panelStyle} onClick={onClose}>
      <div style={cardStyle} onClick={e => e.stopPropagation()}>
        <div style={headerStyle}>
          <div>
            <div style={{ fontSize: 10, color: accentColor, letterSpacing: 2, textTransform: "uppercase" }}>admin@portfolio ~$</div>
            <div style={{ fontSize: 18, marginTop: 2 }}>Painel de controle</div>
          </div>
          <button style={btn()} onClick={onClose}>fechar [esc]</button>
        </div>
        <div style={tabsStyle}>
          {tabs.map(t => <div key={t.id} style={tabStyle(tab === t.id)} onClick={() => setTab(t.id)}>{t.label}</div>)}
        </div>
        <div style={bodyStyle}>{tabs.find(t => t.id === tab).render()}</div>
        <div style={footerStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            {window.SUPABASE_CONFIGURED
              ? <span style={{ fontSize: 10, color: accentColor, letterSpacing: 1 }}>● SUPABASE ATIVO</span>
              : <span style={{ fontSize: 10, color: "#888", letterSpacing: 1 }}>○ modo local</span>}
            {saved && <span style={{ fontSize: 10, color: accentColor }}>✓ salvo!</span>}
            <button style={{ ...btn(), fontSize: 10, padding: "6px 12px", borderColor: previewing ? accentColor : "#555", color: previewing ? accentColor : "#888" }} onClick={togglePreview}>{previewing ? "✦ visualizando" : "▶ pré-visualizar"}</button>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={btn()} onClick={onClose}>cancelar</button>
            <button style={{ ...btn("primary"), opacity: saving ? 0.6 : 1 }} onClick={() => { save().then(() => onClose()); }} disabled={saving}>{saving ? "salvando..." : "salvar & fechar"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginGate({ onSuccess, onCancel, accentColor = "#a3e635" }) {
  const [pwd, setPwd] = React.useState("");
  const [err, setErr] = React.useState(false);
  const tryLogin = () => {
    if (pwd === "admin") { onSuccess(); } else { setErr(true); setTimeout(() => setErr(false), 600); }
  };
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 10000, background: "rgba(0,0,0,0.9)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'JetBrains Mono', monospace" }} onClick={onCancel}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#0a0a0a", border: `1px solid ${accentColor}60`, padding: 32, width: 380, borderRadius: 4, animation: err ? "shake 0.4s" : "none" }}>
        <div style={{ color: accentColor, fontSize: 11, letterSpacing: 2, marginBottom: 4 }}>AUTH REQUIRED</div>
        <div style={{ color: "#e5e5e5", fontSize: 18, marginBottom: 20 }}>$ sudo login</div>
        <input autoFocus type="password" value={pwd} onChange={e => setPwd(e.target.value)} onKeyDown={e => e.key === "Enter" && tryLogin()}
          placeholder="password" style={{ width: "100%", background: "#000", color: "#e5e5e5", border: `1px solid ${err ? "#ef4444" : accentColor + "60"}`, padding: "10px 12px", fontFamily: "inherit", fontSize: 14, outline: "none", borderRadius: 2, marginBottom: 12 }} />
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onCancel} style={{ padding: "8px 16px", fontSize: 12, fontFamily: "inherit", background: "transparent", color: "#888", border: "1px solid #333", cursor: "pointer", borderRadius: 2 }}>cancelar</button>
          <button onClick={tryLogin} style={{ padding: "8px 16px", fontSize: 12, fontFamily: "inherit", background: accentColor, color: "#000", border: "none", cursor: "pointer", borderRadius: 2, letterSpacing: 1 }}>ENTRAR</button>
        </div>
      </div>
      <style>{`@keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-8px)} 75%{transform:translateX(8px)} }`}</style>
    </div>
  );
}

function AdminTrigger({ accentColor = "#a3e635" }) {
  const [stage, setStage] = React.useState("idle"); // idle | login | open
  return (
    <>
      <button onClick={() => setStage("login")} style={{ position: "fixed", bottom: 16, left: 16, zIndex: 9999, padding: "8px 14px", fontSize: 11, fontFamily: "'JetBrains Mono', monospace", background: "rgba(0,0,0,0.6)", color: accentColor, border: `1px solid ${accentColor}60`, backdropFilter: "blur(8px)", cursor: "pointer", borderRadius: 2, letterSpacing: 1.5 }}>
        ⚙ admin
      </button>
      {stage === "login" && <LoginGate accentColor={accentColor} onSuccess={() => setStage("open")} onCancel={() => setStage("idle")} />}
      {stage === "open" && <AdminPanel accentColor={accentColor} onClose={() => setStage("idle")} />}
    </>
  );
}

Object.assign(window, { AdminPanel, LoginGate, AdminTrigger });
