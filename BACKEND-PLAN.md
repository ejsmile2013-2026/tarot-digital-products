# BACKEND-PLAN.md — SaaS-платформа для мастеров

**Обновлено:** 2026-05-22  
**Цель:** Один сервер, одно приложение — любой мастер (таролог, нумеролог, травник) запускает свой Mini App без кода.  
**Первый мастер:** Ana Krista Goyya — уже работает.  
**Этот план — инструкция для разработчика (меня). Следовать точно, не отступать.**

---

## Что уже сделано ✅

| Компонент | Статус |
|---|---|
| Supabase: таблицы masters, services, bookings, subscriptions | ✅ |
| API: `GET /api/masters/[slug]` — профиль + услуги | ✅ |
| API: `POST /api/bookings` — принять заявку + уведомление | ✅ |
| API: `GET/PUT /api/master/me` — профиль мастера | ✅ |
| API: `GET/POST /api/master/services` — управление услугами | ✅ |
| API: `PUT/DELETE /api/master/services/[id]` | ✅ |
| API: `GET/PUT /api/master/bookings` — заявки мастера | ✅ |
| Авторизация через Telegram initData (HMAC-SHA256) | ✅ |
| Лимит 5 услуг на бесплатном тарифе | ✅ |
| Mini App загружает данные из БД (с fallback) | ✅ |
| Форма записи → Supabase + уведомление мастеру | ✅ |
| Обработка ошибок в форме записи | ✅ |

---

## Порядок разработки (выполнять строго по шагам)

```
✅ Шаг 1: База данных и базовые API
✅ Шаг 2: Mini App грузит данные из БД
✅ Шаг 3: Форма записи → Supabase + уведомление
✅ Шаг 4: Панель мастера в Mini App
✅ Шаг 5: Онбординг нового мастера через бота
✅ Шаг 6: Загрузка файлов (Supabase Storage)
→  Шаг 7: Оплата подписки (Telegram Stars + Stripe)
→  Шаг 8: Админ-панель (статистика + уведомления о платежах)
→  Шаг 9: White Label (цвет + свой бот-токен)
→  Шаг 10: Кастомный домен для платформы
```

---

## Шаг 4 — Панель мастера в Mini App

Ана открывает приложение → видит скрытую вкладку «Я мастер» → управляет заявками и услугами.

### Условие показа вкладки
```javascript
// Показывать только если telegram_id пользователя совпадает с telegram_id мастера
const isMaster = TG.user?.id === window._masterData?.telegram_id;
```

### Экраны панели

**Экран «Заявки»**
- Список заявок из `GET /api/master/bookings`
- Фильтр по статусу: Новые / Подтверждённые / Завершённые
- Каждая заявка: имя клиента, услуга, дата, вопрос
- Кнопки: «Подтвердить» → `PUT /api/master/bookings { id, status: 'confirmed' }`
- Кнопки: «Отменить» → `PUT /api/master/bookings { id, status: 'cancelled' }`

**Экран «Мои услуги»**
- Список всех услуг из `GET /api/master/services` (включая неактивные)
- Кнопка «+ Добавить» → форма создания услуги → `POST /api/master/services`
- Тап по услуге → форма редактирования → `PUT /api/master/services/[id]`
- Свайп влево или кнопка «Скрыть» → `DELETE /api/master/services/[id]`
- Если plan=free и услуг уже 5 → кнопка «+ Добавить» показывает экран апгрейда

**Экран «Профиль мастера»**
- Поля: имя, bio, ссылка на канал, WhatsApp
- Кнопка «Сохранить» → `PUT /api/master/me`
- Поле «Цвет акцента» — показывать только если plan=pro или studio
- Загрузка фото → через Шаг 6

### Авторизация запросов из панели
Все запросы панели мастера идут с заголовком:
```
Authorization: tma <window.Telegram.WebApp.initData>
```

---

## Шаг 5 — Онбординг нового мастера через бота

