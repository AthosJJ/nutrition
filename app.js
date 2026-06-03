'use strict';

// ── Constants ──────────────────────────────────────────────
const JOUR_NAMES = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

const JOUR_DISPLAY = {
  dimanche: 'Dimanche', lundi: 'Lundi', mardi: 'Mardi',
  mercredi: 'Mercredi', jeudi: 'Jeudi', vendredi: 'Vendredi', samedi: 'Samedi',
};

const JOUR_ABBR = {
  dimanche: 'Dim.', lundi: 'Lun.', mardi: 'Mar.',
  mercredi: 'Mer.', jeudi: 'Jeu.', vendredi: 'Ven.', samedi: 'Sam.',
};

const SLOT_LABELS = {
  petit_dejeuner: 'Petit-déjeuner',
  collation: 'Collation',
  dejeuner: 'Déjeuner',
  diner: 'Dîner',
};

const SLOT_SHORT = {
  petit_dejeuner: 'matin',
  collation: 'collation',
  dejeuner: 'midi',
  diner: 'soir',
};

const FREE_MSG = {
  dejeuner: 'Midi libre — pas de repas prévu, à toi de jouer.',
  diner: 'Ce soir : repos. Pas de repas prévu cette semaine.',
  petit_dejeuner: 'Matin libre.',
};

const COURSES_SECTIONS = [
  { key: 'boucherie', label: 'Boucherie', emoji: '🥩', special: true },
  { key: 'poisson', label: 'Poisson & fruits de mer', emoji: '🐟', special: false },
  { key: 'fruits_legumes', label: 'Fruits & légumes', emoji: '🥦', special: false },
  { key: 'laitiers_oeufs', label: 'Produits laitiers & œufs', emoji: '🥛', special: false },
  { key: 'feculents_pain', label: 'Féculents & pain', emoji: '🌾', special: false },
  { key: 'epicerie_salee', label: 'Épicerie salée', emoji: '🥫', special: false },
  { key: 'epices_condiments', label: 'Épices, huiles & condiments', emoji: '🧂', special: false },
  { key: 'surgeles', label: 'Surgelés', emoji: '🧊', special: false },
];

// ── Emoji par ingrédient ───────────────────────────────────
// Recherché dans le nom normalisé (sans accents). Ordre = du plus
// spécifique au plus général. Pas de correspondance = pas d'emoji.
const EMOJI_MAP = [
  [['lait de coco', 'noix de coco', 'coco'], '🥥'],
  [['pomme de terre', 'pommes de terre'], '🥔'],
  [['huile'], '🫒'],
  [['poulet', 'dinde', 'volaille'], '🍗'],
  [['boeuf', 'steak', 'hache', 'viande'], '🥩'],
  [['saumon', 'cabillaud', 'poisson', 'thon', 'crevette', 'pave'], '🐟'],
  [['oeuf'], '🥚'],
  [['banane'], '🍌'],
  [['citron'], '🍋'],
  [['avocat'], '🥑'],
  [['tomate'], '🍅'],
  [['carotte'], '🥕'],
  [['courgette', 'concombre'], '🥒'],
  [['potimarron', 'potiron', 'courge'], '🎃'],
  [['oignon', 'echalote'], '🧅'],
  [['poivron'], '🫑'],
  [['ail'], '🧄'],
  [['brocoli'], '🥦'],
  [['haricot vert', 'haricots vert'], '🫛'],
  [['pois chiche', 'lentille', 'haricot'], '🫘'],
  [['epinard', 'salade', 'roquette', 'mache', 'laitue', 'chou'], '🥬'],
  [['pomme'], '🍎'],
  [['fruits rouges', 'fraise', 'framboise', 'myrtille', 'baie'], '🍓'],
  [['miel'], '🍯'],
  [['curry'], '🍛'],
  [['riz', 'basmati', 'semoule', 'boulgour', 'quinoa'], '🍚'],
  [['avoine', 'flocons', 'granola', 'muesli'], '🥣'],
  [['galette', 'wrap', 'tortilla'], '🌯'],
  [['pain', 'ble', 'pates', 'baguette'], '🍞'],
  [['amande', 'noix', 'noisette', 'cajou', 'graine'], '🥜'],
  [['feta', 'chevre', 'fromage', 'parmesan', 'mozzarella'], '🧀'],
  [['yaourt', 'skyr', 'lait', 'creme'], '🥛'],
  [['gingembre'], '🫚'],
  [['herbe', 'persil', 'coriandre', 'thym', 'basilic', 'menthe', 'ciboulette', 'aneth'], '🌿'],
  [['sel', 'poivre', 'cumin', 'paprika', 'muscade', 'epice', 'curcuma', 'piment', 'moutarde'], '🧂'],
];

