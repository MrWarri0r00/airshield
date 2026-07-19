/* ============================================================
   AIR SHIELD — Interactive logic
   ============================================================ */

/* ---------- THEME TOGGLE ---------- */
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

/* ---------- COUNT-UP ANIMATION (hero stats) ---------- */
function countUp(el, target, duration = 1600) {
  const start = performance.now();
  const startVal = 0;
  const step = (now) => {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.floor(startVal + (target - startVal) * eased).toLocaleString();
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = target.toLocaleString();
  };
  requestAnimationFrame(step);
}

const heroObserver = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      document.querySelectorAll('.stat-num').forEach((el) => {
        const t = parseInt(el.dataset.count, 10);
        countUp(el, t);
      });
      heroObserver.disconnect();
    }
  });
}, { threshold: 0.4 });
const heroStats = document.querySelector('.hero-stats');
if (heroStats) heroObserver.observe(heroStats);

/* ---------- KPI COUNT-UP ---------- */
const kpiObserver = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      document.querySelectorAll('[data-count-kpi]').forEach((el) => {
        const t = parseInt(el.dataset.countKpi, 10);
        countUp(el, t, 2000);
      });
      kpiObserver.disconnect();
    }
  });
}, { threshold: 0.3 });
const consoleEl = document.getElementById('console');
if (consoleEl) kpiObserver.observe(consoleEl);

/* ---------- HERO CANVAS (quantum particle field) ---------- */
const canvas = document.getElementById('heroCanvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];
  const COLORS = ['#cc0001', '#ff3131', '#7a0000'];

  function resize() {
    W = canvas.width = canvas.offsetWidth * devicePixelRatio;
    H = canvas.height = canvas.offsetHeight * devicePixelRatio;
  }
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
    // links
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
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
      }
    }
    // nodes
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
      ctx.fillStyle = p.c;
      ctx.globalAlpha = p.a;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
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
  function resizeChart() {
    cw = chartCanvas.width = chartCanvas.offsetWidth * devicePixelRatio;
    ch = chartCanvas.height = 220 * devicePixelRatio;
  }
  resizeChart();
  window.addEventListener('resize', resizeChart);

  let data = Array.from({ length: 60 }, () => Math.random() * 30 + 10);

  function drawChart() {
    c.clearRect(0, 0, cw, ch);
    const max = Math.max(...data) * 1.2;
    const stepX = cw / data.length;

    // grid
    c.strokeStyle = getCSS('--border');
    c.lineWidth = 1 * devicePixelRatio;
    for (let i = 0; i < 4; i++) {
      const y = (ch / 4) * i;
      c.beginPath(); c.moveTo(0, y); c.lineTo(cw, y); c.stroke();
    }

    // area
    const grad = c.createLinearGradient(0, 0, 0, ch);
    grad.addColorStop(0, 'rgba(255,49,49,0.35)');
    grad.addColorStop(1, 'rgba(255,49,49,0.0)');
    c.fillStyle = grad;
    c.beginPath();
    c.moveTo(0, ch);
    data.forEach((v, i) => {
      const x = i * stepX;
      const y = ch - (v / max) * ch;
      c.lineTo(x, y);
    });
    c.lineTo(cw, ch);
    c.closePath();
    c.fill();

    // line
    c.strokeStyle = '#ff3131';
    c.lineWidth = 2 * devicePixelRatio;
    c.beginPath();
    data.forEach((v, i) => {
      const x = i * stepX;
      const y = ch - (v / max) * ch;
      i === 0 ? c.moveTo(x, y) : c.lineTo(x, y);
    });
    c.stroke();

    // last point dot
    const lastY = ch - (data[data.length - 1] / max) * ch;
    c.fillStyle = '#ff3131';
    c.beginPath();
    c.arc(cw - stepX, lastY, 4 * devicePixelRatio, 0, Math.PI * 2);
    c.fill();
  }

  function getCSS(varName) {
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim() || '#26262e';
  }

  drawChart();
  setInterval(() => {
    data.shift();
    data.push(Math.random() * 50 + 10);
    drawChart();
  }, 1500);
}

