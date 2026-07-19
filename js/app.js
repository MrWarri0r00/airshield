/* ============================================================
   AIR SHIELD — Interactive logic v2
   ============================================================ */

/* ---------- THEME ---------- */
const themeToggle = document.getElementById('themeToggle');
const root = document.documentElement;
const savedTheme = localStorage.getItem('airshield-theme');
if (savedTheme) root.setAttribute('data-theme', savedTheme);
themeToggle.addEventListener('click', () => {
  const cur = root.getAttribute('data-theme');
  const next = cur === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  localStorage.setItem('airshield-theme', next);
});

/* ---------- MOBILE NAV ---------- */
const navMenu = document.getElementById('navMenu');
const navLinks = document.getElementById('navLinks');
navMenu?.addEventListener('click', () => navLinks.classList.toggle('open'));

/* ---------- COUNT-UP ---------- */
function countUp(el, target, duration = 1600) {
  const start = performance.now();
  const step = (now) => {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.floor(target * eased).toLocaleString();
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = target.toLocaleString();
  };
  requestAnimationFrame(step);
}
const heroObserver = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      document.querySelectorAll('.stat-num').forEach((el) => countUp(el, parseInt(el.dataset.count, 10)));
      heroObserver.disconnect();
    }
  });
}, { threshold: 0.4 });
const heroStats = document.querySelector('.hero-stats');
if (heroStats) heroObserver.observe(heroStats);

const kpiObserver = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      document.querySelectorAll('[data-count-kpi]').forEach((el) => countUp(el, parseInt(el.dataset.countKpi, 10), 2000));
      kpiObserver.disconnect();
    }
  });
}, { threshold: 0.3 });
const consoleEl = document.getElementById('console');
if (consoleEl) kpiObserver.observe(consoleEl);

/* ---------- HERO CANVAS ---------- */
const canvas = document.getElementById('heroCanvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];
  const COLORS = ['#cc0001', '#ff3131', '#7a0000'];
  function resize() { W = canvas.width = canvas.offsetWidth * devicePixelRatio; H = canvas.height = canvas.offsetHeight * devicePixelRatio; }
  resize();
  window.addEventListener('resize', resize);
  function initParticles() {
    particles = [];
    const count = Math.min(80, Math.floor((W * H) / 30000));
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.3 * devicePixelRatio,
        vy: (Math.random() - 0.5) * 0.3 * devicePixelRatio,
        r: Math.random() * 1.6 * devicePixelRatio + 0.4,
        c: COLORS[Math.floor(Math.random() * COLORS.length)],
        a: Math.random() * 0.5 + 0.2
      });
    }
  }
  initParticles();
  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x, dy = p.y - q.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        const maxD = 120 * devicePixelRatio;
        if (d < maxD) {
          ctx.strokeStyle = `rgba(204,0,1,${0.18 * (1 - d / maxD)})`;
          ctx.lineWidth = 0.5 * devicePixelRatio;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
        }
      }
    }
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
      ctx.fillStyle = p.c; ctx.globalAlpha = p.a;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }
  draw();
}