### ⚠️ Важно: состояние диалога — в Supabase, не в памяти
Vercel serverless — каждый запрос на новом сервере. Хранить состояние в объекте `{}` нельзя — оно теряется. Использовать таблицу `onboarding_sessions`.

### Таблица `onboarding_sessions` (добавить в schema.sql)
```sql
create table if not exists onboarding_sessions (
  telegram_id  bigint primary key,
  step         text default 'start',
  data         jsonb default '{}'::jsonb,
  created_at   timestamptz default now()
);
-- Автоудаление старых сессий (запускать через cron или при старте)
-- DELETE FROM onboarding_sessions WHERE created_at < now() - interval '24 hours';
```

### Диалог онбординга (шаги)

```
step = 'start'
  Триггер: /start с параметром master=1 ИЛИ нажатие кнопки [Я мастер]
  Бот: «Отлично! Давай создадим твоё приложение. Как тебя зовут? (имя и фамилия)»
  Переход: step → 'name'

step = 'name'
  Триггер: любое текстовое сообщение
  Сохранить: data.name = message.text
  Бот: «Напиши 1–2 предложения о себе — это увидят твои клиенты»
  Переход: step → 'bio'

step = 'bio'
  Триггер: любое текстовое сообщение
  Сохранить: data.bio = message.text
  Бот: «В какой нише работаешь? Например: таро, нумерология, травничество»
  Переход: step → 'niche'

step = 'niche'
  Триггер: любое текстовое сообщение
  Сохранить: data.niche = message.text
  Действие:
    1. Сгенерировать slug из имени (транслит, lowercase, дефисы)
    2. Проверить уникальность slug в таблице masters
    3. Если занят — добавить цифру: 'ana-krista-2'
    4. Создать мастера: POST /api/admin/masters
    5. Удалить сессию из onboarding_sessions
  Бот: «Готово! 🎉
    Твоя ссылка: t.me/[бот]/app?start=[slug]
    Перешли её своим клиентам — они сразу попадут к тебе.
    
    Следующий шаг — добавь свои услуги:»
    [Открыть приложение]
  Переход: сессия удаляется
```

### Обработка в `api/webhook.js`
```javascript
// Псевдокод логики
if (message.text === '/start') {
  // Показать кнопки [Я мастер] [Ищу услуги]
}
if (callbackQuery.data === 'register_master') {
  // Создать запись в onboarding_sessions с step='name'
}
// Для каждого входящего сообщения:
const session = await supabase
  .from('onboarding_sessions')
  .select('*')
  .eq('telegram_id', userId)
  .single();
if (session) {
  // Продолжить диалог онбординга согласно session.step
}
```

---

## Шаг 6 — Загрузка файлов (Supabase Storage)

### Структура хранилища
```
bucket: taro-masters (публичный)
  avatars/[master_id]/avatar.jpg
  backgrounds/[master_id]/bg.jpg
  services/[master_id]/[service_id].jpg
```

### API endpoint
```
POST /api/master/upload
Query params: ?type=avatar|bg|service&serviceId=[uuid]
Body: multipart/form-data с полем 'file'
```

### Ограничения (проверять на сервере)
- Максимальный размер: **2MB**
- Разрешённые форматы: `image/jpeg`, `image/png`, `image/webp`
- Vercel serverless ограничивает тело запроса до **4.5MB** — не превышать

### Логика endpoint
```
1. Проверить авторизацию (requireMaster)
2. Проверить размер и тип файла
3. Загрузить в Supabase Storage: storage.from('taro-masters').upload(path, file)
4. Получить публичный URL: storage.from('taro-masters').getPublicUrl(path)
5. Обновить поле avatar_url / bg_url / image_url в нужной таблице
6. Вернуть { url }
```

---

## Шаг 7 — Оплата подписки

### ⚠️ Важно: проверять срок подписки правильно
В `api/_lib/auth.js` добавить функцию и использовать везде:
```javascript
export function isActivePlan(master) {
  if (master.plan === 'free') return false;
  if (!master.plan_expires) return true; // pro/studio без срока = навсегда
  return new Date(master.plan_expires) > new Date();
}
```
Использовать в:
- `canAddService()` — вместо прямой проверки `master.plan`
- `PUT /api/master/me` — при проверке `accent_color`
- `PUT /api/master/me` — при проверке `bot_token`

