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
};

function icon(name, cls = '') {
  const el = SVG[name] || '';
  if (!cls) return el;
  return el.replace('<svg ', `<svg class="${cls}" `);
}

// ── App state ──────────────────────────────────────────────
let data = null;
let recipeMap = {};
let checkedItems = new Set();
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

  renderToday();
  renderSemaine();
  renderRecettes();
  renderCourses();
  setupTabs();
  setupDetailHandlers();
  setupCoursesHandlers();
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
    const trigger = e.target.closest('[data-recipe-id]');
    if (trigger) openDetail(trigger.dataset.recipeId);

    if (e.target.closest('#btn-back-detail')) closeDetail();
  });

  // Swipe down to close
  const overlay = document.getElementById('detail-overlay');
  let touchStartY = 0;
  overlay.addEventListener('touchstart', e => { touchStartY = e.touches[0].clientY; }, { passive: true });
  overlay.addEventListener('touchend', e => {
    const delta = e.changedTouches[0].clientY - touchStartY;
    if (delta > 80 && overlay.scrollTop === 0) closeDetail();
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

function mealCardHTML(recipe, slotLabel) {
  return `<button class="meal-card" data-recipe-id="${recipe.id}">
    <span class="meal-stripe"></span>
    <span class="meal-body">
      <span class="meal-slot">${slotLabel}</span>
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
    return mealCardHTML(r, SLOT_LABELS[slot]);
  }).join('');

  const sourceHTML = citation.source
    ? `<p class="quote-source">${esc(citation.source)}</p>` : '';

  document.getElementById('content-aujourdhui').innerHTML = `
    <div class="today-eyebrow">Aujourd'hui</div>
    <h1 class="today-date">${esc(label)}${dateStr ? ' ' + esc(dateStr) : ''}</h1>

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
      return `<button class="day-row" data-recipe-id="${r.id}">
        <span class="row-slot">${SLOT_LABELS[slot]}</span>
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
        <span class="recipe-row-tag">${JOUR_ABBR[jour.jour] || ''} ${SLOT_SHORT[slot] || slot}</span>
        <span class="recipe-row-main">
          <span class="recipe-row-name">${esc(r.nom)}</span>
          <span class="recipe-row-meta">
            <span>${icon('clock')} ${total} min</span>
            <span>${icon('user')} ${r.portions} pers.</span>
            <span>${r.macros.kcal} kcal</span>
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

  document.getElementById('content-recettes').innerHTML = `
    <div class="screen-head">
      <h1 class="screen-h1">Recettes</h1>
      <p class="screen-sub">Groupées par jour et par repas</p>
    </div>
    <div class="recipe-groups">${groups}</div>
  `;
}

// ── Render: Recipe detail ──────────────────────────────────
function renderDetailHTML(r) {
  const ingredients = r.ingredients.map(ing => {
    // Try to split "Xg/ml/c. ... name" — display as quantity + name if possible
    const parts = ing.match(/^(\d[\d\s/.,]*(?:g|kg|ml|cl|l|c\.\s*à\s*[sc]\.?|poignée|boîte|pavé|dos|tranche|blanc|botte|sachet)[^a-zA-ZÀ-ÿ]*)(.*)/i);
    if (parts) {
      return `<li><span class="ing-q">${esc(parts[1].trim())}</span><span class="ing-n">${esc(parts[2].trim())}</span></li>`;
    }
    return `<li><span class="ing-q"></span><span class="ing-n">${esc(ing)}</span></li>`;
  }).join('');

  const steps = r.etapes.map((s, i) =>
    `<li><span class="step-n">${i + 1}</span><span class="step-t">${esc(s)}</span></li>`
  ).join('');

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

    <div class="course-sections">${sections}</div>
  `;
}

// ── Start ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', init);
