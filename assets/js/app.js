// ── STATE ──
let z = 20;
const WS = {
  about:    { id:'win-about',    title:'about.txt',  open:false, min:false },
  projects: { id:'win-projects', title:'projects/',  open:false, min:false },
  contact:  { id:'win-contact',  title:'contact',    open:false, min:false },
  music:    { id:'win-music',    title:'music',      open:false, min:false },
  feedback: { id:'win-feedback', title:'feedback',   open:false, min:false },
  video:    { id:'win-video',    title:'video',      open:false, min:false },
  settings: { id:'win-settings', title:'settings',   open:false, min:false },
};
const el = k => document.getElementById(k);

// ── WINDOW OPS ──
function openWin(k) {
  const w = WS[k]; if (!w) return;
  w.open = true; w.min = false;
  el(w.id).style.display = 'flex';
  front(k); renderTB();
  playTap('open');
}
function closeWin(k) {
  const w = WS[k]; if (!w) return;
  w.open = false; w.min = false;
  const e = el(w.id);
  e.style.display = 'none';
  e.classList.remove('active');
  renderTB();
  playTap('close');
}
function minWin(k) {
  const w = WS[k]; if (!w) return;
  w.min = true;
  const e = el(w.id);
  e.style.display = 'none';
  e.classList.remove('active');
  renderTB();
  playTap('click');
}
function maxWin(winId) {
  if (isMobile()) return;
  const e = el(winId);
  if (e.dataset.max === '1') {
    e.style.top    = e.dataset.pt;
    e.style.left   = e.dataset.pl;
    e.style.width  = e.dataset.pw;
    e.style.height = e.dataset.ph || '';
    e.dataset.max  = '0';
  } else {
    e.dataset.pt = e.style.top;
    e.dataset.pl = e.style.left;
    e.dataset.pw = e.style.width;
    e.dataset.ph = e.style.height || '';
    e.style.top    = '38px';
    e.style.left   = '0';
    e.style.width  = '100%';
    e.style.height = 'calc(100% - 38px - 90px)';
    e.dataset.max  = '1';
  }
}
function front(k) {
  Object.values(WS).forEach(w => el(w.id).classList.remove('active'));
  el(WS[k].id).classList.add('active');
  el(WS[k].id).style.zIndex = ++z;
}

Object.entries(WS).forEach(([k, w]) => {
  el(w.id).addEventListener('mousedown', () => { front(k); renderTB(); });
});

el('desktop').addEventListener('mousedown', e => {
  if (e.target === el('desktop')) {
    Object.values(WS).forEach(w => el(w.id).classList.remove('active'));
    renderTB();
  }
});

// ── DRAG ──
const isMobile = () => window.innerWidth <= 768;
let ds = null;
function drag(e, winId) {
  if (isMobile() || e.button !== 0) return;
  const de = el(winId);
  if (de.dataset.max === '1') return;
  front(winId.replace('win-','')); renderTB();
  ds = { el: de, ox: e.clientX - de.offsetLeft, oy: e.clientY - de.offsetTop };
  e.preventDefault();
}
document.addEventListener('mousemove', e => {
  if (!ds) return;
  const desk = el('desktop');
  const x = Math.max(0, Math.min(e.clientX - ds.ox, desk.offsetWidth  - ds.el.offsetWidth));
  const y = Math.max(38, Math.min(e.clientY - ds.oy, desk.offsetHeight - ds.el.offsetHeight - 90));
  ds.el.style.left = x + 'px';
  ds.el.style.top  = y + 'px';
});
document.addEventListener('mouseup', () => ds = null);

// ── TASKBAR ──
function renderTB() {
  const c = el('tb-wins');
  c.innerHTML = '';
  Object.entries(WS).forEach(([k, w]) => {
    if (!w.open) return;
    const b = document.createElement('button');
    b.className = 'tb-btn' + (el(w.id).classList.contains('active') && !w.min ? ' on' : '');
    b.textContent = w.title;
    b.onclick = () => {
      if (w.min) { w.min = false; el(w.id).style.display = 'flex'; front(k); }
      else if (el(w.id).classList.contains('active')) { minWin(k); }
      else { front(k); }
      renderTB();
    };
    c.appendChild(b);
  });
}