### Telegram Stars (для СНГ)
```javascript
// В api/master/subscribe.js
await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendInvoice`, {
  method: 'POST',
  body: JSON.stringify({
    chat_id: master.telegram_id,
    title: 'Подписка Pro — 1 месяц',
    description: 'Неограниченные услуги, статистика, напоминания',
    payload: `sub_${master.id}_pro`,
    currency: 'XTR',       // XTR = Telegram Stars
    prices: [{ label: 'Pro', amount: 500 }], // 500 Stars
  }),
});
// После оплаты — обработать successful_payment в webhook.js:
// Обновить master.plan = 'pro', master.plan_expires = +30 дней
```

### Stripe (для США/Европы)
```javascript
// В api/master/subscribe.js
const session = await stripe.checkout.sessions.create({
  mode: 'subscription',
  customer_email: master.email, // нужно добавить email в masters
  line_items: [{ price: STRIPE_PRICE_ID_PRO, quantity: 1 }],
  success_url: `${APP_URL}?master=${master.slug}&subscribed=1`,
  cancel_url:  `${APP_URL}?master=${master.slug}`,
  metadata: { master_id: master.id },
});
// Вернуть session.url → открыть через Telegram.WebApp.openLink()
```

### Stripe Webhook (`POST /api/webhooks/stripe`)
```javascript
// Обрабатывать события:
// invoice.payment_succeeded → обновить plan + plan_expires
// customer.subscription.deleted → downgrade на free
```

### Env-переменные для оплаты (добавить в Vercel)
```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_PRO=price_...
STRIPE_PRICE_ID_STUDIO=price_...
```

---

## Шаг 8 — White Label (свой бот-токен)

### ⚠️ Важно: шифровать bot_token перед сохранением

**Env-переменная:** `ENCRYPTION_KEY` — 32 случайных символа, добавить в Vercel.

```javascript
// В api/_lib/crypto.js
import crypto from 'crypto';

const KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex'); // 32 bytes

