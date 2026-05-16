/* === ВУЛИК — Landing logic === */

/* -----------------------------------------------------------
   👇 ОНОВИ СВОЇ КОНТАКТИ ТУТ
   ----------------------------------------------------------- */
/* Email і телефон зберігаються рознесено — щоб прості боти-скрепери
   не змогли витягти їх із вихідного коду одним regexp-ом.
   Реальні значення збираються лише за подією кліку користувача. */
const CONTACTS = {
  telegram: '@tryandtake',
  telegramUrl: 'https://t.me/tryandtake',
  emailUser: 'bruhanda',
  emailDomain: 'gmail.com',
  phoneParts: ['+38', '096', '584', '80', '50'],
};
function getEmail() { return CONTACTS.emailUser + '@' + CONTACTS.emailDomain; }
function getPhone() { return CONTACTS.phoneParts.join(''); }
function getPhoneDisplay() {
  const [c, a, p1, p2, p3] = CONTACTS.phoneParts;
  return `${c} (${a}) ${p1}-${p2}-${p3}`;
}

/* -----------------------------------------------------------
   🔥 FIREBASE CONFIG — щоб коментарі стали реальними між людьми
   Покрокова інструкція: дивись SETUP.md
   Поки що тут пусто → працюємо в ДЕМО-режимі (localStorage).
   ----------------------------------------------------------- */
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDX5IJXT5ApciykevIZH0b9nLQem4T0R44",
  authDomain: "vulyk-landing.firebaseapp.com",
  projectId: "vulyk-landing",
  storageBucket: "vulyk-landing.firebasestorage.app",
  messagingSenderId: "278770824140",
  appId: "1:278770824140:web:158552020720ca20b5e369",
};

/* === SEEDED COMMENTS — щоб люди бачили "живу" дискусію з самого початку === */
const SEED_COMMENTS = [
  {
    name: 'Андрій',
    role: '🐝 пасічник',
    text: 'Маю 80 вуликів на Полтавщині. Зараз продаю мед через знайомих і Інстаграм — це біль. Перекупник дає 130 грн/л, я хочу 220. Якщо такий маркетплейс справді запрацює — підпишусь першим. Питання: як забезпечите, щоб не зайшли липові пасіки і не зіпсували репутацію?',
    date: '2 дні тому',
    emoji: '🔥',
  },
  {
    name: 'Олена',
    role: '🛒 покупець',
    text: 'Дві дитини, шукаю чесний мед. Купувала на ринку — половина виявлялася з цукром. Готова платити більше за гарантію. QR на банці — це геніально. Хочу бачити пасічника і знати, де він живе.',
    date: '2 дні тому',
    emoji: '💸',
  },
  {
    name: 'Іван',
    role: '🐝 пасічник',
    text: 'Думку про "Усинови вулик" — топ. Минулого року здавав в оренду 5 вуликів сусідам через ФБ — розхапали за тиждень. У великому форматі це працюватиме. Тільки треба продумати, щоб усиновитель не приїхав і не "відкривав" свій вулик коли йому захочеться 😅',
    date: '3 дні тому',
    emoji: '🍯',
  },
  {
    name: 'Максим',
    role: '🌾 фермер / аграрій',
    text: 'У мене 350 га соняшника. Кожного року шукаю пасічників через знайомих. Якщо буде платформа, де я виставлю поле і пасічники самі приїдуть — забираю. Скільки коштуватиме розмістити поле?',
    date: '4 дні тому',
    emoji: '🐝',
  },
  {
    name: 'Тарас',
    role: '🐝 пасічник',
    text: 'Скептично. Уже існують HiveTracks, ApiNote — нічого не нове. Що ви робите інакше? І мобільний застосунок — обовʼязково. На пасіці я з телефоном, а не з ноутбуком.',
    date: '4 дні тому',
    emoji: '🤔',
  },
  {
    name: 'Світлана',
    role: '🛠️ виробник обладнання',
    text: 'Роблю вулики під замовлення. На OLX — гора кліків, мало конверсії. Якщо у вас буде категорія обладнання з нормальною аудиторією пасічників — заходимо. Комісія 4% — це нормально, головне щоб був трафік.',
    date: '5 днів тому',
    emoji: '🐝',
  },
  {
    name: 'Богдан',
    role: '💼 інвестор / партнер',
    text: 'Цікавий концепт, особливо мережевий ефект через QR. Чи готові поговорити про seed-раунд? Дайте знати після фази валідації — хочу побачити перші 100 пасічників і конверсію.',
    date: '6 днів тому',
    emoji: '🔥',
  },
  {
    name: 'Микола',
    role: '🐝 пасічник',
    text: 'Кочівля — ось де болить. Минулого року 4 пасічники наїхали один на одного на ріпак, дільниці перетнулися, скандал. Карта з реальними локаціями і бронюванням — це врятує нерви всім.',
    date: '7 днів тому',
    emoji: '💸',
  },
];

