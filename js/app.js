/* ACTIVE by Eurostars · MVP web-app
   Cuentas y progreso en Supabase · Stella (IA) vía función segura · reservas y pagos simulados */
(function () {
  'use strict';

  var D = window.ACTIVE_DATA;
  var I18N = window.ACTIVE_I18N;
  var CFG = window.ACTIVE_CONFIG;
  var LANG_KEY = 'active-mvp-lang';
  var REMEMBER_KEY = 'active-remember';
  var view = document.getElementById('view');
  var tabbar = document.getElementById('tabbar');
  var overlay = document.getElementById('overlay');
  var toastEl = document.getElementById('toast');

  /* ---------- Almacenamiento seguro (puede fallar en modo privado) ---------- */
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function lsDel(k) { try { localStorage.removeItem(k); } catch (e) {} }
  function ssGet(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function ssSet(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }
  function ssDel(k) { try { sessionStorage.removeItem(k); } catch (e) {} }

  /* «Recordarme»: la sesión vive en localStorage (persistente) o en sessionStorage (se borra al cerrar la app) */
  function remember() { return lsGet(REMEMBER_KEY) !== '0'; }
  function setRemember(on) { lsSet(REMEMBER_KEY, on ? '1' : '0'); }
  var authStorage = {
    getItem: function (k) { return lsGet(k) || ssGet(k); },
    setItem: function (k, v) { if (remember()) { lsSet(k, v); ssDel(k); } else { ssSet(k, v); lsDel(k); } },
    removeItem: function (k) { lsDel(k); ssDel(k); }
  };
  var sb = window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseKey, {
    auth: { storage: authStorage, persistSession: true, autoRefreshToken: true, detectSessionInUrl: false, storageKey: 'active-auth' }
  });

  /* ---------- Estado ---------- */
  var booted = false;
  var state = emptyState();
  var ui = { city: 'all', sport: 'all', commCity: 'all', commTab: 'meetups', form: null, regSport: 'run', authTab: 'register', showPw: false, authBusy: false, authErr: '', chatBusy: false };
  var chat = [];

  function emptyState() { return { user: null, stamps: [], bookings: [], joined: [] }; }
  function cacheKey() { return 'active-cache-' + (state.user ? state.user.id : ''); }
  var saveTimer;
  function save() {
    if (!state.user) return;
    lsSet(cacheKey(), JSON.stringify(state));
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      sb.from('profiles').update({
        display_name: state.user.name, sport: state.user.sport, updated_at: new Date().toISOString(),
        state: { stamps: state.stamps, bookings: state.bookings, joined: state.joined, since: state.user.since }
      }).eq('id', state.user.id).then(function (r) { if (r.error) console.warn('sync', r.error.message); });
    }, 500);
  }

  async function loadProfile(authUser) {
    var r = await sb.from('profiles').select('username, display_name, sport, state, is_admin, created_at').eq('id', authUser.id).maybeSingle();
    if (r.data) {
      var st = r.data.state || {};
      state = {
        user: { id: authUser.id, username: r.data.username, name: r.data.display_name, sport: r.data.sport, isAdmin: !!r.data.is_admin, since: st.since || (r.data.created_at || '').slice(0, 10) },
        stamps: st.stamps || [], bookings: st.bookings || [], joined: st.joined || []
      };
      lsSet(cacheKey(), JSON.stringify(state));
    } else {
      // Sin conexión: usamos la última copia local
      var cached = null; try { cached = JSON.parse(lsGet('active-cache-' + authUser.id)); } catch (e) {}
      state = cached && cached.user ? cached : emptyState();
    }
    try { chat = JSON.parse(lsGet('active-chat-' + authUser.id)) || []; } catch (e) { chat = []; }
  }
  function saveChat() { if (state.user) lsSet('active-chat-' + state.user.id, JSON.stringify(chat.slice(-40))); }

  function getLang() {
    var l = lsGet(LANG_KEY);
    if (l === 'es' || l === 'en') return l;
    return (navigator.language || 'es').slice(0, 2) === 'en' ? 'en' : 'es';
  }
  var lang = getLang();
  function setLang(l) { lang = l; lsSet(LANG_KEY, l); document.documentElement.lang = l; if (route().name === 'welcome') keepForm(); else rerenderKeepScroll(); }

  /* ---------- Utilidades ---------- */
  function t(k, vars) {
    var s = (I18N[lang] && I18N[lang][k]) || I18N.es[k] || k;
    if (vars) Object.keys(vars).forEach(function (v) { s = s.split('{' + v + '}').join(vars[v]); });
    return s;
  }
  function L(o) { return o == null ? '' : (typeof o === 'string' ? o : (o[lang] || o.es)); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function city(id) { return D.cities.filter(function (c) { return c.id === id; })[0]; }
  function act(id) { return D.activities.filter(function (a) { return a.id === id; })[0]; }
  function partner(id) { return D.partners.filter(function (p) { return p.id === id; })[0]; }
  function booking(id) { return state.bookings.filter(function (b) { return b.id === id; })[0]; }
  function money(n) { return n.toLocaleString(lang === 'en' ? 'en-GB' : 'es-ES') + ' €'; }
  function fmtDate(iso, opts) {
    var d = new Date(iso + 'T12:00:00');
    if (isNaN(d)) return '';
    return d.toLocaleDateString(lang === 'en' ? 'en-GB' : 'es-ES', opts || { weekday: 'short', day: 'numeric', month: 'short' });
  }
  function addDays(iso, n) { var d = new Date(iso + 'T12:00:00'); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); }
  function nextFriday() { var d = new Date(); var add = (5 - d.getDay() + 7) % 7 || 7; d.setDate(d.getDate() + add); return d.toISOString().slice(0, 10); }
  function hash(str) { var h = 2166136261; for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function stampSport(a) { return a.type === 'event' ? 'event' : a.sport; }
  function sportLabel(s) { return s === 'padel' ? t('sport_padel') : s === 'event' ? t('filter_event') : s === 'gym' ? t('sport_gym') : t('sport_run'); }
  function initials(n) { return (n || '?').trim().split(/\s+/).map(function (p) { return p[0]; }).join('').slice(0, 2).toUpperCase(); }
  function code() { var c = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', s = 'AE-'; for (var i = 0; i < 5; i++) s += c[Math.floor(Math.random() * c.length)]; return s; }
  function emailFor(u) { return u + '@' + CFG.userDomain; }

  /* ---------- Estatus ---------- */
  function stats() {
    var cities = {}; state.stamps.forEach(function (s) { cities[s.city] = 1; });
    return { count: state.stamps.length, cities: Object.keys(cities).length, cityList: Object.keys(cities) };
  }
  function levelIndex(st) {
    st = st || stats(); var idx = 0;
    D.levels.forEach(function (lv, i) { if (!lv.invite && st.count >= lv.min && st.cities >= lv.cities) idx = i; });
    return idx;
  }
  function level() { return D.levels[levelIndex()]; }

  /* ---------- Iconos (trazo 2px, estilo manual de marca) ---------- */
  var IC = {
    run: '<circle cx="15" cy="4.5" r="2"/><path d="M7 21l3.5-5.5 3 2.5V22"/><path d="M5 11.5l3.5-3.5 4.5.5 2.5 3.5 3.5 1"/><path d="M10.5 15.5L13 9"/>',
    padel: '<ellipse cx="10" cy="9" rx="6" ry="6.5"/><path d="M13.8 14l5.7 7"/><circle cx="19" cy="4.5" r="1.6"/><path d="M8 7h.01M12 7h.01M10 10h.01M8 12h.01M12 12h.01"/>',
    gym: '<path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11"/>',
    event: '<path d="M6 21V4"/><path d="M6 4h11l-2.5 4L17 12H6"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
    ticket: '<path d="M3 8a2 2 0 002-2h14a2 2 0 002 2v2a2 2 0 000 4v2a2 2 0 00-2 2H5a2 2 0 00-2-2v-2a2 2 0 000-4z"/><path d="M14 6v12" stroke-dasharray="2 2"/>',
    passport: '<rect x="5" y="3" width="14" height="18" rx="2"/><circle cx="12" cy="10" r="3"/><path d="M9 16h6"/>',
    users: '<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.2c2.8.4 5 2.8 5 5.8"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/>',
    back: '<path d="M15 5l-7 7 7 7"/>',
    chev: '<path d="M9 5l7 7-7 7"/>',
    pin: '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0119 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>',
    star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
    bed: '<path d="M3 19V6M3 15h18v4M21 15v-3a3 3 0 00-3-3h-7v6"/><circle cx="7" cy="11.5" r="1.8"/>',
    gauge: '<path d="M4 18a8 8 0 1116 0"/><path d="M12 18l4-6"/>',
    route: '<circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="6" r="2.5"/><path d="M8.5 18H15a3 3 0 000-6H9a3 3 0 010-6h6.5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/>',
    qr: '<rect x="4" y="4" width="6" height="6"/><rect x="14" y="4" width="6" height="6"/><rect x="4" y="14" width="6" height="6"/><path d="M14 14h2v2h-2zM18 18h2v2h-2zM14 18h2M18 14h2"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    shield: '<path d="M12 3l7 3v6c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6z"/><path d="M9 12l2 2 4-4"/>',
    coffee: '<path d="M4 9h13v5a5 5 0 01-5 5H9a5 5 0 01-5-5z"/><path d="M17 11h1.5a2.5 2.5 0 010 5H17M8 3v3M12 3v3"/>',
    refresh: '<path d="M20 11a8 8 0 10-2.3 5.7"/><path d="M20 4v7h-7"/>',
    phone: '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>',
    send: '<path d="M4 12l16-8-6 16-2.5-6.5z"/><path d="M11.5 13.5L20 4"/>',
    ext: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5"/>',
    logout: '<path d="M15 4h4a1 1 0 011 1v14a1 1 0 01-1 1h-4"/><path d="M10 16l-4-4 4-4M6 12h10"/>',
    upload: '<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3"/>',
    bulb: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 00-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0012 3z"/>',
    gift: '<rect x="3" y="8" width="18" height="5" rx="1"/><path d="M5 13v8h14v-8M12 8v13"/><path d="M12 8c-2-3-6-3-6-.5S9.5 8 12 8zM12 8c2-3 6-3 6-.5S14.5 8 12 8z"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.01"/>',
    download: '<path d="M12 4v12M7 11l5 5 5-5"/><path d="M4 18v2h16v-2"/>'
  };
  function icon(n, cls) { return '<svg class="ic ' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (IC[n] || '') + '</svg>'; }
  function sportIcon(s, cls) { return icon(IC[s] ? s : 'run', cls); }

  /* Isotipo oficial ACTIVE (vectorizado del logotipo final) */
  var LOGO_PATH = 'M18.27 85.32 18.21 85.38 18.07 85.35 18.06 85.17 19.61 82.41 19.75 81.97 20.48 80.66 21.90 77.75 22.65 75.86 23.21 74.25 23.48 73.38 23.95 71.49 24.19 70.18 24.30 69.16 24.36 69.01 24.44 67.56 24.40 65.95 24.21 64.50 23.92 63.33 23.66 62.61 23.16 61.60 22.79 61.00 22.29 60.35 21.42 59.49 20.40 58.76 19.52 58.30 18.50 57.92 17.49 57.65 16.17 57.45 13.85 57.44 12.24 57.63 10.79 57.92 9.19 58.35 6.86 59.31 4.67 60.03 3.94 60.19 3.70 59.98 3.73 59.84 3.94 59.63 5.69 59.16 7.58 58.44 10.63 57.07 14.43 55.08 18.65 52.61 23.02 49.83 27.10 47.06 31.17 44.15 36.56 40.07 39.33 37.82 39.47 37.74 42.82 34.90 42.97 34.83 45.01 33.01 45.15 32.94 48.79 29.62 50.68 27.77 50.83 27.70 53.05 25.48 53.27 25.18 55.24 23.15 57.86 20.09 59.17 18.34 59.75 17.47 60.59 16.01 61.10 14.85 61.22 14.70 61.46 14.62 61.70 14.85 61.69 14.99 61.12 16.30 60.68 17.76 60.47 19.21 60.47 20.67 60.70 22.27 61.28 24.02 61.69 24.89 62.28 25.91 63.61 27.66 64.95 29.01 65.83 29.73 66.99 30.61 67.87 31.19 68.89 31.79 70.63 32.66 72.38 33.39 74.42 34.10 77.04 34.82 78.35 35.11 79.95 35.41 80.83 35.49 80.97 35.55 83.01 35.78 84.47 35.89 85.19 35.89 85.34 35.93 88.83 35.93 92.04 35.70 92.18 35.64 94.22 35.41 95.97 35.08 96.25 35.23 96.30 35.38 96.11 35.59 94.66 35.89 93.64 36.03 91.89 36.47 89.71 37.07 86.07 38.24 82.57 39.55 79.81 40.71 77.04 41.99 72.96 44.06 70.63 45.37 68.45 46.68 64.23 49.46 60.29 52.38 57.82 54.42 56.65 55.43 55.20 56.82 55.05 56.89 52.25 59.69 52.18 59.84 50.79 61.29 50.72 61.44 49.92 62.31 49.85 62.46 48.86 63.62 47.44 65.52 46.43 66.97 44.81 69.59 43.54 72.07 42.62 74.25 41.77 76.88 41.39 78.62 41.22 78.76 41.10 78.62 41.46 76.88 42.87 72.36 43.45 70.32 43.91 68.58 44.48 66.10 45.03 63.19 45.22 61.15 45.27 59.98 45.22 58.82 45.08 57.65 44.78 56.64 44.57 56.21 44.28 55.80 43.99 55.51 43.70 55.32 43.11 55.15 42.68 55.15 41.84 55.32 41.51 55.42 40.80 55.76 39.62 56.45 38.45 57.33 37.43 58.20 35.07 60.57 32.56 63.48 29.52 67.41 27.35 70.47 25.31 73.53 23.55 76.29 21.08 80.37 20.74 81.10 20.25 81.96 19.82 82.57ZM43.84 46.04 49.81 44.58 50.83 44.32 50.91 44.26 51.04 43.82 51.69 39.60 51.56 39.54 43.55 45.82 43.33 46.01 43.40 46.14Z';
  function isotype(cls) {
    return '<svg class="' + (cls || 'iso') + '" viewBox="0 0 100 100" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="' + LOGO_PATH + '"/></svg>';
  }
  function lockup(small) {
    return '<div class="lockup' + (small ? ' sm' : '') + '">' + isotype('iso') + '<div class="lockup-txt"><b>ACTIVE</b><span>BY EUROSTARS</span></div></div>';
  }

  /* QR simulado (determinista a partir del localizador) */
  function qrMatrix(seed) {
    var n = 25, h = hash(seed), cells = [];
    function rnd() { h ^= h << 13; h >>>= 0; h ^= h >>> 17; h ^= h << 5; h >>>= 0; return h / 4294967296; }
    function finder(x, y) { return x < 7 && y < 7 || x >= n - 7 && y < 7 || x < 7 && y >= n - 7; }
    function finderOn(x, y) {
      var ox = x >= n - 7 ? n - 7 : 0, oy = y >= n - 7 ? n - 7 : 0, a = x - ox, b = y - oy;
      return a === 0 || a === 6 || b === 0 || b === 6 || (a >= 2 && a <= 4 && b >= 2 && b <= 4);
    }
    for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) {
      var on = finder(x, y) ? finderOn(x, y) : (x === 7 || y === 7 || (x === n - 8 && y < 8) || (y === n - 8 && x < 8)) ? false : rnd() > 0.5;
      if (on) cells.push([x, y]);
    }
    return { n: n, cells: cells };
  }
  function qrSvg(seed) {
    var q = qrMatrix(seed), n = q.n;
    var d = q.cells.map(function (c) { return 'M' + c[0] + ' ' + c[1] + 'h1v1h-1z'; }).join('');
    return '<svg class="qr" viewBox="-2 -2 ' + (n + 4) + ' ' + (n + 4) + '" shape-rendering="crispEdges"><rect x="-2" y="-2" width="' + (n + 4) + '" height="' + (n + 4) + '" fill="#fff"/><path d="' + d + '" fill="#3D0B18"/></svg>';
  }

  /* Sello circular de ciudad */
  var stampSeq = 0;
  function stampSvg(cityId, sport, date, opts) {
    opts = opts || {};
    var c = city(cityId), id = 'sp' + (stampSeq++), rot = opts.flat ? 0 : (hash(cityId + sport) % 24) - 12;
    var name = L(c.name).toUpperCase(), year = date ? date.slice(0, 4) : '2026';
    return '<svg class="stamp ' + (opts.cls || '') + '" viewBox="0 0 120 120" style="transform:rotate(' + rot + 'deg)">' +
      '<defs><path id="' + id + 't" d="M20 60a40 40 0 0180 0"/><path id="' + id + 'b" d="M16 60a44 44 0 0088 0"/></defs>' +
      '<g fill="none" stroke="currentColor"><circle cx="60" cy="60" r="56" stroke-width="3"/><circle cx="60" cy="60" r="50" stroke-width="1.2"/><circle cx="60" cy="60" r="27" stroke-width="1.2"/></g>' +
      '<text font-family="Oswald, sans-serif" font-weight="700" font-size="13" letter-spacing="2.4" fill="currentColor" text-anchor="middle"><textPath href="#' + id + 't" startOffset="50%">' + esc(name) + '</textPath></text>' +
      '<text font-family="Inter, sans-serif" font-weight="600" font-size="8.5" letter-spacing="1.6" fill="currentColor" text-anchor="middle"><textPath href="#' + id + 'b" startOffset="50%">' + esc(sportLabel(sport).toUpperCase() + ' · ' + year) + '</textPath></text>' +
      '<g transform="translate(46 46) scale(1.17)" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + (IC[sport] || IC.run) + '</g>' +
      '<text x="9" y="64" font-size="9" fill="currentColor" font-family="Inter">★</text><text x="103" y="64" font-size="9" fill="currentColor" font-family="Inter">★</text>' +
      '</svg>';
  }

  /* ---------- Router ---------- */
  function route() {
    var h = (location.hash || '').replace(/^#\/?/, '');
    var parts = h.split('/');
    return { name: parts[0] || '', arg: parts[1] ? decodeURIComponent(parts[1]) : null };
  }
  function go(path) { if (location.hash === '#/' + path) render(); else location.hash = '#/' + path; }

  var DARK = { welcome: 1, trips: 1, trip: 1, passport: 1, confirmed: 1 };
  var TABS = [
    { id: 'explore', icon: 'compass', label: 'tab_explore' },
    { id: 'trips', icon: 'ticket', label: 'tab_trips' },
    { id: 'passport', icon: 'passport', label: 'tab_passport' },
    { id: 'community', icon: 'users', label: 'tab_community' },
    { id: 'profile', icon: 'user', label: 'tab_profile' }
  ];
  var AFTER = {};

  function render() {
    if (!booted) { view.innerHTML = '<div class="splash">' + isotype('splash-iso') + '</div>'; document.body.classList.add('dark'); return; }
    var r = route();
    if (!state.user && r.name !== 'welcome') { location.replace('#/welcome'); return; }
    if (state.user && (r.name === '' || r.name === 'welcome')) { location.replace('#/explore'); return; }
    var views = { welcome: vWelcome, explore: vExplore, activity: vActivity, book: vBook, confirmed: vConfirmed, trips: vTrips, trip: vTrip, passport: vPassport, community: vCommunity, profile: vProfile, stella: vStella };
    var fn = views[r.name] || vExplore;
    var dark = !!DARK[r.name];
    document.body.classList.toggle('dark', dark);
    document.body.classList.toggle('chat-mode', r.name === 'stella');
    var meta = document.querySelector('meta[name=theme-color]'); if (meta) meta.setAttribute('content', dark ? '#591225' : '#FFFFFF');
    stampSeq = 0;
    view.innerHTML = fn(r.arg);
    view.className = 'view view-' + (r.name || 'explore');
    var isTab = TABS.some(function (x) { return x.id === r.name; });
    renderTabs(isTab ? r.name : null);
    window.scrollTo(0, 0);
    if (AFTER[r.name]) AFTER[r.name](r.arg);
  }

  var fab;
  function renderTabs(active) {
    if (!fab) { fab = document.createElement('button'); fab.className = 'fab'; fab.setAttribute('data-action', 'go'); fab.setAttribute('data-href', 'stella'); fab.setAttribute('aria-label', 'Stella'); document.getElementById('app').appendChild(fab); }
    fab.innerHTML = isotype('fab-iso') + '<span>Stella</span>';
    fab.hidden = !active;
    if (!active) { tabbar.hidden = true; document.body.classList.remove('has-tabs'); return; }
    tabbar.hidden = false; document.body.classList.add('has-tabs');
    var pending = state.bookings.filter(function (b) { return b.status === 'upcoming'; }).length;
    tabbar.innerHTML = TABS.map(function (x) {
      return '<button class="tab' + (x.id === active ? ' on' : '') + '" data-action="go" data-href="' + x.id + '">' + icon(x.icon) +
        (x.id === 'trips' && pending ? '<i class="badge">' + pending + '</i>' : '') + '<span>' + t(x.label) + '</span></button>';
    }).join('');
  }

  /* ---------- Vistas ---------- */
  function langSwitch() {
    return '<div class="seg seg-sm" role="group">' + ['es', 'en'].map(function (l) {
      return '<button type="button" class="' + (lang === l ? 'on' : '') + '" data-action="lang" data-v="' + l + '">' + l.toUpperCase() + '</button>';
    }).join('') + '</div>';
  }

  function vWelcome() {
    var reg = ui.authTab === 'register';
    return '<section class="welcome">' +
      '<div class="welcome-photo" style="background-image:url(img/run9.jpg)"></div>' +
      '<div class="welcome-top">' + lockup() + langSwitch() + '</div>' +
      '<div class="welcome-body">' +
        '<p class="eyebrow">' + t('tagline') + '</p>' +
        '<h1 class="display">' + t('welcome_title') + '</h1>' +
        '<p class="lead">' + t('welcome_sub') + '</p>' +
        '<div class="seg seg-full auth-tabs">' +
          '<button type="button" class="' + (reg ? 'on' : '') + '" data-action="auth-tab" data-v="register">' + t('tab_register') + '</button>' +
          '<button type="button" class="' + (!reg ? 'on' : '') + '" data-action="auth-tab" data-v="login">' + t('tab_login') + '</button></div>' +
        '<form id="auth-form" novalidate>' +
          (reg ? '<label class="field"><span>' + t('your_name') + '</span><input id="f-name" type="text" autocomplete="given-name" placeholder="' + t('name_ph') + '" maxlength="24"></label>' : '') +
          '<label class="field"><span>' + t('username') + '</span><input id="f-user" type="text" autocomplete="username" autocapitalize="none" autocorrect="off" spellcheck="false" placeholder="' + t('username_ph') + '" maxlength="20">' +
            (reg ? '<small class="hint-light">' + t('username_hint') + '</small>' : '') + '</label>' +
          '<label class="field"><span>' + t('password') + '</span><div class="pw"><input id="f-pass" type="' + (ui.showPw ? 'text' : 'password') + '" autocomplete="' + (reg ? 'new-password' : 'current-password') + '" placeholder="' + t('password_ph') + '" maxlength="72">' +
            '<button type="button" class="pw-toggle" data-action="toggle-pw">' + (ui.showPw ? t('hide') : t('show')) + '</button></div></label>' +
          (reg ? '<div class="field"><span>' + t('fav_sport') + '</span><div class="seg seg-full">' +
            ['run', 'padel', 'both'].map(function (s) { return '<button type="button" class="' + (ui.regSport === s ? 'on' : '') + '" data-action="reg-sport" data-v="' + s + '">' + t('sport_' + s) + '</button>'; }).join('') +
          '</div></div>' : '') +
          '<label class="check"><input type="checkbox" id="f-remember"' + (remember() ? ' checked' : '') + '><i>' + icon('check') + '</i><span>' + t('remember_me') + '</span></label>' +
          (ui.authErr ? '<p class="form-err" role="alert">' + esc(ui.authErr) + '</p>' : '') +
          '<button type="submit" class="btn btn-light btn-block"' + (ui.authBusy ? ' disabled' : '') + '>' + (ui.authBusy ? '<span class="spinner sm"></span>' : '') + (reg ? t('create_account') : t('sign_in')) + (ui.authBusy ? '' : icon('chev')) + '</button>' +
          (reg ? '<p class="fine">' + icon('shield') + t('no_email_needed') + '</p>' : '') +
        '</form>' +
        '<button type="button" class="btn-link" data-action="demo"' + (ui.authBusy ? ' disabled' : '') + '>' + t('try_demo') + '</button>' +
      '</div></section>';
  }

  function topbar() {
    var lv = level();
    return '<header class="topbar">' + lockup(true) +
      '<button class="lvl-chip" data-action="go" data-href="passport">' + isotype('iso-xs') + lv.name + '</button></header>';
  }

  function nextBookingCard() {
    var b = state.bookings.filter(function (x) { return x.status === 'upcoming'; })[0];
    if (!b) return '';
    var a = act(b.activity), c = city(b.city);
    if (!a || !c) return '';
    return '<button class="next-card" data-action="go" data-href="trip/' + b.id + '">' +
      '<div class="next-ic">' + sportIcon(a.sport) + '</div>' +
      '<div class="next-txt"><small>' + t('your_next') + '</small><b>' + esc(L(a.title)) + '</b><span>' + esc(L(c.name)) + ' · ' + fmtDate(addDays(b.checkIn, 1)) + '</span></div>' +
      icon('qr', 'next-qr') + '</button>';
  }

  function tagFor(a) { var s = stampSport(a); return '<span class="tag">' + sportIcon(s) + sportLabel(s) + '</span>'; }

  function activityCard(a) {
    var c = city(a.city), left = a.spots - a.taken;
    return '<button class="act-card" data-action="go" data-href="activity/' + a.id + '">' +
      '<div class="act-img" style="background-image:url(' + a.img + ')">' + tagFor(a) +
      (c.pilot ? '<span class="tag tag-pilot">' + t('pilot') + '</span>' : '') + '</div>' +
      '<div class="act-body"><h3>' + esc(L(a.title)) + '</h3>' +
      '<p class="muted">' + icon('pin') + esc(L(c.name)) + ' · ' + esc(a.partner) + '</p>' +
      '<div class="act-meta"><span>' + icon('clock') + esc(L(a.when)) + '</span><span class="price">' + (a.price ? money(a.price) : t('included')) + '</span></div>' +
      '<div class="spots"><i style="width:' + Math.round(a.taken / a.spots * 100) + '%"></i></div><small class="muted">' + left + ' ' + t('spots_left') + '</small>' +
      '</div></button>';
  }
  function miniAct(a) {
    var c = city(a.city);
    return '<button class="mini-act" data-action="go" data-href="activity/' + a.id + '"><div class="thumb" style="background-image:url(' + a.img + ')"></div>' +
      '<div><b>' + esc(L(a.title)) + '</b><span>' + esc(L(c.name)) + ' · ' + esc(L(a.when)) + '</span></div>' + icon('chev') + '</button>';
  }

  function vExplore() {
    var list = D.activities.filter(function (a) {
      if (ui.city !== 'all' && a.city !== ui.city) return false;
      if (ui.sport === 'event') return a.type === 'event';
      if (ui.sport !== 'all') return a.sport === ui.sport && a.type !== 'event';
      return true;
    });
    list.sort(function (a, b) { return (city(b.city).pilot ? 1 : 0) - (city(a.city).pilot ? 1 : 0); });
    var c = ui.city !== 'all' ? city(ui.city) : null;
    return topbar() +
      '<section class="pad">' +
        '<p class="hello">' + t('hello') + ', ' + esc(state.user.name) + '</p>' +
        '<h1 class="display dark-ink">' + t('explore_title') + '</h1>' +
        nextBookingCard() +
      '</section>' +
      '<div class="chips" role="tablist">' +
        '<button class="chip' + (ui.city === 'all' ? ' on' : '') + '" data-action="city" data-v="all">' + icon('globe') + t('all') + '</button>' +
        D.cities.map(function (x) { return '<button class="chip' + (ui.city === x.id ? ' on' : '') + '" data-action="city" data-v="' + x.id + '">' + esc(L(x.name)) + (x.pilot ? '<i class="dot"></i>' : '') + '</button>'; }).join('') +
      '</div>' +
      (c ? '<section class="pad"><div class="city-hero" style="background-image:url(' + c.img + ')"><div>' +
        (c.pilot ? '<span class="tag tag-pilot">' + t('pilot') + '</span>' : '') +
        '<h2>' + esc(L(c.name)) + '</h2><p>' + icon('bed') + esc(c.hotel) + ' ' + '★'.repeat(c.stars) + '</p>' +
        '<p class="small">' + t('from_night') + ' <b>' + money(c.price) + '</b> / ' + t('night') + '</p></div></div></section>' : '') +
      '<section class="pad">' +
        '<div class="seg seg-full seg-light seg-scroll">' + ['all', 'run', 'padel', 'gym', 'event'].map(function (s) {
          return '<button class="' + (ui.sport === s ? 'on' : '') + '" data-action="sport" data-v="' + s + '">' + t('filter_' + s) + '</button>'; }).join('') + '</div>' +
        '<div class="act-list">' + (list.length ? list.map(activityCard).join('') : '<p class="empty">' + t('no_results') + '</p>') + '</div>' +
      '</section>';
  }

  function vActivity(id) {
    var a = act(id); if (!a) return vExplore();
    var c = city(a.city), p = a.partnerId ? partner(a.partnerId) : null;
    return '<section class="detail">' +
      '<div class="hero" style="background-image:url(' + a.img + ')">' +
        '<button class="icon-btn" data-action="back" aria-label="' + t('back') + '">' + icon('back') + '</button>' +
        '<div class="hero-txt">' + tagFor(a) +
        '<h1 class="display">' + esc(L(a.title)) + '</h1><p>' + icon('pin') + esc(L(c.name)) + ' · ' + esc(c.hotel) + '</p></div>' +
      '</div>' +
      '<div class="pad">' +
        '<div class="info-grid">' +
          info('users', t('partner'), a.partner) + info('route', t('distance'), L(a.distance)) +
          info('clock', t('when'), L(a.when)) + info('gauge', t('level'), L(a.level)) +
        '</div>' +
        (p ? '<button class="partner-strip" data-action="partner" data-id="' + p.id + '"><img src="' + p.logo + '" alt="' + esc(p.name) + '"><span>' + esc(L(p.tagline)) + '</span>' + icon('chev') + '</button>' : '') +
        '<p class="body-text">' + esc(L(a.desc)) + '</p>' +
        '<div class="card"><div class="row-ic">' + icon('pin') + '<div><small class="muted">' + t('meeting_point') + '</small><b>' + esc(L(a.meet)) + '</b></div></div></div>' +
        '<h3 class="h-sec">' + t('whats_included') + '</h3>' +
        '<ul class="checks">' + ['inc_1', 'inc_2', 'inc_3', 'inc_4'].map(function (k) { return '<li>' + icon('check') + t(k) + '</li>'; }).join('') + '</ul>' +
        '<div class="stamp-preview">' + stampSvg(a.city, stampSport(a), null, { cls: 'stamp-ink' }) + '<div><small class="muted">' + t('stamp_preview') + '</small><b>' + t('stamp_of') + ' ' + esc(L(c.name)) + '</b><span class="muted">Sport Passport</span></div></div>' +
      '</div>' +
      '<div class="sticky-cta"><div><small class="muted">' + t('from_night') + '</small><b>' + money(c.price) + '</b><small class="muted"> / ' + t('night') + ' + ' + (a.price ? money(a.price) : t('included').toLowerCase()) + '</small></div>' +
        '<button class="btn btn-primary" data-action="go" data-href="book/' + a.id + '">' + t('book_cta') + '</button></div>' +
      '</section>';
  }
  function info(ic, label, val) { return '<div class="info">' + icon(ic) + '<small>' + label + '</small><b>' + esc(val) + '</b></div>'; }

  var ROOMS = { classic: 1, superior: 1.2, suite: 1.6 };
  function quote(a, f) {
    var c = city(a.city), night = Math.round(c.price * ROOMS[f.room]);
    var stay = night * f.nights, activity = a.price * f.guests;
    return { night: night, stay: stay, activity: activity, total: stay + activity };
  }

  function vBook(id) {
    var a = act(id); if (!a) return vExplore();
    var c = city(a.city);
    if (!ui.form || ui.form.activity !== id) ui.form = { activity: id, checkIn: nextFriday(), nights: 2, guests: 1, room: 'superior' };
    var f = ui.form, q = quote(a, f);
    return '<header class="subbar"><button class="icon-btn plain" data-action="back">' + icon('back') + '</button><h2>' + t('booking') + '</h2><span class="sm-brand">' + isotype('iso-xs') + '</span></header>' +
      '<section class="pad book">' +
        '<div class="book-head"><div class="thumb" style="background-image:url(' + a.img + ')"></div><div><b>' + esc(L(a.title)) + '</b><span class="muted">' + esc(c.hotel) + '</span><span class="muted">' + esc(L(a.when)) + '</span></div></div>' +
        '<h3 class="h-sec">' + t('step_dates') + '</h3>' +
        '<label class="field light"><span>' + icon('cal') + t('check_in') + '</span><input type="date" id="f-checkin" value="' + f.checkIn + '" min="' + new Date().toISOString().slice(0, 10) + '"></label>' +
        '<div class="steppers">' + stepper('nights', t('n_nights'), f.nights, 1, 7) + stepper('guests', t('guests'), f.guests, 1, 4) + '</div>' +
        '<div class="field light"><span>' + icon('bed') + t('room') + '</span><div class="rooms">' + Object.keys(ROOMS).map(function (r) {
          return '<button class="room' + (f.room === r ? ' on' : '') + '" data-action="room" data-v="' + r + '"><b>' + t('room_' + r) + '</b><small>' + money(Math.round(c.price * ROOMS[r])) + '</small></button>'; }).join('') + '</div></div>' +
        '<div class="card incl"><div class="row-ic">' + sportIcon(a.sport) + '<div><small class="muted">' + t('activity_spot') + '</small><b>' + esc(L(a.title)) + '</b></div></div><span class="ok">' + icon('check') + '</span></div>' +
        '<h3 class="h-sec">' + t('summary') + '</h3>' +
        '<div class="summary">' +
          '<div><span>' + t('stay') + ' · ' + f.nights + ' ' + (f.nights > 1 ? t('nights') : t('night')) + ' · ' + t('room_' + f.room) + '</span><b>' + money(q.stay) + '</b></div>' +
          '<div><span>' + t('activity') + ' × ' + f.guests + '</span><b>' + (q.activity ? money(q.activity) : t('included')) + '</b></div>' +
          '<div class="perk"><span>' + icon('coffee') + t('direct_perk') + '<small>' + t('direct_perk_desc') + '</small></span><b>' + t('included') + '</b></div>' +
          '<div class="total"><span>' + t('total') + '</span><b>' + money(q.total) + '</b></div>' +
          '<small class="muted">' + t('taxes') + '</small>' +
        '</div>' +
        '<p class="secure">' + icon('shield') + t('direct_channel') + '</p>' +
      '</section>' +
      '<div class="sticky-cta"><div><small class="muted">' + t('total') + '</small><b>' + money(q.total) + '</b></div><button class="btn btn-primary" data-action="confirm">' + t('confirm_pay') + '</button></div>';
  }
  function stepper(key, label, val, min, max) {
    return '<div class="stepper"><span>' + label + '</span><div><button data-action="step" data-k="' + key + '" data-d="-1"' + (val <= min ? ' disabled' : '') + '>' + icon('minus') + '</button><b>' + val + '</b><button data-action="step" data-k="' + key + '" data-d="1"' + (val >= max ? ' disabled' : '') + '>' + icon('plus') + '</button></div></div>';
  }

  function vConfirmed(id) {
    var b = booking(id); if (!b) return vTrips();
    var a = act(b.activity), c = city(b.city);
    return '<section class="confirmed pad">' +
      '<div class="big-check">' + icon('check') + '</div>' +
      '<h1 class="display">' + t('booked_title') + '</h1>' +
      '<p class="lead">' + t('booked_sub') + '</p>' +
      '<div class="dcard"><small>' + t('booking_code') + '</small><b class="mono">' + b.id + '</b>' +
        '<div class="dcard-row"><span>' + esc(c.hotel) + '</span><span>' + fmtDate(b.checkIn) + ' → ' + fmtDate(addDays(b.checkIn, b.nights)) + '</span></div>' +
        '<div class="dcard-row"><span>' + esc(L(a.title)) + '</span><span>' + money(b.total) + '</span></div></div>' +
      '<p class="note">' + icon('star') + t('star_traveler') + '</p>' +
      '<button class="btn btn-light btn-block" data-action="go" data-href="trip/' + b.id + '">' + icon('qr') + t('go_pass') + '</button>' +
      '<button class="btn btn-outline-light btn-block" data-action="pdf" data-id="' + b.id + '">' + icon('download') + t('pdf_download') + '</button>' +
      '</section>';
  }

  function vTrips() {
    var up = state.bookings.filter(function (b) { return b.status === 'upcoming' && act(b.activity); });
    var done = state.bookings.filter(function (b) { return b.status === 'completed' && act(b.activity); });
    function item(b) {
      var a = act(b.activity), c = city(b.city);
      return '<button class="trip-item' + (b.status === 'completed' ? ' done' : '') + '" data-action="go" data-href="trip/' + b.id + '">' +
        '<div class="ti-code">' + c.code + '</div><div class="ti-txt"><b>' + esc(L(a.title)) + '</b><span>' + esc(c.hotel) + ' · ' + fmtDate(b.checkIn) + '</span></div>' +
        (b.status === 'completed' ? '<span class="ti-ok">' + icon('check') + '</span>' : icon('chev')) + '</button>';
    }
    return '<header class="dhead pad">' + lockup(true) + '<h1 class="display">' + t('trips_title') + '</h1></header>' +
      '<section class="pad">' +
      (up.length || done.length ? '' : '<div class="empty-dark">' + icon('ticket') + '<p>' + t('no_trips') + '</p><button class="btn btn-light" data-action="go" data-href="explore">' + t('explore_cta') + '</button></div>') +
      (up.length ? '<h3 class="h-sec">' + t('upcoming') + '</h3>' + up.map(item).join('') : '') +
      (done.length ? '<h3 class="h-sec">' + t('completed') + '</h3>' + done.map(item).join('') : '') +
      '</section>';
  }

  function vTrip(id) {
    var b = booking(id); if (!b || !act(b.activity)) return vTrips();
    var a = act(b.activity), c = city(b.city), actDate = addDays(b.checkIn, 1), done = b.status === 'completed';
    var dist = L(a.distance).split(' / ')[0]; if (/^(Día completo|Full day)$/.test(dist)) dist = '24H';
    return '<header class="subbar dark"><button class="icon-btn plain" data-action="go" data-href="trips">' + icon('back') + '</button><h2>' + t('active_pass') + '</h2><span></span></header>' +
      '<section class="pad">' +
      '<article class="pass' + (done ? ' is-done' : '') + '">' +
        '<div class="pass-top">' + lockup(true) + '<span class="pass-lbl">' + t('active_pass') + '</span></div>' +
        '<div class="pass-route"><div><small>' + t('hotel') + '</small><b>' + c.code + '</b><span>' + esc(L(c.name)) + '</span></div>' +
          '<div class="pass-line">' + sportIcon(a.sport) + '</div>' +
          '<div class="r"><small>' + t('activity') + '</small><b>' + esc(dist) + '</b><span>' + sportLabel(a.sport) + '</span></div></div>' +
        '<div class="pass-grid">' +
          '<div><small>' + t('guest') + '</small><b>' + esc(state.user.name) + '</b></div>' +
          '<div><small>' + t('level') + '</small><b>' + level().name + '</b></div>' +
          '<div class="wide"><small>' + t('activity') + '</small><b>' + esc(L(a.title)) + '</b></div>' +
          '<div><small>' + t('date') + '</small><b>' + fmtDate(actDate) + '</b></div>' +
          '<div><small>' + t('when') + '</small><b>' + esc(L(a.when).split('·').pop().trim()) + '</b></div>' +
          '<div class="wide"><small>' + t('meeting_point') + '</small><b>' + esc(L(a.meet)) + '</b></div>' +
        '</div>' +
        '<div class="perf"></div>' +
        '<div class="pass-qr">' + (done ? '<div class="qr-done">' + stampSvg(b.city, stampSport(a), actDate, { cls: 'stamp-ink' }) + '</div>' : qrSvg(b.id)) +
          '<div class="pass-code"><small>' + t('code') + '</small><b class="mono">' + b.id + '</b></div></div>' +
      '</article>' +
      '<button class="btn btn-outline-light btn-block pass-pdf" data-action="pdf" data-id="' + b.id + '">' + icon('download') + t('pdf_download') + '</button>' +
      (done ? '<div class="done-banner">' + icon('check') + '<div><b>' + t('validated') + '</b><span>' + t('stamp_won') + ' · ' + esc(L(c.name)) + '</span></div></div>' + suggestNext(b.city) :
        '<ol class="steps">' +
          '<li class="' + (b.checkedIn ? 'ok' : 'cur') + '"><i>' + (b.checkedIn ? icon('check') : '1') + '</i><div><b>' + t('step1') + '</b><p>' + t('step1_desc') + '</p>' +
            (b.checkedIn ? '<span class="pill">' + t('checked_in') + '</span>' : '<button class="btn btn-light btn-sm" data-action="checkin" data-id="' + b.id + '">' + t('do_checkin') + '</button>') + '</div></li>' +
          '<li class="' + (b.checkedIn ? 'cur' : '') + '"><i>2</i><div><b>' + t('step2') + '</b><p>' + t('step2_desc') + '</p>' +
            '<button class="btn btn-light btn-sm" data-action="validate" data-id="' + b.id + '"' + (b.checkedIn ? '' : ' disabled') + '>' + icon('qr') + t('validate') + '</button>' +
            (b.checkedIn ? '' : '<small class="hint">' + t('need_checkin') + '</small>') + '</div></li>' +
        '</ol>') +
      '</section>';
  }

  function suggestNext(fromCity) {
    var have = {}; state.stamps.forEach(function (s) { have[s.city] = 1; });
    var a = D.activities.filter(function (x) { return !have[x.city] && x.city !== fromCity && x.type === 'tour'; })[0];
    if (!a) return '';
    var c = city(a.city);
    return '<h3 class="h-sec">' + t('next_city') + '</h3><button class="suggest" data-action="go" data-href="activity/' + a.id + '" style="background-image:url(' + a.img + ')"><div><small>' + t('next_city_sub') + '</small><b>' + esc(L(c.name)) + '</b><span>' + esc(L(a.title)) + '</span></div>' + icon('chev') + '</button>';
  }

  function vPassport() {
    var st = stats(), li = levelIndex(st), lv = D.levels[li], nx = D.levels[li + 1];
    var pct, nextTxt;
    if (nx && !nx.invite) {
      pct = Math.min(100, Math.round((st.count - lv.min) / (nx.min - lv.min) * 100));
      var need = nx.min - st.count;
      nextTxt = need > 0 ? need + ' ' + t('activities_done') + ' ' + t('to_next') + ' ' + nx.name : nx.name + ': ' + L(nx.req);
    } else { pct = 100; nextTxt = t('max_level'); }
    var have = {}; state.stamps.forEach(function (s) { have[s.city] = 1; });
    var missing = D.cities.filter(function (c) { return !have[c.id]; });
    return '<header class="dhead pad">' + lockup(true) + '<h1 class="display">' + t('passport_title') + '</h1></header>' +
      '<section class="pad">' +
      '<div class="pp-cover">' + isotype('pp-iso') +
        '<small>' + t('current_level') + '</small><h2 class="lvl-name">' + lv.name + '</h2>' +
        '<p class="pp-name">' + esc(state.user.name) + ' · @' + esc(state.user.username) + ' · ' + t('member_since') + ' ' + fmtDate(state.user.since || new Date().toISOString().slice(0, 10), { month: 'short', year: 'numeric' }) + '</p>' +
        '<div class="track">' + D.levels.map(function (x, i) {
          return '<div class="node' + (i <= li ? ' on' : '') + (i === li ? ' cur' : '') + '"><i>' + (x.invite ? icon('star') : '') + '</i><span>' + x.name + '</span></div>'; }).join('') +
          '<div class="track-fill" style="width:' + (li / (D.levels.length - 1) * 100 + (nx && !nx.invite ? pct / (D.levels.length - 1) : 0)) + '%"></div></div>' +
        '<p class="pp-next">' + esc(nextTxt) + '</p>' +
      '</div>' +
      '<div class="pp-stats"><div><b>' + st.count + '</b><span>' + t('activities_done') + '</span></div><div><b>' + st.count + '</b><span>' + t('stamps') + '</span></div><div><b>' + st.cities + '/' + D.cities.length + '</b><span>' + t('cities_done') + '</span></div></div>' +
      '<h3 class="h-sec">' + t('my_stamps') + '</h3>' +
      '<div class="pp-page"><div class="stamp-grid">' +
        state.stamps.map(function (s) { return '<div class="slot' + (s.fresh ? ' fresh' : '') + '">' + stampSvg(s.city, s.sport, s.date, { cls: 'stamp-ink' }) + '<small>' + fmtDate(s.date, { day: 'numeric', month: 'short', year: '2-digit' }) + '</small></div>'; }).join('') +
        missing.map(function (c) { return '<div class="slot empty"><div class="ghost"><span>' + esc(L(c.name)) + '</span></div><small>' + t('pending_stamp') + '</small></div>'; }).join('') +
      '</div></div>' +
      '<h3 class="h-sec">' + t('levels_perks') + '</h3>' +
      '<div class="levels">' + D.levels.map(function (x, i) {
        var un = i <= li;
        return '<div class="lv' + (un ? ' un' : '') + (i === li ? ' cur' : '') + '"><div class="lv-head"><b>' + x.name + '</b><span>' + esc(L(x.req)) + '</span>' + (un ? '<i class="lv-ok">' + icon('check') + '</i>' : '<i class="lv-lock">' + icon('lock') + '</i>') + '</div>' +
          '<ul>' + L(x.perks).map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ul></div>'; }).join('') + '</div>' +
      '<div class="st-note">' + icon('star') + '<div><b>' + t('st_title') + '</b><p>' + t('st_desc') + '</p></div></div>' +
      '</section>';
  }

  /* --- Comunidad + Partners --- */
  function partnerCard(p) {
    var acts = D.activities.filter(function (a) { return a.partnerId === p.id; });
    return '<article class="partner" id="p-' + p.id + '">' +
      '<div class="partner-logo"><img src="' + p.logo + '" alt="' + esc(p.name) + '"></div>' +
      '<div class="partner-body">' +
        '<small class="eyebrow-ink">' + sportIcon(p.sport) + esc(L(p.tagline)) + '</small>' +
        '<h3>' + esc(p.name) + '</h3><p class="muted">' + esc(L(p.desc)) + '</p>' +
        '<div class="mini-chips">' + p.cities.map(function (c) { return '<span>' + icon('pin') + esc(L(city(c).name)) + '</span>'; }).join('') + '</div>' +
        '<h4>' + t('partner_perks') + '</h4><ul class="checks">' + L(p.perks).map(function (x) { return '<li>' + icon('check') + esc(x) + '</li>'; }).join('') + '</ul>' +
        (acts.length ? '<h4>' + t('partner_acts') + '</h4>' + acts.map(miniAct).join('') : '') +
        '<div class="partner-foot"><a class="btn btn-ghost btn-sm" href="' + p.url + '" target="_blank" rel="noopener">' + t('visit_web') + icon('ext') + '</a><small class="muted">' + t('sample_deal') + '</small></div>' +
      '</div></article>';
  }

  function vCommunity() {
    var segs = '<div class="seg seg-full seg-light comm-seg">' + ['meetups', 'partners'].map(function (s) {
      return '<button class="' + (ui.commTab === s ? 'on' : '') + '" data-action="ctab" data-v="' + s + '">' + t('seg_' + s) + '</button>'; }).join('') + '</div>';
    if (ui.commTab === 'partners') {
      return topbar() + '<section class="pad"><h1 class="display dark-ink">' + t('community_title') + '</h1>' + segs +
        '<h2 class="h-sec">' + t('partners_title') + '</h2><p class="muted">' + t('partners_sub') + '</p>' +
        D.partners.map(partnerCard).join('') + '</section>';
    }
    var list = D.meetups.filter(function (m) { return ui.commCity === 'all' || m.city === ui.commCity; });
    var mine = D.meetups.filter(function (m) { return state.joined.indexOf(m.id) >= 0; });
    var cities = D.cities.filter(function (c) { return D.meetups.some(function (m) { return m.city === c.id; }); });
    var clubs = {}; D.activities.forEach(function (a) { if (!a.partnerId) clubs[a.partner] = a.city; });
    function card(m) {
      var j = state.joined.indexOf(m.id) >= 0, c = city(m.city), n = m.going + (j ? 1 : 0);
      var faces = ['LM', 'JP', 'AC', 'MR', 'SK'].slice(0, Math.min(4, n));
      return '<div class="meet"><div class="meet-ic">' + sportIcon(m.sport) + '</div><div class="meet-body">' +
        '<small class="muted">' + esc(L(c.name)) + ' · ' + esc(L(m.when)) + '</small><b>' + esc(L(m.title)) + '</b><span class="muted">' + esc(m.club) + ' · ' + esc(L(m.from)) + '</span>' +
        '<div class="meet-foot"><div class="faces">' + faces.map(function (f, i) { return '<i style="z-index:' + (5 - i) + '">' + (j && i === 0 ? initials(state.user.name) : f) + '</i>'; }).join('') + '<span>' + n + ' ' + t('going') + '</span></div>' +
        '<button class="btn btn-sm ' + (j ? 'btn-ghost' : 'btn-primary') + '" data-action="join" data-id="' + m.id + '">' + (j ? icon('check') + t('joined') : t('join')) + '</button></div></div></div>';
    }
    return topbar() +
      '<section class="pad"><h1 class="display dark-ink">' + t('community_title') + '</h1>' + segs + '<p class="muted">' + t('community_sub') + '</p>' +
      '<div class="pulse"><i></i><b>' + (38 + state.joined.length) + '</b> ' + t('guests_now') + '</div></section>' +
      '<div class="chips"><button class="chip' + (ui.commCity === 'all' ? ' on' : '') + '" data-action="ccity" data-v="all">' + t('all') + '</button>' +
        cities.map(function (c) { return '<button class="chip' + (ui.commCity === c.id ? ' on' : '') + '" data-action="ccity" data-v="' + c.id + '">' + esc(L(c.name)) + '</button>'; }).join('') + '</div>' +
      '<section class="pad">' +
        (mine.length && ui.commCity === 'all' ? '<h3 class="h-sec">' + t('my_meetups') + '</h3>' + mine.map(card).join('') + '<h3 class="h-sec">' + t('all') + '</h3>' + list.filter(function (m) { return mine.indexOf(m) < 0; }).map(card).join('') : list.map(card).join('')) +
        '<h3 class="h-sec">' + t('clubs') + '</h3><div class="clubs">' +
          D.partners.map(function (p) { return '<button class="club-logo" data-action="partner" data-id="' + p.id + '"><img src="' + p.logo + '" alt="' + esc(p.name) + '"></button>'; }).join('') +
          Object.keys(clubs).map(function (k) { return '<span>' + esc(k) + '<small>' + esc(L(city(clubs[k]).name)) + '</small></span>'; }).join('') + '</div>' +
      '</section>';
  }
  AFTER.community = function () {
    if (!ui.focusPartner) return;
    var el = document.getElementById('p-' + ui.focusPartner); ui.focusPartner = null;
    if (el) { var y = el.getBoundingClientRect().top + window.scrollY - 12; window.scrollTo(0, y); }
  };

  /* --- Perfil: beneficios, Star Traveler, panel del equipo --- */
  function vProfile() {
    var u = state.user, li = levelIndex(), lv = D.levels[li];
    var perks = [];
    D.levels.forEach(function (x, i) { if (i <= li) perks = perks.concat(L(x.perks)); });
    return topbar() +
      '<section class="pad">' +
        '<div class="prof-head"><div class="avatar">' + initials(u.name) + '</div><div><h1 class="display dark-ink">' + esc(u.name) + '</h1><span class="muted">@' + esc(u.username) + '</span><br><span class="lvl-chip static">' + isotype('iso-xs') + lv.name + '</span></div></div>' +
        '<p class="synced">' + icon('shield') + t('synced') + '</p>' +

        '<h3 class="h-sec">' + t('my_benefits') + '</h3>' +
        '<div class="benefits">' +
          '<div class="ben-block"><small>' + icon('star') + t('benefits_level') + ' · ' + lv.name + '</small><ul class="checks">' + perks.map(function (p) { return '<li>' + icon('check') + esc(p) + '</li>'; }).join('') + '</ul></div>' +
          '<div class="ben-block"><small>' + icon('gift') + t('benefits_partners') + '</small>' + D.partners.map(function (p) {
            return '<button class="ben-partner" data-action="partner" data-id="' + p.id + '"><img src="' + p.logo + '" alt="' + esc(p.name) + '"><span>' + esc(L(p.perks)[0]) + '</span>' + icon('chev') + '</button>'; }).join('') + '</div>' +
        '</div>' +
        '<a class="st-card" href="' + CFG.starTravelerUrl + '" target="_blank" rel="noopener">' +
          '<div class="st-top">' + icon('star') + '<b>' + t('st_card_title') + '</b><span>Eurostars Hotel Company</span></div>' +
          '<p>' + t('st_card_desc') + '</p><span class="st-cta">' + t('st_card_cta') + icon('ext') + '</span></a>' +

        '<div class="list">' +
          '<div class="li"><span>' + icon('globe') + t('language') + '</span>' + langSwitch() + '</div>' +
          '<div class="li"><span>' + sportIcon(u.sport === 'padel' ? 'padel' : 'run') + t('sport') + '</span><div class="seg seg-sm">' + ['run', 'padel', 'both'].map(function (s) {
            return '<button class="' + (u.sport === s ? 'on' : '') + '" data-action="usport" data-v="' + s + '">' + t('sport_' + s) + '</button>'; }).join('') + '</div></div>' +
          '<div class="li"><span>' + icon('phone') + t('install_tip') + '</span></div>' +
        '</div>' +

        '<h3 class="h-sec">' + t('progress_tools') + '</h3>' +
        '<div class="list">' +
          '<button class="li li-btn" data-action="demo-data"><span>' + icon('passport') + t('load_demo_data') + '</span>' + icon('chev') + '</button>' +
          '<button class="li li-btn danger" data-action="reset"><span>' + icon('refresh') + t('reset_progress') + '</span>' + icon('chev') + '</button>' +
          '<button class="li li-btn" data-action="logout"><span>' + icon('logout') + t('logout') + '</span>' + icon('chev') + '</button>' +
        '</div>' +

        (u.isAdmin ? '<h3 class="h-sec">' + t('team_panel') + '</h3><div class="admin" id="admin-panel">' +
          '<div class="card"><b>' + icon('upload') + ' ' + t('kb_title') + '</b><p class="muted small" id="kb-meta">' + t('loading') + '</p>' +
          '<label class="btn btn-primary btn-sm upload-btn">' + icon('upload') + '<span id="kb-label">' + t('kb_upload') + '</span><input type="file" id="kb-file" accept="application/pdf" hidden></label></div>' +
          '<div class="card"><b>' + icon('bulb') + ' ' + t('proposals') + '</b><div id="adm-proposals" class="adm-list muted small">' + t('loading') + '</div></div>' +
          '<div class="card"><b>' + icon('users') + ' ' + t('recent_questions') + '</b><div id="adm-chats" class="adm-list muted small">' + t('loading') + '</div></div>' +
        '</div>' : '') +

        '<h3 class="h-sec">' + t('about') + '</h3>' +
        '<div class="about">' + lockup() + '<p>' + t('about_text') + '</p><p><b>' + t('team') + ':</b> Joan Mas · Joel Puche · Luca Bertuzzi · Alex Piquer · Pol Tristany</p><p class="muted small">' + t('credits') + '</p><p class="muted small">Grupo Hotusa · Talent Match · 2026</p></div>' +
      '</section>';
  }

  AFTER.profile = async function () {
    if (!state.user.isAdmin) return;
    try {
      var meta = document.getElementById('kb-meta');
      var ls = await sb.storage.from('knowledge').list('', { search: 'stella.pdf' });
      var f = ls.data && ls.data.filter(function (x) { return x.name === 'stella.pdf'; })[0];
      if (meta) meta.textContent = f ? t('kb_updated') + ': ' + new Date(f.updated_at || f.created_at).toLocaleString(lang === 'en' ? 'en-GB' : 'es-ES') + ' · ' + Math.round(((f.metadata && f.metadata.size) || 0) / 1024) + ' KB' : '—';
      var pr = await sb.from('proposals').select('username, city, sport, idea, created_at').order('created_at', { ascending: false }).limit(15);
      var pe = document.getElementById('adm-proposals');
      if (pe) pe.innerHTML = pr.data && pr.data.length ? pr.data.map(function (p) {
        return '<div class="adm-item"><b>' + esc(p.idea) + '</b><span>@' + esc(p.username || '?') + ' · ' + esc([p.city, p.sport].filter(Boolean).join(' · ')) + ' · ' + new Date(p.created_at).toLocaleDateString() + '</span></div>'; }).join('') : t('no_proposals');
      var ch = await sb.from('chat_log').select('question, created_at').order('created_at', { ascending: false }).limit(10);
      var ce = document.getElementById('adm-chats');
      if (ce) ce.innerHTML = ch.data && ch.data.length ? ch.data.map(function (c) { return '<div class="adm-item"><b>“' + esc(c.question) + '”</b><span>' + new Date(c.created_at).toLocaleString() + '</span></div>'; }).join('') : '—';
    } catch (e) { console.warn(e); }
  };

  /* --- Stella (chat IA) --- */
  function mdLite(s) {
    var acts = [];
    var out = esc(String(s).replace(/`([^`]+)`/g, '$1')).replace(/\[\[act:([a-z0-9-]+)\]\]/g, function (_, id) { if (act(id) && acts.indexOf(id) < 0) acts.push(id); return ''; });
    out = out.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
      .replace(/(https?:\/\/[^\s<)]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>')
      .replace(/([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})/gi, '<a href="mailto:$1">$1</a>');
    var lines = out.split('\n'), html = '', inList = false;
    lines.forEach(function (l) {
      var m = l.match(/^\s*[-•*]\s+(.*)/);
      if (m) { if (!inList) { html += '<ul>'; inList = true; } html += '<li>' + m[1] + '</li>'; }
      else { if (inList) { html += '</ul>'; inList = false; } if (l.trim()) html += '<p>' + l + '</p>'; }
    });
    if (inList) html += '</ul>';
    return { html: html, acts: acts };
  }
  function bubble(m) {
    if (m.role === 'user') return '<div class="msg me"><div class="bub">' + esc(m.text).replace(/\n/g, '<br>') + '</div></div>';
    var r = mdLite(m.text);
    return '<div class="msg bot"><div class="bot-av">' + isotype('iso-xs') + '</div><div class="bub">' + r.html +
      (r.acts.length ? '<div class="bub-acts">' + r.acts.map(function (id) { return miniAct(act(id)); }).join('') + '</div>' : '') +
      (m.proposal ? '<div class="bub-flag">' + icon('bulb') + t('stella_proposal') + '</div>' : '') +
      (m.sources && m.sources.length ? '<div class="bub-src"><small>' + t('stella_sources') + ':</small>' + m.sources.map(function (s) { return '<a href="' + esc(s.uri) + '" target="_blank" rel="noopener">' + esc(s.title || s.uri) + '</a>'; }).join('') + '</div>' : '') +
      '</div></div>';
  }
  function vStella() {
    var hello = { role: 'bot', text: t('stella_hello', { name: state.user.name }) };
    var sugg = ['stella_s1', 'stella_s2', 'stella_s3', 'stella_s5', 'stella_s4'];
    return '<header class="chat-head"><button class="icon-btn plain" data-action="back">' + icon('back') + '</button>' +
      '<div class="chat-id"><div class="bot-av lg">' + isotype('iso-xs') + '<i class="online"></i></div><div><b>Stella</b><small>' + t('stella_sub') + '</small></div></div>' +
      '<button class="icon-btn plain" data-action="chat-clear" aria-label="' + t('stella_clear') + '">' + icon('refresh') + '</button></header>' +
      '<div class="chat-log" id="chat-log">' + bubble(hello) + chat.map(bubble).join('') +
        (ui.chatBusy ? '<div class="msg bot"><div class="bot-av">' + isotype('iso-xs') + '</div><div class="bub typing" aria-label="' + t('stella_typing') + '"><i></i><i></i><i></i></div></div>' : '') +
        '<p class="ai-note">' + icon('info') + t('ai_note') + '</p>' +
      '</div>' +
      '<div class="chat-input">' +
        '<div class="sugg">' + sugg.map(function (k) { return '<button class="chip" data-action="ask" data-q="' + esc(t(k)) + '"' + (ui.chatBusy ? ' disabled' : '') + '>' + esc(t(k)) + '</button>'; }).join('') + '</div>' +
        '<form id="chat-form" class="chat-row"><textarea id="chat-text" rows="1" placeholder="' + t('stella_ph') + '" maxlength="1500"' + (ui.chatBusy ? ' disabled' : '') + '></textarea>' +
        '<button type="submit" class="send"' + (ui.chatBusy ? ' disabled' : '') + ' aria-label="Enviar">' + icon('send') + '</button></form>' +
      '</div>';
  }
  AFTER.stella = function () { var log = document.getElementById('chat-log'); if (log) log.scrollTop = log.scrollHeight; };

  function chatContext() {
    var st = stats();
    return {
      lang: lang, contact: CFG.ownerEmail, name: state.user.name, sport: state.user.sport, level: level().name, count: st.count,
      cities: st.cityList.map(function (c) { return L(city(c).name); }),
      upcoming: state.bookings.filter(function (b) { return b.status === 'upcoming' && act(b.activity); }).map(function (b) { return L(act(b.activity).title) + ' (' + L(city(b.city).name) + ', check-in ' + fmtDate(b.checkIn, { weekday: 'long', day: 'numeric', month: 'long' }) + ', actividad ' + fmtDate(addDays(b.checkIn, 1), { weekday: 'long', day: 'numeric', month: 'long' }) + ')'; })
    };
  }
  async function sendChat(text) {
    text = (text || '').trim();
    if (!text || ui.chatBusy) return;
    chat.push({ role: 'user', text: text }); saveChat();
    ui.chatBusy = true; render();
    var reply;
    try {
      var res = await sb.functions.invoke('stella', { body: { messages: chat.slice(-16).map(function (m) { return { role: m.role === 'user' ? 'user' : 'assistant', text: m.text }; }), context: chatContext() } });
      if (res.error) {
        var body = null; try { body = await res.error.context.json(); } catch (e) {}
        reply = { role: 'bot', text: body && body.error === 'no_key' ? t('stella_nokey', { email: CFG.ownerEmail }) : t('stella_err', { email: CFG.ownerEmail }) };
      } else {
        reply = { role: 'bot', text: res.data.reply, sources: res.data.sources || [], proposal: !!res.data.proposal };
      }
    } catch (e) {
      reply = { role: 'bot', text: t('stella_err', { email: CFG.ownerEmail }) };
    }
    chat.push(reply); saveChat();
    ui.chatBusy = false;
    if (route().name === 'stella') render();
  }

  /* ---------- Overlays ---------- */
  function showOverlay(html, cls) {
    overlay.className = 'overlay ' + (cls || '');
    overlay.innerHTML = '<div class="ov-card">' + html + '</div>';
    overlay.hidden = false;
    requestAnimationFrame(function () { overlay.classList.add('in'); });
  }
  function hideOverlay() { overlay.classList.remove('in'); setTimeout(function () { overlay.hidden = true; overlay.innerHTML = ''; }, 200); }
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg; toastEl.hidden = false; toastEl.classList.add('in');
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { toastEl.classList.remove('in'); setTimeout(function () { toastEl.hidden = true; }, 250); }, 2400);
  }
  function haptic() { if (navigator.vibrate) navigator.vibrate(30); }

  /* ---------- Cuentas ---------- */
  function authError(code) {
    var map = { invalid_username: 'err_invalid_username', weak_password: 'err_weak_password', username_taken: 'err_username_taken', bad_credentials: 'err_bad_credentials', network: 'err_network' };
    return t(map[code] || 'err_generic');
  }
  async function signIn(username, password) {
    var r;
    try { r = await sb.auth.signInWithPassword({ email: emailFor(username), password: password }); }
    catch (e) { throw new Error('network'); }
    if (r.error) throw new Error(/fetch|network/i.test(r.error.message) ? 'network' : 'bad_credentials');
    await loadProfile(r.data.user);
  }
  async function submitAuth() {
    var reg = ui.authTab === 'register';
    var name = reg ? (document.getElementById('f-name').value || '').trim() : '';
    var username = (document.getElementById('f-user').value || '').trim().toLowerCase();
    var password = document.getElementById('f-pass').value || '';
    setRemember(document.getElementById('f-remember').checked);
    if (reg && !name) { ui.authErr = t('name_required'); return keepForm(); }
    if (!/^[a-z0-9_.]{3,20}$/.test(username)) { ui.authErr = authError(reg ? 'invalid_username' : 'bad_credentials'); return keepForm(); }
    if (password.length < 6) { ui.authErr = authError(reg ? 'weak_password' : 'bad_credentials'); return keepForm(); }
    ui.authBusy = true; ui.authErr = ''; keepForm();
    try {
      if (reg) {
        var resp;
        try {
          resp = await fetch(CFG.supabaseUrl + '/functions/v1/signup', {
            method: 'POST', headers: { 'Content-Type': 'application/json', apikey: CFG.supabaseKey },
            body: JSON.stringify({ username: username, password: password, name: name, sport: ui.regSport, state: { since: new Date().toISOString().slice(0, 10) } })
          });
        } catch (e) { throw new Error('network'); }
        var data = await resp.json().catch(function () { return {}; });
        if (!resp.ok) throw new Error(data.error || 'generic');
      }
      await signIn(username, password);
      ui.authBusy = false; ui.showPw = false;
      go('explore');
    } catch (e) {
      ui.authBusy = false; ui.authErr = authError(e.message); keepForm();
    }
  }
  function keepForm() {
    var vals = {}; ['f-name', 'f-user', 'f-pass'].forEach(function (id) { var el = document.getElementById(id); if (el) vals[id] = el.value; });
    var rem = document.getElementById('f-remember'); var remv = rem ? rem.checked : remember();
    var y = window.scrollY;
    render();
    Object.keys(vals).forEach(function (id) { var el = document.getElementById(id); if (el) el.value = vals[id]; });
    var r2 = document.getElementById('f-remember'); if (r2) r2.checked = remv;
    window.scrollTo(0, y);
  }
  async function demoLogin() {
    var rem = document.getElementById('f-remember'); if (rem) setRemember(rem.checked);
    ui.authBusy = true; ui.authErr = ''; keepForm();
    try {
      await signIn(CFG.demoUser.username, CFG.demoUser.password);
      applyDemoData();
      ui.authBusy = false; ui.city = 'all'; ui.sport = 'all';
      go('explore');
    } catch (e) { ui.authBusy = false; ui.authErr = authError(e.message === 'bad_credentials' ? 'generic' : e.message); keepForm(); }
  }
  function applyDemoData() {
    var d = D.demoState();
    state.stamps = d.stamps; state.bookings = d.bookings; state.joined = d.joined;
    state.user.since = d.user.since;
    save();
  }
  async function logout() {
    await sb.auth.signOut().catch(function () {});
    state = emptyState(); chat = []; ui.authTab = 'login'; ui.authErr = '';
    go('welcome');
  }

  /* ---------- Acciones de producto ---------- */
  function confirmBooking() {
    var f = ui.form, a = act(f.activity), q = quote(a, f);
    showOverlay('<div class="spinner"></div><p>' + t('processing') + '</p>', 'ov-plain');
    setTimeout(function () {
      var b = { id: code(), activity: a.id, city: a.city, checkIn: f.checkIn, nights: f.nights, guests: f.guests, room: f.room, total: q.total, status: 'upcoming', checkedIn: false, created: new Date().toISOString() };
      state.bookings.unshift(b); save(); ui.form = null; hideOverlay(); haptic();
      go('confirmed/' + b.id);
    }, 1400);
  }

  function validate(id) {
    var b = booking(id); if (!b || !b.checkedIn) return;
    var a = act(b.activity), c = city(b.city), before = levelIndex();
    showOverlay('<div class="scanner">' + qrSvg(b.id) + '<i class="scan-line"></i></div><p>' + t('validating') + '</p><small class="muted">' + esc(a.partner) + '</small>', 'ov-dark');
    setTimeout(function () {
      var sport = stampSport(a), date = addDays(b.checkIn, 1);
      state.stamps.forEach(function (s) { delete s.fresh; });
      state.stamps.push({ city: b.city, sport: sport, activity: a.id, date: date, fresh: true });
      b.status = 'completed'; save(); haptic();
      var after = levelIndex();
      showOverlay('<div class="stamp-drop">' + stampSvg(b.city, sport, date, { cls: 'stamp-white', flat: true }) + '</div>' +
        '<small class="eyebrow">' + t('stamp_won') + '</small><h2 class="display">' + esc(L(c.name)) + '</h2><p>' + esc(L(a.title)) + '</p>' +
        '<button class="btn btn-light btn-block" data-action="after-stamp" data-up="' + (after > before ? after : '') + '" data-id="' + b.id + '">' + t('great') + '</button>', 'ov-dark');
    }, 1700);
  }

  function showLevelUp(i) {
    var lv = D.levels[i];
    showOverlay('<div class="burst">' + isotype('burst-iso') + '</div><small class="eyebrow">' + t('level_up') + '</small><h2 class="display lvl-big">' + lv.name + '</h2>' +
      '<p class="muted-light">' + t('new_perks') + '</p><ul class="checks light">' + L(lv.perks).map(function (p) { return '<li>' + icon('check') + esc(p) + '</li>'; }).join('') + '</ul>' +
      '<button class="btn btn-light btn-block" data-action="to-passport">' + t('see_passport') + '</button>', 'ov-dark');
  }

  async function uploadKb(file) {
    var label = document.getElementById('kb-label');
    if (!file || file.type !== 'application/pdf') { toast(t('kb_error')); return; }
    if (label) label.textContent = t('kb_uploading');
    var r = await sb.storage.from('knowledge').upload('stella.pdf', file, { upsert: true, contentType: 'application/pdf' });
    toast(r.error ? t('kb_error') : t('kb_done'));
    rerenderKeepScroll();
  }


  /* ---------- PDF de reserva brandeado (jsPDF, se carga solo cuando hace falta) ---------- */
  var jspdfLoading;
  function loadJsPdf() {
    if (window.jspdf) return Promise.resolve(window.jspdf);
    if (!jspdfLoading) jspdfLoading = new Promise(function (res, rej) {
      var sc = document.createElement('script');
      sc.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      sc.onload = function () { res(window.jspdf); }; sc.onerror = function () { jspdfLoading = null; rej(new Error('load')); };
      document.head.appendChild(sc);
    });
    return jspdfLoading;
  }
  function logoPng(color, px) {
    var c = document.createElement('canvas'); c.width = c.height = px || 400;
    var ctx = c.getContext('2d'); ctx.scale(c.width / 100, c.height / 100);
    ctx.fillStyle = color; ctx.fill(new Path2D(LOGO_PATH), 'evenodd');
    return c.toDataURL('image/png');
  }
  async function bookingPdf(id) {
    var b = booking(id); if (!b) return;
    var a = act(b.activity), c = city(b.city), actDate = addDays(b.checkIn, 1), q = quote(a, b);
    toast(t('pdf_preparing'));
    var lib;
    try { lib = await loadJsPdf(); } catch (e) { toast(t('err_network')); return; }
    var doc = new lib.jsPDF({ unit: 'mm', format: 'a4' });
    var BUR = [89, 18, 37], CLA = [61, 11, 24], POR = [232, 235, 237], INK = [42, 9, 17], MUT = [111, 90, 96];
    var W = 210, M = 16;
    var long = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    function txt(s, x, y, o) { doc.text(Array.isArray(s) ? s : String(s), x, y, o || {}); }
    function font(style, size, col) { doc.setFont('helvetica', style); doc.setFontSize(size); doc.setTextColor.apply(doc, col || INK); }
    function label(s, x, y) { font('bold', 7.5, MUT); doc.setCharSpace(0.6); txt(s.toUpperCase(), x, y); doc.setCharSpace(0); }

    // Cabecera burdeos
    doc.setFillColor.apply(doc, BUR); doc.rect(0, 0, W, 66, 'F');
    doc.addImage(logoPng('#FFFFFF', 300), 'PNG', M - 2, 10, 26, 26, 'logoW', 'FAST');
    font('bold', 22, [255, 255, 255]); doc.setCharSpace(1.2); txt('ACTIVE', M + 27, 22); doc.setCharSpace(2.2); font('bold', 8, [255, 255, 255]); txt('BY EUROSTARS', M + 27.5, 28.5); doc.setCharSpace(0);
    font('normal', 8.5, [255, 255, 255]); txt('Travel further. Play together.', W - M, 18, { align: 'right' });
    font('bold', 9, [255, 255, 255]); doc.setCharSpace(1); txt(t('pdf_title').toUpperCase(), M, 48); doc.setCharSpace(0);
    font('bold', 26, [255, 255, 255]); doc.setCharSpace(1.5); txt(b.id, M, 59); doc.setCharSpace(0);
    var status = b.status === 'completed' ? t('validated') : t('pdf_confirmed');
    font('bold', 8.5, BUR); var sw = doc.getTextWidth(status) + 10;
    doc.setFillColor(255, 255, 255); doc.roundedRect(W - M - sw, 51, sw, 9, 4.5, 4.5, 'F'); txt(status, W - M - sw / 2, 57, { align: 'center' });

    // Columna izquierda: datos
    var y = 80, LX = M, colW = 112;
    function row(lbl, val, sub) {
      label(lbl, LX, y); font('bold', 11, INK);
      var lines = doc.splitTextToSize(String(val), colW); txt(lines, LX, y + 5.5); y += 5.5 + (lines.length - 1) * 5;
      if (sub) { font('normal', 9, MUT); var sl = doc.splitTextToSize(String(sub), colW); txt(sl, LX, y + 5); y += 5 * sl.length; }
      y += 7;
    }
    function section(title) { font('bold', 10, BUR); doc.setCharSpace(0.8); txt(title.toUpperCase(), LX, y); doc.setCharSpace(0); doc.setDrawColor.apply(doc, BUR); doc.setLineWidth(0.5); doc.line(LX, y + 2, LX + colW, y + 2); y += 9; }
    section(t('guest'));
    row(t('pdf_member'), state.user.name + '  ·  @' + state.user.username, t('level') + ': ' + level().name);
    section(t('stay'));
    row(t('hotel'), c.hotel + ' ' + '*'.repeat(c.stars), L(c.name) + ', ' + L(c.country));
    row(t('pdf_dates'), fmtDate(b.checkIn, long) + '  -  ' + fmtDate(addDays(b.checkIn, b.nights), long), b.nights + ' ' + (b.nights > 1 ? t('nights') : t('night')) + ' · ' + b.guests + ' ' + (b.guests > 1 ? t('guests') : t('guest')).toLowerCase() + ' · ' + t('room_' + b.room));
    section(t('activity'));
    row(L(a.title), a.partner, fmtDate(actDate, long) + ' · ' + L(a.when) + ' · ' + L(a.distance));
    row(t('meeting_point'), L(a.meet));

    // Columna derecha: QR
    var qx = 140, qy = 78, qs = 54;
    doc.setFillColor.apply(doc, POR); doc.roundedRect(qx - 4, qy - 4, qs + 8, qs + 30, 4, 4, 'F');
    doc.setFillColor(255, 255, 255); doc.rect(qx, qy, qs, qs, 'F');
    var qm = qrMatrix(b.id), cell = (qs - 6) / qm.n; doc.setFillColor.apply(doc, CLA);
    qm.cells.forEach(function (p) { doc.rect(qx + 3 + p[0] * cell, qy + 3 + p[1] * cell, cell + 0.05, cell + 0.05, 'F'); });
    font('bold', 7.5, MUT); doc.setCharSpace(0.6); txt(t('active_pass').toUpperCase(), qx + qs / 2, qy + qs + 8, { align: 'center' }); doc.setCharSpace(0);
    font('bold', 13, CLA); txt(b.id, qx + qs / 2, qy + qs + 15, { align: 'center' });
    font('normal', 7.5, MUT); txt(doc.splitTextToSize(t('pdf_show_qr'), qs), qx + qs / 2, qy + qs + 20.5, { align: 'center' });

    // Resumen económico
    y = Math.max(y, 178) + 2;
    doc.setFillColor.apply(doc, POR); doc.roundedRect(M, y, W - 2 * M, 44, 4, 4, 'F');
    var yy = y + 10;
    function money2(n) { return n.toLocaleString('es-ES') + ' EUR'; }
    function line(l, v, bold) { font(bold ? 'bold' : 'normal', bold ? 12 : 10, bold ? BUR : INK); txt(l, M + 8, yy); txt(v, W - M - 8, yy, { align: 'right' }); yy += 8; }
    line(t('stay') + ' · ' + b.nights + ' ' + (b.nights > 1 ? t('nights') : t('night')) + ' · ' + t('room_' + b.room), money2(q.stay));
    line(t('activity') + ' x ' + b.guests, q.activity ? money2(q.activity) : t('included'));
    line(t('direct_perk') + ' (' + t('direct_perk_desc').toLowerCase() + ')', t('included'));
    doc.setDrawColor(200, 190, 194); doc.setLineWidth(0.3); doc.line(M + 8, yy - 4.5, W - M - 8, yy - 4.5);
    line(t('total'), money2(b.total), true);
    y += 52;

    // Ventajas del nivel
    var perks = []; D.levels.forEach(function (x, i) { if (i <= levelIndex()) perks = perks.concat(L(x.perks)); });
    font('bold', 10, BUR); doc.setCharSpace(0.8); txt((t('pdf_perks') + ' · ' + level().name).toUpperCase(), M, y); doc.setCharSpace(0); y += 6;
    font('normal', 9.5, INK);
    perks.slice(0, 6).forEach(function (p, i) { var cx = i % 2 ? W / 2 + 2 : M, cy = y + Math.floor(i / 2) * 6; doc.setFillColor.apply(doc, BUR); doc.circle(cx + 1.2, cy - 1.2, 0.9, 'F'); txt(p, cx + 4, cy); });
    y += Math.ceil(Math.min(perks.length, 6) / 2) * 6 + 4;
    font('normal', 9, MUT); txt(doc.splitTextToSize(t('star_traveler') + '. ' + t('taxes') + '.', W - 2 * M), M, y);

    // Pie
    doc.setFillColor.apply(doc, CLA); doc.rect(0, 272, W, 25, 'F');
    doc.addImage(logoPng('#FFFFFF', 300), 'PNG', M - 1, 276.5, 13, 13, 'logoW', 'FAST');
    font('bold', 9, [255, 255, 255]); doc.setCharSpace(1); txt('TRAVEL FURTHER. PLAY TOGETHER.', M + 15, 282); doc.setCharSpace(0);
    font('normal', 7.5, [230, 210, 215]); txt(t('direct_channel') + ' · ' + new Date().toLocaleDateString(lang === 'en' ? 'en-GB' : 'es-ES'), M + 15, 287);
    txt(t('pdf_disclaimer'), W - M, 287, { align: 'right' });

    var name = 'ACTIVE-' + b.id + '.pdf';
    var blob = doc.output('blob');
    var file = new File([blob], name, { type: 'application/pdf' });
    if ('ontouchstart' in window && navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], title: 'ACTIVE · ' + b.id }); return; } catch (e) { if (e && e.name === 'AbortError') return; }
    }
    doc.save(name);
  }

  /* ---------- Eventos ---------- */
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-action]'); if (!el || el.disabled) return;
    var a = el.getAttribute('data-action'), v = el.getAttribute('data-v');
    switch (a) {
      case 'go': go(el.getAttribute('data-href')); break;
      case 'back': if (history.length > 1) history.back(); else go('explore'); break;
      case 'lang': setLang(v); break;
      case 'auth-tab': ui.authTab = v; ui.authErr = ''; keepForm(); break;
      case 'toggle-pw': ui.showPw = !ui.showPw; keepForm(); break;
      case 'reg-sport': ui.regSport = v; keepForm(); break;
      case 'demo': demoLogin(); break;
      case 'city': ui.city = v; render(); break;
      case 'sport': ui.sport = v; render(); break;
      case 'ccity': ui.commCity = v; render(); break;
      case 'ctab': ui.commTab = v; render(); break;
      case 'partner': ui.commTab = 'partners'; ui.focusPartner = el.getAttribute('data-id'); go('community'); break;
      case 'step':
        var k = el.getAttribute('data-k'), d = +el.getAttribute('data-d');
        ui.form[k] = Math.max(1, Math.min(k === 'nights' ? 7 : 4, ui.form[k] + d)); rerenderKeepScroll(); break;
      case 'room': ui.form.room = v; rerenderKeepScroll(); break;
      case 'confirm': confirmBooking(); break;
      case 'checkin': var b = booking(el.getAttribute('data-id')); b.checkedIn = true; save(); haptic(); rerenderKeepScroll(); break;
      case 'validate': validate(el.getAttribute('data-id')); break;
      case 'after-stamp':
        var up = el.getAttribute('data-up');
        if (up) showLevelUp(+up); else { hideOverlay(); render(); }
        break;
      case 'to-passport': hideOverlay(); go('passport'); break;
      case 'join':
        var id = el.getAttribute('data-id'), ix = state.joined.indexOf(id);
        if (ix >= 0) { state.joined.splice(ix, 1); toast(t('left_toast')); } else { state.joined.push(id); toast(t('joined_toast')); haptic(); }
        save(); rerenderKeepScroll(); break;
      case 'usport': state.user.sport = v; save(); rerenderKeepScroll(); break;
      case 'demo-data': applyDemoData(); go('explore'); break;
      case 'reset':
        if (confirm(t('reset_progress_confirm'))) { state.stamps = []; state.bookings = []; state.joined = []; save(); go('explore'); }
        break;
      case 'logout': if (confirm(t('logout_confirm'))) logout(); break;
      case 'ask': sendChat(el.getAttribute('data-q')); break;
      case 'pdf': bookingPdf(el.getAttribute('data-id')); break;
      case 'chat-clear': chat = []; saveChat(); render(); break;
    }
  });
  document.addEventListener('submit', function (e) {
    if (e.target.id === 'auth-form') { e.preventDefault(); submitAuth(); }
    if (e.target.id === 'chat-form') { e.preventDefault(); var ta = document.getElementById('chat-text'); sendChat(ta.value); }
  });
  document.addEventListener('change', function (e) {
    if (e.target.id === 'f-checkin' && ui.form && e.target.value) { ui.form.checkIn = e.target.value; rerenderKeepScroll(); }
    if (e.target.id === 'kb-file') uploadKb(e.target.files[0]);
  });
  document.addEventListener('input', function (e) {
    if (e.target.id === 'chat-text') { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'; }
  });
  document.addEventListener('keydown', function (e) {
    if (e.target.id === 'chat-text' && e.key === 'Enter' && !e.shiftKey && !('ontouchstart' in window)) { e.preventDefault(); sendChat(e.target.value); }
  });
  function rerenderKeepScroll() { var y = window.scrollY; render(); window.scrollTo(0, y); }

  window.addEventListener('hashchange', render);
  document.documentElement.lang = lang;

  /* ---------- Arranque ---------- */
  render();
  (async function boot() {
    try {
      var s = await sb.auth.getSession();
      if (s.data && s.data.session) await loadProfile(s.data.session.user);
    } catch (e) { console.warn(e); }
    booted = true;
    render();
  })();
})();
