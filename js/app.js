// Air Shield v4.0 - fixed feedFilter hoisting
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

function countUp(el, target, duration = 1600) {
  const start = performance.now();
  const startVal = 0;
  const step = (now) => {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    const val = Math.floor(startVal + (target - startVal) * eased);
    // Don't use toLocaleString for years (2029), only for large numbers
    el.textContent = target > 2100 ? val.toLocaleString() : val.toString();
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = target > 2100 ? target.toLocaleString() : target.toString();
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
  const match = document.querySelector(`.sb-item[data-panel="${name}"]`);
  if (match) match.classList.add('active');
  panels.forEach((p) => p.classList.remove('active'));
  const tgt = document.getElementById('panel-' + name);
  if (tgt) tgt.classList.add('active');
  // trigger resize so canvases (globe, chart) resize to their now-visible container
  setTimeout(() => window.dispatchEvent(new Event('resize')), 50);
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
  // Apply current filter
  if (feedFilter !== 'all' && t.sev !== feedFilter) row.style.display = 'none';
  if (feedEl) { feedEl.prepend(row); while (feedEl.children.length > 24) feedEl.removeChild(feedEl.lastChild); }
  if (t.sev !== 'info') { threatCount++; if (threatCountEl) threatCountEl.textContent = threatCount; }
}
// Feed filter — must be declared before addFeedItem uses it
let feedFilter = 'all';
document.querySelectorAll('.feed-filter').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.feed-filter').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    feedFilter = btn.dataset.filter;
    // Apply filter to existing items
    document.querySelectorAll('.feed-item').forEach(item => {
      if (feedFilter === 'all' || item.classList.contains(feedFilter)) {
        item.style.display = '';
      } else {
        item.style.display = 'none';
      }
    });
  });
});

if (feedEl) { for (let i = 0; i < 12; i++) addFeedItem(true); setInterval(addFeedItem, 3200); }

/* ---------- FLIGHT DATA (shared) — pulled from OpenSky real-time API ---------- */
const ROUTES = [
  ['JFK','LHR'],['LAX','NRT'],['ATL','FRA'],['DFW','GRU'],['ORD','DXB'],['MIA','CDG'],
  ['SFO','ICN'],['SEA','AMS'],['IAD','HND'],['BOS','MAD'],['PHX','ZRH'],['DEN','VIE'],
  ['HKG','SFO'],['SIN','LHR'],['SYD','LAX'],['DXB','JFK'],['ICN','ATL'],['AMS','JFK'],
];
const AIRPORTS = {
  JFK: [40.6413, -73.7781], LHR: [51.4700, -0.4543], LAX: [33.9416, -118.4085],
  NRT: [35.7720, 140.3929], ATL: [33.6407, -84.4277], FRA: [50.0379, 8.5622],
  DFW: [32.8998, -97.0403], GRU: [-23.4356, -46.4731], ORD: [41.9742, -87.9073],
  DXB: [25.2532, 55.3657], MIA: [25.7959, -80.2870], CDG: [49.0097, 2.5479],
  SFO: [37.6213, -122.3790], ICN: [37.4602, 126.4407], SEA: [47.4502, -122.3088],
  AMS: [52.3105, 4.7683], IAD: [38.9531, -77.4565], HND: [35.5494, 139.7798],
  BOS: [42.3656, -71.0096], MAD: [40.4983, -3.5676], PHX: [33.4342, -112.0116],
  ZRH: [47.4647, 8.5492], DEN: [39.8561, -104.6737], VIE: [48.1102, 16.5697],
  HKG: [22.3080, 113.9185], SIN: [1.3644, 103.9915], SYD: [-33.9399, 151.1753],
};
const TYPES = ['B777-300ER','B787-9','A350-1000','A380-800','B747-8I','A330-300','B767-300ER','A220-300'];

function altColor(alt) {
  if (!alt || alt < 35000) return '#ff3131';
  if (alt < 40000) return '#ff8c1a';
  return '#ffcc00';
}

let FLIGHTS = [];

