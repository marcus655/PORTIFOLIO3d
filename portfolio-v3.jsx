// V3 — Particles + grid terrain (synthwave / data vibe)
// Dark roxo, partículas animadas + grid terrain ondulante, tipografia bold

function Hero3DTerrain({ accentColor, secondColor = "#ff00aa" }) {
  const mountRef = React.useRef(null);
  React.useEffect(() => {
    const mount = mountRef.current;
    if (!mount || !window.THREE) return;
    const THREE = window.THREE;
    const w = mount.clientWidth, h = mount.clientHeight;
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0a0514, 5, 28);
    const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 100);
    camera.position.set(0, 2.5, 6);
    camera.lookAt(0, 0, -5);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(w, h);
    mount.appendChild(renderer.domElement);

    // Grid terrain
    const segs = 60;
    const size = 30;
    const geo = new THREE.PlaneGeometry(size, size, segs, segs);
    geo.rotateX(-Math.PI / 2);
    const original = new Float32Array(geo.attributes.position.array);
    const mat = new THREE.LineBasicMaterial({ color: new THREE.Color(accentColor), transparent: true, opacity: 0.6 });
    const wire = new THREE.LineSegments(new THREE.WireframeGeometry(geo), mat);
    wire.position.z = -5;
    scene.add(wire);

    // Particles
    const pCount = 600;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    const pVel = new Float32Array(pCount);
    for (let i = 0; i < pCount; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 20;
      pPos[i * 3 + 1] = Math.random() * 8;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 20 - 3;
      pVel[i] = 0.005 + Math.random() * 0.015;
    }
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: new THREE.Color(secondColor), size: 0.04, transparent: true, opacity: 0.8 });
    const points = new THREE.Points(pGeo, pMat);
    scene.add(points);

    // Center sphere
    const sGeo = new THREE.IcosahedronGeometry(0.8, 1);
    const sMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(accentColor), wireframe: true });
    const sphere = new THREE.Mesh(sGeo, sMat);
    sphere.position.set(0, 1.8, -3);
    scene.add(sphere);

    let mx = 0, my = 0, targetMx = 0, targetMy = 0;
    let clickPulse = 0;
    const onMove = (e) => {
      targetMx = (e.clientX / window.innerWidth - 0.5);
      targetMy = (e.clientY / window.innerHeight - 0.5);
    };
    const onClick = () => { clickPulse = 1; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("click", onClick);

    let raf;
    const start = performance.now();
    const pos = geo.attributes.position;
    const tick = () => {
      const t = (performance.now() - start) * 0.001;
      mx += (targetMx - mx) * 0.06;
      my += (targetMy - my) * 0.06;
      clickPulse *= 0.92;

      // Ripple from mouse onto terrain
      for (let i = 0; i < pos.count; i++) {
        const x = original[i * 3];
        const z = original[i * 3 + 2];
        // distance from mouse-projected point
        const mouseWorldX = mx * 8;
        const mouseWorldZ = -5 + my * 4;
        const dx = x - mouseWorldX;
        const dz = z - mouseWorldZ;
        const d = Math.sqrt(dx * dx + dz * dz);
        const ripple = Math.sin(d * 1.2 - t * 3) * Math.max(0, 1 - d / 6) * 0.5;
        const wave = Math.sin(x * 0.5 + t) * 0.25 + Math.cos(z * 0.5 + t * 0.8) * 0.25;
        const pulse = clickPulse * Math.max(0, 1 - d / 8) * 0.8;
        pos.setY(i, wave + ripple + pulse);
      }
      pos.needsUpdate = true;
      wire.geometry.dispose();
      wire.geometry = new THREE.WireframeGeometry(geo);

      const pa = pGeo.attributes.position.array;
      for (let i = 0; i < pCount; i++) {
        pa[i * 3 + 1] -= pVel[i];
        // mouse attraction
        pa[i * 3] += (mx * 0.5 - pa[i * 3] * 0.001) * 0.01;
        if (pa[i * 3 + 1] < -1) pa[i * 3 + 1] = 8;
      }
      pGeo.attributes.position.needsUpdate = true;

      // Sphere follows mouse
      const sphereTargetX = mx * 3;
      const sphereTargetY = 1.8 - my * 1.2 + Math.sin(t) * 0.2;
      sphere.position.x += (sphereTargetX - sphere.position.x) * 0.08;
      sphere.position.y += (sphereTargetY - sphere.position.y) * 0.08;
      sphere.rotation.y = t * 0.5 + mx * 2;
      sphere.rotation.x = t * 0.3 - my * 2;
      sphere.scale.setScalar(1 + clickPulse * 0.4);

      camera.position.x += (mx * 2.5 - camera.position.x) * 0.04;
      camera.position.y += (2.5 - my * 1.5 - camera.position.y) * 0.04;
      camera.lookAt(0, 1, -5);

      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    tick();

    const onResize = () => {
      const nw = mount.clientWidth, nh = mount.clientHeight;
      renderer.setSize(nw, nh);
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("click", onClick);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, [accentColor, secondColor]);
  return <div ref={mountRef} style={{ position: "absolute", inset: 0 }} />;
}

// Custom cursor that reacts to hoverable elements
function CustomCursor({ accentColor, secondColor }) {
  const dotRef = React.useRef(null);
  const ringRef = React.useRef(null);
  const [touch, setTouch] = React.useState(false);
  React.useEffect(() => {
    // Desabilita cursor custom em dispositivos touch / mobile
    const isTouch = ("ontouchstart" in window) || navigator.maxTouchPoints > 0 || window.matchMedia("(hover: none)").matches;
    if (isTouch) { setTouch(true); return; }
    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my;
    let hovering = false;
    const onMove = (e) => { mx = e.clientX; my = e.clientY; };
    const onOver = (e) => {
      const hov = !!(e.target.closest && e.target.closest("a, button, [data-hover]"));
      hovering = hov;
      if (ringRef.current) {
        ringRef.current.style.width = hov ? "60px" : "32px";
        ringRef.current.style.height = hov ? "60px" : "32px";
        ringRef.current.style.borderColor = hov ? secondColor : accentColor;
      }
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);
    let raf;
    const tick = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      if (dotRef.current) dotRef.current.style.transform = `translate(${mx - 3}px, ${my - 3}px)`;
      if (ringRef.current) ringRef.current.style.transform = `translate(${rx - (hovering ? 30 : 16)}px, ${ry - (hovering ? 30 : 16)}px)`;
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
    };
  }, [accentColor, secondColor]);
  if (touch) return null;
  return (
    <>
      <div ref={ringRef} style={{ position: "fixed", top: 0, left: 0, width: 32, height: 32, border: `1.5px solid ${accentColor}`, borderRadius: "50%", pointerEvents: "none", zIndex: 9998, transition: "width 0.25s, height 0.25s, border-color 0.2s", mixBlendMode: "difference" }} />
      <div ref={dotRef} style={{ position: "fixed", top: 0, left: 0, width: 6, height: 6, background: accentColor, borderRadius: "50%", pointerEvents: "none", zIndex: 9999 }} />
    </>
  );
}