/* ---------- ACTIVITY CHART ---------- */
const chartCanvas = document.getElementById('activityChart');
if (chartCanvas) {
  const c = chartCanvas.getContext('2d');
  let cw, ch;
  function resizeChart() { cw = chartCanvas.width = chartCanvas.offsetWidth * devicePixelRatio; ch = chartCanvas.height = 220 * devicePixelRatio; }
  resizeChart();
  window.addEventListener('resize', resizeChart);
  let data = Array.from({ length: 60 }, () => Math.random() * 30 + 10);
  function getCSS(v) { return getComputedStyle(document.documentElement).getPropertyValue(v).trim() || '#1e2a44'; }
  function drawChart() {
    c.clearRect(0, 0, cw, ch);
    const max = Math.max(...data) * 1.2;
    const stepX = cw / data.length;
    c.strokeStyle = getCSS('--border'); c.lineWidth = 1 * devicePixelRatio;
    for (let i = 0; i < 4; i++) { const y = (ch / 4) * i; c.beginPath(); c.moveTo(0, y); c.lineTo(cw, y); c.stroke(); }
    const grad = c.createLinearGradient(0, 0, 0, ch);
    grad.addColorStop(0, 'rgba(255,49,49,0.35)'); grad.addColorStop(1, 'rgba(255,49,49,0.0)');
    c.fillStyle = grad; c.beginPath(); c.moveTo(0, ch);
    data.forEach((v, i) => { const x = i * stepX; const y = ch - (v / max) * ch; c.lineTo(x, y); });
    c.lineTo(cw, ch); c.closePath(); c.fill();
    c.strokeStyle = '#ff3131'; c.lineWidth = 2 * devicePixelRatio; c.beginPath();
    data.forEach((v, i) => { const x = i * stepX; const y = ch - (v / max) * ch; i === 0 ? c.moveTo(x, y) : c.lineTo(x, y); });
    c.stroke();
    const lastY = ch - (data[data.length - 1] / max) * ch;
    c.fillStyle = '#ff3131'; c.beginPath(); c.arc(cw - stepX, lastY, 4 * devicePixelRatio, 0, Math.PI * 2); c.fill();
  }
  drawChart();
  setInterval(() => { data.shift(); data.push(Math.random() * 50 + 10); drawChart(); }, 1500);
}

/* ---------- SIDEBAR NAV + DROPDOWNS ---------- */
const sbItems = document.querySelectorAll('.sb-item');
const panels = document.querySelectorAll('.panel');

function activatePanel(name) {
  document.querySelectorAll('.sb-item').forEach((i) => i.classList.remove('active'));
  // mark the matching item active (including dd items)
  const match = document.querySelector(`.sb-item[data-panel="${name}"]`);
  if (match) match.classList.add('active');
  panels.forEach((p) => p.classList.remove('active'));
  const tgt = document.getElementById('panel-' + name);
  if (tgt) tgt.classList.add('active');
}

// Regular items
document.querySelectorAll('.sb-item[data-panel]').forEach((item) => {
  item.addEventListener('click', (e) => {
    if (item.classList.contains('sb-dd-toggle')) return; // toggles handled separately
    activatePanel(item.dataset.panel);
  });
});

// Dropdown toggles
document.querySelectorAll('.sb-dd-toggle').forEach((toggle) => {
  toggle.addEventListener('click', (e) => {
    const dd = toggle.dataset.dd;
    const menu = document.getElementById('dd-' + dd);
    const isOpen = toggle.classList.contains('open');
    // close all
    document.querySelectorAll('.sb-dd-toggle').forEach((t) => t.classList.remove('open'));
    document.querySelectorAll('.sb-dd-menu').forEach((m) => m.classList.remove('open'));
    if (!isOpen) { toggle.classList.add('open'); if (menu) menu.classList.add('open'); }
  });
});

// Dropdown items
document.querySelectorAll('.sb-dd-item').forEach((item) => {
  item.addEventListener('click', () => {
    activatePanel(item.dataset.panel);
  });
});