// Generate fallback flights immediately so UI doesn't break
function generateFallbackFlights() {
  FLIGHTS = [];
  for (let i = 0; i < 80; i++) {
    const route = ROUTES[i % ROUTES.length];
    const fromCoords = AIRPORTS[route[0]] || [40, -74];
    const toCoords = AIRPORTS[route[1]] || [51, 0];
    const progress = 0.15 + Math.random() * 0.7;
    const lat = fromCoords[0] + (toCoords[0] - fromCoords[0]) * progress + (Math.random() - 0.5) * 8;
    const lon = fromCoords[1] + (toCoords[1] - fromCoords[1]) * progress + (Math.random() - 0.5) * 8;
    const score = Math.floor(Math.random() * 18) + 82;
    const status = score > 92 ? 'SECURE' : score > 86 ? 'ACTIVE' : 'WATCH';
    FLIGHTS.push({
      id: 'RTX-' + (1000 + i), from: route[0], to: route[1],
      fromCoords, toCoords,
      type: TYPES[Math.floor(Math.random() * TYPES.length)],
      lat, lon, score, status, threat: Math.random() < 0.08,
      heading: Math.floor(Math.random() * 360),
      alt: Math.floor(Math.random() * 30000) + 30000,
      spd: Math.floor(Math.random() * 200) + 480,
      qkd: Math.random() > 0.15, progress, trail: [],
    });
  }
}

// Generate immediately
generateFallbackFlights();

// Fetch real aircraft from embedded JSON (fetched server-side to avoid CORS)
async function fetchRealFlights() {
  try {
    const res = await fetch('assets/real_flights.json');
    const data = await res.json();
    const realFlights = data.flights || [];
    FLIGHTS = realFlights.slice(0, 80).map((f, i) => {
      const route = ROUTES[i % ROUTES.length];
      const fromCoords = AIRPORTS[route[0]] || [40, -74];
      const toCoords = AIRPORTS[route[1]] || [51, 0];
      const score = Math.floor(Math.random() * 18) + 82;
      const status = score > 92 ? 'SECURE' : score > 86 ? 'ACTIVE' : 'WATCH';
      return {
        id: f.id,
        from: route[0], to: route[1],
        fromCoords, toCoords,
        type: TYPES[Math.floor(Math.random() * TYPES.length)],
        lat: f.lat, lon: f.lon,
        score, status,
        threat: Math.random() < 0.08,
        heading: f.heading || Math.floor(Math.random() * 360),
        alt: f.alt_ft || Math.floor(Math.random() * 30000) + 30000,
        spd: f.speed_kts || Math.floor(Math.random() * 200) + 480,
        qkd: Math.random() > 0.15,
        progress: 0.15 + Math.random() * 0.7,
        trail: [],
        realCallsign: f.callsign,
        realCountry: f.country,
      };
    });
    console.log(`Loaded ${FLIGHTS.length} real aircraft from embedded JSON`);
  } catch (e) {
    console.warn('Real flights JSON failed, using fallback:', e.message);
    generateFallbackFlights();
  }
}

/* ---------- FLEET GRID ---------- */
// Wait for real flight data to load before rendering
fetchRealFlights().then(() => {
  // Refresh from OpenSky every 60 seconds
  setInterval(fetchRealFlights, 60000);
});

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
let currentSearch = '';
if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    currentSearch = e.target.value;
    // Re-render registry with filter
    renderRegistry(currentSearch);
    // Filter fleet grid
    const f = currentSearch.toUpperCase();
    document.querySelectorAll('.fleet-card').forEach((card) => {
      const id = card.querySelector('.fleet-id').textContent.toUpperCase();
      const route = card.querySelector('.fleet-route').textContent.toUpperCase();
      card.style.display = (!f || id.includes(f) || route.includes(f)) ? '' : 'none';
    });
    // Highlight matching planes on the globe
    if (f) {
      FLIGHTS.forEach((fl) => {
        const match = fl.id.toUpperCase().includes(f) || fl.from.toUpperCase().includes(f) || fl.to.toUpperCase().includes(f) || fl.type.toUpperCase().includes(f);
        fl.searchMatch = match;
      });
    } else {
      FLIGHTS.forEach((fl) => { fl.searchMatch = false; });
    }
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

/* ---------- SNDL EXPOSURE METER ---------- */
const emArc = document.getElementById('emArc');
const emValue = document.getElementById('emValue');
const emChannels = document.getElementById('emChannels');
let emPercent = 47;
function updateExposure() {
  // Fluctuate between 30% and 70%
  emPercent += (Math.random() - 0.5) * 4;
  emPercent = Math.max(30, Math.min(72, emPercent));
  const arcLen = 251.3; // half circle length
  const offset = arcLen * (1 - emPercent / 100);
  if (emArc) emArc.setAttribute('stroke-dashoffset', offset);
  if (emValue) emValue.textContent = Math.round(emPercent) + '%';
  const channels = Math.round((emPercent / 100) * 247);
  if (emChannels) emChannels.textContent = channels + ' / 247';
}
updateExposure();
setInterval(updateExposure, 2500);