const REACTION_EMOJIS = ['🐝', '🍯', '🔥', '🤔', '💸', '🙅'];
const SEED_REACTIONS = { '🐝': 47, '🍯': 38, '🔥': 62, '🤔': 12, '💸': 29, '🙅': 3 };

/* === STORAGE KEYS === */
const LS_COMMENTS = 'vulyk_comments_v1';
const LS_REACTIONS = 'vulyk_reactions_v1';
const LS_MY_REACTIONS = 'vulyk_my_reactions_v1';
const LS_WAITLIST = 'vulyk_waitlist_v1';

/* === UTILS === */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function loadLS(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch { return fallback; }
}
function saveLS(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

function initials(name) {
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '🐝';
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatDate(d) {
  if (!d) return '';
  if (typeof d === 'string') return d;
  const ts = typeof d === 'object' && d.toDate ? d.toDate().getTime() : Number(d);
  const diff = (Date.now() - ts) / 1000;
  if (diff < 60) return 'щойно';
  if (diff < 3600) return `${Math.floor(diff / 60)} хв тому`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} год тому`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)} д тому`;
  return new Date(ts).toLocaleDateString('uk-UA');
}

/* === FIREBASE INIT === */
let db = null;
let useFirebase = false;

function isFirebaseConfigured() {
  return (
    FIREBASE_CONFIG.apiKey &&
    FIREBASE_CONFIG.projectId &&
    !FIREBASE_CONFIG.apiKey.includes('YOUR_') &&
    typeof window.firebase !== 'undefined'
  );
}

function initFirebase() {
  if (!isFirebaseConfigured()) {
    setStatus('demo', 'Демо-режим — коментарі лише у твоєму браузері. Підключи Firebase (SETUP.md), щоб люди бачили одне одного.');
    return false;
  }
  try {
    if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
    db = firebase.firestore();
    useFirebase = true;
    setStatus('live', 'Live — реальна дискусія для всіх');
    console.log('🔥 Firebase active — real-time discussion enabled');
    return true;
  } catch (e) {
    console.warn('Firebase init failed:', e);
    setStatus('err', 'Помилка підключення Firebase — працюємо локально. Деталі в консолі (F12).');
    return false;
  }
}

function setStatus(mode, text) {
  const el = $('#liveStatus');
  if (!el) return;
  el.classList.remove('live', 'demo', 'err');
  el.classList.add(mode);
  el.querySelector('.live-status__text').textContent = text;
}

function updateCount(n) {
  const el = $('#commentCount');
  if (!el) return;
  el.textContent = `${n} коментарів`;
}

/* === NAV BURGER === */
$('.nav__burger')?.addEventListener('click', () => {
  $('.nav__links').classList.toggle('is-open');
});

/* === REGION SELECT === */
$('#region')?.addEventListener('change', (e) => {
  const v = e.target.value;
  const fb = $('#regionFeedback');
  if (!v) { fb.textContent = ''; return; }
  fb.textContent = `🐝 У регіоні «${v}» поки що 0 пасічників на платформі. Будь першим!`;
});

/* === REACTIONS === */
let currentReactions = { ...SEED_REACTIONS };

function renderReactions() {
  const mine = loadLS(LS_MY_REACTIONS, []);
  $$('.reaction').forEach((btn) => {
    const emoji = btn.dataset.emoji;
    const countEl = btn.querySelector('.reaction__count') || btn.querySelector('b');
    if (countEl) countEl.textContent = currentReactions[emoji] ?? 0;
    btn.classList.toggle('active', mine.includes(emoji));
  });
}

function setupReactions() {
  if (useFirebase) {
    db.collection('reactions').doc('global').onSnapshot((doc) => {
      const data = doc.exists ? doc.data() : {};
      currentReactions = { ...SEED_REACTIONS, ...data };
      renderReactions();
    }, (err) => {
      console.warn('Reactions snapshot error:', err);
      currentReactions = loadLS(LS_REACTIONS, { ...SEED_REACTIONS });
      renderReactions();
    });
  } else {
    currentReactions = loadLS(LS_REACTIONS, { ...SEED_REACTIONS });
    renderReactions();
  }

  $$('.reaction').forEach((btn) => {
    btn.addEventListener('click', () => {
      const emoji = btn.dataset.emoji;
      const mine = loadLS(LS_MY_REACTIONS, []);
      const isOn = mine.includes(emoji);
      const delta = isOn ? -1 : 1;
      if (isOn) mine.splice(mine.indexOf(emoji), 1);
      else mine.push(emoji);
      saveLS(LS_MY_REACTIONS, mine);

      if (useFirebase) {
        db.collection('reactions').doc('global').set(
          { [emoji]: firebase.firestore.FieldValue.increment(delta) },
          { merge: true }
        ).catch(err => console.warn('Reaction write failed:', err));
      } else {
        currentReactions[emoji] = Math.max(0, (currentReactions[emoji] || 0) + delta);
        saveLS(LS_REACTIONS, currentReactions);
        renderReactions();
      }
    });
  });
}

/* === COMMENTS === */
let liveComments = [];

function renderComments() {
  const container = $('#comments');
  if (!container) return;
  const all = [...liveComments, ...SEED_COMMENTS];
  updateCount(liveComments.length + SEED_COMMENTS.length);
  container.innerHTML = all.map((c) => {
    const isMine = c.isMine;
    return `
      <article class="comment">
        <div class="comment__head">
          <div class="comment__avatar">${escapeHtml(initials(c.name))}</div>
          <span class="comment__name">${escapeHtml(c.name)}</span>
          <span class="comment__role">${escapeHtml(c.role)}</span>
          ${c.emoji ? `<span style="font-size: 20px;">${c.emoji}</span>` : ''}
          <span class="comment__date">${escapeHtml(formatDate(c.date))}${isMine ? ' • ти' : ''}</span>
        </div>
        <p class="comment__text">${escapeHtml(c.text)}</p>
      </article>
    `;
  }).join('');
}

function setupComments() {
  if (useFirebase) {
    db.collection('comments')
      .orderBy('createdAt', 'desc')
      .limit(200)
      .onSnapshot((snap) => {
        liveComments = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            name: data.name,
            role: data.role,
            text: data.text,
            date: data.createdAt ? data.createdAt.toMillis() : Date.now(),
            isMine: false,
          };
        });
        renderComments();
      }, (err) => {
        console.warn('Comments snapshot error:', err);
        setStatus('err', 'Втрачено зʼєднання з Firebase. Перевір правила Firestore (SETUP.md).');
      });
  } else {
    liveComments = loadLS(LS_COMMENTS, []).map(c => ({ ...c, isMine: true }));
    renderComments();
  }

  $('#commentForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = $('#cName').value.trim();
    const role = $('#cRole').value;
    const text = $('#cText').value.trim();
    if (!name || !text) return;

    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Надсилаємо…';

    try {
      if (useFirebase) {
        await db.collection('comments').add({
          name, role, text,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
      } else {
        const user = loadLS(LS_COMMENTS, []);
        user.unshift({ name, role, text, date: Date.now() });
        saveLS(LS_COMMENTS, user);
        liveComments = user.map(c => ({ ...c, isMine: true }));
        renderComments();
      }
      $('#cName').value = '';
      $('#cText').value = '';
    } catch (err) {
      console.warn('Comment submit failed:', err);
      alert('Не вдалось надіслати. Перевір консоль (F12).');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Залишити коментар';
    }
  });
}