function normalizeText(s) {
  return (s || '')
    .toLowerCase()
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

function ingredientEmoji(text) {
  const t = normalizeText(text);
  for (const [keys, emoji] of EMOJI_MAP) {
    if (keys.some(k => t.includes(k))) return emoji;
  }
  return '';
}

// ── SVG icon helpers ───────────────────────────────────────
const SVG = {
  chevron: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>`,
  chevronL: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 6.5"/></svg>`,
  fire: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c1 3-2 4-2 7a2 2 0 0 0 4 0c2 1.5 3 3.2 3 5a5 5 0 0 1-10 0c0-4 3-5 5-12z"/></svg>`,
  clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>`,
  user: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.5"/><path d="M5.5 19c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/></svg>`,
  leaf: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5 19c0-8 6-14 14-14 0 8-6 14-14 14z"/><path d="M5 19c4-4 7-6 11-7"/></svg>`,
  moon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M19 13.5A7 7 0 0 1 10.5 5a7 7 0 1 0 8.5 8.5z"/></svg>`,
  spark: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4l1.6 5.4L19 11l-5.4 1.6L12 18l-1.6-5.4L5 11l5.4-1.6z"/></svg>`,
  meat: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4a5 5 0 0 1 5 5c0 2.5-2 4.5-5 5l-6.5 6.5a2.1 2.1 0 0 1-3-3L11 11c.5-3 2.5-5 3-7z"/></svg>`,
  refresh: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12a8 8 0 1 1-2.34-5.66"/><path d="M20 4v4h-4"/></svg>`,
  star: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3.1l2.63 5.33 5.88.86-4.25 4.14 1 5.86L12 17.7l-5.26 2.76 1-5.86-4.25-4.14 5.88-.86z"/></svg>`,
  calendar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5.5" width="17" height="14.5" rx="3.5"/><line x1="3.5" y1="9.5" x2="20.5" y2="9.5"/><line x1="8" y1="3" x2="8" y2="6.5"/><line x1="16" y1="3" x2="16" y2="6.5"/></svg>`,
};

function icon(name, cls = '') {
  const el = SVG[name] || '';
  if (!cls) return el;
  return el.replace('<svg ', `<svg class="${cls}" `);
}

const RATING_LABELS = {
  0: 'Pas encore notée', 1: 'Horrible', 2: 'Pas bon',
  3: 'Normal', 4: 'Très bon', 5: 'Incroyable wsh',
};
const RATINGS_KEY = 'ratings:v1';

// ── App state ──────────────────────────────────────────────
let data = null;
let recipeMap = {};
let checkedItems = new Set();
let ratings = {}; // clé = nom de recette normalisé -> { rating, name, week, ratedAt }
let activeTab = 'aujourdhui';
let openDetailId = null;

// ── Init ───────────────────────────────────────────────────
async function init() {
  try {
    const res = await fetch('./data/semaine.json');
    if (!res.ok) throw new Error('Fetch failed');
    data = await res.json();
  } catch (e) {
    document.getElementById('content-aujourdhui').innerHTML =
      `<p style="color:#c0563b;padding:24px 0">Impossible de charger les données. Vérifiez votre connexion.</p>`;
    return;
  }

  recipeMap = Object.fromEntries(data.recettes.map(r => [r.id, r]));
  checkedItems = loadChecked();
  ratings = loadRatings();

  renderToday();
  renderSemaine();
  renderRecettes();
  renderCourses();
  setupTabs();
  setupDetailHandlers();
  setupCoursesHandlers();
  setupUpdateHandler();
  setupExportHandlers();
}

// ── Manual update (PWA cache refresh) ──────────────────────
// iOS garde le shell (HTML/CSS/JS) en cache. Ce bouton va chercher
// la dernière version du service worker, puis recharge la page pour
// servir le nouveau code et le menu à jour (semaine.json en network-first).
function setupUpdateHandler() {
  document.getElementById('app').addEventListener('click', e => {
    const btn = e.target.closest('[data-action="refresh"]');
    if (btn) triggerUpdate(btn);
  });
}

async function triggerUpdate(btn) {
  if (btn.classList.contains('is-updating')) return;
  btn.classList.add('is-updating');
  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        await reg.update();
        const fresh = reg.installing || reg.waiting;
        if (fresh) {
          await new Promise(resolve => {
            const timer = setTimeout(resolve, 4000);
            fresh.addEventListener('statechange', () => {
              if (fresh.state === 'activated' || fresh.state === 'redundant') {
                clearTimeout(timer);
                resolve();
              }
            });
          });
        }
      }
    }
  } catch (_) {
    // hors-ligne ou pas de SW : on recharge quand même
  }
  location.reload();
}