/* ============================================================ MAPLIBRE GLOBE */
const mapContainer = document.getElementById('maplibreGlobe');
let mlMap = null;
let selectedFlight = null;
const globeInfo = document.getElementById('globeInfo');

function altColor(alt) {
  if (alt < 35000) return '#ff3131';
  if (alt < 40000) return '#ff8c1a';
  return '#ffcc00';
}

function showFlightOnGlobe(fl) {
  selectedFlight = fl;
  activatePanel('globe');
  updateGlobeInfo(fl);
  if (mlMap && fl) {
    mlMap.flyTo({ center: [fl.lon, fl.lat], zoom: Math.max(mlMap.getZoom(), 3), duration: 1500 });
  }
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

// Initialize MapLibre globe
function initMapLibre() {
  if (!mapContainer || typeof maplibregl === 'undefined') return;

  // Animate the aircraft count from 0 to 247
  const globeCountEl = document.getElementById('globeCount');
  if (globeCountEl) {
    countUp(globeCountEl, 247, 2000);
  }

  mlMap = new maplibregl.Map({
    container: mapContainer,
    style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    center: [0, 25],
    zoom: 1.5,
    maxZoom: 8,
    minZoom: 0.5,
    maxPitch: 85,
    attributionControl: false,
  });

  mlMap.on('load', () => {
    // Set globe projection — flat, no tilt when idle
    try {
      mlMap.setProjection({ type: 'globe' });
      mlMap.setSky({
        'sky-color': '#04040A',
        'sky-horizon-blend': 0.5,
        'horizon-color': '#0a0a1a',
        'horizon-fog-blend': 0.3,
        'fog-color': '#04040A',
        'fog-ground-blend': 0.9,
      });
    } catch (e) { console.warn('Projection set failed:', e); }
    // Create plane icon (red aircraft silhouette)
    const planeCanvas = document.createElement('canvas');
    planeCanvas.width = 32; planeCanvas.height = 32;
    const pctx = planeCanvas.getContext('2d');
    pctx.fillStyle = '#ff3131';
    pctx.beginPath();
    pctx.moveTo(16, 2);           // nose
    pctx.lineTo(19, 14);
    pctx.lineTo(30, 18);
    pctx.lineTo(30, 21);
    pctx.lineTo(19, 20);
    pctx.lineTo(20, 26);
    pctx.lineTo(25, 30);
    pctx.lineTo(25, 31);
    pctx.lineTo(16, 29);
    pctx.lineTo(7, 31);
    pctx.lineTo(7, 30);
    pctx.lineTo(12, 26);
    pctx.lineTo(13, 20);
    pctx.lineTo(2, 21);
    pctx.lineTo(2, 18);
    pctx.lineTo(13, 14);
    pctx.closePath();
    pctx.fill();
    mlMap.addImage('plane-red', { width: 32, height: 32, data: new Uint8Array(pctx.getImageData(0, 0, 32, 32).data) });

    // Threat icon (dark red)
    pctx.clearRect(0, 0, 32, 32);
    pctx.fillStyle = '#660018';
    pctx.beginPath();
    pctx.moveTo(16, 2); pctx.lineTo(19, 14); pctx.lineTo(30, 18); pctx.lineTo(30, 21);
    pctx.lineTo(19, 20); pctx.lineTo(20, 26); pctx.lineTo(25, 30); pctx.lineTo(25, 31);
    pctx.lineTo(16, 29); pctx.lineTo(7, 31); pctx.lineTo(7, 30); pctx.lineTo(12, 26);
    pctx.lineTo(13, 20); pctx.lineTo(2, 21); pctx.lineTo(2, 18); pctx.lineTo(13, 14);
    pctx.closePath(); pctx.fill();
    mlMap.addImage('plane-threat', { width: 32, height: 32, data: new Uint8Array(pctx.getImageData(0, 0, 32, 32).data) });

    // Search-highlight icon (gold)
    pctx.clearRect(0, 0, 32, 32);
    pctx.fillStyle = '#ffcc00';
    pctx.beginPath();
    pctx.moveTo(16, 2); pctx.lineTo(19, 14); pctx.lineTo(30, 18); pctx.lineTo(30, 21);
    pctx.lineTo(19, 20); pctx.lineTo(20, 26); pctx.lineTo(25, 30); pctx.lineTo(25, 31);
    pctx.lineTo(16, 29); pctx.lineTo(7, 31); pctx.lineTo(7, 30); pctx.lineTo(12, 26);
    pctx.lineTo(13, 20); pctx.lineTo(2, 21); pctx.lineTo(2, 18); pctx.lineTo(13, 14);
    pctx.closePath(); pctx.fill();
    mlMap.addImage('plane-search', { width: 32, height: 32, data: new Uint8Array(pctx.getImageData(0, 0, 32, 32).data) });

    // Airport dot icon
    const aptCanvas = document.createElement('canvas');
    aptCanvas.width = 16; aptCanvas.height = 16;
    const actx = aptCanvas.getContext('2d');
    actx.fillStyle = '#78c8ff';
    actx.beginPath(); actx.arc(8, 8, 5, 0, Math.PI * 2); actx.fill();
    actx.strokeStyle = '#78c8ff'; actx.lineWidth = 1;
    actx.beginPath(); actx.arc(8, 8, 7, 0, Math.PI * 2); actx.stroke();
    mlMap.addImage('airport', { width: 16, height: 16, data: new Uint8Array(actx.getImageData(0, 0, 16, 16).data) });

    // Add flights source
    mlMap.addSource('flights', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: FLIGHTS.map(fl => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [fl.lon, fl.lat] },
        properties: {
          id: fl.id, from: fl.from, to: fl.to, type: fl.type,
          alt: fl.alt, spd: fl.spd, heading: fl.heading,
          score: fl.score, status: fl.status, threat: fl.threat,
          qkd: fl.qkd, lat: fl.lat, lon: fl.lon,
        }
      })) }
    });

    // Add airport markers source
    const airportFeatures = [];
    const drawnAirports = new Set();
    FLIGHTS.forEach(fl => {
      [fl.from, fl.to].forEach(code => {
        if (drawnAirports.has(code)) return;
        drawnAirports.add(code);
        const coords = AIRPORTS[code];
        if (coords) airportFeatures.push({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [coords[1], coords[0]] },
          properties: { code }
        });
      });
    });
    mlMap.addSource('airports', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: airportFeatures }
    });

    // Airport labels
    mlMap.addLayer({
      id: 'airport-labels',
      type: 'symbol',
      source: 'airports',
      layout: {
        'icon-image': 'airport',
        'icon-size': 0.8,
        'text-field': ['get', 'code'],
        'text-font': ['Open Sans Semibold'],
        'text-size': 10,
        'text-offset': [0, -1.5],
        'text-anchor': 'bottom',
      },
      paint: {
        'text-color': '#78c8ff',
        'text-halo-color': '#000',
        'text-halo-width': 1,
      }
    });

    // Flight trails (lines behind planes)
    const trailFeatures = FLIGHTS.filter(fl => fl.trail && fl.trail.length > 1).map(fl => ({
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: fl.trail.map(t => [t[1], t[0]]) },
      properties: { id: fl.id }
    }));
    mlMap.addSource('trails', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: trailFeatures }
    });
    mlMap.addLayer({
      id: 'trail-lines',
      type: 'line',
      source: 'trails',
      paint: {
        'line-color': '#ff3131',
        'line-width': 1.5,
        'line-opacity': 0.4,
      }
    });

    // Route lines (origin → plane → destination) for selected flight
    mlMap.addSource('route-lines', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] }
    });
    mlMap.addLayer({
      id: 'route-line-layer',
      type: 'line',
      source: 'route-lines',
      paint: {
        'line-color': '#ffcc00',
        'line-width': 1.5,
        'line-opacity': 0.5,
        'line-dasharray': [2, 2],
      }
    });

    // Aircraft symbol layer — rotated by heading
    mlMap.addLayer({
      id: 'aircraft',
      type: 'symbol',
      source: 'flights',
      layout: {
        'icon-image': [
          'case',
          ['==', ['get', 'searchMatch'], true], 'plane-search',
          ['get', 'threat'], 'plane-threat',
          'plane-red'
        ],
        'icon-size': 0.7,
        'icon-rotate': ['get', 'heading'],
        'icon-rotation-alignment': 'map',
        'icon-allow-overlap': true,
      },
      paint: {
        'icon-opacity': 0.9,
      }
    });

    // Click handler
    mlMap.on('click', 'aircraft', (e) => {
      const f = e.features[0];
      const fl = FLIGHTS.find(x => x.id === f.properties.id);
      if (fl) {
        selectedFlight = fl;
        updateGlobeInfo(fl);
        updateRouteLines();
      }
    });

    // Hover cursor
    mlMap.on('mouseenter', 'aircraft', () => { mlMap.getCanvas().style.cursor = 'pointer'; });
    mlMap.on('mouseleave', 'aircraft', () => { mlMap.getCanvas().style.cursor = ''; });

    // Popup on hover
    const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 15 });
    mlMap.on('mouseenter', 'aircraft', (e) => {
      const f = e.features[0];
      const coords = f.geometry.coordinates.slice();
      const html = `<div style="font-family:'JetBrains Mono',monospace;font-size:11px;color:#fff;background:#0a0e1a;padding:6px 10px;border:1px solid #cc0001;border-radius:4px;">
        <span style="color:#ff3131;font-weight:bold">${f.properties.id}</span> · ${f.properties.from}→${f.properties.to} · ${Math.round(f.properties.alt).toLocaleString()}ft
      </div>`;
      popup.setLngLat(coords).setHTML(html).addTo(mlMap);
    });
    mlMap.on('mouseleave', 'aircraft', () => popup.remove());

    // No auto-rotate — globe only moves when user interacts

    // Start live movement
    setInterval(() => {
      FLIGHTS.forEach((fl) => {
        if (!fl.fromCoords || !fl.toCoords) return;
        fl.progress += 0.008;
        if (fl.progress >= 1) {
          fl.progress = 0;
          const route = ROUTES[Math.floor(Math.random() * ROUTES.length)];
          fl.from = route[0]; fl.to = route[1];
          fl.fromCoords = AIRPORTS[route[0]] || [40, -74];
          fl.toCoords = AIRPORTS[route[1]] || [51, 0];
          fl.trail = [];
        }
        fl.lat = fl.fromCoords[0] + (fl.toCoords[0] - fl.fromCoords[0]) * fl.progress + (Math.random() - 0.5) * 4;
        fl.lon = fl.fromCoords[1] + (fl.toCoords[1] - fl.fromCoords[1]) * fl.progress + (Math.random() - 0.5) * 4;
        fl.heading = Math.floor(Math.atan2(fl.toCoords[1] - fl.lon, fl.toCoords[0] - fl.lat) * 180 / Math.PI + 360) % 360;
        fl.trail.unshift([fl.lat, fl.lon]);
        if (fl.trail.length > 8) fl.trail.pop();
        if (selectedFlight === fl) updateGlobeInfo(fl);
      });
      // Update map sources
      if (mlMap.getSource('flights')) {
        mlMap.getSource('flights').setData({
          type: 'FeatureCollection',
          features: FLIGHTS.map(fl => ({
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [fl.lon, fl.lat] },
            properties: {
              id: fl.id, from: fl.from, to: fl.to, type: fl.type,
              alt: fl.alt, spd: fl.spd, heading: fl.heading,
              score: fl.score, status: fl.status, threat: fl.threat,
              qkd: fl.qkd, searchMatch: fl.searchMatch || false,
            }
          }))
        });
      }
      if (mlMap.getSource('trails')) {
        mlMap.getSource('trails').setData({
          type: 'FeatureCollection',
          features: FLIGHTS.filter(fl => fl.trail && fl.trail.length > 1).map(fl => ({
            type: 'Feature',
            geometry: { type: 'LineString', coordinates: fl.trail.map(t => [t[1], t[0]]) },
            properties: { id: fl.id }
          }))
        });
      }
      updateRouteLines();
    }, 2000);
  });
}

