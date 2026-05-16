# 🔥 Налаштування Firebase — щоб коментарі стали реальними

> **Без цього кроку лендінг працює, але кожен бачить лише свої коментарі.**
> Після налаштування — усі відвідувачі бачать дискусію в реальному часі (як в Інстаграмі під постом).

⏱️ Часу: ~5 хвилин.
💰 Коштує: безкоштовно (вистачить на десятки тисяч відвідувачів/місяць).

---

## Крок 1: Створи проєкт Firebase (2 хв)

1. Відкрий **https://console.firebase.google.com**
2. Увійди своїм Google акаунтом (той же, що `bruhanda@gmail.com`)
3. Натисни **Add project** (Додати проєкт)
4. Назва: `vulyk-landing` → **Continue**
5. Google Analytics — можеш вимкнути (не потрібно) → **Create project**
6. Чекай ~30 секунд → **Continue**

---

## Крок 2: Додай Web App (1 хв)

1. На головній сторінці проєкту натисни іконку **`</>`** (Web)
2. Назва App: `ВУЛИК лендинг` → **Register app**
3. Зʼявиться код. Знайди обʼєкт `firebaseConfig`. Виглядає так:

   ```js
   const firebaseConfig = {
     apiKey: "AIzaSyA1b2C3d4E5f6G7h8I9j0K1l2M3n4O5p6Q",
     authDomain: "vulyk-landing.firebaseapp.com",
     projectId: "vulyk-landing",
     storageBucket: "vulyk-landing.appspot.com",
     messagingSenderId: "123456789012",
     appId: "1:123456789012:web:abc123def456ghi789jkl"
   };
   ```

4. **Скопіюй увесь обʼєкт.** Потім натисни **Continue to console**.

---

## Крок 3: Встав конфіг у `script.js` (30 сек)

Відкрий файл `script.js`, знайди блок `FIREBASE_CONFIG` (~рядок 18) і встав свої значення:

```js
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyA1b2...",          // ← твоє
  authDomain: "vulyk-landing...",   // ← твоє
  projectId: "vulyk-landing",       // ← твоє
  storageBucket: "...",             // ← твоє
  messagingSenderId: "...",         // ← твоє
  appId: "...",                     // ← твоє
};
```

Збережи файл.

---

## Крок 4: Увімкни Firestore (1 хв)

1. У лівому меню Firebase → **Build** → **Firestore Database**
2. Натисни **Create database**
3. Обери **Start in test mode** (тестовий режим — діє 30 днів, для запуску дискусії з друзями достатньо)
4. Локація: **`eur3 (europe-west)`** → найкраще для України
5. Натисни **Enable**

---

## Крок 5: Перевір 🎉

1. Відкрий `index.html` у браузері (або через локальний сервер).
2. Прокрути до секції **"Що думаєте?"**.
3. Над реакціями має бути 🟢 **"Live — реальна дискусія для всіх"** замість 🟡 "Демо-режим".
4. Залиш тестовий коментар.
5. **Відкрий ту саму сторінку з телефону / іншого браузера** — коментар має зʼявитись там автоматично, без оновлення!

---

## Крок 6 (опціонально): Безпечніші правила доступу

Тестовий режим діє 30 днів. Щоб залишилось працювати довше і з захистом від спаму — заміни правила Firestore:

1. У Firestore → **Rules**
2. Встав цей текст і натисни **Publish**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {
    match /comments/{doc} {
      allow read: if true;
      allow create: if request.resource.data.text is string
        && request.resource.data.text.size() > 0
        && request.resource.data.text.size() < 2000
        && request.resource.data.name is string
        && request.resource.data.name.size() < 100
        && request.resource.data.role is string;
      allow update, delete: if false;
    }
    match /reactions/{doc} {
      allow read: if true;
      allow write: if true;
    }
    match /waitlist/{doc} {
      allow read: if false;     // приватно — тільки ти бачиш через консоль
      allow create: if request.resource.data.name is string
        && request.resource.data.name.size() < 200;
    }
  }
}
```

Це означає:
- Усі можуть **читати коментарі** і **писати нові** (з обмеженням розміру)
- Ніхто не може **редагувати/видаляти чужі** коментарі
- Реакції — анонімні лічильники, відкриті
- Waitlist-заявки бачиш **тільки ти** через Firebase Console

---

## 📥 Як побачити waitlist-заявки

1. Firebase Console → **Firestore Database** → **Data**
2. Колекція `waitlist` — усі, хто заповнив форму
3. Можеш експортувати в CSV через Firebase Admin або скопіювати вручну

---

## ❓ Проблеми

| Що бачиш | Що робити |
|----------|-----------|
| 🟡 "Демо-режим" | Не вставив `FIREBASE_CONFIG` у `script.js`, або вставив з лапками-копією. Перевір. |
| 🔴 "Помилка підключення" | Відкрий консоль (F12) — побачиш точну помилку. |
| `Permission denied` | Не увімкнув Firestore (Крок 4) або не у test-mode. |
| `Invalid API key` | Неправильно скопійований apiKey. Скопіюй ще раз. |
| Коментарі не показуються | Перевір, чи створилась колекція `comments` у Firestore Data. |

---

## 🚀 Що далі — деплой

Коли все працює локально — давай задеплоїмо. Дві кнопки:

### Vercel (рекомендую, 2 хв)
1. Зайди на **https://vercel.com**, увійди через GitHub
2. Створи репозиторій на GitHub з цими файлами
3. У Vercel → **Add New Project** → обери репо → **Deploy**
4. Отримаєш URL типу `vulyk.vercel.app`

### Netlify (альтернатива)
1. **https://netlify.com** → **Add new site** → **Deploy manually**
2. Перетягни папку з файлами → готово

Ділись посиланням з пасічниками — і дивись дискусію в реальному часі.