/* ---------- LIVE THREAT FEED ---------- */
const THREAT_TEMPLATES = [
  { sev: 'critical', msg: 'SNDL intercept detected on <b>downlink channel 7</b>', src: 'QSVM-01' },
  { sev: 'critical', msg: 'QGAN-morphed malware signature on <b>avionics bus</b>', src: 'QSVM-02' },
  { sev: 'high', msg: 'GPS spoof attempt neutralized — <b>Q-INS override</b>', src: 'NAV-CORE' },
  { sev: 'high', msg: 'Anomalous handshake probe from <b>unregistered tower</b>', src: 'PQC-GW' },
  { sev: 'info', msg: 'Quantum key rotation complete — <b>key ID refreshed</b>', src: 'QRNG-04' },
  { sev: 'info', msg: 'Tamper-evident log sealed — block <b>#4421-A</b>', src: 'QKD-RELAY' },
  { sev: 'critical', msg: 'Classical RSA handshake <b>blocked</b> — legacy fallback denied', src: 'PQC-GW' },
  { sev: 'high', msg: 'Deepfake voice impersonation flagged on ATC channel', src: 'AI-IDS' },
  { sev: 'info', msg: 'Cryptographic Agility Score updated: <b>94/100</b>', src: 'FLEET-OPS' },
  { sev: 'high', msg: 'Supply-chain firmware signature mismatch — <b>quarantined</b>', src: 'SB-SCAN' },
];
const feedEl = document.getElementById('threatFeed');
const threatCountEl = document.getElementById('threatCount');
let threatCount = 0;
function pad(n) { return n.toString().padStart(2, '0'); }
function nowTime() { const d = new Date(); return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`; }
function addFeedItem(initial = false) {
  const t = THREAT_TEMPLATES[Math.floor(Math.random() * THREAT_TEMPLATES.length)];
  const time = initial ? new Date(Date.now() - Math.random() * 60000).toTimeString().slice(0, 8) : nowTime();
  const sevLabel = t.sev.toUpperCase();
  const row = document.createElement('div');
  row.className = 'feed-item ' + t.sev;
  row.innerHTML = `<span class="feed-time">${time}</span><span class="feed-sev ${t.sev}">${sevLabel}</span><span class="feed-msg">${t.msg}</span><span class="feed-src">${t.src}</span>`;
  if (feedEl) { feedEl.prepend(row); while (feedEl.children.length > 24) feedEl.removeChild(feedEl.lastChild); }
  if (t.sev !== 'info') { threatCount++; if (threatCountEl) threatCountEl.textContent = threatCount; }
}
if (feedEl) { for (let i = 0; i < 12; i++) addFeedItem(true); setInterval(addFeedItem, 3200); }

/* ---------- FLIGHT DATA (shared) ---------- */
const ROUTES = [
  ['JFK','LHR'],['LAX','NRT'],['ATL','FRA'],['DFW','GRU'],['ORD','DXB'],['MIA','CDG'],
  ['SFO','ICN'],['SEA','AMS'],['IAD','HND'],['BOS','MAD'],['PHX','ZRH'],['DEN','VIE'],
  ['HKG','SFO'],['SIN','LHR'],['SYD','LAX'],['DXB','JFK'],['ICN','ATL'],['AMS','JFK'],
];
const TYPES = ['B777-300ER','B787-9','A350-1000','A380-800','B747-8I','A330-300','B767-300ER','A220-300'];
// generate 80 flights with lat/lon
const FLIGHTS = [];
for (let i = 0; i < 80; i++) {
  const route = ROUTES[i % ROUTES.length];
  const lat = (Math.random() - 0.5) * 160; // -80 to 80
  const lon = (Math.random() - 0.5) * 360; // -180 to 180
  const score = Math.floor(Math.random() * 18) + 82;
  const status = score > 92 ? 'SECURE' : score > 86 ? 'ACTIVE' : 'WATCH';
  const threat = Math.random() < 0.08;
  FLIGHTS.push({
    id: 'RTX-' + (1000 + Math.floor(Math.random() * 8999)),
    from: route[0], to: route[1],
    type: TYPES[Math.floor(Math.random() * TYPES.length)],
    lat, lon, score, status, threat,
    alt: Math.floor(Math.random() * 30000) + 30000,
    spd: Math.floor(Math.random() * 200) + 480,
    heading: Math.floor(Math.random() * 360),
    qkd: Math.random() > 0.15,
  });
}

/* ---------- FLEET GRID ---------- */
const fleetEl = document.getElementById('fleetGrid');
if (fleetEl) {
  for (let i = 0; i < 24; i++) {
    const f = FLIGHTS[i];
    const div = document.createElement('div');
    div.className = 'fleet-card';
    div.innerHTML = `<div class="fleet-id">${f.id}</div><div class="fleet-route">${f.from} → ${f.to}</div><div class="fleet-bar"><div style="width:${f.score}%"></div></div><div class="fleet-stat"><span>${f.score}/100</span><span class="ok">${f.status}</span></div>`;
    fleetEl.appendChild(div);
  }
}

/* ---------- FLIGHT REGISTRY ---------- */
const registryEl = document.getElementById('registryList');
function renderRegistry(filter = '') {
  if (!registryEl) return;
  registryEl.innerHTML = '';
  const f = filter.toUpperCase();
  const filtered = FLIGHTS.filter((x) =>
    !f || x.id.toUpperCase().includes(f) || x.from.toUpperCase().includes(f) || x.to.toUpperCase().includes(f) || x.type.toUpperCase().includes(f)
  );
  if (filtered.length === 0) {
    registryEl.innerHTML = '<div class="reg-empty">No flights match "' + filter + '"</div>';
    return;
  }
  filtered.forEach((fl) => {
    const div = document.createElement('div');
    div.className = 'reg-row';
    div.innerHTML = `<span class="reg-id">${fl.id}</span><span class="reg-route">${fl.from} → ${fl.to}</span><span class="reg-type">${fl.type}</span><span class="reg-score">${fl.score}/100</span><span class="reg-status ${fl.status === 'SECURE' ? 'secure' : fl.status === 'WATCH' ? 'watch' : 'secure'}">${fl.status}</span><span class="reg-arrow">›</span>`;
    div.addEventListener('click', () => showFlightOnGlobe(fl));
    registryEl.appendChild(div);
  });
}
renderRegistry();

/* ---------- SEARCH ---------- */
const searchInput = document.getElementById('flightSearch');
if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    const v = e.target.value;
    renderRegistry(v);
    // also filter the fleet grid
    const f = v.toUpperCase();
    document.querySelectorAll('.fleet-card').forEach((card) => {
      const id = card.querySelector('.fleet-id').textContent.toUpperCase();
      const route = card.querySelector('.fleet-route').textContent.toUpperCase();
      card.style.display = (!f || id.includes(f) || route.includes(f)) ? '' : 'none';
    });
  });
}

/* ---------- CRYPTO AGILITY ---------- */
const CRYPTO = [
  { name: 'Key Encapsulation', mono: 'ML-KEM (FIPS 203)', status: 'ready', pct: 100, desc: 'Lattice-based post-quantum key exchange. Active on all aircraft.' },
  { name: 'Digital Signatures', mono: 'ML-DSA (FIPS 204)', status: 'ready', pct: 100, desc: 'Lattice-based signatures replacing RSA-2048 across fleet.' },
  { name: 'Quantum Key Distribution', mono: 'QKD', status: 'migrating', pct: 78, desc: 'Satellite-to-aircraft laser links live on 193/247 aircraft.' },
  { name: 'Quantum RNG', mono: 'QRNG', status: 'ready', pct: 100, desc: 'Onboard micro-QRNG chips generating true-random keys.' },
  { name: 'TLS Handshake', mono: 'PQC-TLS 1.3', status: 'migrating', pct: 94, desc: 'Hybrid classical + PQC handshakes on all comms links.' },
  { name: 'RSA-2048 (Legacy)', mono: 'RSA', status: 'legacy', pct: 8, desc: "Disabled. Classical public-key math is broken by Shor's algorithm." },
  { name: 'ECC (Legacy)', mono: 'ECC', status: 'legacy', pct: 4, desc: 'Disabled. Elliptic-curve crypto broken by quantum Shor variant.' },
];
const cryptoList = document.getElementById('cryptoList');
if (cryptoList) {
  CRYPTO.forEach((c) => {
    const div = document.createElement('div');
    div.className = 'crypto-row';
    div.innerHTML = `<div class="crypto-head"><div class="crypto-name">${c.name}<span class="mono">${c.mono}</span></div><div class="crypto-status ${c.status}">${c.status.toUpperCase()}</div></div><div class="crypto-desc">${c.desc}</div><div class="crypto-progress"><div style="width:${c.pct}%"></div></div>`;
    cryptoList.appendChild(div);
  });
}

/* ---------- QUANTUM KEYS ---------- */
function randHex(n) { let s = ''; const chars = '0123456789abcdef'; for (let i = 0; i < n; i++) s += chars[Math.floor(Math.random() * 16)]; return s; }
const keyGrid = document.getElementById('keyGrid');
function renderKeys() {
  if (!keyGrid) return;
  keyGrid.innerHTML = '';
  const types = ['QKD-AIR','QKD-GND','QRNG-CHIP','PQC-SESSION','QKD-AIR','PQC-SESSION','QRNG-CHIP','QKD-GND'];
  types.forEach(() => {
    const fresh = Math.random() > 0.5;
    const div = document.createElement('div');
    div.className = 'key-card' + (fresh ? ' fresh' : '');
    div.innerHTML = `<div class="key-label">${types[Math.floor(Math.random()*types.length)]} · KEY #${1000 + Math.floor(Math.random() * 8999)}</div><div class="key-value">${randHex(8)} ${randHex(8)}<br/>${randHex(8)} ${randHex(8)}</div><div class="key-meta"><span>${fresh ? 'FRESH · 1s ago' : 'ROTATING'}</span><span>${Math.floor(Math.random() * 240) + 256}-bit</span></div>`;
    keyGrid.appendChild(div);
  });
}
if (keyGrid) { renderKeys(); setInterval(renderKeys, 4000); }