// ── CLOCK ──
const DAYS   = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
const MONTHS = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
function tick() {
  const n = new Date();
  const p = x => String(x).padStart(2,'0');
  el('tb-clock').textContent =
    DAYS[n.getDay()] + ', ' +
    p(n.getDate()) + ' ' + MONTHS[n.getMonth()] + ' ' + n.getFullYear() +
    '  |  ' +
    p(n.getHours()) + ':' + p(n.getMinutes()) + ':' + p(n.getSeconds());
}
tick(); setInterval(tick, 1000);

// ── START MENU ──
function toggleSMenu() { el('smenu').classList.toggle('open'); }
function closeSMenu()  { el('smenu').classList.remove('open'); }

// ── MAC MENU BAR ──
function toggleMenu(id) {
  const item   = el(id);
  const isOpen = item.classList.contains('open');
  closeAllMenus();
  if (!isOpen) item.classList.add('open');
}
function closeAllMenus() {
  document.querySelectorAll('.tb-menu-item.open').forEach(m => m.classList.remove('open'));
}
function closeAllWins() {
  Object.keys(WS).forEach(k => { if (WS[k].open) closeWin(k); });
}
function minimizeAllWins() {
  Object.keys(WS).forEach(k => { if (WS[k].open && !WS[k].min) minWin(k); });
}
function copySiteURL() {
  navigator.clipboard.writeText('https://harys.space').catch(() => {});
}

// Hover-to-open: jika salah satu menu sudah open, hover langsung buka yang lain
document.querySelectorAll('.tb-menu-item').forEach(item => {
  item.addEventListener('mouseenter', () => {
    if (document.querySelector('.tb-menu-item.open')) {
      closeAllMenus();
      item.classList.add('open');
    }
  });
});

document.addEventListener('click', e => {
  if (!e.target.closest('.tb-menus') && !e.target.closest('.tb-start')) {
    closeSMenu();
    closeAllMenus();
  }
});


// ── PIXEL ART ICONS ──
const PX = 4; // pixels per "pixel" (desktop icons)