/* ---------- SIDEBAR NAVIGATION ---------- */
const sbItems = document.querySelectorAll('.sb-item');
const panels = document.querySelectorAll('.panel');
sbItems.forEach((item) => {
  item.addEventListener('click', () => {
    const target = item.dataset.panel;
    sbItems.forEach((i) => i.classList.remove('active'));
    item.classList.add('active');
    panels.forEach((p) => p.classList.remove('active'));
    document.getElementById('panel-' + target).classList.add('active');
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
function nowTime() {
  const d = new Date();
  return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
}

function addFeedItem(initial = false) {
  const t = THREAT_TEMPLATES[Math.floor(Math.random() * THREAT_TEMPLATES.length)];
  const time = initial
    ? new Date(Date.now() - Math.random() * 60000).toTimeString().slice(0, 8)
    : nowTime();
  const sevLabel = t.sev.toUpperCase();

  const row = document.createElement('div');
  row.className = 'feed-item ' + t.sev;
  row.innerHTML = `
    <span class="feed-time">${time}</span>
    <span class="feed-sev ${t.sev}">${sevLabel}</span>
    <span class="feed-msg">${t.msg}</span>
    <span class="feed-src">${t.src}</span>
  `;

  if (feedEl) {
    feedEl.prepend(row);
    while (feedEl.children.length > 24) feedEl.removeChild(feedEl.lastChild);
  }
  if (t.sev !== 'info') {
    threatCount++;
    if (threatCountEl) threatCountEl.textContent = threatCount;
  }
}

// seed feed
for (let i = 0; i < 12; i++) addFeedItem(true);
// live updates
setInterval(addFeedItem, 3200);

/* ---------- FLEET STATUS ---------- */
const ROUTES = [
  ['JFK', 'LHR'], ['LAX', 'NRT'], ['ATL', 'FRA'], ['DFW', 'GRU'],
  ['ORD', 'DXB'], ['MIA', 'CDG'], ['SFO', 'ICN'], ['SEA', 'AMS'],
  ['IAD', 'HND'], ['BOS', 'MAD'], ['PHX', 'ZRH'], ['DEN', 'VIE'],
];
const fleetEl = document.getElementById('fleetGrid');
if (fleetEl) {
  for (let i = 0; i < 24; i++) {
    const id = 'RTX-' + (1000 + Math.floor(Math.random() * 8999));
    const route = ROUTES[i % ROUTES.length];
    const score = Math.floor(Math.random() * 18) + 82;
    const status = score > 92 ? 'SECURE' : score > 86 ? 'ACTIVE' : 'WATCH';
    const div = document.createElement('div');
    div.className = 'fleet-card';
    div.innerHTML = `
      <div class="fleet-id">${id}</div>
      <div class="fleet-route">${route[0]} → ${route[1]}</div>
      <div class="fleet-bar"><div style="width:${score}%"></div></div>
      <div class="fleet-stat">
        <span>${score}/100</span>
        <span class="ok">${status}</span>
      </div>
    `;
    fleetEl.appendChild(div);
  }
}

/* ---------- CRYPTO AGILITY ---------- */
const CRYPTO = [
  { name: 'Key Encapsulation', mono: 'ML-KEM (FIPS 203)', status: 'ready', pct: 100, desc: 'Lattice-based post-quantum key exchange. Active on all aircraft.' },
  { name: 'Digital Signatures', mono: 'ML-DSA (FIPS 204)', status: 'ready', pct: 100, desc: 'Lattice-based signatures replacing RSA-2048 across fleet.' },
  { name: 'Quantum Key Distribution', mono: 'QKD', status: 'migrating', pct: 78, desc: 'Satellite-to-aircraft laser links live on 193/247 aircraft.' },
  { name: 'Quantum RNG', mono: 'QRNG', status: 'ready', pct: 100, desc: 'Onboard micro-QRNG chips generating true-random keys.' },
  { name: 'TLS Handshake', mono: 'PQC-TLS 1.3', status: 'migrating', pct: 94, desc: 'Hybrid classical + PQC handshakes on all comms links.' },
  { name: 'RSA-2048 (Legacy)', mono: 'RSA', status: 'legacy', pct: 8, desc: 'Disabled. Classical public-key math is broken by Shor’s algorithm.' },
  { name: 'ECC (Legacy)', mono: 'ECC', status: 'legacy', pct: 4, desc: 'Disabled. Elliptic-curve crypto broken by quantum Shor variant.' },
];
const cryptoList = document.getElementById('cryptoList');
if (cryptoList) {
  CRYPTO.forEach((c) => {
    const div = document.createElement('div');
    div.className = 'crypto-row';
    div.innerHTML = `
      <div class="crypto-head">
        <div class="crypto-name">${c.name}<span class="mono">${c.mono}</span></div>
        <div class="crypto-status ${c.status}">${c.status.toUpperCase()}</div>
      </div>
      <div class="crypto-desc">${c.desc}</div>
      <div class="crypto-progress"><div style="width:${c.pct}%"></div></div>
    `;
    cryptoList.appendChild(div);
  });
}

/* ---------- QUANTUM KEYS ---------- */
function randHex(n) {
  let s = '';
  const chars = '0123456789abcdef';
  for (let i = 0; i < n; i++) s += chars[Math.floor(Math.random() * 16)];
  return s;
}
const keyGrid = document.getElementById('keyGrid');
function renderKeys() {
  if (!keyGrid) return;
  keyGrid.innerHTML = '';
  const types = ['QKD-AIR', 'QKD-GND', 'QRNG-CHIP', 'PQC-SESSION', 'QKD-AIR', 'PQC-SESSION', 'QRNG-CHIP', 'QKD-GND'];
  types.forEach((t, i) => {
    const fresh = Math.random() > 0.5;
    const div = document.createElement('div');
    div.className = 'key-card' + (fresh ? ' fresh' : '');
    div.innerHTML = `
      <div class="key-label">${t} · KEY #${1000 + Math.floor(Math.random() * 8999)}</div>
      <div class="key-value">${randHex(8)} ${randHex(8)}<br/>${randHex(8)} ${randHex(8)}</div>
      <div class="key-meta">
        <span>${fresh ? 'FRESH · 1s ago' : 'ROTATING'}</span>
        <span>${Math.floor(Math.random() * 240) + 256}-bit</span>
      </div>
    `;
    keyGrid.appendChild(div);
  });
}
if (keyGrid) {
  renderKeys();
  setInterval(renderKeys, 4000);
}

/* ---------- CLOCK ---------- */
const sbTime = document.getElementById('sbTime');
function tick() {
  if (sbTime) sbTime.textContent = nowTime() + ' UTC';
}
tick();
setInterval(tick, 1000);