function updateRouteLines() {
  if (!mlMap || !mlMap.getSource('route-lines') || !selectedFlight) return;
  const fl = selectedFlight;
  const features = [];
  if (fl.fromCoords) features.push({
    type: 'Feature',
    geometry: { type: 'LineString', coordinates: [[fl.fromCoords[1], fl.fromCoords[0]], [fl.lon, fl.lat]] },
    properties: {}
  });
  if (fl.toCoords) features.push({
    type: 'Feature',
    geometry: { type: 'LineString', coordinates: [[fl.lon, fl.lat], [fl.toCoords[1], fl.toCoords[0]]] },
    properties: {}
  });
  mlMap.getSource('route-lines').setData({ type: 'FeatureCollection', features });
}

// Resize handler for when panel becomes visible
window.addEventListener('resize', () => { if (mlMap) setTimeout(() => mlMap.resize(), 50); });

// Initialize when globe panel is opened
const globeBtn = document.querySelector('.sb-item[data-panel="globe"]');
if (globeBtn) {
  globeBtn.addEventListener('click', () => {
    if (!mlMap) {
      setTimeout(initMapLibre, 100);
    } else {
      setTimeout(() => mlMap.resize(), 100);
    }
  });
}
// Also init on dropdown click
document.querySelectorAll('.sb-dd-item').forEach(item => {
  item.addEventListener('click', () => {
    if (item.dataset.panel === 'globe' && !mlMap) {
      setTimeout(initMapLibre, 100);
    }
  });
});