// ── Tab navigation ─────────────────────────────────────────
function setupTabs() {
  document.querySelectorAll('.tab').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      if (tab === activeTab && !openDetailId) return;

      // Close detail if open
      if (openDetailId) closeDetail();

      // Switch tab
      document.querySelectorAll('.tab').forEach(t => {
        t.classList.toggle('is-active', t.dataset.tab === tab);
        t.setAttribute('aria-current', t.dataset.tab === tab ? 'page' : 'false');
      });

      document.querySelectorAll('.tab-section').forEach(s => {
        const isActive = s.id === `section-${tab}`;
        s.classList.toggle('is-active', isActive);
        s.hidden = !isActive;
        if (isActive) s.scrollTop = 0;
      });

      activeTab = tab;
    });
  });
}

// ── Recipe detail ──────────────────────────────────────────
function setupDetailHandlers() {
  // Open via event delegation on all sections
  document.getElementById('app').addEventListener('click', e => {
    // Notation par étoiles (dans la fiche ouverte)
    const star = e.target.closest('[data-rate]');
    if (star) {
      const r = recipeMap[openDetailId];
      if (r) {
        const v = Number(star.dataset.rate);
        setRating(r, getRating(r.nom) === v ? 0 : v); // re-tap = on enlève la note
        const block = document.getElementById('rating-block');
        if (block) block.innerHTML = ratingInnerHTML(r);
        renderRecettes(); // rafraîchit les étoiles dans la liste
      }
      return;
    }

    const trigger = e.target.closest('[data-recipe-id]');
    if (trigger) openDetail(trigger.dataset.recipeId);

    if (e.target.closest('#btn-back-detail')) closeDetail();
  });

  // Swipe pour fermer : vers le bas, ou vers la droite (retour façon iOS)
  const overlay = document.getElementById('detail-overlay');
  let touchStartY = 0, touchStartX = 0;
  overlay.addEventListener('touchstart', e => {
    touchStartY = e.touches[0].clientY;
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  overlay.addEventListener('touchend', e => {
    const dy = e.changedTouches[0].clientY - touchStartY;
    const dx = e.changedTouches[0].clientX - touchStartX;
    // Swipe vers le bas depuis le haut de la page
    if (dy > 80 && Math.abs(dy) > Math.abs(dx) && overlay.scrollTop === 0) { closeDetail(); return; }
    // Swipe gauche -> droite franc = retour
    if (dx > 80 && Math.abs(dx) > Math.abs(dy) * 2) { closeDetail(); }
  }, { passive: true });
}

function openDetail(id) {
  const recipe = recipeMap[id];
  if (!recipe) return;
  openDetailId = id;

  document.getElementById('content-detail').innerHTML = renderDetailHTML(recipe);

  const overlay = document.getElementById('detail-overlay');
  overlay.hidden = false;
  overlay.setAttribute('aria-hidden', 'false');
  overlay.scrollTop = 0;
  // Trigger animation next frame
  requestAnimationFrame(() => requestAnimationFrame(() => overlay.classList.add('is-open')));
}

function closeDetail() {
  openDetailId = null;
  const overlay = document.getElementById('detail-overlay');
  overlay.classList.remove('is-open');
  overlay.addEventListener('transitionend', () => {
    overlay.hidden = true;
    overlay.setAttribute('aria-hidden', 'true');
  }, { once: true });
}

// ── Courses handlers ───────────────────────────────────────
function setupCoursesHandlers() {
  document.getElementById('content-courses').addEventListener('click', e => {
    const item = e.target.closest('.course-item[data-item-key]');
    if (item) toggleItem(item.dataset.itemKey);

    if (e.target.closest('#btn-reset-courses')) {
      checkedItems.clear();
      saveChecked();
      renderCourses();
    }
  });
}

function toggleItem(key) {
  if (checkedItems.has(key)) checkedItems.delete(key);
  else checkedItems.add(key);
  saveChecked();
  // Re-render only courses for performance
  renderCourses();
  // Restore scroll position
}

// ── LocalStorage ───────────────────────────────────────────
function loadChecked() {
  if (!data) return new Set();
  const currentKey = `courses:${data.label_semaine}`;
  // Clean old weeks
  Object.keys(localStorage)
    .filter(k => k.startsWith('courses:') && k !== currentKey)
    .forEach(k => localStorage.removeItem(k));
  try {
    return new Set(JSON.parse(localStorage.getItem(currentKey) || '[]'));
  } catch {
    return new Set();
  }
}

function saveChecked() {
  if (!data) return;
  localStorage.setItem(`courses:${data.label_semaine}`, JSON.stringify([...checkedItems]));
}

// ── Notes des recettes (1–5) ───────────────────────────────
// Indexées par NOM de recette (les ids r1/r2… changent quand on
// remplace semaine.json). Stockées en localStorage, donc conservées
// même quand le menu est remplacé.
function ratingKey(name) {
  return (name || '').trim().toLowerCase();
}

function loadRatings() {
  try {
    return JSON.parse(localStorage.getItem(RATINGS_KEY) || '{}') || {};
  } catch {
    return {};
  }
}

function saveRatings() {
  localStorage.setItem(RATINGS_KEY, JSON.stringify(ratings));
}

function getRating(name) {
  const e = ratings[ratingKey(name)];
  return e ? e.rating : 0;
}

function setRating(recipe, value) {
  const k = ratingKey(recipe.nom);
  if (!value) {
    delete ratings[k];
  } else {
    ratings[k] = {
      rating: value,
      name: recipe.nom,
      week: (data && data.label_semaine) || '',
      ratedAt: new Date().toISOString().slice(0, 10),
    };
  }
  saveRatings();
}

function ratingInnerHTML(r) {
  const cur = getRating(r.nom);
  const stars = [1, 2, 3, 4, 5].map(n =>
    `<button class="star-btn${n <= cur ? ' is-on' : ''}" type="button" data-rate="${n}" aria-label="${n} sur 5 — ${RATING_LABELS[n]}">${icon('star')}</button>`
  ).join('');
  return `<span class="rating-caption">Ta note</span>
    <div class="rating-stars">${stars}</div>
    <span class="rating-label${cur ? ' is-set' : ''}">${RATING_LABELS[cur]}</span>`;
}

// ── Helpers ────────────────────────────────────────────────
function todayIndex() {
  return new Date().getDay(); // 0=Sunday
}

function todayJour() {
  const name = JOUR_NAMES[todayIndex()];
  return data.jours.find(j => j.jour === name) || data.jours[0];
}

function getRecipe(id) {
  return id ? recipeMap[id] : null;
}

// Collect ordered meal slots for a jour object
function jourSlots(jour) {
  const slots = [];
  if (jour.petit_dejeuner !== undefined) {
    slots.push({ slot: 'petit_dejeuner', id: jour.petit_dejeuner });
  }
  (jour.collations || []).forEach(id => slots.push({ slot: 'collation', id }));
  if (jour.dejeuner !== undefined) slots.push({ slot: 'dejeuner', id: jour.dejeuner });
  if (jour.diner !== undefined) slots.push({ slot: 'diner', id: jour.diner });
  return slots;
}

function macrosHTML(macros) {
  return `<span class="macros">
    <span class="macro macro-kcal">${icon('fire')} ${macros.kcal} kcal</span>
    <span class="macro">P ${macros.P} g</span>
    <span class="macro">G ${macros.G} g</span>
    <span class="macro">L ${macros.L} g</span>
  </span>`;
}

function mealCardHTML(recipe, slotLabel, slotKey) {
  return `<button class="meal-card" data-meal="${slotKey}" data-recipe-id="${recipe.id}">
    <span class="meal-stripe"></span>
    <span class="meal-body">
      <span class="meal-slot"><span class="meal-dot"></span>${slotLabel}</span>
      <span class="meal-name">${esc(recipe.nom)}</span>
      ${macrosHTML(recipe.macros)}
    </span>
    <span class="meal-chev">${icon('chevron')}</span>
  </button>`;
}

function freeCardHTML(slotKey) {
  return `<div class="free-card">
    <span class="free-icon">${icon('moon')}</span>
    <span class="free-body">
      <span class="free-slot">${SLOT_LABELS[slotKey]}</span>
      <span class="free-msg">${FREE_MSG[slotKey] || 'Créneau libre.'}</span>
    </span>
  </div>`;
}

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Render: Today ──────────────────────────────────────────
function renderToday() {
  const jour = todayJour();
  const dayIdx = todayIndex();
  const citation = data.citations[dayIdx % data.citations.length];
  const slots = jourSlots(jour);
  const label = JOUR_DISPLAY[jour.jour] || jour.jour;
  const dateStr = jour.date_affichee || '';

  // Compute total macros
  let total = { kcal: 0, P: 0, G: 0, L: 0 };
  slots.forEach(({ id }) => {
    const r = getRecipe(id);
    if (r) { total.kcal += r.macros.kcal; total.P += r.macros.P; total.G += r.macros.G; total.L += r.macros.L; }
  });
  const hasFood = slots.some(({ id }) => id);

  const mealItems = slots.map(({ slot, id }) => {
    if (!id) return freeCardHTML(slot);
    const r = getRecipe(id);
    if (!r) return '';
    return mealCardHTML(r, SLOT_LABELS[slot], slot);
  }).join('');

  const sourceHTML = citation.source
    ? `<p class="quote-source">${esc(citation.source)}</p>` : '';

  document.getElementById('content-aujourdhui').innerHTML = `
    <div class="today-head">
      <div class="today-headings">
        <div class="today-eyebrow">Aujourd'hui</div>
        <h1 class="today-date">${esc(label)}${dateStr ? ' ' + esc(dateStr) : ''}</h1>
      </div>
      <button class="refresh-btn" type="button" data-action="refresh" aria-label="Mettre à jour le menu" title="Mettre à jour">${icon('refresh')}</button>
    </div>

    <div class="quote-card">
      <span class="quote-mark">"</span>
      <p class="quote-text">${esc(citation.texte)}</p>
      ${sourceHTML}
    </div>

    <h2 class="section-title">Aujourd'hui c'est :</h2>
    <div class="meal-list">${mealItems}</div>

    ${hasFood ? `<div class="total-card">
      <div class="total-head">
        <span class="total-label">Total du jour</span>
        <span class="total-kcal">${icon('fire')} ${total.kcal} kcal</span>
      </div>
      <div class="total-macros">
        <div class="tm"><span class="tm-v">${total.P} g</span><span class="tm-l">Protéines</span></div>
        <div class="tm"><span class="tm-v">${total.G} g</span><span class="tm-l">Glucides</span></div>
        <div class="tm"><span class="tm-v">${total.L} g</span><span class="tm-l">Lipides</span></div>
      </div>
    </div>` : ''}
  `;
}

// ── Render: Week ───────────────────────────────────────────
function renderSemaine() {
  const todayName = JOUR_NAMES[todayIndex()];

  const dayCards = data.jours.map(jour => {
    const isToday = jour.jour === todayName;
    const slots = jourSlots(jour);
    const label = JOUR_DISPLAY[jour.jour] || jour.jour;
    const dateStr = jour.date_affichee || '';

    const rows = slots.map(({ slot, id }) => {
      if (!id) {
        return `<div class="day-row is-free">
          <span class="row-slot">${SLOT_LABELS[slot]}</span>
          <span class="row-free">— libre</span>
        </div>`;
      }
      const r = getRecipe(id);
      if (!r) return '';
      return `<button class="day-row" data-meal="${slot}" data-recipe-id="${r.id}">
        <span class="row-slot"><span class="row-dot"></span>${SLOT_LABELS[slot]}</span>
        <span class="row-name">${esc(r.nom)}</span>
        <span class="row-chev">${icon('chevron')}</span>
      </button>`;
    }).join('');

    return `<div class="day-card${isToday ? ' is-today' : ''}">
      <div class="day-card-head">
        <span class="day-name">${esc(label)}</span>
        ${dateStr ? `<span class="day-date">${esc(dateStr)}</span>` : ''}
        ${isToday ? `<span class="today-badge">Aujourd'hui</span>` : ''}
      </div>
      <div class="day-rows">${rows}</div>
    </div>`;
  }).join('');

  document.getElementById('content-semaine').innerHTML = `
    <div class="screen-head">
      <h1 class="screen-h1">Semaine</h1>
    </div>

    <div class="week-banner">
      <div class="week-chips">
        <span class="info-chip">${icon('user')} ${data.personnes} pers.</span>
        <span class="info-chip">${icon('spark')} Batch cooking ${data.batch_cooking ? 'oui' : 'non'}</span>
      </div>
      <p class="week-balance">${icon('leaf')} ${esc(data.equilibre_semaine)}</p>
    </div>

    <div class="week-list">${dayCards}</div>
  `;
}

// ── Render: Recipes list ───────────────────────────────────
function renderRecettes() {
  const groups = data.jours.map(jour => {
    const slots = jourSlots(jour).filter(({ id }) => id);
    if (!slots.length) return '';

    const label = JOUR_DISPLAY[jour.jour] || jour.jour;
    const rows = slots.map(({ slot, id }) => {
      const r = getRecipe(id);
      if (!r) return '';
      const total = r.prep_min + r.cuisson_min;
      return `<button class="recipe-row" data-recipe-id="${r.id}">
        <span class="recipe-row-tag" data-meal="${slot}">${JOUR_ABBR[jour.jour] || ''} ${SLOT_SHORT[slot] || slot}</span>
        <span class="recipe-row-main">
          <span class="recipe-row-name">${esc(r.nom)}</span>
          <span class="recipe-row-meta">
            <span>${icon('clock')} ${total} min</span>
            <span>${icon('user')} ${r.portions} pers.</span>
            <span>${r.macros.kcal} kcal</span>
            ${getRating(r.nom) ? `<span class="row-rating" aria-label="Note ${getRating(r.nom)} sur 5">${'★'.repeat(getRating(r.nom))}</span>` : ''}
          </span>
        </span>
        <span class="recipe-chev">${icon('chevron')}</span>
      </button>`;
    }).join('');

    return `<div class="recipe-day">
      <div class="recipe-day-label">${esc(label)}</div>
      ${rows}
    </div>`;
  }).join('');

  const rated = Object.keys(ratings).length;
  document.getElementById('content-recettes').innerHTML = `
    <div class="screen-head screen-head-row">
      <div>
        <h1 class="screen-h1">Recettes</h1>
        <p class="screen-sub">Groupées par jour et par repas</p>
      </div>
      <button class="export-btn" id="btn-export" type="button">${icon('spark')} Exporter mes notes${rated ? ` (${rated})` : ''}</button>
    </div>
    <div class="recipe-groups">${groups}</div>
  `;
}

// ── Export des notes ───────────────────────────────────────
function ratingsExportText() {
  const entries = Object.values(ratings)
    .sort((a, b) => b.rating - a.rating || a.name.localeCompare(b.name));
  if (!entries.length) return 'Aucune recette notée pour l’instant.';
  const lines = entries.map(e =>
    `${'★'.repeat(e.rating)}${'☆'.repeat(5 - e.rating)}  ${e.name} (${e.rating}/5)`
  );
  return `Notes recettes — Coach Nutrition\n${'—'.repeat(28)}\n${lines.join('\n')}`;
}

function ratingsExportJSON() {
  const entries = Object.values(ratings)
    .sort((a, b) => b.rating - a.rating || a.name.localeCompare(b.name))
    .map(e => ({ recette: e.name, note: e.rating, semaine: e.week, le: e.ratedAt }));
  return JSON.stringify(entries, null, 2);
}

function openExport() {
  const text = ratingsExportText();
  const sheet = document.getElementById('export-sheet');
  document.getElementById('export-text').value = text;
  sheet.hidden = false;
  requestAnimationFrame(() => sheet.classList.add('is-open'));
}

function closeExport() {
  const sheet = document.getElementById('export-sheet');
  sheet.classList.remove('is-open');
  sheet.addEventListener('transitionend', () => { sheet.hidden = true; }, { once: true });
}

async function copyText(str, btn) {
  let ok = false;
  try {
    await navigator.clipboard.writeText(str);
    ok = true;
  } catch {
    // Repli pour iOS / contexte non sécurisé
    const ta = document.getElementById('export-text');
    ta.value = str;
    ta.removeAttribute('readonly');
    ta.select();
    ta.setSelectionRange(0, str.length);
    try { ok = document.execCommand('copy'); } catch { ok = false; }
    ta.setAttribute('readonly', '');
  }
  if (btn) {
    const old = btn.textContent;
    btn.textContent = ok ? '✓ Copié' : 'Sélectionne puis copie';
    setTimeout(() => { btn.textContent = old; }, 1600);
  }
}

function setupExportHandlers() {
  document.getElementById('content-recettes').addEventListener('click', e => {
    if (e.target.closest('#btn-export')) openExport();
  });
  const sheet = document.getElementById('export-sheet');
  sheet.addEventListener('click', e => {
    if (e.target.closest('[data-export-close]')) { closeExport(); return; }
    if (e.target.closest('#export-copy-text')) { copyText(ratingsExportText(), e.target.closest('#export-copy-text')); return; }
    if (e.target.closest('#export-copy-json')) { copyText(ratingsExportJSON(), e.target.closest('#export-copy-json')); return; }
  });
}

// ── Render: Recipe detail ──────────────────────────────────
function renderDetailHTML(r) {
  const ingredients = r.ingredients.map(ing => {
    const e = ingredientEmoji(ing);
    const emojiCol = `<span class="ing-emoji" aria-hidden="true">${e}</span>`;
    // Try to split "Xg/ml/c. ... name" — display as quantity + name if possible
    const parts = ing.match(/^(\d[\d\s/.,]*(?:kg|g|ml|cl|l|c\.\s*à\s*[sc]\.?|poignée|boîte|pavé|dos|tranche|blanc|botte|sachet)(?![a-zà-ÿ])[^a-zA-ZÀ-ÿ]*)(.*)/i);
    if (parts) {
      return `<li>${emojiCol}<span class="ing-q">${esc(parts[1].trim())}</span><span class="ing-n">${esc(parts[2].trim())}</span></li>`;
    }
    return `<li>${emojiCol}<span class="ing-q"></span><span class="ing-n">${esc(ing)}</span></li>`;
  }).join('');

  const steps = r.etapes.map((s, i) =>
    `<li><span class="step-n">${i + 1}</span><span class="step-t">${esc(s)}</span></li>`
  ).join('');

  const prepCallout = (data.batch_cooking && r.prep_dimanche) ? `
    <div class="callout callout-prep">
      <span class="callout-icon">${icon('calendar')}</span>
      <div>
        <span class="callout-label">Prep du dimanche</span>
        <p>${esc(r.prep_dimanche)}</p>
      </div>
    </div>` : '';

  const halalCallout = r.substitution_halal ? `
    <div class="callout">
      <span class="callout-icon">${icon('meat')}</span>
      <div>
        <span class="callout-label">Substitution halal</span>
        <p>${esc(r.substitution_halal)}</p>
      </div>
    </div>` : '';

  const batchCallout = r.astuce_batch ? `
    <div class="callout">
      <span class="callout-icon">${icon('spark')}</span>
      <div>
        <span class="callout-label">Astuce batch cooking</span>
        <p>${esc(r.astuce_batch)}</p>
      </div>
    </div>` : '';

  return `
    <button class="back-btn" id="btn-back-detail">${icon('chevronL')} Retour</button>
    <h1 class="detail-title">${esc(r.nom)}</h1>
    <p class="detail-meta">Pour ${r.portions} personne${r.portions > 1 ? 's' : ''} · Prép : ${r.prep_min} min · Cuisson : ${r.cuisson_min} min</p>

    <div class="rating-block" id="rating-block">${ratingInnerHTML(r)}</div>

    <div class="detail-block">
      <h3 class="detail-h3">Ingrédients</h3>
      <ul class="ingredients">${ingredients}</ul>
    </div>

    <div class="detail-block">
      <h3 class="detail-h3">Étapes</h3>
      <ol class="steps">${steps}</ol>
    </div>

    <div class="detail-block">
      <h3 class="detail-h3">Macros par portion</h3>
      <div class="detail-macros">
        <div class="dm"><span class="dm-v">${r.macros.kcal}</span><span class="dm-l">kcal</span></div>
        <div class="dm"><span class="dm-v">${r.macros.P} g</span><span class="dm-l">Protéines</span></div>
        <div class="dm"><span class="dm-v">${r.macros.G} g</span><span class="dm-l">Glucides</span></div>
        <div class="dm"><span class="dm-v">${r.macros.L} g</span><span class="dm-l">Lipides</span></div>
      </div>
    </div>

    ${prepCallout}
    ${halalCallout}
    ${batchCallout}
  `;
}

// ── Render: Courses ────────────────────────────────────────
function renderCourses() {
  const courses = data.courses;
  const allKeys = [];
  COURSES_SECTIONS.forEach(({ key }) => {
    (courses[key] || []).forEach((_, i) => allKeys.push(`${key}:${i}`));
  });

  const doneCount = allKeys.filter(k => checkedItems.has(k)).length;
  const pct = allKeys.length ? Math.round((doneCount / allKeys.length) * 100) : 0;

  const sections = COURSES_SECTIONS.map(({ key, label, emoji, special }) => {
    const items = courses[key] || [];
    if (!items.length) return '';

    const sChecked = items.filter((_, i) => checkedItems.has(`${key}:${i}`)).length;

    const itemRows = items.map((text, i) => {
      const itemKey = `${key}:${i}`;
      const checked = checkedItems.has(itemKey);
      return `<button class="course-item${checked ? ' is-checked' : ''}" data-item-key="${itemKey}">
        <span class="check-box">${icon('check')}</span>
        <span class="course-label">${esc(text)}</span>
      </button>`;
    }).join('');

    const boucherieNote = special ? `
      <div class="boucherie-note">
        ${icon('meat')}
        <span>→ Pour la boucherie, ne <strong>PAS</strong> commander sur Auchan.</span>
      </div>` : '';

    return `<div class="course-section${special ? ' is-special' : ''}">
      <div class="course-section-head">
        <span class="course-rayon"><span class="rayon-emoji">${emoji}</span> ${esc(label)}</span>
        <span class="section-count">${sChecked}/${items.length}</span>
      </div>
      ${boucherieNote}
      <div class="course-items">${itemRows}</div>
    </div>`;
  }).join('');

  document.getElementById('content-courses').innerHTML = `
    <div class="screen-head courses-top">
      <div>
        <h1 class="screen-h1">Courses</h1>
        <p class="screen-sub">${doneCount}/${allKeys.length} articles</p>
      </div>
      <button class="reset-btn" id="btn-reset-courses">Tout décocher</button>
    </div>

    <div class="global-progress">
      <div class="progress">
        <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
        <span class="progress-label">${doneCount}/${allKeys.length}</span>
      </div>
    </div>

    ${(allKeys.length && pct === 100) ? `<div class="courses-done">🎉 Liste complète — bravo !</div>` : ''}

    <div class="course-sections">${sections}</div>
  `;
}

// ── Start ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', init);