export function encrypt(text) {
  const iv  = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', KEY, iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decrypt(text) {
  const [ivHex, encHex] = text.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const enc = Buffer.from(encHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', KEY, iv);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString();
}
```

В `PUT /api/master/me`:
```javascript
if (updates.bot_token) {
  updates.bot_token = encrypt(updates.bot_token);
}
```

При использовании токена для отправки сообщений:
```javascript
const realToken = master.bot_token ? decrypt(master.bot_token) : BOT_TOKEN;
```

### ⚠️ Важно: автоматически регистрировать webhook для нового бота

Когда мастер сохраняет `bot_token` → сервер сразу вызывает `setWebhook`:
```javascript
// В PUT /api/master/me после сохранения bot_token:
const webhookUrl = `${APP_URL}/api/webhooks/bot/${master.slug}`;
await fetch(`https://api.telegram.org/bot${realToken}/setWebhook`, {
  method: 'POST',
  body: JSON.stringify({ url: webhookUrl }),
});
```

Новый endpoint: `POST /api/webhooks/bot/[slug].js`
- Принимает обновления для конкретного мастера по его боту
- Логика та же что в `api/webhook.js`, но токен берётся из мастера по slug

---

## Истечение подписки — что происходит с лишними услугами

### Сценарий
Мастер был на Pro, добавил 8 услуг. Подписка истекла → `isActivePlan()` вернул `false` → мастер снова на уровне free (лимит 5 услуг).

### Поведение клиентской части (`GET /api/masters/[slug]`)
```javascript
// Если план неактивен — показывать клиентам только первые 5 услуг по sort_order
let query = supabase
  .from('services')
  .select('*')
  .eq('master_id', master.id)
  .eq('is_active', true)
  .order('sort_order', { ascending: true });

if (!isActivePlan(master)) {
  query = query.limit(5); // клиенты видят только первые 5
}
```
Услуги 6, 7, 8 — **не удаляются**, просто не попадают в публичный ответ.

### Поведение панели мастера (`GET /api/master/services`)
Мастер видит **все** свои услуги, но сервер добавляет флаг `blocked_by_plan: true` для услуг сверх лимита:
```javascript
const services = data.map((svc, index) => ({
  ...svc,
  blocked_by_plan: !isActivePlan(master) && index >= 5,
}));
```

### UI в панели мастера
Услуги с `blocked_by_plan: true` отображаются с:
- Иконкой 🔒 поверх карточки
- Приглушённым (серым) фоном — чтобы визуально отличать
- Текстом под названием: `«Клиенты не видят эту услугу»`
- Кнопкой: `«Продлить подписку →»` — открывает экран оплаты

**Пример как это выглядит:**
```
┌─────────────────────────────┐
│ 🔒  Расклад на карьеру       │  ← заблокированная услуга
│     Клиенты не видят         │
│     [Продлить подписку →]    │
└─────────────────────────────┘
```

### Уведомление мастеру при истечении подписки
Когда `plan_expires` наступает — бот отправляет сообщение мастеру:
```
⚠️ Твоя подписка Pro истекла.

Клиенты видят только первые 5 услуг из 8.
Услуги «Расклад на карьеру», «Курс», «Медитация» скрыты.

Чтобы они снова стали видны — продли подписку:
[Продлить за $19/мес]
```
Уведомление отправляется через cron или при первом запросе после истечения (проверить `plan_expires < now()` в `requireMaster`).

### Правило: услуги никогда не удаляются автоматически
При даунгрейде — только скрываем от клиентов. Данные сохраняются. При продлении подписки — всё восстанавливается автоматически без действий мастера.

---

## Защита от спама (добавить в `POST /api/bookings`)

### ⚠️ Добавить до выполнения любого следующего шага

```javascript
// Не более 3 заявок от одного клиента в час
if (clientTgId) {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from('bookings')
    .select('id', { count: 'exact', head: true })
    .eq('master_id', master.id)
    .eq('client_tg_id', clientTgId)
    .gte('created_at', oneHourAgo);

  if (count >= 3) {
    return res.status(429).json({ error: 'Слишком много заявок. Попробуй через час.' });
  }
}
```

---

## База данных — полная схема

### `masters`
```
id, telegram_id, slug, name, bio, meta, stats
avatar_url, bg_url, channel_url, whatsapp
accent_color  — кастомный цвет (только если isActivePlan)
bot_token     — зашифрован AES-256 (только если isActivePlan)
plan          — 'free' | 'pro' | 'studio'
plan_expires  — проверять через isActivePlan(), не напрямую
created_at
```

### `services`
```
id, master_id, category, type, emoji
title, subtitle, description
includes (jsonb), testimonial, testimonial_author
price, image_url, gradient, sort_order
is_active, created_at
```

### `bookings`
```
id, master_id, service_id, service_title
client_tg_id, client_name, question, preferred_date
status        — 'new' | 'confirmed' | 'done' | 'cancelled'
payment_status — 'pending' | 'paid' | 'refunded'
payment_method — 'stars' | 'stripe' | 'manual'
created_at
```

### `subscriptions`
```
id, master_id, plan
amount_cents, payment_method
stripe_sub_id, stripe_customer_id
starts_at, expires_at, created_at
```

### `onboarding_sessions` (новая — добавить в schema.sql)
```
telegram_id  bigint PRIMARY KEY
step         text     — 'name' | 'bio' | 'niche'
data         jsonb    — накопленные ответы
created_at   timestamptz
```

---

## Все API endpoints

### Публичные (без авторизации)

| Метод | URL | Что делает |
|---|---|---|
| `GET` | `/api/masters/[slug]` | Профиль + активные услуги |
| `POST` | `/api/bookings` | Создать заявку (с защитой от спама) |
| `POST` | `/api/webhook` | Telegram webhook платформы |
| `POST` | `/api/webhooks/bot/[slug]` | Webhook для White Label бота мастера |
| `POST` | `/api/webhooks/stripe` | Stripe события подписок |

### Только для мастера

| Метод | URL | Что делает |
|---|---|---|
| `GET` | `/api/master/me` | Профиль + статистика |
| `PUT` | `/api/master/me` | Обновить (с шифрованием bot_token + авто-webhook) |
| `GET` | `/api/master/services` | Все услуги включая неактивные |
| `POST` | `/api/master/services` | Создать (проверка лимита через isActivePlan) |
| `PUT` | `/api/master/services/[id]` | Редактировать |
| `DELETE` | `/api/master/services/[id]` | Скрыть |
| `GET` | `/api/master/bookings` | Все заявки |
| `PUT` | `/api/master/bookings` | Изменить статус |
| `POST` | `/api/master/upload` | Загрузить фото (макс 2MB, jpeg/png/webp) |
| `POST` | `/api/master/subscribe` | Оформить подписку (Stars или Stripe) |

### Только для суперадмина

| Метод | URL | Что делает |
|---|---|---|
| `GET` | `/api/admin/masters` | Все мастера |
| `PUT` | `/api/admin/masters/[id]/plan` | Изменить тариф вручную |
| `POST` | `/api/admin/masters` | Создать мастера (из онбординга) |

---

## Тарифы

| | **Free** | **Pro — $19/мес** | **Studio — $49/мес** |
|---|---|---|---|
| Услуги | до 5 | неограниченно | неограниченно |
| Цвет приложения | ❌ | ✅ | ✅ |
| Свой бот-токен | ❌ | ✅ | ✅ |
| Статистика | ❌ | ✅ | ✅ |
| Напоминания клиентам | ❌ | ✅ | ✅ |
| Мастеров | 1 | 1 | до 5 |

**Везде где проверяется план — использовать `isActivePlan(master)`, не `master.plan`.**

---

## Безопасность — кто что видит

| Данные | Клиент | Мастер | Другой мастер |
|---|---|---|---|
| Профиль мастера | ✅ публичный | ✅ | ✅ |
| Активные услуги | ✅ | ✅ | ✅ |
| Неактивные услуги | ❌ | ✅ свои | ❌ |
| Заявки | ❌ | ✅ свои | ❌ |
| bot_token | ❌ | ❌ (зашифрован) | ❌ |

---

## Админ-панель (статистика платформы)

### Доступ
Защита через секретную ссылку:
```
https://tg-app-nine-lovat.vercel.app/admin?key=ADMIN_SECRET_KEY
```
- `ADMIN_SECRET_KEY` — добавить в Vercel как env-переменную
- Если `key` неверный или отсутствует → страница возвращает `403 Forbidden`
- Ссылку никому не давать, хранить в заметках

### Страница `/admin/index.html`
Отдельная HTML-страница (не Mini App, обычный браузер).  
Загружает данные через `GET /api/admin/stats?key=...`.

**Блоки на странице:**

```
┌─────────────────────────────────────────────┐
│  🔮 Taro Platform — Admin                    │
├──────────┬──────────┬───────────┬────────────┤
│ Мастеров │ Активных │  Выручка  │  Заявок    │
│    12    │    8     │ $152/мес  │   340      │
├──────────┴──────────┴───────────┴────────────┤
│                                              │
│  Мастера                                     │
│  ┌──────────────────────────────────────┐    │
│  │ Ana Krista · Pro · 45 клиентов       │    │
│  │ Maria Astro · Free · 12 клиентов     │    │
│  │ Darya Num · Studio · 78 клиентов     │    │
│  └──────────────────────────────────────┘    │
│                                              │
│  Последние платежи                           │
│  ┌──────────────────────────────────────┐    │
│  │ Ana Krista · Pro · $19 · 22 мая      │    │
│  │ Darya Num · Studio · $49 · 20 мая    │    │
│  └──────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

### API endpoint `GET /api/admin/stats`

**Защита:**
```javascript
const key = req.query.key;
if (key !== process.env.ADMIN_SECRET_KEY) {
  return res.status(403).json({ error: 'Forbidden' });
}
```

**Что возвращает:**
```javascript
{
  summary: {
    totalMasters: 12,
    activePlans: 8,          // plan != 'free' AND isActivePlan
    monthlyRevenue: 152,     // сумма из subscriptions за текущий месяц
    totalBookings: 340,
  },
  masters: [
    {
      id, name, slug, plan, plan_expires,
      clientsCount,   // уникальных client_tg_id в bookings
      bookingsCount,  // всего заявок
      servicesCount,  // активных услуг
      createdAt,
    }
  ],
  recentPayments: [          // последние 20 платежей из subscriptions
    {
      masterName, plan, amountCents, paymentMethod, createdAt
    }
  ]
}
```

**SQL-запросы внутри endpoint:**
```javascript
// Мастера с количеством клиентов и заявок
const { data: masters } = await supabase
  .from('masters')
  .select(`
    id, name, slug, plan, plan_expires, created_at,
    bookings(count),
    services(count)
  `);

// Уникальные клиенты на мастера
// SELECT master_id, COUNT(DISTINCT client_tg_id) FROM bookings GROUP BY master_id

// Выручка за текущий месяц
const { data: revenue } = await supabase
  .from('subscriptions')
  .select('amount_cents')
  .gte('created_at', startOfMonth);
```

### Уведомление в Telegram при каждом платеже

При каждой успешной оплате подписки (Stars или Stripe) — бот присылает тебе сообщение:

```
💰 Новый платёж!

👤 Мастер: Ana Krista Goyya (@Ana_Krista)
📦 Тариф: Pro
💵 Сумма: $19
💳 Способ: Stripe
📅 Дата: 22 мая 2026
```

**Реализация:** в `api/webhooks/stripe.js` и в обработчике `successful_payment` в `api/webhook.js` — после обновления плана мастера вызывать:
```javascript
await sendTg(ADMIN_TELEGRAM_ID, `💰 Новый платёж!\n\n👤 ${master.name}\n📦 ${plan}\n💵 $${amount}`)
```
`ADMIN_TELEGRAM_ID` = твой Telegram ID (`449959218`) — добавить в env-переменные.

---

## Env-переменные (все должны быть в Vercel)

```
TELEGRAM_BOT_TOKEN=        — токен главного бота платформы
SUPABASE_URL=              — URL проекта Supabase
SUPABASE_SERVICE_KEY=      — service_role ключ Supabase
ENCRYPTION_KEY=            — 32-байтный hex-ключ для AES-256 (сгенерировать: openssl rand -hex 32)
STRIPE_SECRET_KEY=         — добавить при Шаге 7
STRIPE_WEBHOOK_SECRET=     — добавить при Шаге 7
STRIPE_PRICE_ID_PRO=       — добавить при Шаге 7
STRIPE_PRICE_ID_STUDIO=    — добавить при Шаге 7
ADMIN_SECRET_KEY=          — секретный ключ для /admin (сгенерировать: openssl rand -hex 16)
ADMIN_TELEGRAM_ID=449959218 — твой Telegram ID для уведомлений о платежах
```

---

## Шаг 10 — Кастомный домен (сделать когда придёт время)

**Цель:** заменить `tg-app-nine-lovat.vercel.app` на красивый адрес платформы, например `taro-platform.com`.

**Что нужно от тебя:** только оплатить домен (~$10–15/год). Настройку беру на себя.

**Где купить:** Namecheap, GoDaddy или Cloudflare Registrar (самые дешёвые).

**Что я сделаю после покупки:**
1. В Vercel: Settings → Domains → добавить домен
2. Vercel выдаст DNS-записи (два значения)
3. В панели регистратора: вставить эти DNS-записи
4. Через 10–30 минут домен заработает с автоматическим SSL

**Для каждого мастера** отдельный домен не нужен — у них будут ссылки вида:
```
taro-platform.com?master=ana-krista
taro-platform.com?master=maria-astro
```