// ─── Loading Screen ────────────────────────────────────────────────────────
function LoadingScreen({ accentColor, secondColor, onDone }) {
  const [pct, setPct] = React.useState(0);
  React.useEffect(() => {
    const steps = [20, 45, 70, 90, 100];
    let i = 0;
    const next = () => {
      if (i >= steps.length) { setTimeout(onDone, 300); return; }
      setPct(steps[i++]);
      setTimeout(next, 180 + Math.random() * 200);
    };
    setTimeout(next, 100);
  }, []);
  return (
    <div style={{ position: "fixed", inset: 0, background: "#0a0514", zIndex: 99999, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'JetBrains Mono', monospace", transition: pct === 100 ? "opacity 0.4s" : "none", opacity: pct === 100 ? 0 : 1, pointerEvents: pct === 100 ? "none" : "auto" }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: "clamp(48px,10vw,96px)", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 900, background: `linear-gradient(135deg, #fff, ${accentColor}, ${secondColor})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: -3 }}>MA</div>
      </div>
      <div style={{ width: 200, height: 2, background: "#1a0f28", position: "relative", marginBottom: 12 }}>
        <div style={{ height: "100%", background: `linear-gradient(90deg, ${accentColor}, ${secondColor})`, width: `${pct}%`, transition: "width 0.3s ease" }} />
      </div>
      <div style={{ fontSize: 10, letterSpacing: 4, color: "#888" }}>CARREGANDO... {pct}%</div>
    </div>
  );
}

// ─── Scroll Reveal ───────────────────────────────────────────────────────────
function useScrollReveal(options = {}) {
  const ref = React.useRef(null);
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.12, ...options });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function Reveal({ children, delay = 0, style }) {
  const [ref, visible] = useScrollReveal();
  return (
    <div ref={ref} style={{ transition: `opacity 0.7s ${delay}s, transform 0.7s ${delay}s`, opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(32px)", ...style }}>
      {children}
    </div>
  );
}

// ─── Project Modal ───────────────────────────────────────────────────────────
function ProjectModal({ project, onClose, accentColor, secondColor, bgColor }) {
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  if (!project) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 9000, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "'JetBrains Mono', monospace" }}>
      <div onClick={e => e.stopPropagation()} style={{ width: "min(760px,94vw)", background: bgColor, border: `1px solid ${accentColor}50`, boxShadow: `0 0 60px ${accentColor}20`, maxHeight: "88vh", overflowY: "auto", borderRadius: 2 }}>
        {project.image && <div style={{ height: 240, background: `url(${project.image}) center/cover`, borderBottom: `1px solid ${accentColor}30` }} />}
        {!project.image && <div style={{ height: 120, background: `linear-gradient(135deg, ${accentColor}20, ${secondColor}10)`, display: "flex", alignItems: "center", justifyContent: "center", borderBottom: `1px solid ${accentColor}30` }}><span style={{ fontSize: 48, fontWeight: 900, color: `${accentColor}50`, fontFamily: "'Space Grotesk',sans-serif" }}>{project.title[0]}</span></div>}
        <div style={{ padding: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ color: secondColor, fontSize: 10, letterSpacing: 3, marginBottom: 6 }}>{project.year}</div>
              <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 32, fontWeight: 700, letterSpacing: -1 }}>{project.title}</h2>
            </div>
            <button onClick={onClose} style={{ background: "transparent", border: `1px solid ${accentColor}50`, color: accentColor, padding: "8px 14px", cursor: "pointer", fontFamily: "inherit", fontSize: 11, letterSpacing: 2 }}>FECHAR ×</button>
          </div>
          <p style={{ color: "#ccc", fontSize: 16, lineHeight: 1.8, fontFamily: "'Space Grotesk',sans-serif", marginBottom: 24 }}>{project.description}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 28 }}>
            {project.tags.map(t => <span key={t} style={{ fontSize: 11, color: secondColor, background: `${secondColor}15`, padding: "4px 10px", letterSpacing: 1 }}>#{t}</span>)}
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {project.github && <a href={project.github.startsWith("http") ? project.github : `https://${project.github}`} target="_blank" rel="noopener" style={{ padding: "10px 18px", border: `1px solid ${accentColor}`, color: accentColor, textDecoration: "none", fontSize: 11, letterSpacing: 2 }}>→ GITHUB</a>}
            {project.link && <a href={project.link.startsWith("http") ? project.link : `https://${project.link}`} target="_blank" rel="noopener" style={{ padding: "10px 18px", background: accentColor, color: "#000", textDecoration: "none", fontSize: 11, fontWeight: 700, letterSpacing: 2 }}>↗ VER PROJETO</a>}
          </div>
        </div>
      </div>
    </div>
  );
}
function TiltCard({ children, style, maxTilt = 8, ...rest }) {
  const ref = React.useRef(null);
  const [tilt, setTilt] = React.useState({ rx: 0, ry: 0, glowX: 50, glowY: 50 });
  const [touch, setTouch] = React.useState(false);
  React.useEffect(() => {
    setTouch(("ontouchstart" in window) || navigator.maxTouchPoints > 0 || window.matchMedia("(hover: none)").matches);
  }, []);
  const onMove = (e) => {
    if (touch) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    setTilt({ ry: (x - 0.5) * maxTilt * 2, rx: -(y - 0.5) * maxTilt * 2, glowX: x * 100, glowY: y * 100 });
  };
  const onLeave = () => setTilt({ rx: 0, ry: 0, glowX: 50, glowY: 50 });
  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} {...rest}
      style={{ ...style, transform: touch ? "none" : `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`, transformStyle: "preserve-3d", transition: tilt.rx === 0 ? "transform 0.5s" : "transform 0.1s", "--glow-x": `${tilt.glowX}%`, "--glow-y": `${tilt.glowY}%` }}>
      {children}
    </div>
  );
}