/* === CONTACTS — click-to-reveal для email/телефону === */
function setupRevealChannel(selector, displayGetter, valueGetter, hrefPrefix, actionLabel) {
  document.querySelectorAll(selector).forEach((el) => {
    let revealed = false;
    const valueEl = el.querySelector('.channel__value');
    const actionEl = el.querySelector('.channel__action');

    const handle = () => {
      if (!revealed) {
        if (valueEl) valueEl.textContent = displayGetter();
        if (actionEl) actionEl.textContent = actionLabel;
        el.classList.add('channel--revealed');
        revealed = true;
      } else {
        window.location.href = hrefPrefix + valueGetter();
      }
    };

    el.addEventListener('click', handle);
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handle();
      }
    });
  });
}

function applyContacts() {
  setupRevealChannel(
    '[data-channel="email"]',
    getEmail, getEmail,
    'mailto:',
    'натисни ще раз щоб написати →'
  );
  setupRevealChannel(
    '[data-channel="phone"]',
    getPhoneDisplay, getPhone,
    'tel:',
    'натисни ще раз щоб подзвонити →'
  );
}

/* === WAITLIST FORM === */
$('#waitForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = {
    name: $('#wName').value.trim(),
    contact: $('#wContact').value.trim(),
    role: $('#wRole').value,
    region: $('#wRegion').value.trim(),
    message: $('#wMessage').value.trim(),
    date: new Date().toISOString(),
  };

  // 1) Save locally as backup
  const all = loadLS(LS_WAITLIST, []);
  all.push(data);
  saveLS(LS_WAITLIST, all);

  // 2) Save to Firebase if available — щоб ти бачив усі заявки в одному місці
  if (useFirebase) {
    try {
      await db.collection('waitlist').add({
        ...data,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
    } catch (err) {
      console.warn('Waitlist save to Firebase failed:', err);
    }
  }

  // 3) Open email client as duplicate notification
  const body = encodeURIComponent(
`Хочу долучитись до ВУЛИК.

Імʼя: ${data.name}
Контакт: ${data.contact}
Роль: ${data.role}
Регіон: ${data.region}
Повідомлення: ${data.message}

— Надіслано з лендингу`
  );
  const mailto = `mailto:${getEmail()}?subject=${encodeURIComponent('ВУЛИК — нова заявка з waitlist')}&body=${body}`;

  const status = $('#waitStatus');
  status.classList.remove('err');
  status.classList.add('ok');
  status.textContent = useFirebase
    ? '✅ Дякую! Заявка збережена. Зараз відкриється пошта для дублювання.'
    : '✅ Дякую! Зараз відкриється поштовий клієнт — натисни "Надіслати".';

  setTimeout(() => { window.location.href = mailto; }, 600);
  e.target.reset();
});

/* === FOOTER YEAR === */
$('#year').textContent = new Date().getFullYear();

/* === INIT === */
function init() {
  applyContacts();
  initFirebase();   // sets useFirebase
  setupReactions();
  setupComments();
}

// Firebase CDN scripts have `defer` → DOMContentLoaded waits for them.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

/* === DEBUG / RESET === */
window.VULYK = {
  reset: () => { localStorage.clear(); location.reload(); },
  export: () => console.log({
    waitlist: loadLS(LS_WAITLIST, []),
    comments: loadLS(LS_COMMENTS, []),
    reactions: loadLS(LS_REACTIONS, {}),
  }),
  useFirebase: () => useFirebase,
};