const ICONS = {
  // ── Desktop pixel art icons (temp, to be replaced with PNG) ──
  music: [
    [0,0,1,1,1,1,0,0],
    [0,0,1,0,0,1,0,0],
    [0,0,1,0,0,1,0,0],
    [0,0,1,0,0,1,0,0],
    [0,1,1,0,1,1,0,0],
    [1,1,0,0,1,0,0,0],
    [1,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
  ],
  msg: [
    [1,1,1,1,1,1,1,0],
    [1,0,0,0,0,0,1,0],
    [1,0,1,0,1,0,1,0],
    [1,0,0,0,0,0,1,0],
    [1,1,1,1,1,1,1,0],
    [0,1,1,0,0,0,0,0],
    [0,0,1,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
  ],
  video: [
    [1,0,0,0,0,0,0,0],
    [1,1,0,0,0,0,0,0],
    [1,1,1,0,0,0,0,0],
    [1,1,1,1,0,0,0,0],
    [1,1,1,1,1,0,0,0],
    [1,1,1,1,0,0,0,0],
    [1,1,1,0,0,0,0,0],
    [1,1,0,0,0,0,0,0],
    [1,0,0,0,0,0,0,0],
  ],
  // ── Win95 button icons (8×8, rendered at 2px/pixel = 16×16) ──
  'btn-min': [
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,1,1,1,1,1,0,0],
    [0,1,1,1,1,1,0,0],
    [0,0,0,0,0,0,0,0],
  ],
  'btn-max': [
    [0,1,1,1,1,1,1,0],
    [0,1,1,1,1,1,1,0],
    [0,1,0,0,0,0,1,0],
    [0,1,0,0,0,0,1,0],
    [0,1,0,0,0,0,1,0],
    [0,1,0,0,0,0,1,0],
    [0,1,1,1,1,1,1,0],
    [0,0,0,0,0,0,0,0],
  ],
  'btn-close': [
    [1,1,0,0,0,1,1,0],
    [0,1,1,0,1,1,0,0],
    [0,0,1,1,1,0,0,0],
    [0,0,0,1,0,0,0,0],
    [0,0,1,1,1,0,0,0],
    [0,1,1,0,1,1,0,0],
    [1,1,0,0,0,1,1,0],
    [0,0,0,0,0,0,0,0],
  ],
  settings: [
    [0,0,0,1,1,0,0,0],
    [0,1,1,1,1,1,1,0],
    [0,1,0,0,0,0,1,0],
    [1,1,0,0,0,0,1,1],
    [1,1,0,0,0,0,1,1],
    [0,1,0,0,0,0,1,0],
    [0,1,1,1,1,1,1,0],
    [0,0,0,1,1,0,0,0],
  ],
};

function makeSVG(grid, px) {
  px = px || PX;
  const rows = grid.length;
  const cols = Math.max(...grid.map(r => r.length));
  let r = '';
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      if (grid[row][col]) {
        r += `<rect x="${col*px}" y="${row*px}" width="${px}" height="${px}"/>`;
      }
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${cols*px}" height="${rows*px}" viewBox="0 0 ${cols*px} ${rows*px}" fill="currentColor" style="image-rendering:pixelated">${r}</svg>`;
}

// ── GLITTER effect on desktop icons ──
const STARS  = ['✦','✧','⋆','✸','✺','*','·','✼'];
const COLORS = ['#df80ff','#c840ff','#a020f0','#e8a0ff','#ff40ff','#bf00ff'];

function startGlitter(iconEl) {
  setInterval(() => {
    if (Math.random() > 0.55) return;
    const sp = document.createElement('span');
    sp.className = 'sparkle';
    sp.textContent = STARS[Math.floor(Math.random() * STARS.length)];
    const size = 5 + Math.random() * 9;
    const col  = COLORS[Math.floor(Math.random() * COLORS.length)];
    sp.style.cssText = `
      left:${Math.random() * 62 - 4}px;
      top:${Math.random() * 62 - 4}px;
      font-size:${size}px;
      color:${col};
      text-shadow:0 0 6px ${col}, 0 0 12px ${col};
      animation-delay:${Math.random() * .15}s;
    `;
    iconEl.appendChild(sp);
    setTimeout(() => sp.remove(), 950);
  }, 450);
}

document.querySelectorAll('.d-icon').forEach(icon => {
  startGlitter(icon);
  icon.addEventListener('click', () => {
    playTap('click');
    // Di mobile: satu tap langsung buka window (ondblclick tidak bekerja di touchscreen)
    if (isMobile()) {
      const match = icon.getAttribute('ondblclick')?.match(/openWin\('(\w+)'\)/);
      if (match) openWin(match[1]);
    }
  });
});
document.querySelectorAll('.dock-icon').forEach(icon => {
  startGlitter(icon);
  icon.addEventListener('click', () => playTap('click'));
});

// Desktop pixel art icons (7px per pixel)
document.querySelectorAll('.d-art[data-icon]').forEach(el => {
  const grid = ICONS[el.dataset.icon];
  if (grid) el.innerHTML = makeSVG(grid, 7);
});

// Dock pixel art icons (6px per pixel)
document.querySelectorAll('.dock-art[data-icon]').forEach(el => {
  const grid = ICONS[el.dataset.icon];
  if (grid) el.innerHTML = makeSVG(grid, 6);
});

// Win95 button icons (2px per pixel)
document.querySelectorAll('.wb-min').forEach(el => {
  el.innerHTML = makeSVG(ICONS['btn-min'], 1);
});
document.querySelectorAll('.wb-max').forEach(el => {
  el.innerHTML = makeSVG(ICONS['btn-max'], 1);
});
document.querySelectorAll('.wb-close').forEach(el => {
  el.innerHTML = makeSVG(ICONS['btn-close'], 1);
});

// ── FEEDBACK (Formspree) ──
// Daftar gratis di https://formspree.io → buat form → salin endpoint ke sini
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/GANTI_ENDPOINT_INI';

async function submitFeedback(e) {
  e.preventDefault();
  const name  = el('fb-name').value.trim();
  const email = el('fb-email').value.trim();
  const msg   = el('fb-msg').value.trim();
  if (!name || !msg) return;

  const btn = el('fb-submit');
  btn.textContent = '[ MENGIRIM... ]';
  btn.disabled    = true;
  el('fb-error').style.display = 'none';

  try {
    const res = await fetch(FORMSPREE_ENDPOINT, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body:    JSON.stringify({ name, email, message: msg }),
    });
    if (res.ok) {
      el('fb-name').value  = '';
      el('fb-email').value = '';
      el('fb-msg').value   = '';
      const ok = el('fb-success');
      ok.style.display = 'block';
      setTimeout(() => ok.style.display = 'none', 4000);
    } else {
      el('fb-error').style.display = 'block';
    }
  } catch (_) {
    el('fb-error').style.display = 'block';
  }

  btn.textContent = '[ KIRIM PESAN ]';
  btn.disabled    = false;
}