/* ---------- CLOCK ---------- */
const sbTime = document.getElementById('sbTime');
function tick() { if (sbTime) sbTime.textContent = nowTime() + ' UTC'; }
tick(); setInterval(tick, 1000);

/* ============================================================ 3D GLOBE */
const globeCanvas = document.getElementById('globeCanvas');
let WORLD_GEOJSON = null;

async function loadWorld() {
  try {
    const res = await fetch('assets/world.geojson');
    WORLD_GEOJSON = await res.json();
  } catch (e) {
    console.warn('world geojson failed', e);
  }
}
loadWorld();

if (globeCanvas) {
  const g = globeCanvas.getContext('2d');
  let GW, GH;
  function resizeGlobe() {
    GW = globeCanvas.width = globeCanvas.offsetWidth * devicePixelRatio;
    GH = globeCanvas.height = globeCanvas.offsetHeight * devicePixelRatio;
  }
  resizeGlobe();
  window.addEventListener('resize', resizeGlobe);

  let rotY = 0, rotX = -0.3;
  let dragging = false, lastX = 0, lastY = 0;
  let autoRotate = true;

  globeCanvas.addEventListener('mousedown', (e) => { dragging = true; lastX = e.clientX; lastY = e.clientY; autoRotate = false; });
  window.addEventListener('mouseup', () => { dragging = false; });
  window.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    rotY += (e.clientX - lastX) * 0.005;
    rotX += (e.clientY - lastY) * 0.005;
    rotX = Math.max(-1.2, Math.min(1.2, rotX));
    lastX = e.clientX; lastY = e.clientY;
  });
  globeCanvas.addEventListener('touchstart', (e) => { dragging = true; lastX = e.touches[0].clientX; lastY = e.touches[0].clientY; autoRotate = false; });
  globeCanvas.addEventListener('touchend', () => { dragging = false; });
  globeCanvas.addEventListener('touchmove', (e) => {
    if (!dragging) return;
    e.preventDefault();
    rotY += (e.touches[0].clientX - lastX) * 0.005;
    rotX += (e.touches[0].clientY - lastY) * 0.005;
    rotX = Math.max(-1.2, Math.min(1.2, rotX));
    lastX = e.touches[0].clientX; lastY = e.touches[0].clientY;
  }, { passive: false });

  function project(lat, lon, r) {
    const x = r * Math.cos(lat * Math.PI / 180) * Math.sin(lon * Math.PI / 180);
    const y = r * Math.sin(lat * Math.PI / 180);
    const z = r * Math.cos(lat * Math.PI / 180) * Math.cos(lon * Math.PI / 180);
    const x2 = x * Math.cos(rotY) + z * Math.sin(rotY);
    const z2 = -x * Math.sin(rotY) + z * Math.cos(rotY);
    const y2 = y * Math.cos(rotX) - z2 * Math.sin(rotX);
    const z3 = y * Math.sin(rotX) + z2 * Math.cos(rotX);
    return { x: x2, y: y2, z: z3 };
  }

  // Plane icon path (small airplane silhouette)
  function drawPlaneIcon(ctx, x, y, size, color, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(size, size);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    // simple plane shape pointing up
    ctx.moveTo(0, -7);          // nose
    ctx.lineTo(1, -2);          // right body
    ctx.lineTo(6, 0);           // right wing tip
    ctx.lineTo(6, 2);
    ctx.lineTo(1, 2);
    ctx.lineTo(1.5, 5);          // right tail
    ctx.lineTo(3, 7);
    ctx.lineTo(3, 8);
    ctx.lineTo(0, 7);           // tail center
    ctx.lineTo(-3, 8);
    ctx.lineTo(-3, 7);
    ctx.lineTo(-1.5, 5);
    ctx.lineTo(-1, 2);
    ctx.lineTo(-6, 2);
    ctx.lineTo(-6, 0);
    ctx.lineTo(-1, -2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  let selectedFlight = null;
  const globeInfo = document.getElementById('globeInfo');

  function showFlightOnGlobe(fl) {
    selectedFlight = fl;
    activatePanel('globe');
    updateGlobeInfo(fl);
  }
  window.showFlightOnGlobe = showFlightOnGlobe;

  function updateGlobeInfo(fl) {
    if (!globeInfo) return;
    if (!fl) {
      globeInfo.innerHTML = '<div class="gi-head">SELECT AN AIRCRAFT</div><div class="gi-empty">Click any red plane on the globe to view live flight data.</div>';
      return;
    }
    const statusClass = fl.status === 'WATCH' ? 'warn' : 'ok';
    globeInfo.innerHTML = `
      <div class="gi-head">AIRCRAFT TELEMETRY</div>
      <div class="gi-id">${fl.id}</div>
      <div class="gi-row"><span class="label">Route</span><span class="val">${fl.from} → ${fl.to}</span></div>
      <div class="gi-row"><span class="label">Type</span><span class="val">${fl.type}</span></div>
      <div class="gi-row"><span class="label">Altitude</span><span class="val">${fl.alt.toLocaleString()} ft</span></div>
      <div class="gi-row"><span class="label">Speed</span><span class="val">${fl.spd} kts</span></div>
      <div class="gi-row"><span class="label">Heading</span><span class="val">${fl.heading}°</span></div>
      <div class="gi-row"><span class="label">Position</span><span class="val">${fl.lat.toFixed(1)}, ${fl.lon.toFixed(1)}</span></div>
      <div class="gi-row"><span class="label">QKD Link</span><span class="val ${fl.qkd ? 'ok' : 'warn'}">${fl.qkd ? 'ACTIVE' : 'DEGRADED'}</span></div>
      <div class="gi-row"><span class="label">Agility Score</span><span class="val ok">${fl.score}/100</span></div>
      <div class="gi-row"><span class="label">Status</span><span class="val ${statusClass}">${fl.status}</span></div>
    `;
  }

  globeCanvas.addEventListener('click', (e) => {
    const rect = globeCanvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * devicePixelRatio;
    const my = (e.clientY - rect.top) * devicePixelRatio;
    const cx = GW / 2, cy = GH / 2;
    const r = Math.min(GW, GH) * 0.38;
    let closest = null, closestDist = 24 * devicePixelRatio;
    FLIGHTS.forEach((fl) => {
      const p = project(fl.lat, fl.lon, r);
      const sx = cx + p.x, sy = cy - p.y;
      if (p.z > -r * 0.3) {
        const d = Math.sqrt((mx - sx) ** 2 + (my - sy) ** 2);
        if (d < closestDist) { closestDist = d; closest = fl; }
      }
    });
    if (closest) { selectedFlight = closest; updateGlobeInfo(closest); }
  });

  function drawGlobe() {
    g.clearRect(0, 0, GW, GH);
    const cx = GW / 2, cy = GH / 2;
    const r = Math.min(GW, GH) * 0.38;

    // sphere background
    const grad = g.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 0, cx, cy, r);
    grad.addColorStop(0, '#16203a');
    grad.addColorStop(0.7, '#0a1020');
    grad.addColorStop(1, '#050810');
    g.fillStyle = grad;
    g.beginPath();
    g.arc(cx, cy, r, 0, Math.PI * 2);
    g.fill();

    // sphere outline
    g.strokeStyle = 'rgba(255,49,49,0.15)';
    g.lineWidth = 1 * devicePixelRatio;
    g.beginPath();
    g.arc(cx, cy, r, 0, Math.PI * 2);
    g.stroke();

    // grid lines
    g.strokeStyle = 'rgba(255,255,255,0.04)';
    g.lineWidth = 0.5 * devicePixelRatio;
    for (let lat = -60; lat <= 60; lat += 30) {
      g.beginPath();
      for (let lon = -180; lon <= 180; lon += 5) {
        const p = project(lat, lon, r);
        const sx = cx + p.x, sy = cy - p.y;
        if (p.z > 0) { g.moveTo(sx, sy); } else { g.lineTo(sx, sy); }
      }
      g.stroke();
    }
    for (let lon = -180; lon <= 180; lon += 30) {
      g.beginPath();
      for (let lat = -80; lat <= 80; lat += 5) {
        const p = project(lat, lon, r);
        const sx = cx + p.x, sy = cy - p.y;
        if (p.z > 0) { g.moveTo(sx, sy); } else { g.lineTo(sx, sy); }
      }
      g.stroke();
    }

    // draw actual country borders from geojson
    if (WORLD_GEOJSON && WORLD_GEOJSON.features) {
      g.strokeStyle = 'rgba(138,150,180,0.55)';
      g.fillStyle = 'rgba(40,55,85,0.35)';
      g.lineWidth = 0.8 * devicePixelRatio;
      WORLD_GEOJSON.features.forEach((feat) => {
        const geom = feat.geometry;
        if (!geom) return;
        const coords = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
        coords.forEach((poly) => {
          poly.forEach((ring) => {
            let first = true;
            ring.forEach((pt) => {
              const [lon, lat] = pt;
              const p = project(lat, lon, r);
              const sx = cx + p.x, sy = cy - p.y;
              if (p.z > 0) {
                if (first) { g.beginPath(); g.moveTo(sx, sy); first = false; }
                else { g.lineTo(sx, sy); }
              }
            });
            if (!first) { g.closePath(); g.fill(); g.stroke(); }
          });
        });
      });
    }

    // flight paths (QKD links)
    g.strokeStyle = 'rgba(255,49,49,0.25)';
    g.lineWidth = 1 * devicePixelRatio;
    for (let i = 0; i < 8; i++) {
      const a = FLIGHTS[i], b = FLIGHTS[i + 10];
      const pa = project(a.lat, a.lon, r), pb = project(b.lat, b.lon, r);
      if (pa.z > 0 && pb.z > 0) {
        g.beginPath();
        g.moveTo(cx + pa.x, cy - pa.y);
        g.lineTo(cx + pb.x, cy - pb.y);
        g.stroke();
      }
    }

    // aircraft as plane icons
    FLIGHTS.forEach((fl) => {
      const p = project(fl.lat, fl.lon, r);
      if (p.z > -r * 0.2) {
        const sx = cx + p.x, sy = cy - p.y;
        const alpha = Math.max(0.35, p.z / r + 0.35);
        const isThreat = fl.threat;
        const color = isThreat ? '#660018' : '#ff3131';
        const iconSize = (selectedFlight === fl ? 1.6 : 1) * devicePixelRatio;

        // glow
        g.shadowColor = color;
        g.shadowBlur = 10 * devicePixelRatio;
        drawPlaneIcon(g, sx, sy, iconSize, color, alpha);
        g.shadowBlur = 0;

        if (selectedFlight === fl) {
          g.strokeStyle = '#ff3131';
          g.lineWidth = 1.5 * devicePixelRatio;
          g.beginPath();
          g.arc(sx, sy, 12 * devicePixelRatio, 0, Math.PI * 2);
          g.stroke();
        }
      }
    });

    if (autoRotate) rotY += 0.002;
    requestAnimationFrame(drawGlobe);
  }
  drawGlobe();
}