// Magnetic button — attracts toward cursor (desabilita em touch)
function MagneticButton({ children, style, as = "a", strength = 0.3, ...rest }) {
  const ref = React.useRef(null);
  const [off, setOff] = React.useState({ x: 0, y: 0 });
  const [touch, setTouch] = React.useState(false);
  React.useEffect(() => {
    setTouch(("ontouchstart" in window) || navigator.maxTouchPoints > 0 || window.matchMedia("(hover: none)").matches);
  }, []);
  const onMove = (e) => {
    if (touch) return;
    const r = ref.current.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    setOff({ x: (e.clientX - cx) * strength, y: (e.clientY - cy) * strength });
  };
  const onLeave = () => setOff({ x: 0, y: 0 });
  const Comp = as;
  return (
    <Comp ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} {...rest}
      style={{ ...style, transform: touch ? "none" : `translate(${off.x}px, ${off.y}px)`, transition: off.x === 0 ? "transform 0.5s cubic-bezier(.2,1,.2,1)" : "transform 0.1s", display: "inline-block" }}>
      {children}
    </Comp>
  );
}

// Hidden admin activator — listens for typed sequence "admin" anywhere on page
function HiddenAdminTrigger({ accentColor = "#a3e635" }) {
  const [stage, setStage] = React.useState("idle");
  React.useEffect(() => {
    let buf = "";
    const onKey = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      buf = (buf + e.key.toLowerCase()).slice(-5);
      if (buf === "admin") { setStage("login"); buf = ""; }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return (
    <>
      {stage === "login" && <LoginGate accentColor={accentColor} onSuccess={() => setStage("open")} onCancel={() => setStage("idle")} />}
      {stage === "open" && <AdminPanel accentColor={accentColor} onClose={() => setStage("idle")} />}
    </>
  );
}

// Auto-open admin panel if arrived from login page
function AutoAdminPanel({ accentColor = "#ff00aa" }) {
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => {
    // Verifica tanto o flag local quanto o token do Supabase
    const localAuth = sessionStorage.getItem("marcus_admin_auth") === "1";
    const sbAuth = !!sessionStorage.getItem("sb_token");
    if (localAuth || sbAuth) {
      setOpen(true);
    }
  }, []);
  if (!open) return null;
  return <AdminPanel accentColor={accentColor} onClose={() => {
    sessionStorage.removeItem("marcus_admin_auth");
    setOpen(false);
  }} />;
}

// Discreet admin link — nearly invisible corner dot, redirects to login page
function DiscreetAdminLink() {
  return (
    <a href="login.html" title="" data-hover
       style={{ position: "fixed", bottom: 12, right: 12, zIndex: 9000, width: 10, height: 10, borderRadius: "50%", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", opacity: 0.5, transition: "opacity 0.3s, transform 0.3s", cursor: "pointer" }}
       onMouseEnter={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "scale(1.4)"; }}
       onMouseLeave={e => { e.currentTarget.style.opacity = "0.5"; e.currentTarget.style.transform = "scale(1)"; }} />
  );
}

function PortfolioV3({ accentColor = "#ff00aa", bgColor = "#0a0514" }) {
  const [data, , loading] = usePortfolioData();
  const secondColor = "#00eaff";
  const [showLoader, setShowLoader] = React.useState(true);
  const [selectedProject, setSelectedProject] = React.useState(null);
  const [mobile, setMobile] = React.useState(false);
  const [contactStatus, setContactStatus] = React.useState("idle"); // idle | sending | sent | error
  const [contactForm, setContactForm] = React.useState({ name: "", email: "", message: "" });

  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const handler = (e) => setMobile(e.matches);
    setMobile(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const submitContact = async (e) => {
    e.preventDefault();
    const fid = data.formspreeId;
    if (!fid) { alert("Configure o ID do Formspree no painel admin!"); return; }
    setContactStatus("sending");
    try {
      const r = await fetch(`https://formspree.io/f/${fid}`, {
        method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(contactForm),
      });
      setContactStatus(r.ok ? "sent" : "error");
    } catch { setContactStatus("error"); }
  };

  const px = mobile ? "20px" : "48px";

  const v3Styles = {
    root: { background: bgColor, color: "#e5e5e5", minHeight: "100%", fontFamily: "'JetBrains Mono', monospace", fontSize: 14, cursor: mobile ? "auto" : "none" },
    nav: { position: "sticky", top: 0, zIndex: 50, padding: mobile ? "14px 20px" : "16px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", background: `${bgColor}dd`, backdropFilter: "blur(14px)", borderBottom: `1px solid ${accentColor}30`, fontSize: 11, letterSpacing: 2 },
    section: { padding: mobile ? "70px 20px" : "120px 48px", maxWidth: 1500, margin: "0 auto" },
    eyebrow: { color: secondColor, fontSize: 10, letterSpacing: 4, textTransform: "uppercase", marginBottom: 16 },
    h2: { fontSize: mobile ? 44 : 72, fontWeight: 900, letterSpacing: -2, margin: 0, marginBottom: 40, fontFamily: "'Space Grotesk', sans-serif", textTransform: "uppercase" },
  };

  const inputSt = { width: "100%", padding: "12px 14px", background: "#0f0820", color: "#e5e5e5", border: `1px solid ${accentColor}40`, fontFamily: "'JetBrains Mono',monospace", fontSize: 13, outline: "none", marginBottom: 12 };

  if (showLoader) return <LoadingScreen accentColor={accentColor} secondColor={secondColor} onDone={() => setShowLoader(false)} />;

  return (
    <div style={v3Styles.root}>
      <CustomCursor accentColor={accentColor} secondColor={secondColor} />
      <DiscreetAdminLink />
      <AutoAdminPanel accentColor={accentColor} />
      {selectedProject && <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} accentColor={accentColor} secondColor={secondColor} bgColor={bgColor} />}
      <nav style={v3Styles.nav}>
        <div style={{ color: accentColor, fontWeight: 700 }}>&lt;MARCUS/&gt;</div>
        {!mobile && (
          <div style={{ display: "flex", gap: 24 }}>
            {["sobre", "projetos", "skills", "contato"].map(x => <a key={x} href={`#${x}`} style={{ color: "#bbb", textDecoration: "none" }}>[{x}]</a>)}
          </div>
        )}
        <div style={{ color: secondColor }}>● ONLINE</div>
      </nav>

      <section style={{ position: "relative", height: "100vh", minHeight: 600, overflow: "hidden" }}>
        <Hero3DTerrain accentColor={accentColor} secondColor={secondColor} />
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, transparent 30%, ${bgColor} 90%)` }} />
        <div style={{ position: "relative", zIndex: 2, padding: mobile ? "60px 20px 0" : "80px 48px 0", maxWidth: 1500, margin: "0 auto" }}>
          <h1 style={{ fontSize: mobile ? "clamp(64px,18vw,100px)" : "clamp(80px, 14vw, 220px)", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 900, letterSpacing: -4, lineHeight: 0.88, margin: 0, textTransform: "uppercase", background: `linear-gradient(135deg, #fff 0%, ${accentColor} 60%, ${secondColor} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            Marcus<br />Andrei
          </h1>
          <div style={{ marginTop: 24, maxWidth: 520 }}>
            <div style={{ display: "inline-block", padding: "6px 14px", border: `1px solid ${accentColor}`, color: accentColor, fontSize: 11, letterSpacing: 2, marginBottom: 12 }}>// {data.headline.toUpperCase()}</div>
            <div style={{ color: "#ccc", fontSize: mobile ? 14 : 16, lineHeight: 1.7, fontFamily: "'Space Grotesk', sans-serif" }}>{data.tagline.replace(/\/\/\s*/, "")}</div>
          </div>
          <div style={{ marginTop: 32, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <MagneticButton as="a" href="#projetos" style={{ padding: "12px 24px", background: accentColor, color: "#000", textDecoration: "none", fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", clipPath: "polygon(0 0, 100% 0, 95% 100%, 5% 100%)" }}>{data.ui?.heroCtaPrimary || "EXPLORAR PROJETOS ▶"}</MagneticButton>
            <MagneticButton as="a" href="#contato" style={{ padding: "12px 20px", color: secondColor, textDecoration: "none", fontSize: 12, letterSpacing: 2, textTransform: "uppercase", border: `1px solid ${secondColor}60` }}>{data.ui?.heroCtaSecondary || "→ CONTATO"}</MagneticButton>
            {data.cvUrl && <MagneticButton as="a" href={data.cvUrl} target="_blank" rel="noopener" style={{ padding: "12px 20px", color: "#fff", textDecoration: "none", fontSize: 12, letterSpacing: 2, textTransform: "uppercase", border: "1px solid #ffffff40" }}>↓ CV</MagneticButton>}
          </div>
        </div>
      </section>

      <section id="sobre" style={v3Styles.section}>
        <Reveal>
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1.5fr", gap: mobile ? 32 : 60 }}>
          <div>
            <div style={v3Styles.eyebrow}>/// 01 ABOUT</div>
            <h2 style={v3Styles.h2}>{(data.ui?.aboutTitle || "Em construção.\nSempre aprendendo.").split("\n").map((line, i) => <React.Fragment key={i}>{line}{i < (data.ui?.aboutTitle || "x\nx").split("\n").length - 1 && <br />}</React.Fragment>)}</h2>
            {data.photo && (
              <div style={{ position: "relative", display: "inline-block", marginTop: 8 }}>
                <div style={{ width: 160, height: 160, borderRadius: "50%", overflow: "hidden", border: `3px solid ${accentColor}`, boxShadow: `0 0 30px ${accentColor}50, 0 0 60px ${accentColor}20` }}>
                  <img src={data.photo} alt={data.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ position: "absolute", inset: -6, borderRadius: "50%", border: `1px solid ${secondColor}40`, animation: "spin 8s linear infinite" }} />
              </div>
            )}
          </div>
          <div>
            <p style={{ fontSize: mobile ? 16 : 20, lineHeight: 1.7, color: "#ddd", fontFamily: "'Space Grotesk', sans-serif", margin: 0, marginBottom: 28 }}>{data.about}</p>
            <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 14, fontSize: 12 }}>
              {[["location", data.location], ["email", data.email], ["github", data.github], ["linkedin", data.linkedin]].map(([k, v]) => (
                <div key={k} style={{ borderLeft: `2px solid ${accentColor}`, paddingLeft: 12 }}>
                  <div style={{ color: secondColor, fontSize: 10, letterSpacing: 2 }}>{k.toUpperCase()}</div>
                  <div style={{ color: "#ccc", marginTop: 2, wordBreak: "break-all" }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        </Reveal>
      </section>

      <section id="projetos" style={v3Styles.section}>
        <Reveal>
        <div style={v3Styles.eyebrow}>/// 02 PROJECTS [{data.projects.length}]</div>
        <h2 style={v3Styles.h2}>{data.ui?.projectsTitle || "Meus projetos."}</h2>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
          {data.projects.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.08}>
            <TiltCard data-hover onClick={() => setSelectedProject(p)} style={{ border: `1px solid ${accentColor}40`, padding: 0, background: "#0f0820", position: "relative", overflow: "hidden", cursor: "pointer" }}>
              <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at var(--glow-x) var(--glow-y), ${accentColor}25, transparent 60%)`, pointerEvents: "none", zIndex: 1 }} />
              <div style={{ height: 180, background: p.image ? `url(${p.image}) center/cover` : `linear-gradient(135deg, ${accentColor}20, ${secondColor}10)`, position: "relative", display: "flex", alignItems: "center", justifyContent: "center", borderBottom: `1px solid ${accentColor}30` }}>
                {!p.image && <div style={{ fontSize: 40, fontWeight: 900, color: `${accentColor}60`, fontFamily: "'Space Grotesk', sans-serif" }}>0{i + 1}</div>}
              </div>
              <div style={{ padding: 20, position: "relative", zIndex: 2 }}>
                <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", marginBottom: 8 }}>{p.title}</div>
                <p style={{ fontSize: 13, color: "#aaa", margin: "0 0 14px 0", lineHeight: 1.6 }}>{p.description}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                  {p.tags.map(t => <span key={t} style={{ fontSize: 10, color: secondColor, background: `${secondColor}15`, padding: "3px 8px", letterSpacing: 1 }}>#{t}</span>)}
                </div>
                <div style={{ fontSize: 10, color: accentColor, letterSpacing: 2 }}>CLIQUE PARA VER DETALHES →</div>
              </div>
            </TiltCard>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="skills" style={v3Styles.section}>
        <Reveal>
        <div style={v3Styles.eyebrow}>/// 03 STACK</div>
        <h2 style={v3Styles.h2}>{data.ui?.skillsTitle || "Stack em estudo."}</h2>
        {(() => {
          const grouped = data.skills.reduce((acc, s) => { (acc[s.category] = acc[s.category] || []).push(s); return acc; }, {});
          const cats = Object.keys(grouped);
          return (
            <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(260px, 1fr))`, gap: 20 }}>
              {cats.map(cat => (
                <div key={cat} style={{ padding: 22, border: `1px solid ${accentColor}30`, background: `linear-gradient(135deg, ${accentColor}08, transparent)` }}>
                  <div style={{ color: secondColor, fontSize: 10, letterSpacing: 3, marginBottom: 14 }}>// {cat.toUpperCase()}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {grouped[cat].map((s, i) => (
                      <span key={i} style={{ fontSize: 13, padding: "6px 12px", background: "#0f0820", border: `1px solid ${accentColor}40`, color: "#fff", fontFamily: "'Space Grotesk', sans-serif" }}>{s.name}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
        </Reveal>
      </section>

      <section style={v3Styles.section}>
        <Reveal>
        <div style={v3Styles.eyebrow}>/// 04 TIMELINE</div>
        <h2 style={v3Styles.h2}>{data.ui?.experienceTitle || "Trajetória."}</h2>
        </Reveal>
        <div style={{ display: "grid", gap: 16 }}>
          {data.experience.map((x, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "180px 1fr", gap: mobile ? 8 : 30, padding: mobile ? "18px 14px" : "24px 20px", background: i % 2 ? "transparent" : "#0f0820", borderLeft: `3px solid ${accentColor}` }}>
              <div>
                <div style={{ color: secondColor, fontSize: 11, letterSpacing: 2 }}>{x.period}</div>
                <div style={{ color: "#888", fontSize: 11, marginTop: 4 }}>{x.company}</div>
              </div>
              <div>
                <div style={{ fontSize: mobile ? 18 : 22, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", marginBottom: 6 }}>{x.role}</div>
                <p style={{ color: "#bbb", fontSize: 14, margin: 0, lineHeight: 1.6 }}>{x.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {data.testimonials && data.testimonials.length > 0 && (
        <section style={v3Styles.section}>
          <Reveal>
          <div style={v3Styles.eyebrow}>/// 05 REVIEWS</div>
          <h2 style={v3Styles.h2}>{data.ui?.testimonialsTitle || "Recomendações."}</h2>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
            {data.testimonials.map((t, i) => (
              <div key={i} style={{ padding: 28, border: `1px solid ${accentColor}30`, background: `linear-gradient(135deg, ${accentColor}08, ${secondColor}05)` }}>
                <div style={{ color: accentColor, fontSize: 10, letterSpacing: 2, marginBottom: 14 }}>★★★★★</div>
                <p style={{ fontSize: 15, color: "#ddd", lineHeight: 1.7, fontFamily: "'Space Grotesk', sans-serif", margin: "0 0 20px" }}>{t.quote}</p>
                <div style={{ borderTop: `1px solid ${accentColor}30`, paddingTop: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{t.author}</div>
                  <div style={{ fontSize: 11, color: "#888" }}>{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section id="contato" style={{ ...v3Styles.section, paddingTop: mobile ? 80 : 100, paddingBottom: mobile ? 100 : 140 }}>
        <Reveal>
        <div style={v3Styles.eyebrow}>/// {data.testimonials && data.testimonials.length > 0 ? "06" : "05"} CONNECT</div>
        <h2 style={{ ...v3Styles.h2, fontSize: mobile ? 52 : 110, background: `linear-gradient(90deg, ${accentColor}, ${secondColor})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{(data.ui?.contactTitle || "Vamos\nconversar.").split("\n").map((line, i, arr) => <React.Fragment key={i}>{line}{i < arr.length - 1 && <br />}</React.Fragment>)}</h2>
        {data.ui?.contactSubtitle && <div style={{ color: "#aaa", fontSize: mobile ? 14 : 16, fontFamily: "'Space Grotesk', sans-serif", marginBottom: 40 }}>{data.ui.contactSubtitle}</div>}
        </Reveal>

        <Reveal delay={0.15}>
        {data.formspreeId ? (
          contactStatus === "sent" ? (
            <div style={{ textAlign: "center", padding: 40, border: `1px solid ${accentColor}40` }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>✓</div>
              <div style={{ color: accentColor, fontSize: 14, letterSpacing: 2 }}>MENSAGEM ENVIADA!</div>
              <div style={{ color: "#888", fontSize: 13, marginTop: 8 }}>Obrigado pelo contato. Responderei em breve.</div>
            </div>
          ) : (
            <form onSubmit={submitContact} style={{ maxWidth: 560 }}>
              <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 12, marginBottom: 0 }}>
                <div>
                  <div style={{ fontSize: 10, color: secondColor, letterSpacing: 2, marginBottom: 6 }}>NOME</div>
                  <input required style={inputSt} value={contactForm.name} onChange={e => setContactForm(f => ({...f, name: e.target.value}))} placeholder="Seu nome" />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: secondColor, letterSpacing: 2, marginBottom: 6 }}>EMAIL</div>
                  <input required type="email" style={inputSt} value={contactForm.email} onChange={e => setContactForm(f => ({...f, email: e.target.value}))} placeholder="seu@email.com" />
                </div>
              </div>
              <div style={{ fontSize: 10, color: secondColor, letterSpacing: 2, marginBottom: 6 }}>MENSAGEM</div>
              <textarea required style={{ ...inputSt, minHeight: 120, resize: "vertical" }} value={contactForm.message} onChange={e => setContactForm(f => ({...f, message: e.target.value}))} placeholder="Olá, Marcus!" />
              {contactStatus === "error" && <div style={{ color: "#ef4444", fontSize: 11, marginBottom: 12 }}>Erro ao enviar. Tente novamente.</div>}
              <button type="submit" disabled={contactStatus === "sending"} style={{ padding: "14px 32px", background: contactStatus === "sending" ? "#333" : accentColor, color: "#000", border: "none", cursor: "pointer", fontFamily: "'JetBrains Mono',monospace", fontSize: 12, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase" }}>{contactStatus === "sending" ? "enviando..." : "ENVIAR MENSAGEM ▶"}</button>
            </form>
          )
        ) : (
          <div style={{ textAlign: "center" }}>
            <a href={`mailto:${data.email}`} style={{ display: "inline-block", fontSize: mobile ? 16 : 24, color: "#fff", textDecoration: "none", padding: mobile ? "14px 24px" : "18px 40px", border: `2px solid ${accentColor}`, fontFamily: "'JetBrains Mono', monospace", wordBreak: "break-all" }}>&gt; {data.email}</a>
          </div>
        )}
        </Reveal>

        <div style={{ marginTop: 60, display: "flex", gap: 24, justifyContent: data.formspreeId ? "flex-start" : "center", fontSize: 12, flexWrap: "wrap" }}>
          <a href={`https://${data.github}`} style={{ color: secondColor, textDecoration: "none" }}>[github]</a>
          <a href={`https://${data.linkedin}`} style={{ color: secondColor, textDecoration: "none" }}>[linkedin]</a>
          {data.cvUrl && <a href={data.cvUrl} target="_blank" rel="noopener" style={{ color: "#aaa", textDecoration: "none" }}>[baixar cv]</a>}
        </div>
      </section>

      <footer style={{ padding: mobile ? "20px" : "24px 48px", borderTop: `1px solid ${accentColor}30`, display: "flex", justifyContent: "space-between", fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: "#555", flexWrap: "wrap", gap: 8 }}>
        <span>© {new Date().getFullYear()} · {data.name}</span>
        <span>{data.ui?.footerTag || "build.v3.synthgrid"}</span>
      </footer>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

Object.assign(window, { PortfolioV3, Hero3DTerrain, CustomCursor, TiltCard, MagneticButton, HiddenAdminTrigger, DiscreetAdminLink });