// ── VIDEO ──
function loadVideo() {
  const raw   = el('vid-url').value.trim();
  const match = raw.match(/(?:v=|youtu\.be\/)([^&?\s]+)/);
  if (!match) { alert('URL YouTube tidak valid'); return; }
  el('vid-frame').src = 'https://www.youtube.com/embed/' + match[1] + '?autoplay=1';
}

// ── THEME ──
function setTheme(t) {
  document.documentElement.dataset.theme = t;
  localStorage.setItem('harys_theme', t);
  ['dark', 'light'].forEach(mode => {
    const opt   = el('opt-'   + mode);
    const radio = el('radio-' + mode);
    const view  = el('view-'  + mode);
    const active = mode === t;
    if (opt)   opt.classList.toggle('active', active);
    if (radio) radio.textContent = active ? '▣' : '□';
    if (view)  view.classList.toggle('check', active);
  });
}
// Terapkan tema tersimpan segera (sebelum render)
(function() {
  const t = localStorage.getItem('harys_theme') || 'dark';
  document.documentElement.dataset.theme = t;
})();

// ── TAP SOUND ──
function playTap(type = 'click') {
  try {
    const ctx  = new (window.AudioContext || window.webkitAudioContext)();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'open') {
      // Buka window: dua nada naik
      osc.type = 'square';
      osc.frequency.setValueAtTime(660, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.06);
      gain.gain.setValueAtTime(0.07, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.14);
    } else if (type === 'close') {
      // Tutup window: nada turun
      osc.type = 'square';
      osc.frequency.setValueAtTime(660, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(330, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.12);
    } else {
      // Klik biasa: tick pendek
      osc.type = 'square';
      osc.frequency.setValueAtTime(1100, ctx.currentTime);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.05);
    }
  } catch (_) {}
}

// ── BOOT SOUND ──
function playBootSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();

    // Arpeggio nada: C5 → E5 → G5 → C6 (startup chime retro)
    const notes = [
      { freq: 523.25, start: 0.00, dur: 0.18 },
      { freq: 659.25, start: 0.14, dur: 0.18 },
      { freq: 783.99, start: 0.28, dur: 0.18 },
      { freq: 1046.5, start: 0.42, dur: 0.55 },
    ];

    notes.forEach(({ freq, start, dur }) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);

      // Envelope: fade in cepat, fade out halus
      gain.gain.setValueAtTime(0, ctx.currentTime + start);
      gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);

      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + dur);
    });
  } catch (_) {}
}

// ── BOOT ──
function startBoot() {
  const preboot = el('preboot');
  const boot    = el('boot');
  const prog    = el('bprog');
  const msg     = el('bmsg');
  const msgs    = ['LOADING KERNEL...', 'MOUNTING FILESYSTEM...', 'STARTING SERVICES...', 'WELCOME.'];

  // Fade out pre-boot, tampilkan boot screen
  preboot.classList.add('out');
  setTimeout(() => {
    preboot.style.display = 'none';
    boot.style.display = 'flex';
  }, 500);

  playBootSound();

  let i = 0;
  prog.style.width = '8%';
  const iv = setInterval(() => {
    i++;
    if (i < msgs.length) {
      msg.textContent = msgs[i];
      prog.style.width = ((i + 1) / msgs.length * 100) + '%';
    }
    if (i >= msgs.length - 1) {
      clearInterval(iv);
      setTimeout(() => {
        boot.classList.add('out');
        setTimeout(() => {
          boot.style.display = 'none';
          setTheme(localStorage.getItem('harys_theme') || 'dark');
          if (isMobile()) {
            openWin('about');
            openWin('projects');
            openWin('contact');
          } else {
            openWin('about');
          }
        }, 700);
      }, 350);
    }
  }, 520);
}

window.addEventListener('load', () => {
  el('preboot').addEventListener('click', startBoot, { once: true });
});
