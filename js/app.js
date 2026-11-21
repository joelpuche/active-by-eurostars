/* ACTIVE by Eurostars · MVP web-app
   Cuentas y progreso en Supabase · Stella (IA) · muro social en tiempo real · reservas y pagos simulados */
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

  /* ---------- Almacenamiento seguro ---------- */
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function lsDel(k) { try { localStorage.removeItem(k); } catch (e) {} }
  function ssGet(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function ssSet(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }
  function ssDel(k) { try { sessionStorage.removeItem(k); } catch (e) {} }

  /* «Recordarme»: sesión en localStorage (persistente) o sessionStorage (se borra al cerrar la app) */
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
  var ui = { city: 'all', kind: 'all', commCity: 'all', commTab: 'meetups', form: null, authTab: 'register', showPw: false, authBusy: false, authErr: '', chatBusy: false, prefsDraft: null, collabKind: 'sponsor', collabSent: false, ambSent: false, wall: null, sportF: 'all', tourId: 'run', memMonth: null, wrapIdx: 0 };
  var chat = [];

  function emptyState() { return { user: null, prefs: { goals: [], sports: [] }, stamps: [], bookings: [], joined: [] }; }
  function cacheKey() { return 'active-cache-' + (state.user ? state.user.id : ''); }
  var saveTimer;
  function save() {
    if (!state.user) return;
    lsSet(cacheKey(), JSON.stringify(state));
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      sb.from('profiles').update({
        display_name: state.user.name, updated_at: new Date().toISOString(),
        state: { stamps: state.stamps, bookings: state.bookings, joined: state.joined, since: state.user.since, prefs: state.prefs }
      }).eq('id', state.user.id).then(function (r) { if (r.error) console.warn('sync', r.error.message); });
    }, 500);
  }

  async function loadProfile(authUser) {
    var r = await sb.from('profiles').select('username, display_name, state, is_admin, created_at').eq('id', authUser.id).maybeSingle();
    if (r.data) {
      var st = r.data.state || {};
      state = {
        user: { id: authUser.id, username: r.data.username, name: r.data.display_name, isAdmin: !!r.data.is_admin, since: st.since || (r.data.created_at || '').slice(0, 10) },
        prefs: st.prefs || { goals: [], sports: [] },
        stamps: st.stamps || [], bookings: st.bookings || [], joined: st.joined || []
      };
      lsSet(cacheKey(), JSON.stringify(state));
    } else {
      var cached = null; try { cached = JSON.parse(lsGet('active-cache-' + authUser.id)); } catch (e) {}
      state = cached && cached.user ? cached : emptyState();
      if (!state.prefs) state.prefs = { goals: [], sports: [] };
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
  function byId(list, id) { return list.filter(function (x) { return x.id === id; })[0]; }
  function city(id) { return byId(D.cities, id); }
  function act(id) { return byId(D.activities, id); }
  function partner(id) { return byId(D.partners, id); }
  function meetup(id) { return byId(D.meetups, id); }
  function booking(id) { return byId(state.bookings, id); }
  function money(n) { return n.toLocaleString(lang === 'en' ? 'en-GB' : 'es-ES') + ' €'; }
  function fmtDate(iso, opts) {
    var d = new Date(iso + 'T12:00:00');
    if (isNaN(d)) return '';
    return d.toLocaleDateString(lang === 'en' ? 'en-GB' : 'es-ES', opts || { weekday: 'short', day: 'numeric', month: 'short' });
  }
  function addDays(iso, n) { var d = new Date(iso + 'T12:00:00'); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); }
  function nextFriday() { var d = new Date(); var add = (5 - d.getDay() + 7) % 7 || 7; d.setDate(d.getDate() + add); return d.toISOString().slice(0, 10); }
  function firstFriday(ym) { var d = new Date(ym + '-01T12:00:00'); d.setDate(1 + ((5 - d.getDay() + 7) % 7)); return d.toISOString().slice(0, 10); }
  function hash(str) { var h = 2166136261; for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function stampSport(a) { return a.sport; }
  function stampLabel(id) { var a = act(id); return a && a.stampName ? a.stampName : null; }
  function sportLabel(s) { var x = byId(D.sports, s); return s === 'event' ? t('filter_event') : x ? L(x.label) : t('sport_run'); }
  function initials(n) { return ((n || '?').trim().split(/\s+/).filter(function (p) { return /^[\p{L}\d]/u.test(p); }).map(function (p) { return p[0]; }).join('') || '?').slice(0, 2).toUpperCase(); }
  function code() { var c = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', s = 'AE-'; for (var i = 0; i < 5; i++) s += c[Math.floor(Math.random() * c.length)]; return s; }
  function emailFor(u) { return u + '@' + CFG.userDomain; }
  function timeAgo(iso) {
    var s = Math.max(1, Math.round((Date.now() - new Date(iso)) / 1000));
    var rtf = new Intl.RelativeTimeFormat(lang === 'en' ? 'en' : 'es', { numeric: 'auto' });
    if (s < 3600) return rtf.format(-Math.max(1, Math.round(s / 60)), 'minute');
    if (s < 86400) return rtf.format(-Math.round(s / 3600), 'hour');
    return rtf.format(-Math.round(s / 86400), 'day');
  }

  /* ---------- Estatus y precios por nivel ---------- */
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
  function levelIdxOf(id) { for (var i = 0; i < D.levels.length; i++) if (D.levels[i].id === id) return i; return 99; }
  function levelName(id) { var i = levelIdxOf(id); return D.levels[i] ? D.levels[i].name : id; }
  // Precio real para el usuario: gratis si su nivel lo desbloquea
  function priceFor(item) {
    var free = item.freeFrom && levelIndex() >= levelIdxOf(item.freeFrom);
    return { amount: free ? 0 : item.price, base: item.price, unlocked: !!free };
  }
  function priceLabel(a, short) {
    if (a.invite) return t('invite_only');
    var p = priceFor(a);
    if (p.unlocked) return t('free_for_level', { level: level().name });
    if (!a.price) return short ? t('included') : t('included_direct');
    return money(a.price) + (a.freeFrom && !short ? ' · ' + t('free_from', { level: levelName(a.freeFrom) }) : '');
  }

  /* ---------- Recomendaciones según objetivos e intereses ---------- */
  function score(a) {
    var s = 0, p = state.prefs || {}, have = {};
    state.stamps.forEach(function (x) { have[x.city] = 1; });
    (p.goals || []).forEach(function (g) { var go = byId(D.goals, g); if (go && go.kinds.indexOf(a.kind) >= 0) s += 3; if (g === 'discover' && ['surf', 'golf', 'sup', 'trail', 'cycling', 'yoga', 'pilates', 'swim', 'tennis'].indexOf(a.sport) >= 0) s += 2; });
    if ((p.sports || []).indexOf(a.sport) >= 0) s += 2;
    if (!have[a.city]) s += 1;
    if (city(a.city).pilot) s += 0.5;
    if (a.invite) s -= 10;
    return s;
  }
  function reasonFor(a) {
    var p = state.prefs || {}, have = {};
    state.stamps.forEach(function (x) { have[x.city] = 1; });
    var g = (p.goals || []).map(function (id) { return byId(D.goals, id); }).filter(function (go) { return go && go.kinds.indexOf(a.kind) >= 0; })[0];
    if (g) return L(g.label);
    if ((p.sports || []).indexOf(a.sport) >= 0) return t('reason_sport', { sport: sportLabel(a.sport) });
    if (!have[a.city]) return t('reason_stamp');
    return D.kinds[a.kind].name;
  }
  function recommended(n) {
    // Variedad: penaliza repetir tipo de evento y ciudad
    var pool = D.activities.filter(function (a) { return !a.invite; }), out = [], kc = {}, cc = {};
    function adj(a) { return score(a) - 1.5 * (kc[a.kind] || 0) - (cc[a.city] || 0); }
    while (out.length < (n || 5) && pool.length) {
      pool.sort(function (a, b) { return adj(b) - adj(a); });
      var x = pool.shift(); out.push(x); kc[x.kind] = (kc[x.kind] || 0) + 1; cc[x.city] = (cc[x.city] || 0) + 1;
    }
    return out;
  }

  /* ---------- Iconos (trazo 2px, estilo manual de marca) ---------- */
  var IC = {
    run: '<circle cx="15" cy="4.5" r="2"/><path d="M7 21l3.5-5.5 3 2.5V22"/><path d="M5 11.5l3.5-3.5 4.5.5 2.5 3.5 3.5 1"/><path d="M10.5 15.5L13 9"/>',
    padel: '<ellipse cx="10" cy="9" rx="6" ry="6.5"/><path d="M13.8 14l5.7 7"/><circle cx="19" cy="4.5" r="1.6"/><path d="M8 7h.01M12 7h.01M10 10h.01M8 12h.01M12 12h.01"/>',
    gym: '<path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11"/>',
    event: '<path d="M6 21V4"/><path d="M6 4h11l-2.5 4L17 12H6"/>',
    trail: '<path d="M3 20l6-10 4 6 3-4 5 8z"/>', cycling: '<circle cx="6" cy="16" r="3.5"/><circle cx="18" cy="16" r="3.5"/><path d="M6 16l4-7h5l3 7M10 9l2 7"/>',
    swim: '<path d="M3 17c2 0 2-1.5 4.5-1.5S9.5 17 12 17s2-1.5 4.5-1.5S18.5 17 21 17"/><circle cx="16" cy="7" r="2"/><path d="M5 13l5-5 3 3"/>',
    tennis: '<circle cx="12" cy="12" r="8"/><path d="M5 7c3 2 3 8 0 10M19 7c-3 2-3 8 0 10"/>', pilates: '<circle cx="7" cy="8" r="2"/><path d="M3 18h18M5 18l4-6 5 2 5-4"/>', yoga: '<circle cx="12" cy="5" r="2"/><path d="M4 20l4-4h8l4 4M12 8v8M6 11l6-2 6 2"/>',
    triathlon: '<circle cx="12" cy="12" r="8"/><path d="M12 4v16M4 12h16"/>', surf: '<path d="M6 21C6 12 11 5 18 3c0 9-5 16-12 18z"/><path d="M8 17l6-8"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
    ticket: '<path d="M3 8a2 2 0 002-2h14a2 2 0 002 2v2a2 2 0 000 4v2a2 2 0 00-2 2H5a2 2 0 00-2-2v-2a2 2 0 000-4z"/><path d="M14 6v12" stroke-dasharray="2 2"/>',
    passport: '<rect x="5" y="3" width="14" height="18" rx="2"/><circle cx="12" cy="10" r="3"/><path d="M9 16h6"/>',
    users: '<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.2c2.8.4 5 2.8 5 5.8"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/>',
    back: '<path d="M15 5l-7 7 7 7"/>', chev: '<path d="M9 5l7 7-7 7"/>',
    pin: '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0119 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>',
    star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
    bed: '<path d="M3 19V6M3 15h18v4M21 15v-3a3 3 0 00-3-3h-7v6"/><circle cx="7" cy="11.5" r="1.8"/>',
    gauge: '<path d="M4 18a8 8 0 1116 0"/><path d="M12 18l4-6"/>',
    route: '<circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="6" r="2.5"/><path d="M8.5 18H15a3 3 0 000-6H9a3 3 0 010-6h6.5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>', minus: '<path d="M5 12h14"/>',
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
    download: '<path d="M12 4v12M7 11l5 5 5-5"/><path d="M4 18v2h16v-2"/>',
    chat: '<path d="M4 5h16v11H9l-5 4z"/>',
    golf: '<path d="M7 21V3l9 4-9 4"/><path d="M4 21h10"/>',
    sup: '<path d="M4 17c3 1.5 13 1.5 16 0"/><path d="M14 3l-3 11M10 4l3 1"/><circle cx="8" cy="7" r="1.5"/>',
    camera: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/>',
    sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
    share: '<path d="M12 3v12M7 8l5-5 5 5"/><path d="M5 13v7h14v-7"/>',
    filter: '<path d="M4 5h16l-6 8v6l-4-2v-4z"/>', eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    handshake: '<path d="M3 11l4-4 4 2 3-2 7 4-6 6-3-2-3 2z"/><path d="M8 14l2 2M11 13l2 2"/>',
    crown: '<path d="M3 8l4 4 5-7 5 7 4-4-2 11H5z"/>', trophy: '<path d="M8 4h8v5a4 4 0 01-8 0zM5 5H3v2a3 3 0 003 3M19 5h2v2a3 3 0 01-3 3M12 13v4M8 21h8M9 17h6"/>'
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
    var name = (opts.label || L(c.name)).toUpperCase(), year = date ? date.slice(0, 4) : '2026';
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

  var DARK = { welcome: 1, trips: 1, trip: 1, passport: 1, confirmed: 1, prefs: 1, tour: 1, wrapped: 1 };
  var PUBLIC = { welcome: 1, collab: 1 };
  var TABS = [
    { id: 'explore', icon: 'compass', label: 'tab_explore' },
    { id: 'trips', icon: 'ticket', label: 'tab_trips' },
    { id: 'passport', icon: 'passport', label: 'tab_passport' },
    { id: 'community', icon: 'users', label: 'tab_community' },
    { id: 'profile', icon: 'user', label: 'tab_profile' }
  ];
  var AFTER = {};
  var BEFORE_LEAVE = null;

  function render() {
    if (!booted) {
      if (!view.querySelector('.splash')) view.innerHTML = '<div class="splash"><div class="splash-glow"></div>' +
        '<div class="splash-mark">' + isotype('splash-iso') + '</div>' +
        '<div class="splash-word"><b>ACTIVE</b><span>BY EUROSTARS</span></div>' +
        '<p class="splash-tag">Travel further. Play together.</p><div class="splash-bar"><i></i></div></div>';
      document.body.classList.add('dark'); tabbar.hidden = true; return;
    }
    var r = route();
    if (BEFORE_LEAVE) { BEFORE_LEAVE(); BEFORE_LEAVE = null; }
    if (!state.user && !PUBLIC[r.name]) { location.replace('#/welcome'); return; }
    if (state.user && (r.name === '' || r.name === 'welcome')) { location.replace('#/explore'); return; }
    var views = { welcome: vWelcome, prefs: vPrefs, explore: vExplore, activity: vActivity, book: vBook, confirmed: vConfirmed, trips: vTrips, trip: vTrip, passport: vPassport, community: vCommunity, profile: vProfile, stella: vStella, wall: vWall, tour: vTour, ambassador: vAmbassador, collab: vCollab, memories: vMemories, wrapped: vWrapped };
    var fn = views[r.name] || vExplore;
    var dark = !!DARK[r.name];
    document.body.classList.toggle('dark', dark);
    document.body.classList.toggle('chat-mode', r.name === 'stella' || r.name === 'wall');
    document.body.classList.toggle('story-mode', r.name === 'wrapped');
    var meta = document.querySelector('meta[name=theme-color]'); if (meta) meta.setAttribute('content', dark ? '#591225' : '#FFFFFF');
    stampSeq = 0;
    view.innerHTML = fn(r.arg);
    view.className = 'view view-' + (r.name || 'explore');
    var isTab = TABS.some(function (x) { return x.id === r.name; });
    renderTabs(isTab && state.user ? r.name : null);
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

  /* ---------- Piezas comunes ---------- */
  function langSwitch() {
    return '<div class="seg seg-sm" role="group">' + ['es', 'en'].map(function (l) {
      return '<button type="button" class="' + (lang === l ? 'on' : '') + '" data-action="lang" data-v="' + l + '">' + l.toUpperCase() + '</button>';
    }).join('') + '</div>';
  }
  function topbar() {
    var lv = level();
    return '<header class="topbar">' + lockup() +
      '<button class="lvl-chip" data-action="go" data-href="passport">' + isotype('iso-xs') + lv.name + '</button></header>';
  }
  function subbar(title, back, dark) {
    return '<header class="subbar' + (dark ? ' dark' : '') + '"><button class="icon-btn plain" data-action="' + (back ? 'go' : 'back') + '"' + (back ? ' data-href="' + back + '"' : '') + ' aria-label="' + t('back') + '">' + icon('back') + '</button><h2>' + esc(title) + '</h2><span class="sm-brand">' + isotype('iso-xs') + '</span></header>';
  }
  function logoImg(p) { return '<img src="' + p.logo + '" alt="' + esc(p.name) + '"' + (p.mono ? ' class="mono"' : '') + ' loading="lazy">'; }
  function kindTag(a) { var k = D.kinds[a.kind]; return '<span class="tag kind-' + a.kind + '">' + icon(k.icon) + k.name + '</span>' + (a.role ? '<span class="tag tag-role">' + t('role_' + a.role) + '</span>' : ''); }
  function marquee() {
    var items = D.partners.map(function (p) { return '<button class="mq-item" data-action="partner" data-id="' + p.id + '" aria-label="' + esc(p.name) + '">' + logoImg(p) + '</button>'; }).join('');
    return '<div class="marquee" aria-label="' + t('partners_title') + '"><div class="mq-track">' + items + items + '</div></div>';
  }
  function collabCta() {
    return '<button class="collab-cta" data-action="go" data-href="collab">' + icon('handshake') + '<div><b>' + t('collab_cta_title') + '</b><span>' + t('collab_cta_sub') + '</span></div>' + icon('chev') + '</button>';
  }

  /* ---------- Bienvenida y cuenta ---------- */
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
          '<label class="check"><input type="checkbox" id="f-remember"' + (remember() ? ' checked' : '') + '><i>' + icon('check') + '</i><span>' + t('remember_me') + '</span></label>' +
          (ui.authErr ? '<p class="form-err" role="alert">' + esc(ui.authErr) + '</p>' : '') +
          '<button type="submit" class="btn btn-light btn-block"' + (ui.authBusy ? ' disabled' : '') + '>' + (ui.authBusy ? '<span class="spinner sm"></span>' : '') + (reg ? t('create_account') : t('sign_in')) + (ui.authBusy ? '' : icon('chev')) + '</button>' +
          (reg ? '<p class="fine">' + icon('shield') + t('no_email_needed') + '</p>' : '') +
        '</form>' +
        '<button type="button" class="btn-link" data-action="demo"' + (ui.authBusy ? ' disabled' : '') + '>' + t('try_demo') + '</button>' +
        '<button type="button" class="btn-link small-link" data-action="go" data-href="collab">' + icon('handshake') + t('collab_welcome') + '</button>' +
      '</div></section>';
  }

  /* Onboarding: qué espera el usuario de ACTIVE */
  function vPrefs() {
    if (!ui.prefsDraft) ui.prefsDraft = JSON.parse(JSON.stringify(state.prefs || { goals: [], sports: [] }));
    var d = ui.prefsDraft;
    return '<section class="prefs pad">' +
      '<div class="welcome-top flat">' + lockup(true) + '</div>' +
      '<p class="eyebrow">' + t('prefs_eyebrow', { name: esc(state.user.name) }) + '</p>' +
      '<h1 class="display">' + t('prefs_title') + '</h1>' +
      '<p class="lead">' + t('prefs_sub') + '</p>' +
      '<div class="goal-grid">' + D.goals.map(function (g) {
        var on = d.goals.indexOf(g.id) >= 0;
        return '<button class="goal' + (on ? ' on' : '') + '" data-action="pref-goal" data-v="' + g.id + '">' + icon(g.icon) + '<span>' + esc(L(g.label)) + '</span><i>' + icon('check') + '</i></button>'; }).join('') + '</div>' +
      '<h3 class="h-sec">' + t('prefs_sports') + '</h3><p class="muted small">' + t('prefs_sports_sub') + '</p>' +
      '<div class="sport-chips">' + D.sports.map(function (s) {
        var on = d.sports.indexOf(s.id) >= 0;
        return '<button class="schip' + (on ? ' on' : '') + '" data-action="pref-sport" data-v="' + s.id + '">' + sportIcon(s.id) + esc(L(s.label)) + '</button>'; }).join('') + '</div>' +
      '<button class="btn btn-light btn-block prefs-save" data-action="prefs-save">' + t('prefs_save') + icon('chev') + '</button>' +
      '<button class="btn-link" data-action="prefs-skip">' + t('prefs_skip') + '</button>' +
      '</section>';
  }

  /* ---------- Explorar ---------- */
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
  function activityCard(a) {
    var c = city(a.city), left = a.spots - a.taken;
    return '<button class="act-card" data-action="go" data-href="activity/' + a.id + '">' +
      '<div class="act-img" style="background-image:url(' + a.img + ')">' + kindTag(a) +
      (c.pilot ? '<span class="tag tag-pilot">' + t('pilot') + '</span>' : '') + (a.exclusive ? '<span class="tag tag-excl">' + icon('crown') + t('exclusive') + '</span>' : '') + '</div>' +
      '<div class="act-body"><h3>' + esc(L(a.title)) + '</h3>' +
      '<p class="muted">' + icon('pin') + esc(L(c.name)) + ' · ' + esc(a.partner) + '</p>' +
      '<div class="act-meta"><span>' + sportIcon(a.sport) + esc(sportLabel(a.sport)) + ' · ' + esc(L(a.when)) + '</span><span class="price' + (priceFor(a).unlocked ? ' unlocked' : '') + '">' + priceLabel(a, true) + '</span></div>' +
      (a.invite ? '' : '<div class="spots"><i style="width:' + Math.round(a.taken / a.spots * 100) + '%"></i></div><small class="muted">' + left + ' ' + t('spots_left') + '</small>') +
      '</div></button>';
  }
  function miniAct(a) {
    var c = city(a.city);
    return '<button class="mini-act" data-action="go" data-href="activity/' + a.id + '"><div class="thumb" style="background-image:url(' + a.img + ')"></div>' +
      '<div><b>' + esc(L(a.title)) + '</b><span>' + esc(L(c.name)) + ' · ' + esc(L(a.when)) + '</span></div>' + icon('chev') + '</button>';
  }
  function forYouCard(a) {
    return '<button class="fy-card" data-action="go" data-href="activity/' + a.id + '" style="background-image:url(' + a.img + ')">' +
      '<span class="fy-why">' + icon('star') + esc(reasonFor(a)) + '</span>' +
      '<div><small>' + D.kinds[a.kind].name + ' · ' + esc(L(city(a.city).name)) + '</small><b>' + esc(L(a.title)) + '</b><span>' + priceLabel(a, true) + '</span></div></button>';
  }

  function vExplore() {
    var filtering = ui.city !== 'all' || ui.kind !== 'all' || ui.sportF !== 'all';
    var list = D.activities.filter(function (a) {
      if (ui.city !== 'all' && a.city !== ui.city) return false;
      if (ui.kind !== 'all' && a.kind !== ui.kind) return false;
      if (ui.sportF !== 'all' && a.sport !== ui.sportF) return false;
      return true;
    });
    list.sort(function (a, b) { return score(b) - score(a); });
    var noPrefs = !state.prefs || !(state.prefs.goals || []).length;
    var pills = [];
    if (ui.sportF !== 'all') pills.push(['sportF', sportIcon(ui.sportF) + esc(sportLabel(ui.sportF))]);
    if (ui.kind !== 'all') pills.push(['kind', icon(D.kinds[ui.kind].icon) + D.kinds[ui.kind].name]);
    if (ui.city !== 'all') pills.push(['city', icon('pin') + esc(L(city(ui.city).name))]);
    var sportsWithActs = D.sports.filter(function (sp) { return D.activities.some(function (a) { return a.sport === sp.id; }); });
    return topbar() +
      '<section class="pad">' +
        '<p class="hello">' + t('hello') + ', ' + esc(state.user.name) + '</p>' +
        '<h1 class="display dark-ink">' + t('explore_title') + '</h1>' +
        nextBookingCard() +
      '</section>' +
      '<section><div class="sec-head pad"><h3 class="h-sec">' + t('what_fancy') + '</h3></div>' +
        '<div class="sport-tiles">' + sportsWithActs.map(function (sp) {
          var n = D.activities.filter(function (a) { return a.sport === sp.id; }).length;
          return '<button class="stile' + (ui.sportF === sp.id ? ' on' : '') + '" data-action="sport-f" data-v="' + sp.id + '" style="background-image:url(' + sp.img + ')"><i>' + sportIcon(sp.id) + '</i><b>' + esc(L(sp.label)) + '</b><small>' + n + '</small></button>'; }).join('') + '</div></section>' +
      (filtering ? '' :
        '<section><div class="sec-head pad"><h3 class="h-sec">' + t('for_you') + '</h3><button class="link-btn" data-action="go" data-href="prefs">' + (noPrefs ? t('prefs_set') : t('edit')) + '</button></div>' +
          '<div class="fy-row">' + recommended(6).map(forYouCard).join('') + '</div></section>' +
        '<section><div class="sec-head pad"><h3 class="h-sec">' + t('three_ways') + '</h3></div>' +
          '<div class="kind-row">' + ['local', 'race', 'tour'].map(function (k) {
            var K = D.kinds[k], n = D.activities.filter(function (a) { return a.kind === k && !a.invite; }).length;
            return '<button class="kind-big kb2-' + k + '" data-action="' + (k === 'tour' ? 'go' : 'kind') + '" data-href="tour" data-v="' + k + '" style="background-image:url(' + K.img + ')">' +
              '<span class="kb-ic">' + icon(K.icon) + '</span><div><small>' + esc(L(K.tag)) + '</small><b>' + K.name + '</b><p>' + esc(L(K.short)) + '</p><em>' + (k === 'tour' ? t('tour_3') : n + ' ' + t('options')) + icon('chev') + '</em></div></button>'; }).join('') + '</div></section>' +
        '<section><div class="sec-head pad"><h3 class="h-sec">' + t('destinations') + '</h3></div>' +
          '<div class="city-row">' + D.cities.map(function (c) {
            var n = D.activities.filter(function (a) { return a.city === c.id; }).length;
            return '<button class="city-card" data-action="city" data-v="' + c.id + '" style="background-image:url(' + c.img + ')">' + (c.pilot ? '<span class="tag tag-pilot">' + t('pilot') + '</span>' : '') +
              '<div><b>' + esc(L(c.name)) + '</b><small>' + esc(c.hotel) + '</small><em>' + n + ' ' + t('options') + '</em></div></button>'; }).join('') + '</div></section>' +
        '<section class="pad"><h3 class="h-sec">' + t('partners_title') + '</h3></section>' + marquee()) +
      '<section class="pad" id="list-anchor">' +
        '<div class="list-head"><h3 class="h-sec">' + (filtering ? t('results') : t('all_activities')) + ' <span class="count">' + list.length + '</span></h3>' +
          (filtering ? '<button class="link-btn" data-action="clear-f">' + t('clear_filters') + '</button>' : '') + '</div>' +
        (pills.length ? '<div class="pills">' + pills.map(function (p) { return '<button class="pill-f" data-action="unf" data-v="' + p[0] + '">' + p[1] + icon('x') + '</button>'; }).join('') + '</div>' : '') +
        '<div class="kind-grid">' + ['all', 'local', 'race', 'tour'].map(function (k) {
          return '<button class="kg' + (ui.kind === k ? ' on' : '') + '" data-action="kind" data-v="' + k + '">' + icon(k === 'all' ? 'globe' : D.kinds[k].icon) + '<span>' + (k === 'all' ? t('filter_all') : D.kinds[k].name.replace('ACTIVE ', '')) + '</span></button>'; }).join('') + '</div>' +
        (ui.kind !== 'all' ? '<p class="kind-note">' + icon('user') + esc(L(D.kinds[ui.kind].who)) + '</p>' : '') +
      '</section>' +
      '<div class="chips">' +
        '<button class="chip' + (ui.city === 'all' ? ' on' : '') + '" data-action="city" data-v="all">' + icon('globe') + t('all') + '</button>' +
        D.cities.map(function (x) { return '<button class="chip' + (ui.city === x.id ? ' on' : '') + '" data-action="city" data-v="' + x.id + '">' + esc(L(x.name)) + (x.pilot ? '<i class="dot"></i>' : '') + '</button>'; }).join('') +
      '</div>' +
      '<section class="pad">' +
        '<div class="act-list">' + (list.length ? list.map(activityCard).join('') : '<div class="empty-box">' + icon('compass') + '<p>' + t('no_results') + '</p><button class="btn btn-ghost btn-sm" data-action="clear-f">' + t('clear_filters') + '</button></div>') + '</div>' +
        collabCta() +
      '</section>';
  }

  /* ---------- Detalle de actividad + gente que va ---------- */
  function vActivity(id) {
    var a = act(id); if (!a) return vExplore();
    var c = city(a.city), p = a.partnerId ? partner(a.partnerId) : null, K = D.kinds[a.kind], pr = priceFor(a);
    return '<section class="detail">' +
      '<div class="hero" style="background-image:url(' + a.img + ')">' +
        '<button class="icon-btn" data-action="back" aria-label="' + t('back') + '">' + icon('back') + '</button>' +
        '<div class="hero-txt">' + kindTag(a) +
        '<h1 class="display">' + esc(L(a.title)) + '</h1><p>' + icon('pin') + esc(L(c.name)) + ' · ' + esc(c.hotel) + '</p></div>' +
      '</div>' +
      '<div class="pad">' +
        '<div class="kind-box kb-' + a.kind + '"><b>' + icon(K.icon) + K.name + ' · ' + esc(L(K.tag)) + '</b><p>' + esc(L(K.what)) + '</p><small>' + icon('user') + esc(L(K.who)) + '</small>' +
          (a.kind === 'tour' ? '<button class="link-btn light" data-action="go" data-href="tour">' + t('tour_see') + icon('chev') + '</button>' : '') + '</div>' +
        '<div class="info-grid">' +
          info('users', t('partner'), a.partner) + info('route', t('distance'), L(a.distance)) +
          info('clock', t('when'), L(a.when)) + info('gauge', t('level'), L(a.level)) +
        '</div>' +
        '<div class="price-box' + (pr.unlocked ? ' unlocked' : '') + '"><div><small>' + t('your_price') + '</small><b>' + priceLabel(a) + '</b>' +
          (pr.unlocked ? '<s>' + money(pr.base) + '</s>' : '') + '</div>' +
          (a.exclusive ? '<p>' + icon('crown') + t('exclusive_note') + '</p>' : '') +
          (a.bibNote ? '<p>' + icon('info') + t('bib_note') + '</p>' : '') + (a.ticketNote ? '<p>' + icon('info') + t('ticket_note') + '</p>' : '') + '</div>' +
        (p ? '<button class="partner-strip" data-action="partner" data-id="' + p.id + '">' + logoImg(p) + '<span>' + esc(L(p.tagline)) + '</span>' + icon('chev') + '</button>' : '') +
        '<p class="body-text">' + esc(L(a.desc)) + '</p>' +
        (a.ups ? '<h3 class="h-sec">' + t('race_plan') + '</h3><ul class="upsell-list">' + upsellsFor(a).map(function (u) { var up = priceFor(u); return '<li>' + icon('check') + '<span>' + esc(L(u.title)) + '</span><b>' + (up.amount ? money(up.amount) : (up.unlocked ? t('free_for_level', { level: level().name }) : t('included'))) + '</b></li>'; }).join('') + '</ul><p class="direct-only">' + icon('shield') + t('direct_only') + '</p>' : '') +
        '<div class="card"><div class="row-ic">' + icon('pin') + '<div><small class="muted">' + t('meeting_point') + '</small><b>' + esc(L(a.meet)) + '</b></div></div></div>' +
        '<div id="social-preview" class="social"><h3 class="h-sec">' + t('who_goes') + '</h3><p class="muted small">' + t('loading') + '</p></div>' +
        '<div class="stamp-preview">' + stampSvg(a.city, stampSport(a), null, { cls: 'stamp-ink', label: a.stampName }) + '<div><small class="muted">' + t('stamp_preview') + '</small><b>' + t('stamp_of') + ' ' + esc(L(c.name)) + '</b><span class="muted">Sport Passport</span></div></div>' +
      '</div>' +
      '<div class="sticky-cta"><div><small class="muted">' + t('from_night') + '</small><b>' + money(c.price) + '</b><small class="muted"> / ' + t('night') + ' + ' + priceLabel(a, true).toLowerCase() + '</small></div>' +
        (a.invite ? '<button class="btn btn-primary" disabled>' + t('invite_only') + '</button>' : '<button class="btn btn-primary" data-action="go" data-href="book/' + a.id + '">' + t('book_cta') + '</button>') + '</div>' +
      '</section>';
  }
  function info(ic, label, val) { return '<div class="info">' + icon(ic) + '<small>' + label + '</small><b>' + esc(val) + '</b></div>'; }
  function eventMeta(id) { var a = act(id); if (a) return { title: L(a.title), base: a.taken }; var m = meetup(id); return m ? { title: L(m.title), base: m.going } : { title: id, base: 0 }; }

  async function loadSocial(id) {
    var at = await sb.from('event_attendees').select('user_id, display_name, username, created_at').eq('event_id', id).order('created_at', { ascending: true });
    var ms = await sb.from('event_messages').select('id, user_id, display_name, body, created_at').eq('event_id', id).order('created_at', { ascending: true }).limit(100);
    return { attendees: at.data || [], messages: ms.data || [], error: at.error || ms.error };
  }
  function avatars(list, extra) {
    var shown = list.slice(0, 5);
    return '<div class="faces big">' + shown.map(function (p, i) { return '<i style="z-index:' + (9 - i) + '" title="' + esc(p.display_name) + '">' + initials(p.display_name) + '</i>'; }).join('') +
      '<span>' + t('people_going', { n: list.length + extra }) + '</span></div>';
  }
  function isAttending(soc) { return soc.attendees.some(function (p) { return p.user_id === state.user.id; }); }
  AFTER.activity = async function (id) {
    var box = document.getElementById('social-preview'); if (!box) return;
    var soc = await loadSocial(id), meta = eventMeta(id);
    if (!document.getElementById('social-preview')) return;
    var last = soc.messages.slice(-2);
    box.innerHTML = '<h3 class="h-sec">' + t('who_goes') + '</h3>' + avatars(soc.attendees, meta.base) +
      (last.length ? '<div class="wall-peek">' + last.map(msgHtml).join('') + '</div>' : '<p class="muted small">' + t('wall_empty') + '</p>') +
      '<div class="social-actions"><button class="btn btn-sm ' + (isAttending(soc) ? 'btn-ghost' : 'btn-primary') + '" data-action="attend" data-id="' + id + '">' + (isAttending(soc) ? icon('check') + t('attending') : t('attend')) + '</button>' +
      '<button class="btn btn-sm btn-ghost" data-action="go" data-href="wall/' + id + '">' + icon('chat') + t('open_wall') + '</button></div>';
  };

  /* Muro del evento (tiempo real) */
  function msgHtml(m) {
    var mine = state.user && m.user_id === state.user.id;
    return '<div class="wmsg' + (mine ? ' mine' : '') + '"><i>' + initials(m.display_name) + '</i><div><b>' + esc(m.display_name) + ' <small>' + timeAgo(m.created_at) + '</small></b><p>' + esc(m.body) + '</p></div></div>';
  }
  function vWall(id) {
    var meta = eventMeta(id);
    return '<header class="chat-head"><button class="icon-btn plain" data-action="back">' + icon('back') + '</button>' +
      '<div class="chat-id"><div class="bot-av lg">' + icon('users') + '</div><div><b class="wall-title">' + esc(meta.title) + '</b><small>' + t('wall_sub') + '</small></div></div><span style="width:40px"></span></header>' +
      '<div class="chat-log" id="wall-log"><p class="muted small center">' + t('loading') + '</p></div>' +
      '<div class="chat-input"><form id="wall-form" class="chat-row" data-id="' + esc(id) + '"><textarea id="wall-text" rows="1" placeholder="' + t('wall_ph') + '" maxlength="500"></textarea>' +
      '<button type="submit" class="send" aria-label="Enviar">' + icon('send') + '</button></form></div>';
  }
  AFTER.wall = async function (id) {
    var soc = await loadSocial(id), meta = eventMeta(id);
    ui.wall = { id: id, soc: soc };
    drawWall(meta);
    var ch = sb.channel('wall-' + id).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'event_messages', filter: 'event_id=eq.' + id }, function (payload) {
      if (!ui.wall || ui.wall.id !== id) return;
      if (ui.wall.soc.messages.some(function (m) { return m.id === payload.new.id; })) return;
      ui.wall.soc.messages.push(payload.new); drawWall(meta);
    }).subscribe();
    BEFORE_LEAVE = function () { sb.removeChannel(ch); ui.wall = null; };
  };
  function drawWall(meta) {
    var log = document.getElementById('wall-log'); if (!log || !ui.wall) return;
    var soc = ui.wall.soc;
    log.innerHTML = '<div class="wall-top">' + avatars(soc.attendees, meta.base) +
      '<button class="btn btn-sm ' + (isAttending(soc) ? 'btn-ghost' : 'btn-primary') + '" data-action="attend" data-id="' + ui.wall.id + '">' + (isAttending(soc) ? icon('check') + t('attending') : t('attend')) + '</button></div>' +
      (soc.messages.length ? soc.messages.map(msgHtml).join('') : '<p class="muted small center">' + t('wall_empty') + '</p>') +
      '<p class="ai-note">' + icon('info') + t('wall_note') + '</p>';
    log.scrollTop = log.scrollHeight;
  }
  async function attendToggle(id) {
    var soc = await loadSocial(id);
    if (isAttending(soc)) await sb.from('event_attendees').delete().eq('event_id', id).eq('user_id', state.user.id);
    else { await sb.from('event_attendees').insert({ event_id: id, user_id: state.user.id, display_name: state.user.name, username: state.user.username }); haptic(); toast(t('attend_toast')); }
    var r = route();
    if (r.name === 'wall') { ui.wall.soc = await loadSocial(id); drawWall(eventMeta(id)); }
    else if (AFTER[r.name]) AFTER[r.name](r.arg);
  }
  async function ensureAttending(id) {
    await sb.from('event_attendees').upsert({ event_id: id, user_id: state.user.id, display_name: state.user.name, username: state.user.username }, { onConflict: 'event_id,user_id', ignoreDuplicates: true });
  }
  async function postWall(id, text) {
    text = (text || '').trim(); if (!text) return;
    var r = await sb.from('event_messages').insert({ event_id: id, user_id: state.user.id, display_name: state.user.name, body: text.slice(0, 500) }).select().single();
    if (r.error) { toast(t('err_generic')); return; }
    if (ui.wall && ui.wall.id === id && !ui.wall.soc.messages.some(function (m) { return m.id === r.data.id; })) ui.wall.soc.messages.push(r.data);
    var ta = document.getElementById('wall-text'); if (ta) { ta.value = ''; ta.style.height = 'auto'; }
    drawWall(eventMeta(id));
  }

  /* ---------- Reserva con fotos de habitación y extras ---------- */
  var ROOMS = { classic: 1, superior: 1.2, suite: 1.6 };
  function upsellsFor(a) { return a.ups ? D.upsells.filter(function (u) { return u.sets.indexOf(a.ups) >= 0; }) : []; }
  function quote(a, f) {
    var c = city(a.city), night = Math.round(c.price * ROOMS[f.room]);
    var stay = night * f.nights, ap = priceFor(a).amount, activity = ap * f.guests;
    var ups = (f.upsells || []).map(function (id) { var u = byId(D.upsells, id); return { id: id, title: L(u.title), amount: priceFor(u).amount }; });
    var extras = ups.reduce(function (s, u) { return s + u.amount; }, 0);
    return { night: night, stay: stay, activity: activity, ups: ups, extras: extras, total: stay + activity + extras };
  }
  function vBook(id) {
    var a = act(id); if (!a || a.invite) return vExplore();
    var c = city(a.city);
    if (!ui.form || ui.form.activity !== id) ui.form = { activity: id, checkIn: a.month ? firstFriday(a.month) : nextFriday(), nights: 2, guests: 1, room: 'superior', upsells: a.ups ? D.upsellDefaults[a.ups].slice() : [], photo: 0 };
    var f = ui.form, q = quote(a, f), photos = c.rooms[f.room];
    return subbar(t('booking')) +
      '<section class="book">' +
        '<div class="room-gallery" id="room-gallery">' + photos.map(function (src) { return '<img src="' + src + '" alt="' + esc(c.hotel + ' · ' + t('room_' + f.room)) + '" loading="lazy">'; }).join('') +
          '<span class="rg-label">' + icon('bed') + esc(t('room_' + f.room)) + ' · ' + photos.length + ' ' + t('photos') + '</span></div>' +
        '<p class="photo-credit pad">' + t('photo_credit') + '</p>' +
        '<div class="pad">' +
        '<div class="book-head"><div class="thumb" style="background-image:url(' + a.img + ')"></div><div><b>' + esc(L(a.title)) + '</b><span class="muted">' + esc(c.hotel) + '</span><span class="muted">' + esc(L(a.when)) + '</span></div></div>' +
        '<h3 class="h-sec">' + t('step_dates') + '</h3>' + (a.month ? '<p class="kind-note">' + icon('cal') + t('event_dates_note', { when: esc(L(a.when)) }) + '</p>' : '') +
        '<div class="field light"><span>' + icon('bed') + t('room') + '</span><div class="rooms">' + Object.keys(ROOMS).map(function (r) {
          return '<button class="room' + (f.room === r ? ' on' : '') + '" data-action="room" data-v="' + r + '"><img src="' + c.rooms[r][0] + '" alt=""><b>' + t('room_' + r) + '</b><small>' + money(Math.round(c.price * ROOMS[r])) + '</small></button>'; }).join('') + '</div></div>' +
        '<label class="field light"><span>' + icon('cal') + t('check_in') + '</span><input type="date" id="f-checkin" value="' + f.checkIn + '" min="' + new Date().toISOString().slice(0, 10) + '"></label>' +
        '<div class="steppers">' + stepper('nights', t('n_nights'), f.nights, 1, 7) + stepper('guests', t('guests'), f.guests, 1, 4) + '</div>' +
        '<div class="card incl"><div class="row-ic">' + sportIcon(a.sport) + '<div><small class="muted">' + t('activity_spot') + '</small><b>' + esc(L(a.title)) + '</b><span class="muted small">' + priceLabel(a) + '</span></div></div><span class="ok">' + icon('check') + '</span></div>' +
        (a.ups ? '<h3 class="h-sec">' + t('race_extras') + '</h3><p class="muted small">' + t('race_extras_sub') + '</p><div class="upsells">' + upsellsFor(a).map(function (u) {
          var on = f.upsells.indexOf(u.id) >= 0, up = priceFor(u);
          return '<button class="upsell' + (on ? ' on' : '') + '" data-action="upsell" data-v="' + u.id + '"><i>' + icon('check') + '</i><span>' + esc(L(u.title)) + '</span><b>' + (up.amount ? '+' + money(up.amount) : (up.unlocked ? t('free_for_level', { level: level().name }) : t('included'))) + '</b></button>'; }).join('') + '</div>' : '') +
        '<h3 class="h-sec">' + t('summary') + '</h3>' +
        '<div class="summary">' +
          '<div><span>' + t('stay') + ' · ' + f.nights + ' ' + (f.nights > 1 ? t('nights') : t('night')) + ' · ' + t('room_' + f.room) + '</span><b>' + money(q.stay) + '</b></div>' +
          '<div><span>' + t('activity') + ' × ' + f.guests + '</span><b>' + (q.activity ? money(q.activity) : (priceFor(a).unlocked ? t('free_for_level', { level: level().name }) : t('included'))) + '</b></div>' +
          q.ups.map(function (u) { return '<div class="ups-line"><span>' + esc(u.title) + '</span><b>' + (u.amount ? money(u.amount) : t('included')) + '</b></div>'; }).join('') +
          '<div class="perk"><span>' + icon('coffee') + t('direct_perk') + '<small>' + t('direct_perk_desc') + '</small></span><b>' + t('included') + '</b></div>' +
          '<div class="total"><span>' + t('total') + '</span><b>' + money(q.total) + '</b></div>' +
          '<small class="muted">' + t('taxes') + '</small>' +
        '</div>' +
        '<p class="secure">' + icon('shield') + t('direct_channel') + '</p>' +
      '</div></section>' +
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
      '<button class="btn btn-outline-light btn-block" data-action="pdf" data-id="' + b.id + '">' + icon('eye') + t('pdf_preview') + '</button>' +
      '<button class="btn btn-outline-light btn-block" data-action="go" data-href="wall/' + a.id + '">' + icon('chat') + t('meet_people') + '</button>' +
      '</section>';
  }

  /* ---------- Mi viaje y pase ---------- */
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
    var dist = L(a.distance).split(' / ')[0].split(' + ')[0]; if (/^(Día completo|Full day)$/.test(dist)) dist = '24H';
    return '<header class="subbar dark"><button class="icon-btn plain" data-action="go" data-href="trips">' + icon('back') + '</button><h2>' + t('active_pass') + '</h2><span></span></header>' +
      '<section class="pad">' +
      '<article class="pass' + (done ? ' is-done' : '') + '">' +
        '<div class="pass-top">' + lockup(true) + '<span class="pass-lbl">' + D.kinds[a.kind].name.toUpperCase() + '</span></div>' +
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
          ((b.upsells || []).length ? '<div class="wide"><small>' + t('race_extras') + '</small><b>' + b.upsells.map(function (u) { return esc(L(byId(D.upsells, u).title)); }).join(' · ') + '</b></div>' : '') +
        '</div>' +
        '<div class="perf"></div>' +
        '<div class="pass-qr">' + (done ? '<div class="qr-done">' + stampSvg(b.city, stampSport(a), actDate, { cls: 'stamp-ink', label: a.stampName }) + '</div>' : qrSvg(b.id)) +
          '<div class="pass-code"><small>' + t('code') + '</small><b class="mono">' + b.id + '</b></div></div>' +
      '</article>' +
      '<div class="pass-actions"><button class="btn btn-outline-light" data-action="pdf" data-id="' + b.id + '">' + icon('eye') + t('pdf_short') + '</button>' +
        '<button class="btn btn-outline-light" data-action="go" data-href="wall/' + a.id + '">' + icon('chat') + t('meet_short') + '</button></div>' +
      (done ? '<div class="done-banner">' + icon('check') + '<div><b>' + t('validated') + '</b><span>' + t('stamp_won') + ' · ' + esc(L(c.name)) + '</span></div></div>' +
        (stampOf(b) && stampOf(b).photo ? '<button class="btn btn-light btn-block mt12" data-action="go" data-href="memories">' + icon('image') + t('see_memory') + '</button>' : '<button class="btn btn-light btn-block mt12" data-action="photo" data-id="' + b.id + '">' + icon('camera') + t('photo_add') + '</button>') + suggestNext(b.city) :
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
    var a = recommended(20).filter(function (x) { return !have[x.city] && x.city !== fromCity && x.kind === 'local'; })[0];
    if (!a) return '';
    var c = city(a.city);
    return '<h3 class="h-sec">' + t('next_city') + '</h3><button class="suggest" data-action="go" data-href="activity/' + a.id + '" style="background-image:url(' + a.img + ')"><div><small>' + t('next_city_sub') + '</small><b>' + esc(L(c.name)) + '</b><span>' + esc(L(a.title)) + '</span></div>' + icon('chev') + '</button>';
  }

  /* ---------- Pasaporte ---------- */
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
      '<button class="tour-strip" data-action="go" data-href="tour">' + icon('trophy') + '<div><b>ACTIVE Tour ' + D.tour.season + '</b><span>' + t('tour_strip') + '</span></div>' + icon('chev') + '</button>' +
      '<h3 class="h-sec">' + t('my_stamps') + '</h3>' +
      '<div class="pp-page"><div class="stamp-grid">' +
        state.stamps.map(function (s) { return '<div class="slot' + (s.fresh ? ' fresh' : '') + '">' + stampSvg(s.city, s.sport, s.date, { cls: 'stamp-ink', label: stampLabel(s.activity) }) + '<small>' + fmtDate(s.date, { day: 'numeric', month: 'short', year: '2-digit' }) + '</small></div>'; }).join('') +
        missing.map(function (c) { return '<div class="slot empty"><div class="ghost"><span>' + esc(L(c.name)) + '</span></div><small>' + t('pending_stamp') + '</small></div>'; }).join('') +
      '</div></div>' +
      '<h3 class="h-sec">' + t('levels_perks') + '</h3>' +
      '<div class="levels">' + D.levels.map(function (x, i) {
        var un = i <= li;
        return '<div class="lv' + (un ? ' un' : '') + (i === li ? ' cur' : '') + '"><div class="lv-head"><b>' + x.name + '</b><span>' + esc(L(x.req)) + '</span>' + (un ? '<i class="lv-ok">' + icon('check') + '</i>' : '<i class="lv-lock">' + icon('lock') + '</i>') + '</div>' +
          '<ul>' + L(x.perks).map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ul></div>'; }).join('') + '</div>' +
      '<div class="mem-strips"><button class="tour-strip" data-action="go" data-href="memories">' + icon('cal') + '<div><b>' + t('memories_title') + '</b><span>' + t('memories_strip') + '</span></div>' + icon('chev') + '</button>' +
      '<button class="tour-strip wrap-strip" data-action="wrapped">' + icon('sparkle') + '<div><b>ACTIVE Wrapped ' + new Date().getFullYear() + '</b><span>' + t('wrapped_strip') + '</span></div>' + icon('chev') + '</button></div>' +
      '<button class="amb-strip" data-action="go" data-href="ambassador">' + icon('crown') + '<div><b>' + t('amb_title') + '</b><span>' + t('amb_strip') + '</span></div>' + icon('chev') + '</button>' +
      '<div class="st-note">' + icon('star') + '<div><b>' + t('st_title') + '</b><p>' + t('st_desc') + '</p></div></div>' +
      '</section>';
  }

  /* ---------- ACTIVE Tour ---------- */
  function vTour() {
    var tr = byId(D.tours, ui.tourId) || D.tours[0];
    var stops = D.activities.filter(function (a) { return a.tour === tr.id; });
    var done = state.stamps.filter(function (s) { return stops.some(function (x) { return x.id === s.activity; }); }).map(function (s) { return s.activity; });
    var booked = state.bookings.filter(function (b) { return stops.some(function (x) { return x.id === b.activity; }); }).map(function (b) { return b.activity; });
    var qual = stops.filter(function (x) { return !x.final; });
    var pts = done.length * D.tour.points.stop;
    var rank = tr.ranking.concat([{ name: state.user.name + ' (' + t('you') + ')', city: '', pts: pts, me: true }]).sort(function (a, b) { return b.pts - a.pts; });
    var next = qual.filter(function (x) { return done.indexOf(x.id) < 0; })[0] || stops[0];
    return subbar('ACTIVE Tour', null, true) +
      '<section class="pad tour">' +
        '<p class="tour-intro">' + esc(L(D.kinds.tour.what)) + '</p>' +
        '<div class="tour-tabs">' + D.tours.map(function (x) {
          return '<button class="tt' + (x.id === tr.id ? ' on' : '') + '" data-action="tour-tab" data-v="' + x.id + '" style="background-image:url(' + x.img + ')">' + sportIcon(x.sport) + '<b>' + esc(x.name.replace('ACTIVE Tour ', '')) + '</b></button>'; }).join('') + '</div>' +
        '<div class="tour-hero" style="background-image:linear-gradient(180deg, rgba(61,11,24,.55), rgba(61,11,24,.96)), url(' + tr.img + ')"><small>' + t('tour_season', { y: D.tour.season }) + '</small><h1 class="display">' + esc(tr.name) + '</h1><p>' + esc(L(tr.format)) + '</p>' +
          '<div class="tour-prog"><div><b>' + done.length + '/' + qual.length + '</b><span>' + t('tour_stops_done') + '</span></div><div><b>' + pts + '</b><span>' + t('points') + '</span></div><div><b>#' + (rank.findIndex(function (r) { return r.me; }) + 1) + '</b><span>' + t('ranking') + '</span></div></div></div>' +
        '<p class="inspired">' + icon('info') + t('tour_separate') + '</p>' +
        '<h3 class="h-sec">' + t('tour_calendar') + '</h3>' +
        '<ol class="tour-stops">' + stops.map(function (x) {
          var st = done.indexOf(x.id) >= 0 ? 'done' : booked.indexOf(x.id) >= 0 ? 'booked' : x.final ? 'final' : 'open';
          return '<li class="ts-' + st + '"><i>' + (st === 'done' ? icon('check') : x.final ? icon('trophy') : x.stop) + '</i><button data-action="go" data-href="activity/' + x.id + '"><b>' + esc(L(city(x.city).name)) + (x.final ? ' · Master Final' : '') + '</b><span>' + esc(L(x.when)) + '</span>' +
            '<em>' + (st === 'done' ? t('ts_done') : st === 'booked' ? t('ts_booked') : x.final ? t('invite_only') : priceLabel(x, true)) + '</em></button></li>'; }).join('') + '</ol>' +
        '<h3 class="h-sec">' + t('tour_rewards') + '</h3><ul class="checks light">' + L(D.tour.rewards).map(function (r) { return '<li>' + icon('trophy') + esc(r) + '</li>'; }).join('') + '</ul>' +
        '<h3 class="h-sec">' + t('ranking') + ' · ' + esc(tr.name.replace('ACTIVE Tour ', '')) + '</h3><div class="rank">' + rank.map(function (r, i) {
          return '<div class="rk' + (r.me ? ' me' : '') + (i < 3 ? ' top' : '') + '"><span>' + (i + 1) + '</span><b>' + esc(r.name) + '</b><small>' + esc(r.city) + '</small><em>' + r.pts + ' pts</em></div>'; }).join('') + '</div>' +
        '<button class="btn btn-light btn-block" data-action="go" data-href="activity/' + next.id + '">' + t('tour_join') + '</button>' +
      '</section>';
  }

  /* ---------- Programa Embajador ---------- */
  function vAmbassador() {
    var st = stats(), need = Math.max(0, 10 - st.count);
    return subbar(t('amb_title')) +
      '<section class="pad amb">' +
        '<div class="amb-hero">' + icon('crown') + '<h1 class="display dark-ink">' + t('amb_h1') + '</h1><p class="muted">' + t('amb_sub') + '</p></div>' +
        '<h3 class="h-sec">' + t('amb_benefits') + '</h3><ul class="checks">' + t('amb_benefits_list').split('|').map(function (b) { return '<li>' + icon('check') + esc(b) + '</li>'; }).join('') + '</ul>' +
        '<h3 class="h-sec">' + t('amb_how') + '</h3>' +
        '<div class="card"><b>' + t('amb_route1') + '</b><p class="muted small">' + t('amb_route1_d') + '</p><div class="spots"><i style="width:' + Math.min(100, st.count * 10) + '%"></i></div><small class="muted">' + (need ? t('amb_need', { n: need }) : t('amb_reached')) + '</small></div>' +
        '<div class="card"><b>' + t('amb_route2') + '</b><p class="muted small">' + t('amb_route2_d') + '</p></div>' +
        '<h3 class="h-sec">' + t('amb_form_title') + '</h3>' +
        (ui.ambSent ? '<div class="sent">' + icon('check') + '<b>' + t('amb_sent') + '</b></div>' :
        '<form id="amb-form" class="form-light">' +
          '<label class="field light"><span>' + t('amb_event_name') + '</span><input id="a-title" required maxlength="80" placeholder="' + t('amb_event_ph') + '"></label>' +
          '<div class="two"><label class="field light"><span>' + t('city') + '</span><select id="a-city">' + D.cities.map(function (c) { return '<option value="' + c.id + '">' + esc(L(c.name)) + '</option>'; }).join('') + '</select></label>' +
          '<label class="field light"><span>' + t('sport') + '</span><select id="a-sport">' + D.sports.map(function (s) { return '<option value="' + s.id + '">' + esc(L(s.label)) + '</option>'; }).join('') + '</select></label></div>' +
          '<label class="field light"><span>' + t('contact') + '</span><input id="a-contact" maxlength="120" placeholder="' + t('contact_ph') + '"></label>' +
          '<label class="field light"><span>' + t('amb_event_desc') + '</span><textarea id="a-desc" rows="3" maxlength="1000" placeholder="' + t('amb_event_desc_ph') + '"></textarea></label>' +
          '<button type="submit" class="btn btn-primary btn-block">' + t('amb_send') + '</button></form>') +
      '</section>';
  }

  /* ---------- Colabora con ACTIVE ---------- */
  var COLLAB_KINDS = ['sponsor', 'organizer', 'event', 'club', 'brand', 'ambassador', 'other'];
  function vCollab() {
    return subbar(t('collab_title'), state.user ? null : 'welcome') +
      '<section class="pad collab">' +
        '<div class="amb-hero">' + icon('handshake') + '<h1 class="display dark-ink">' + t('collab_h1') + '</h1><p class="muted">' + t('collab_sub') + '</p></div>' +
        '<div class="collab-grid">' + t('collab_ways').split('|').map(function (w) { var p = w.split('::'); return '<div><b>' + esc(p[0]) + '</b><span>' + esc(p[1]) + '</span></div>'; }).join('') + '</div>' +
        (ui.collabSent ? '<div class="sent">' + icon('check') + '<b>' + t('collab_sent') + '</b><p class="muted small">' + t('collab_sent_sub') + '</p></div>' :
        '<form id="collab-form" class="form-light">' +
          '<div class="field light"><span>' + t('collab_kind') + '</span><div class="sport-chips">' + COLLAB_KINDS.map(function (k) {
            return '<button type="button" class="schip' + (ui.collabKind === k ? ' on' : '') + '" data-action="collab-kind" data-v="' + k + '">' + t('ck_' + k) + '</button>'; }).join('') + '</div></div>' +
          '<div class="two"><label class="field light"><span>' + t('your_name') + '</span><input id="c-name" required maxlength="80" value="' + esc(state.user ? state.user.name : '') + '"></label>' +
          '<label class="field light"><span>' + t('company') + '</span><input id="c-company" maxlength="80" placeholder="' + t('optional') + '"></label></div>' +
          '<label class="field light"><span>' + t('contact') + '</span><input id="c-contact" required maxlength="120" placeholder="' + t('contact_ph') + '"></label>' +
          '<label class="field light"><span>' + t('city') + '</span><select id="c-city"><option value="">' + t('any_city') + '</option>' + D.cities.map(function (c) { return '<option value="' + c.id + '">' + esc(L(c.name)) + '</option>'; }).join('') + '</select></label>' +
          '<label class="field light"><span>' + t('collab_msg') + '</span><textarea id="c-msg" required rows="4" maxlength="1500" placeholder="' + t('collab_msg_ph') + '"></textarea></label>' +
          '<p class="muted small">' + t('collab_privacy') + '</p>' +
          '<button type="submit" class="btn btn-primary btn-block">' + t('collab_send') + '</button></form>') +
      '</section>';
  }
  async function submitCollab(kind, fields) {
    var row = { kind: kind, name: fields.name, company: fields.company || null, contact: fields.contact, city: fields.city || null, message: fields.message, user_id: state.user ? state.user.id : null };
    var r = await sb.from('collab_requests').insert(row);
    return !r.error;
  }


  /* ---------- Recuerdos: foto con marca de agua, calendario y Wrapped ---------- */
  function stampOf(b) { return state.stamps.filter(function (s) { return s.activity === b.activity && s.date === addDays(b.checkIn, 1); })[0]; }
  var photoUrls = {};
  async function signPhotos(paths) {
    paths = paths.filter(function (p) { return p && !photoUrls[p]; });
    if (!paths.length) return;
    var r = await sb.storage.from('memories').createSignedUrls(paths, 3600);
    (r.data || []).forEach(function (x) { if (x.signedUrl) photoUrls[x.path] = x.signedUrl; });
  }
  function svgToImage(svgText) {
    return new Promise(function (res, rej) {
      var img = new Image(); img.onload = function () { res(img); }; img.onerror = rej;
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgText);
    });
  }
  function fileToImage(file) {
    return new Promise(function (res, rej) {
      var url = URL.createObjectURL(file), img = new Image();
      img.onload = function () { res(img); }; img.onerror = rej; img.src = url;
    });
  }
  function wrapLines(ctx, text, maxW) {
    var words = text.split(' '), lines = [], cur = '';
    words.forEach(function (w) { var tst = cur ? cur + ' ' + w : w; if (ctx.measureText(tst).width > maxW && cur) { lines.push(cur); cur = w; } else cur = tst; });
    if (cur) lines.push(cur); return lines;
  }
  async function composeMemory(file, s) {
    var a = act(s.activity) || {}, c = city(s.city), W = 1080, H = 1350;
    var cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    var ctx = cv.getContext('2d');
    var img = await fileToImage(file);
    var sc = Math.max(W / img.width, H / img.height), w = img.width * sc, h = img.height * sc;
    ctx.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
    var g = ctx.createLinearGradient(0, H * 0.45, 0, H); g.addColorStop(0, 'rgba(61,11,24,0)'); g.addColorStop(1, 'rgba(61,11,24,.92)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    var g2 = ctx.createLinearGradient(0, 0, 0, 260); g2.addColorStop(0, 'rgba(0,0,0,.35)'); g2.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g2; ctx.fillRect(0, 0, W, 260);
    // Sello de la ciudad (marca de agua)
    var svg = stampSvg(s.city, s.sport, s.date, { flat: true, label: a.stampName }).replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" color="#ffffff" ');
    try {
      var st = await svgToImage(svg);
      ctx.save(); ctx.globalAlpha = 0.95; ctx.translate(W - 210, 210); ctx.rotate(-0.17); ctx.drawImage(st, -160, -160, 320, 320); ctx.restore();
    } catch (e) { console.warn('stamp', e); }
    // Logo ACTIVE by Eurostars
    ctx.save(); ctx.translate(56, H - 190); ctx.scale(1.05, 1.05); ctx.fillStyle = '#fff'; ctx.fill(new Path2D(LOGO_PATH), 'evenodd'); ctx.restore();
    ctx.fillStyle = '#fff'; ctx.textBaseline = 'alphabetic';
    ctx.font = '700 64px Oswald, "Arial Narrow", sans-serif'; ctx.fillText('ACTIVE', 176, H - 118);
    ctx.font = '600 24px Oswald, "Arial Narrow", sans-serif'; ctx.fillText('B Y   E U R O S T A R S', 178, H - 82);
    // Texto de la actividad
    ctx.font = '700 54px Oswald, "Arial Narrow", sans-serif';
    var lines = wrapLines(ctx, (L(a.title) || '').toUpperCase(), W - 112).slice(0, 2);
    var y0 = H - 300 - (lines.length - 1) * 60;
    lines.forEach(function (l, i) { ctx.fillText(l, 56, y0 + i * 60); });
    ctx.font = '500 30px Inter, -apple-system, sans-serif'; ctx.globalAlpha = .9;
    ctx.fillText(L(c.name) + '  ·  ' + fmtDate(s.date, { day: 'numeric', month: 'long', year: 'numeric' }), 58, H - 236);
    ctx.globalAlpha = 1;
    ctx.font = '600 22px Inter, -apple-system, sans-serif'; ctx.textAlign = 'right'; ctx.globalAlpha = .8;
    ctx.fillText('TRAVEL FURTHER. PLAY TOGETHER.', W - 56, H - 86); ctx.textAlign = 'left'; ctx.globalAlpha = 1;
    return new Promise(function (res) { cv.toBlob(function (b) { res(b); }, 'image/jpeg', 0.86); });
  }
  var photoTarget = null;
  function pickPhoto(bookingId, up) {
    photoTarget = { id: bookingId, up: up };
    var inp = document.getElementById('photo-input');
    if (!inp) { inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*'; inp.id = 'photo-input'; inp.hidden = true; document.body.appendChild(inp); }
    inp.value = ''; inp.click();
  }
  async function handlePhoto(file) {
    if (!file || !photoTarget) return;
    var b = booking(photoTarget.id), s = b && stampOf(b); if (!s) return;
    var up = photoTarget.up;
    showOverlay('<div class="spinner"></div><p>' + t('photo_making') + '</p>', 'ov-plain');
    try {
      await (document.fonts ? document.fonts.ready : Promise.resolve());
      var blob = await composeMemory(file, s);
      var path = state.user.id + '/' + s.activity + '-' + s.date + '.jpg';
      var r = await sb.storage.from('memories').upload(path, blob, { upsert: true, contentType: 'image/jpeg' });
      if (r.error) throw r.error;
      s.photo = path; save(); delete photoUrls[path];
      var url = URL.createObjectURL(blob);
      memoryShare = { blob: blob, name: 'ACTIVE-' + s.city + '-' + s.date + '.jpg' };
      showOverlay('<img class="mem-result" src="' + url + '" alt=""><small class="eyebrow">' + t('photo_saved') + '</small>' +
        '<div class="two mt12"><button class="btn btn-ghost" data-action="mem-share">' + icon('share') + t('share') + '</button><button class="btn btn-primary" data-action="' + (up ? 'after-stamp' : 'go-memories') + '" data-up="' + (up || '') + '">' + (up ? t('great') : t('memories_title')) + '</button></div>', 'ov-plain ov-mem');
    } catch (e) { console.warn(e); hideOverlay(); toast(t('photo_error')); }
  }
  var memoryShare = null;
  async function shareBlob(blob, name) {
    var file = new File([blob], name, { type: blob.type });
    if ('ontouchstart' in window && navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], title: 'ACTIVE by Eurostars' }); return; } catch (e) { if (e && e.name === 'AbortError') return; }
    }
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove();
  }

  function vMemories() {
    var stamps = state.stamps.slice().sort(function (a, b) { return a.date < b.date ? -1 : 1; });
    var months = {}; stamps.forEach(function (s) { months[s.date.slice(0, 7)] = 1; });
    var keys = Object.keys(months).sort();
    if (!ui.memMonth) ui.memMonth = keys.length ? keys[keys.length - 1] : new Date().toISOString().slice(0, 7);
    var ym = ui.memMonth, first = new Date(ym + '-01T12:00:00'), days = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
    var offset = (first.getDay() + 6) % 7, monthStamps = stamps.filter(function (s) { return s.date.slice(0, 7) === ym; });
    var byDay = {}; monthStamps.forEach(function (s) { (byDay[+s.date.slice(8, 10)] = byDay[+s.date.slice(8, 10)] || []).push(s); });
    var dows = lang === 'en' ? ['M', 'T', 'W', 'T', 'F', 'S', 'S'] : ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
    var cells = '';
    for (var i = 0; i < offset; i++) cells += '<div class="cd empty"></div>';
    for (var d = 1; d <= days; d++) {
      var ss = byDay[d];
      if (ss) { var s0 = ss[0], a0 = act(s0.activity) || {}; cells += '<button class="cd has" data-action="mem-open" data-v="' + esc(s0.activity + '|' + s0.date) + '" data-photo="' + esc(s0.photo || '') + '" style="background-image:url(' + (a0.img || '') + ')"><span>' + d + '</span>' + (s0.photo ? '<i>' + icon('camera') + '</i>' : '') + '</button>'; }
      else cells += '<div class="cd"><span>' + d + '</span></div>';
    }
    var idx = keys.indexOf(ym);
    return subbar(t('memories_title')) +
      '<section class="pad mem">' +
        '<p class="muted">' + t('memories_sub') + '</p>' +
        '<div class="cal-head"><button class="icon-btn small" data-action="mem-month" data-v="-1">' + icon('back') + '</button><b>' + first.toLocaleDateString(lang === 'en' ? 'en-GB' : 'es-ES', { month: 'long', year: 'numeric' }) + '</b><button class="icon-btn small" data-action="mem-month" data-v="1">' + icon('chev') + '</button></div>' +
        '<div class="cal">' + dows.map(function (x) { return '<div class="dow">' + x + '</div>'; }).join('') + cells + '</div>' +
        (keys.length ? '<div class="mem-jump">' + keys.map(function (k) { return '<button class="chip' + (k === ym ? ' on' : '') + '" data-action="mem-goto" data-v="' + k + '">' + new Date(k + '-01T12:00:00').toLocaleDateString(lang === 'en' ? 'en-GB' : 'es-ES', { month: 'short', year: '2-digit' }) + '</button>'; }).join('') + '</div>' : '') +
        '<div class="mem-list">' + (monthStamps.length ? monthStamps.map(function (s) {
          var a = act(s.activity) || {}, bk = state.bookings.filter(function (b) { return b.activity === s.activity && addDays(b.checkIn, 1) === s.date; })[0];
          return '<article class="mem-card"><div class="mem-img" data-photo="' + esc(s.photo || '') + '" style="background-image:url(' + (a.img || '') + ')">' + (s.photo ? '' : '<span class="mem-nophoto">' + icon('image') + t('no_photo') + '</span>') +
            '<div class="mem-stamp">' + stampSvg(s.city, s.sport, s.date, { cls: 'stamp-white', label: a.stampName }) + '</div></div>' +
            '<div class="mem-body"><b>' + esc(L(a.title) || s.activity) + '</b><span>' + esc(L(city(s.city).name)) + ' · ' + fmtDate(s.date, { weekday: 'long', day: 'numeric', month: 'long' }) + '</span>' +
            '<div class="mem-actions">' + (s.photo ? '<button class="btn btn-ghost btn-sm" data-action="mem-share-path" data-v="' + esc(s.photo) + '">' + icon('share') + t('share') + '</button>' : (bk ? '<button class="btn btn-primary btn-sm" data-action="photo" data-id="' + bk.id + '">' + icon('camera') + t('photo_add') + '</button>' : '')) + '</div></div></article>'; }).join('')
          : '<div class="empty-box">' + icon('cal') + '<p>' + t('memories_empty') + '</p></div>') + '</div>' +
        '<button class="wrap-cta" data-action="wrapped">' + icon('sparkle') + '<div><b>ACTIVE Wrapped ' + ym.slice(0, 4) + '</b><span>' + t('wrapped_cta') + '</span></div>' + icon('chev') + '</button>' +
      '</section>';
  }
  AFTER.memories = async function () {
    var els = [].slice.call(document.querySelectorAll('[data-photo]')).filter(function (e) { return e.getAttribute('data-photo'); });
    await signPhotos(els.map(function (e) { return e.getAttribute('data-photo'); }));
    els.forEach(function (e) { var u = photoUrls[e.getAttribute('data-photo')]; if (u) e.style.backgroundImage = 'url(' + u + ')'; });
  };

  function wrappedData(year) {
    var ss = state.stamps.filter(function (s) { return s.date.slice(0, 4) === String(year); });
    function top(key) { var m = {}; ss.forEach(function (s) { var k = key(s); m[k] = (m[k] || 0) + 1; }); var best = null; Object.keys(m).forEach(function (k) { if (!best || m[k] > m[best]) best = k; }); return best ? { k: best, n: m[best] } : null; }
    var cities = {}, sports = {}; ss.forEach(function (s) { cities[s.city] = 1; sports[s.sport] = 1; });
    return { year: year, stamps: ss, count: ss.length, cities: Object.keys(cities).length, sports: Object.keys(sports).length,
      topSport: top(function (s) { return s.sport; }), topCity: top(function (s) { return s.city; }), topMonth: top(function (s) { return s.date.slice(0, 7); }),
      photos: ss.filter(function (s) { return s.photo; }) };
  }
  function vWrapped() {
    var w = wrappedData(ui.wrapYear || new Date().getFullYear()), i = ui.wrapIdx;
    var slides = [];
    slides.push('<div class="sl sl-intro">' + isotype('wr-iso') + '<small>ACTIVE Wrapped</small><h1 class="display">' + t('wr_intro', { y: w.year }) + '</h1><p>' + t('wr_intro_sub', { name: esc(state.user.name) }) + '</p></div>');
    if (!w.count) slides.push('<div class="sl"><h2 class="display">' + t('wr_empty') + '</h2></div>');
    else {
      slides.push('<div class="sl"><small>' + t('wr_numbers') + '</small><div class="wr-big"><b>' + w.count + '</b><span>' + t('activities_done') + '</span></div><div class="wr-row"><div><b>' + w.cities + '</b><span>' + t('cities_done') + '</span></div><div><b>' + w.sports + '</b><span>' + t('wr_sports') + '</span></div><div><b>' + w.count + '</b><span>' + t('stamps') + '</span></div></div></div>');
      var sp = byId(D.sports, w.topSport.k) || {};
      slides.push('<div class="sl sl-img" style="background-image:url(' + (sp.img || '') + ')"><small>' + t('wr_top_sport') + '</small><div class="wr-ic">' + sportIcon(w.topSport.k) + '</div><h2 class="display">' + esc(sportLabel(w.topSport.k)) + '</h2><p>' + t('wr_times', { n: w.topSport.n }) + '</p></div>');
      var tc = city(w.topCity.k);
      slides.push('<div class="sl sl-img" style="background-image:url(' + tc.img + ')"><small>' + t('wr_top_city') + '</small><h2 class="display wr-city">' + esc(L(tc.name)) + '</h2><p>' + esc(tc.hotel) + ' · ' + t('wr_times', { n: w.topCity.n }) + '</p></div>');
      slides.push('<div class="sl"><small>' + t('wr_top_month') + '</small><h2 class="display">' + new Date(w.topMonth.k + '-01T12:00:00').toLocaleDateString(lang === 'en' ? 'en-GB' : 'es-ES', { month: 'long' }) + '</h2><p>' + t('wr_month_sub', { n: w.topMonth.n }) + '</p></div>');
      slides.push('<div class="sl"><small>' + t('wr_moments') + '</small><div class="wr-grid">' + w.stamps.slice(-6).map(function (s) { var a = act(s.activity) || {}; return '<div data-photo="' + esc(s.photo || '') + '" style="background-image:url(' + (a.img || '') + ')"></div>'; }).join('') + '</div><p>' + (w.photos.length ? t('wr_photos', { n: w.photos.length }) : t('wr_no_photos')) + '</p></div>');
      slides.push('<div class="sl sl-end"><small>' + t('wr_level') + '</small><h2 class="display">' + level().name + '</h2><div class="wr-stamps">' + w.stamps.slice(-4).map(function (s) { return stampSvg(s.city, s.sport, s.date, { cls: 'stamp-white', label: stampLabel(s.activity) }); }).join('') + '</div><p class="eyebrow">Travel further. Play together.</p>' +
        '<button class="btn btn-light" data-action="wr-share">' + icon('share') + t('wr_share') + '</button></div>');
    }
    if (i >= slides.length) i = ui.wrapIdx = slides.length - 1;
    return '<section class="story">' +
      '<div class="story-bars">' + slides.map(function (_, k) { return '<i class="' + (k < i ? 'done' : k === i ? 'cur' : '') + '"></i>'; }).join('') + '</div>' +
      '<button class="story-close icon-btn plain" data-action="go" data-href="passport" aria-label="' + t('close') + '">' + icon('x') + '</button>' +
      slides[i] +
      '<button class="story-nav prev" data-action="wr-nav" data-v="-1" aria-label="prev"></button><button class="story-nav next" data-action="wr-nav" data-v="1" aria-label="next"></button>' +
      '</section>';
  }
  AFTER.wrapped = AFTER.memories;
  async function shareWrapped() {
    var w = wrappedData(ui.wrapYear || new Date().getFullYear()), W = 1080, H = 1920;
    var cv = document.createElement('canvas'); cv.width = W; cv.height = H; var ctx = cv.getContext('2d');
    await (document.fonts ? document.fonts.ready : Promise.resolve());
    var g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#591225'); g.addColorStop(1, '#3D0B18'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.globalAlpha = .08; ctx.translate(380, 300); ctx.scale(9, 9); ctx.fillStyle = '#fff'; ctx.fill(new Path2D(LOGO_PATH), 'evenodd'); ctx.restore();
    ctx.save(); ctx.translate(80, 110); ctx.scale(1.3, 1.3); ctx.fillStyle = '#fff'; ctx.fill(new Path2D(LOGO_PATH), 'evenodd'); ctx.restore();
    ctx.fillStyle = '#fff'; ctx.font = '700 70px Oswald, sans-serif'; ctx.fillText('ACTIVE', 230, 200); ctx.font = '600 28px Oswald, sans-serif'; ctx.fillText('B Y   E U R O S T A R S', 232, 240);
    ctx.font = '700 120px Oswald, sans-serif'; ctx.fillText('WRAPPED ' + w.year, 80, 520);
    ctx.font = '500 44px Inter, sans-serif'; ctx.globalAlpha = .85; ctx.fillText(state.user.name + ' · ' + level().name, 84, 600); ctx.globalAlpha = 1;
    var rows = [[w.count, t('activities_done')], [w.cities, t('cities_done')], [w.sports, t('wr_sports')]];
    rows.forEach(function (r, k) { ctx.font = '700 200px Oswald, sans-serif'; ctx.fillText(String(r[0]), 80, 900 + k * 260); ctx.font = '600 44px Inter, sans-serif'; ctx.fillText(String(r[1]).toUpperCase(), 330, 860 + k * 260); });
    if (w.topSport) { ctx.font = '600 44px Inter, sans-serif'; ctx.fillText(t('wr_top_sport') + ': ' + sportLabel(w.topSport.k), 84, 1700); }
    if (w.topCity) ctx.fillText(t('wr_top_city') + ': ' + L(city(w.topCity.k).name), 84, 1770);
    ctx.font = '600 32px Inter, sans-serif'; ctx.globalAlpha = .8; ctx.fillText('TRAVEL FURTHER. PLAY TOGETHER.', 84, 1860);
    cv.toBlob(function (b) { shareBlob(b, 'ACTIVE-Wrapped-' + w.year + '.jpg'); }, 'image/jpeg', 0.9);
  }

  /* ---------- Comunidad + Partners ---------- */
  function partnerCard(p) {
    var acts = D.activities.filter(function (a) { return a.partnerId === p.id; });
    return '<article class="partner" id="p-' + p.id + '">' +
      '<div class="partner-logo">' + logoImg(p) + '</div>' +
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
        '<h2 class="h-sec">' + t('partners_title') + '</h2><p class="muted">' + t('partners_sub') + '</p></section>' + marquee() +
        '<section class="pad">' + D.partners.map(partnerCard).join('') + collabCta() + '</section>';
    }
    var list = D.meetups.filter(function (m) { return ui.commCity === 'all' || m.city === ui.commCity; });
    var mine = D.meetups.filter(function (m) { return state.joined.indexOf(m.id) >= 0; });
    var cities = D.cities.filter(function (c) { return D.meetups.some(function (m) { return m.city === c.id; }); });
    function card(m) {
      var j = state.joined.indexOf(m.id) >= 0, c = city(m.city), n = m.going + (j ? 1 : 0);
      var faces = ['LM', 'JP', 'AC', 'MR', 'SK'].slice(0, Math.min(4, n));
      return '<div class="meet"><div class="meet-ic">' + sportIcon(m.sport) + '</div><div class="meet-body">' +
        '<small class="muted">' + esc(L(c.name)) + ' · ' + esc(L(m.when)) + '</small><b>' + esc(L(m.title)) + '</b><span class="muted">' + esc(m.club) + ' · ' + esc(L(m.from)) + '</span>' +
        '<div class="meet-foot"><div class="faces">' + faces.map(function (f, i) { return '<i style="z-index:' + (5 - i) + '">' + (j && i === 0 ? initials(state.user.name) : f) + '</i>'; }).join('') + '<span>' + n + ' ' + t('going') + '</span></div>' +
        '<div class="meet-btns"><button class="icon-btn small" data-action="go" data-href="wall/' + m.id + '" aria-label="' + t('open_wall') + '">' + icon('chat') + '</button>' +
        '<button class="btn btn-sm ' + (j ? 'btn-ghost' : 'btn-primary') + '" data-action="join" data-id="' + m.id + '">' + (j ? icon('check') + t('joined') : t('join')) + '</button></div></div></div></div>';
    }
    return topbar() +
      '<section class="pad"><h1 class="display dark-ink">' + t('community_title') + '</h1>' + segs + '<p class="muted">' + t('community_sub') + '</p>' +
      '<div class="pulse"><i></i><b>' + (38 + state.joined.length) + '</b> ' + t('guests_now') + '</div></section>' +
      '<div class="chips"><button class="chip' + (ui.commCity === 'all' ? ' on' : '') + '" data-action="ccity" data-v="all">' + t('all') + '</button>' +
        cities.map(function (c) { return '<button class="chip' + (ui.commCity === c.id ? ' on' : '') + '" data-action="ccity" data-v="' + c.id + '">' + esc(L(c.name)) + '</button>'; }).join('') + '</div>' +
      '<section class="pad">' +
        (mine.length && ui.commCity === 'all' ? '<h3 class="h-sec">' + t('my_meetups') + '</h3>' + mine.map(card).join('') + '<h3 class="h-sec">' + t('all') + '</h3>' + list.filter(function (m) { return mine.indexOf(m) < 0; }).map(card).join('') : list.map(card).join('')) +
        '<button class="amb-strip light" data-action="go" data-href="ambassador">' + icon('crown') + '<div><b>' + t('amb_title') + '</b><span>' + t('amb_strip2') + '</span></div>' + icon('chev') + '</button>' +
      '</section>';
  }
  AFTER.community = function () {
    if (!ui.focusPartner) return;
    var el = document.getElementById('p-' + ui.focusPartner); ui.focusPartner = null;
    if (el) { var y = el.getBoundingClientRect().top + window.scrollY - 12; window.scrollTo(0, y); }
  };

  /* ---------- Perfil ---------- */
  function vProfile() {
    var u = state.user, li = levelIndex(), lv = D.levels[li], p = state.prefs || { goals: [], sports: [] };
    var perks = [];
    D.levels.forEach(function (x, i) { if (i <= li) perks = perks.concat(L(x.perks)); });
    return topbar() +
      '<section class="pad">' +
        '<div class="prof-head"><div class="avatar">' + initials(u.name) + '</div><div><h1 class="display dark-ink">' + esc(u.name) + '</h1><span class="muted">@' + esc(u.username) + '</span><br><span class="lvl-chip static">' + isotype('iso-xs') + lv.name + '</span></div></div>' +
        '<p class="synced">' + icon('shield') + t('synced') + '</p>' +

        '<h3 class="h-sec">' + t('my_benefits') + '</h3>' +
        '<div class="benefits">' +
          '<div class="ben-block"><small>' + icon('star') + t('benefits_level') + ' · ' + lv.name + '</small><ul class="checks">' + perks.map(function (x) { return '<li>' + icon('check') + esc(x) + '</li>'; }).join('') + '</ul></div>' +
          '<div class="ben-block"><small>' + icon('gift') + t('benefits_partners') + '</small>' + D.partners.slice(0, 4).map(function (pa) {
            return '<button class="ben-partner" data-action="partner" data-id="' + pa.id + '">' + logoImg(pa) + '<span>' + esc(L(pa.perks)[0]) + '</span>' + icon('chev') + '</button>'; }).join('') + '</div>' +
        '</div>' +
        '<a class="st-card" href="' + CFG.starTravelerUrl + '" target="_blank" rel="noopener">' +
          '<div class="st-top">' + icon('star') + '<b>' + t('st_card_title') + '</b><span>Eurostars Hotel Company</span></div>' +
          '<p>' + t('st_card_desc') + '</p><span class="st-cta">' + t('st_card_cta') + icon('ext') + '</span></a>' +

        '<h3 class="h-sec">' + t('my_prefs') + '</h3>' +
        '<div class="ben-block prefs-sum"><div class="sport-chips">' + (p.goals.length ? p.goals.map(function (g) { var go = byId(D.goals, g); return go ? '<span class="schip on static">' + icon(go.icon) + esc(L(go.label)) + '</span>' : ''; }).join('') : '<span class="muted small">' + t('prefs_none') + '</span>') + '</div>' +
          '<div class="sport-chips">' + p.sports.map(function (s) { return '<span class="schip static">' + sportIcon(s) + esc(sportLabel(s)) + '</span>'; }).join('') + '</div>' +
          '<button class="btn btn-ghost btn-sm" data-action="go" data-href="prefs">' + t('edit') + '</button></div>' +

        '<div class="list">' +
          '<button class="li li-btn" data-action="go" data-href="ambassador"><span>' + icon('crown') + t('amb_title') + '</span>' + icon('chev') + '</button>' +
          '<button class="li li-btn" data-action="go" data-href="collab"><span>' + icon('handshake') + t('collab_title') + '</span>' + icon('chev') + '</button>' +
          '<button class="li li-btn" data-action="go" data-href="tour"><span>' + icon('trophy') + 'ACTIVE Tour ' + D.tour.season + '</span>' + icon('chev') + '</button>' +
          '<button class="li li-btn" data-action="go" data-href="memories"><span>' + icon('cal') + t('memories_title') + '</span>' + icon('chev') + '</button>' +
          '<button class="li li-btn" data-action="wrapped"><span>' + icon('sparkle') + 'ACTIVE Wrapped</span>' + icon('chev') + '</button>' +
          '<div class="li"><span>' + icon('globe') + t('language') + '</span>' + langSwitch() + '</div>' +
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
          '<div class="card"><b>' + icon('handshake') + ' ' + t('collab_requests') + '</b><div id="adm-collab" class="adm-list muted small">' + t('loading') + '</div></div>' +
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
      var co = await sb.from('collab_requests').select('kind, name, company, contact, city, message, created_at').order('created_at', { ascending: false }).limit(20);
      var ce0 = document.getElementById('adm-collab');
      if (ce0) ce0.innerHTML = co.data && co.data.length ? co.data.map(function (c) {
        return '<div class="adm-item"><b>' + esc(t('ck_' + c.kind)) + ' · ' + esc(c.name) + (c.company ? ' (' + esc(c.company) + ')' : '') + '</b><span>' + esc(c.message) + '</span><span>' + esc(c.contact) + ' · ' + (c.city ? esc(L(city(c.city) ? city(c.city).name : c.city)) + ' · ' : '') + new Date(c.created_at).toLocaleDateString() + '</span></div>'; }).join('') : t('no_proposals');
      var pr = await sb.from('proposals').select('username, city, sport, idea, created_at').order('created_at', { ascending: false }).limit(15);
      var pe = document.getElementById('adm-proposals');
      if (pe) pe.innerHTML = pr.data && pr.data.length ? pr.data.map(function (p) {
        return '<div class="adm-item"><b>' + esc(p.idea) + '</b><span>@' + esc(p.username || '?') + ' · ' + esc([p.city, p.sport].filter(Boolean).join(' · ')) + ' · ' + new Date(p.created_at).toLocaleDateString() + '</span></div>'; }).join('') : t('no_proposals');
      var ch = await sb.from('chat_log').select('question, created_at').order('created_at', { ascending: false }).limit(10);
      var ce = document.getElementById('adm-chats');
      if (ce) ce.innerHTML = ch.data && ch.data.length ? ch.data.map(function (c) { return '<div class="adm-item"><b>“' + esc(c.question) + '”</b><span>' + new Date(c.created_at).toLocaleString() + '</span></div>'; }).join('') : '—';
    } catch (e) { console.warn(e); }
  };

  /* ---------- Stella (chat IA) ---------- */
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
    var st = stats(), p = state.prefs || { goals: [], sports: [] };
    return {
      lang: lang, contact: CFG.ownerEmail, name: state.user.name, level: level().name, count: st.count,
      sport: (p.sports.map(sportLabel).join(', ') || '—') + ' · Objetivos con ACTIVE: ' + (p.goals.map(function (g) { var go = byId(D.goals, g); return go ? L(go.label) : g; }).join(', ') || '—'),
      goals: p.goals.map(function (g) { var go = byId(D.goals, g); return go ? L(go.label) : g; }),
      prices: D.activities.filter(function (a) { return a.freeFrom; }).map(function (a) { return L(a.title) + ': ' + (priceFor(a).unlocked ? 'GRATIS para su nivel' : a.price + ' € para su nivel (gratis desde ' + levelName(a.freeFrom) + ')'); })
        .concat(D.upsells.filter(function (u) { return u.freeFrom; }).map(function (u) { return L(u.title) + ' (Race Weekend): ' + (priceFor(u).unlocked ? 'GRATIS para su nivel' : u.price + ' € para su nivel (gratis desde ' + levelName(u.freeFrom) + ')'); })),
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
  function authError(c) {
    var map = { invalid_username: 'err_invalid_username', weak_password: 'err_weak_password', username_taken: 'err_username_taken', bad_credentials: 'err_bad_credentials', network: 'err_network' };
    return t(map[c] || 'err_generic');
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
            body: JSON.stringify({ username: username, password: password, name: name, sport: 'both', state: { since: new Date().toISOString().slice(0, 10), prefs: { goals: [], sports: [] } } })
          });
        } catch (e) { throw new Error('network'); }
        var data = await resp.json().catch(function () { return {}; });
        if (!resp.ok) throw new Error(data.error || 'generic');
      }
      await signIn(username, password);
      ui.authBusy = false; ui.showPw = false; ui.prefsDraft = null;
      go(reg ? 'prefs' : 'explore');
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
      ui.authBusy = false; ui.city = 'all'; ui.kind = 'all';
      go('explore');
    } catch (e) { ui.authBusy = false; ui.authErr = authError(e.message === 'bad_credentials' ? 'generic' : e.message); keepForm(); }
  }
  function applyDemoData() {
    var d = D.demoState();
    state.stamps = d.stamps; state.bookings = d.bookings; state.joined = d.joined; state.prefs = d.prefs;
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
      var b = { id: code(), activity: a.id, city: a.city, checkIn: f.checkIn, nights: f.nights, guests: f.guests, room: f.room, upsells: f.upsells.slice(), total: q.total, status: 'upcoming', checkedIn: false, created: new Date().toISOString() };
      state.bookings.unshift(b); save(); ui.form = null; hideOverlay(); haptic();
      ensureAttending(a.id);
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
      showOverlay('<div class="stamp-drop">' + stampSvg(b.city, sport, date, { cls: 'stamp-white', flat: true, label: a.stampName }) + '</div>' +
        '<small class="eyebrow">' + t('stamp_won') + '</small><h2 class="display">' + esc(L(c.name)) + '</h2><p>' + esc(L(a.title)) + '</p>' +
        '<button class="btn btn-light btn-block" data-action="photo" data-id="' + b.id + '" data-up="' + (after > before ? after : '') + '">' + icon('camera') + t('photo_add') + '</button>' +
        '<button class="btn btn-outline-light btn-block mt8" data-action="after-stamp" data-up="' + (after > before ? after : '') + '" data-id="' + b.id + '">' + t('great') + '</button>', 'ov-dark');
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

  /* ---------- PDF de reserva (jsPDF) con vista previa (pdf.js) ---------- */
  var libs = {};
  function loadScript(key, src, test) {
    if (test()) return Promise.resolve();
    if (!libs[key]) libs[key] = new Promise(function (res, rej) {
      var sc = document.createElement('script'); sc.src = src;
      sc.onload = function () { res(); }; sc.onerror = function () { libs[key] = null; rej(new Error('load')); };
      document.head.appendChild(sc);
    });
    return libs[key];
  }
  function logoPng(color, px) {
    var c = document.createElement('canvas'); c.width = c.height = px || 300;
    var ctx = c.getContext('2d'); ctx.scale(c.width / 100, c.height / 100);
    ctx.fillStyle = color; ctx.fill(new Path2D(LOGO_PATH), 'evenodd');
    return c.toDataURL('image/png');
  }
  async function buildBookingPdf(b) {
    await loadScript('jspdf', 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js', function () { return !!window.jspdf; });
    var a = act(b.activity), c = city(b.city), actDate = addDays(b.checkIn, 1), q = quote(a, b);
    var doc = new window.jspdf.jsPDF({ unit: 'mm', format: 'a4' });
    var BUR = [89, 18, 37], CLA = [61, 11, 24], POR = [232, 235, 237], INK = [42, 9, 17], MUT = [111, 90, 96];
    var W = 210, M = 16, logoW = logoPng('#FFFFFF', 300);
    var longD = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    function txt(s, x, y, o) { doc.text(Array.isArray(s) ? s : String(s), x, y, o || {}); }
    function font(style, size, col) { doc.setFont('helvetica', style); doc.setFontSize(size); doc.setTextColor.apply(doc, col || INK); }
    function label(s, x, y) { font('bold', 7.5, MUT); doc.setCharSpace(0.6); txt(s.toUpperCase(), x, y); doc.setCharSpace(0); }
    function money2(n) { return n.toLocaleString('es-ES') + ' EUR'; }

    doc.setFillColor.apply(doc, BUR); doc.rect(0, 0, W, 66, 'F');
    doc.addImage(logoW, 'PNG', M - 2, 10, 26, 26, 'logoW', 'FAST');
    font('bold', 22, [255, 255, 255]); doc.setCharSpace(1.2); txt('ACTIVE', M + 27, 22); doc.setCharSpace(2.2); font('bold', 8, [255, 255, 255]); txt('BY EUROSTARS', M + 27.5, 28.5); doc.setCharSpace(0);
    font('normal', 8.5, [255, 255, 255]); txt('Travel further. Play together.', W - M, 18, { align: 'right' });
    font('bold', 8, [255, 255, 255]); txt(D.kinds[a.kind].name.toUpperCase(), W - M, 24, { align: 'right' });
    font('bold', 9, [255, 255, 255]); doc.setCharSpace(1); txt(t('pdf_title').toUpperCase(), M, 48); doc.setCharSpace(0);
    font('bold', 26, [255, 255, 255]); doc.setCharSpace(1.5); txt(b.id, M, 59); doc.setCharSpace(0);
    var status = b.status === 'completed' ? t('validated') : t('pdf_confirmed');
    font('bold', 8.5, BUR); var sw = doc.getTextWidth(status) + 10;
    doc.setFillColor(255, 255, 255); doc.roundedRect(W - M - sw, 51, sw, 9, 4.5, 4.5, 'F'); txt(status, W - M - sw / 2, 57, { align: 'center' });

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
    row(t('pdf_dates'), fmtDate(b.checkIn, longD) + '  -  ' + fmtDate(addDays(b.checkIn, b.nights), longD), b.nights + ' ' + (b.nights > 1 ? t('nights') : t('night')) + ' · ' + b.guests + ' ' + (b.guests > 1 ? t('guests') : t('guest')).toLowerCase() + ' · ' + t('room_' + b.room));
    section(t('activity'));
    row(L(a.title), a.partner, fmtDate(actDate, longD) + ' · ' + L(a.when) + ' · ' + L(a.distance));
    row(t('meeting_point'), L(a.meet));

    var qx = 140, qy = 78, qs = 54;
    doc.setFillColor.apply(doc, POR); doc.roundedRect(qx - 4, qy - 4, qs + 8, qs + 30, 4, 4, 'F');
    doc.setFillColor(255, 255, 255); doc.rect(qx, qy, qs, qs, 'F');
    var qm = qrMatrix(b.id), cell = (qs - 6) / qm.n; doc.setFillColor.apply(doc, CLA);
    qm.cells.forEach(function (p) { doc.rect(qx + 3 + p[0] * cell, qy + 3 + p[1] * cell, cell + 0.05, cell + 0.05, 'F'); });
    font('bold', 7.5, MUT); doc.setCharSpace(0.6); txt(t('active_pass').toUpperCase(), qx + qs / 2, qy + qs + 8, { align: 'center' }); doc.setCharSpace(0);
    font('bold', 13, CLA); txt(b.id, qx + qs / 2, qy + qs + 15, { align: 'center' });
    font('normal', 7.5, MUT); txt(doc.splitTextToSize(t('pdf_show_qr'), qs), qx + qs / 2, qy + qs + 20.5, { align: 'center' });

    y = Math.max(y, 178) + 2;
    var lines = [[t('stay') + ' · ' + b.nights + ' ' + (b.nights > 1 ? t('nights') : t('night')) + ' · ' + t('room_' + b.room), money2(q.stay)],
      [t('activity') + ' x ' + b.guests, q.activity ? money2(q.activity) : t('included')]];
    q.ups.forEach(function (u) { lines.push([u.title, u.amount ? money2(u.amount) : t('included')]); });
    lines.push([t('direct_perk') + ' (' + t('direct_perk_desc').toLowerCase() + ')', t('included')]);
    var boxH = 14 + lines.length * 7 + 10;
    doc.setFillColor.apply(doc, POR); doc.roundedRect(M, y, W - 2 * M, boxH, 4, 4, 'F');
    var yy = y + 10;
    lines.forEach(function (l) { font('normal', 9.5, INK); txt(doc.splitTextToSize(l[0], 140)[0], M + 8, yy); txt(l[1], W - M - 8, yy, { align: 'right' }); yy += 7; });
    doc.setDrawColor(200, 190, 194); doc.setLineWidth(0.3); doc.line(M + 8, yy - 3.5, W - M - 8, yy - 3.5);
    font('bold', 12, BUR); txt(t('total'), M + 8, yy + 3); txt(money2(b.total), W - M - 8, yy + 3, { align: 'right' });
    y += boxH + 8;

    var perks = []; D.levels.forEach(function (x, i) { if (i <= levelIndex()) perks = perks.concat(L(x.perks)); });
    if (y < 250) {
      font('bold', 10, BUR); doc.setCharSpace(0.8); txt((t('pdf_perks') + ' · ' + level().name).toUpperCase(), M, y); doc.setCharSpace(0); y += 6;
      font('normal', 9, INK);
      perks.slice(0, 4).forEach(function (p, i) { var cx = i % 2 ? W / 2 + 2 : M, cy = y + Math.floor(i / 2) * 6; doc.setFillColor.apply(doc, BUR); doc.circle(cx + 1.2, cy - 1.2, 0.9, 'F'); txt(doc.splitTextToSize(p, 85)[0], cx + 4, cy); });
      y += 14;
    }
    if (a.ups && y < 262) { font('normal', 8.5, MUT); txt(doc.splitTextToSize(t('direct_only') + '. ' + (a.ticketNote ? t('ticket_note') : t('bib_note')), W - 2 * M), M, y); }

    doc.setFillColor.apply(doc, CLA); doc.rect(0, 272, W, 25, 'F');
    doc.addImage(logoW, 'PNG', M - 1, 276.5, 13, 13, 'logoW', 'FAST');
    font('bold', 9, [255, 255, 255]); doc.setCharSpace(1); txt('TRAVEL FURTHER. PLAY TOGETHER.', M + 15, 282); doc.setCharSpace(0);
    font('normal', 7.5, [230, 210, 215]); txt(t('direct_channel') + ' · ' + new Date().toLocaleDateString(lang === 'en' ? 'en-GB' : 'es-ES'), M + 15, 287);
    txt(t('pdf_disclaimer'), W - M, 287, { align: 'right' });
    return doc;
  }
  var pdfState = null;
  async function previewPdf(id) {
    var b = booking(id); if (!b) return;
    showOverlay('<div class="spinner"></div><p>' + t('pdf_preparing') + '</p>', 'ov-plain');
    try {
      var doc = await buildBookingPdf(b);
      var blob = doc.output('blob');
      pdfState = { doc: doc, blob: blob, name: 'ACTIVE-' + b.id + '.pdf', id: b.id };
      await loadScript('pdfjs', 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js', function () { return !!window.pdfjsLib; });
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      var pdf = await window.pdfjsLib.getDocument({ data: new Uint8Array(await blob.arrayBuffer()) }).promise;
      var page = await pdf.getPage(1);
      var cssW = Math.min(window.innerWidth - 48, 460), vp0 = page.getViewport({ scale: 1 }), scale = cssW / vp0.width, dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      var vp = page.getViewport({ scale: scale * dpr });
      var canvas = document.createElement('canvas'); canvas.width = vp.width; canvas.height = vp.height; canvas.style.width = cssW + 'px';
      await page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise;
      overlay.className = 'overlay ov-pdf';
      overlay.innerHTML = '<div class="pdf-sheet"><div class="pdf-head"><b>' + icon('eye') + t('pdf_preview_title') + '</b><button class="icon-btn plain" data-action="pdf-close" aria-label="' + t('close') + '">' + icon('x') + '</button></div>' +
        '<div class="pdf-canvas"></div>' +
        '<div class="pdf-actions"><button class="btn btn-ghost" data-action="pdf-close">' + t('close') + '</button><button class="btn btn-primary" data-action="pdf-save">' + icon('download') + t('pdf_save') + '</button></div></div>';
      overlay.querySelector('.pdf-canvas').appendChild(canvas);
      overlay.hidden = false; requestAnimationFrame(function () { overlay.classList.add('in'); });
    } catch (e) {
      console.warn(e); hideOverlay(); toast(t('err_network'));
    }
  }
  async function savePdf() {
    if (!pdfState) return;
    var file = new File([pdfState.blob], pdfState.name, { type: 'application/pdf' });
    if ('ontouchstart' in window && navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], title: 'ACTIVE · ' + pdfState.id }); return; } catch (e) { if (e && e.name === 'AbortError') return; }
    }
    pdfState.doc.save(pdfState.name);
  }

  /* ---------- Eventos ---------- */
  function toggleIn(arr, v) { var i = arr.indexOf(v); if (i >= 0) arr.splice(i, 1); else arr.push(v); }
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-action]'); if (!el || el.disabled) return;
    var a = el.getAttribute('data-action'), v = el.getAttribute('data-v');
    switch (a) {
      case 'go': go(el.getAttribute('data-href')); break;
      case 'back': if (history.length > 1) history.back(); else go('explore'); break;
      case 'lang': setLang(v); break;
      case 'auth-tab': ui.authTab = v; ui.authErr = ''; keepForm(); break;
      case 'toggle-pw': ui.showPw = !ui.showPw; keepForm(); break;
      case 'demo': demoLogin(); break;
      case 'pref-goal': toggleIn(ui.prefsDraft.goals, v); rerenderKeepScroll(); break;
      case 'pref-sport': toggleIn(ui.prefsDraft.sports, v); rerenderKeepScroll(); break;
      case 'prefs-save': state.prefs = ui.prefsDraft; ui.prefsDraft = null; save(); toast(t('prefs_saved')); go('explore'); break;
      case 'prefs-skip': ui.prefsDraft = null; go('explore'); break;
      case 'city': ui.city = v; jumpToList(); break;
      case 'kind': ui.kind = v; jumpToList(); break;
      case 'ccity': ui.commCity = v; render(); break;
      case 'ctab': ui.commTab = v; render(); break;
      case 'partner': ui.commTab = 'partners'; ui.focusPartner = el.getAttribute('data-id'); go('community'); break;
      case 'step':
        var k = el.getAttribute('data-k'), d = +el.getAttribute('data-d');
        ui.form[k] = Math.max(1, Math.min(k === 'nights' ? 7 : 4, ui.form[k] + d)); rerenderKeepScroll(); break;
      case 'room': ui.form.room = v; rerenderKeepScroll(); break;
      case 'upsell': toggleIn(ui.form.upsells, v); rerenderKeepScroll(); break;
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
        if (ix >= 0) { state.joined.splice(ix, 1); toast(t('left_toast')); } else { state.joined.push(id); toast(t('joined_toast')); haptic(); ensureAttending(id); }
        save(); rerenderKeepScroll(); break;
      case 'attend': attendToggle(el.getAttribute('data-id')); break;
      case 'collab-kind': ui.collabKind = v; var cv = {}; ['c-name', 'c-company', 'c-contact', 'c-city', 'c-msg'].forEach(function (i) { var x = document.getElementById(i); if (x) cv[i] = x.value; }); rerenderKeepScroll(); Object.keys(cv).forEach(function (i) { var x = document.getElementById(i); if (x) x.value = cv[i]; }); break;
      case 'demo-data': applyDemoData(); go('explore'); break;
      case 'reset':
        if (confirm(t('reset_progress_confirm'))) { state.stamps = []; state.bookings = []; state.joined = []; save(); go('explore'); }
        break;
      case 'logout': if (confirm(t('logout_confirm'))) logout(); break;
      case 'ask': sendChat(el.getAttribute('data-q')); break;
      case 'pdf': previewPdf(el.getAttribute('data-id')); break;
      case 'pdf-save': savePdf(); break;
      case 'pdf-close': hideOverlay(); break;
      case 'sport-f': ui.sportF = ui.sportF === v ? 'all' : v; jumpToList(); break;
      case 'unf': ui[v] = 'all'; render(); break;
      case 'clear-f': ui.city = 'all'; ui.kind = 'all'; ui.sportF = 'all'; jumpToList(); break;
      case 'tour-tab': ui.tourId = v; rerenderKeepScroll(); break;
      case 'photo': pickPhoto(el.getAttribute('data-id'), el.getAttribute('data-up')); break;
      case 'mem-share': if (memoryShare) shareBlob(memoryShare.blob, memoryShare.name); break;
      case 'mem-share-path': (async function (pth) { await signPhotos([pth]); var r = await fetch(photoUrls[pth]); shareBlob(await r.blob(), pth.split('/').pop()); })(v); break;
      case 'go-memories': hideOverlay(); ui.memMonth = null; go('memories'); break;
      case 'mem-month': var dd = new Date(ui.memMonth + '-15T12:00:00'); dd.setMonth(dd.getMonth() + (+v)); ui.memMonth = dd.toISOString().slice(0, 7); render(); break;
      case 'mem-goto': ui.memMonth = v; render(); break;
      case 'mem-open': var pr = v.split('|'); var bb = state.bookings.filter(function (b) { return b.activity === pr[0] && addDays(b.checkIn, 1) === pr[1]; })[0]; var mc = document.querySelector('.mem-card'); if (mc) mc.scrollIntoView({ behavior: 'smooth' }); break;
      case 'wrapped': ui.wrapIdx = 0; ui.wrapYear = (state.stamps.map(function (s) { return s.date.slice(0, 4); }).sort().pop()) || new Date().getFullYear(); go('wrapped'); break;
      case 'wr-nav': ui.wrapIdx = Math.max(0, ui.wrapIdx + (+v)); if (+v < 0 || document.querySelectorAll('.story-bars i').length > ui.wrapIdx) render(); else go('passport'); break;
      case 'wr-share': shareWrapped(); break;
      case 'chat-clear': chat = []; saveChat(); render(); break;
    }
  });
  document.addEventListener('submit', async function (e) {
    var f = e.target;
    if (f.id === 'auth-form') { e.preventDefault(); submitAuth(); }
    if (f.id === 'chat-form') { e.preventDefault(); sendChat(document.getElementById('chat-text').value); }
    if (f.id === 'wall-form') { e.preventDefault(); postWall(f.getAttribute('data-id'), document.getElementById('wall-text').value); }
    if (f.id === 'collab-form') {
      e.preventDefault();
      var v = function (i) { return (document.getElementById(i).value || '').trim(); };
      if (!v('c-name') || v('c-contact').length < 3 || !v('c-msg')) { toast(t('form_missing')); return; }
      f.querySelector('button[type=submit]').disabled = true;
      var ok = await submitCollab(ui.collabKind, { name: v('c-name'), company: v('c-company'), contact: v('c-contact'), city: v('c-city'), message: v('c-msg') });
      if (ok) { ui.collabSent = true; rerenderKeepScroll(); } else { toast(t('err_generic')); f.querySelector('button[type=submit]').disabled = false; }
    }
    if (f.id === 'amb-form') {
      e.preventDefault();
      var g = function (i) { return (document.getElementById(i).value || '').trim(); };
      if (!g('a-title') || !g('a-desc')) { toast(t('form_missing')); return; }
      f.querySelector('button[type=submit]').disabled = true;
      var msg = '[' + g('a-sport') + '] ' + g('a-title') + ' — ' + g('a-desc') + ' (' + t('level') + ': ' + level().name + ', ' + stats().count + ' ' + t('activities_done') + ')';
      var ok2 = await submitCollab('ambassador', { name: state.user.name + ' (@' + state.user.username + ')', company: null, contact: g('a-contact') || '@' + state.user.username + ' (app)', city: g('a-city'), message: msg });
      if (ok2) { ui.ambSent = true; rerenderKeepScroll(); } else { toast(t('err_generic')); f.querySelector('button[type=submit]').disabled = false; }
    }
  });
  document.addEventListener('change', function (e) {
    if (e.target.id === 'f-checkin' && ui.form && e.target.value) { ui.form.checkIn = e.target.value; rerenderKeepScroll(); }
    if (e.target.id === 'kb-file') uploadKb(e.target.files[0]);
    if (e.target.id === 'photo-input') handlePhoto(e.target.files[0]);
  });
  document.addEventListener('input', function (e) {
    if (e.target.id === 'chat-text' || e.target.id === 'wall-text') { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'; }
  });
  document.addEventListener('keydown', function (e) {
    if ((e.target.id === 'chat-text' || e.target.id === 'wall-text') && e.key === 'Enter' && !e.shiftKey && !('ontouchstart' in window)) {
      e.preventDefault();
      if (e.target.id === 'chat-text') sendChat(e.target.value); else postWall(e.target.form.getAttribute('data-id'), e.target.value);
    }
  });
  function jumpToList() { render(); var y0 = document.getElementById('list-anchor'); if (y0) window.scrollTo(0, y0.getBoundingClientRect().top + window.scrollY - 8); }
  function rerenderKeepScroll() { var y = window.scrollY; render(); window.scrollTo(0, y); }

  window.addEventListener('hashchange', render);
  document.documentElement.lang = lang;

  /* ---------- Arranque ---------- */
  render();
  var splashMin = new Promise(function (r) { setTimeout(r, 1600); });
  (async function boot() {
    try {
      var s = await sb.auth.getSession();
      if (s.data && s.data.session) await loadProfile(s.data.session.user);
    } catch (e) { console.warn(e); }
    await splashMin;
    var sp = view.querySelector('.splash'); if (sp) { sp.classList.add('out'); await new Promise(function (r) { setTimeout(r, 380); }); }
    booted = true;
    render();
  })();
})();
