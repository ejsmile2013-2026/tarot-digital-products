# BACKEND-PLAN.md — SaaS-платформа для мастеров Таро

**Дата:** 2026  
**Цель:** Один сервер, одно приложение — каждый мастер получает свой Mini App без кода.  
**Первый клиент-мастер:** Ana Krista Goyya (`@AnaKristaTaro_Bot`) — уже работает как v1.

---

## Решение по боту

**Один главный бот платформы** — например, `@TaroAppBot`.

Каждый мастер получает уникальную ссылку:
```
t.me/TaroAppBot/app?start=ana-krista
t.me/TaroAppBot/app?start=maria-astro
```

Клиенты Аны видят только Ану. Клиенты Марии — только Марию. Пересечений нет.

**Почему не отдельный бот каждому мастеру:**
- Мастер-новичок не знает что такое BotFather
- Один бот = один webhook = меньше сложности
- Легко масштабировать без IT-поддержки каждого мастера

**White Label (платный тариф):** мастер вставляет токен своего бота → приложение работает от его имени.

---

## Роли в системе

| Роль | Кто это | Что может делать |
|---|---|---|
| **Суперадмин** | Ты (владелец платформы) | Видит всех мастеров, управляет тарифами |
| **Мастер** | Таролог, нумеролог | Настраивает свой профиль, услуги, видит заявки |
| **Клиент** | Подписчик мастера | Просматривает каталог, записывается, платит |

---

## База данных

**Рекомендация:** Supabase (PostgreSQL + Auth + Storage + бесплатный тариф до 500MB)

### Таблица: `masters`

```sql
id            uuid PRIMARY KEY
telegram_id   bigint UNIQUE        -- Telegram user ID мастера
slug          text UNIQUE          -- URL-имя: 'ana-krista'
name          text                 -- 'Ana Krista Goyya'
bio           text                 -- биография
meta          text                 -- 'Таролог · 10 лет опыта'
avatar_url    text                 -- ссылка на фото в Storage
bg_url        text                 -- ссылка на фоновое изображение
channel_url   text                 -- https://t.me/Ana_Krista
whatsapp      text                 -- https://wa.me/13177520369
accent_color  text DEFAULT '#2AABEE' -- акцентный цвет (White Label)
bot_token     text                 -- NULL = общий бот, иначе свой
plan          text DEFAULT 'free'  -- 'free' | 'pro' | 'studio'
plan_expires  timestamp            -- когда истекает подписка
created_at    timestamp DEFAULT now()
```

### Таблица: `services`

```sql
id            uuid PRIMARY KEY
master_id     uuid REFERENCES masters(id)
category      text                 -- 'readings' | 'materials' | 'courses'
type          text                 -- 'consultation' | 'digital'
title         text
subtitle      text                 -- 'Онлайн · 60 мин'
description   text
includes      jsonb                -- ["пункт 1", "пункт 2"]
testimonial   text
testimonial_author text
price         integer              -- в рублях/центах
image_url     text
sort_order    integer DEFAULT 0
is_active     boolean DEFAULT true
created_at    timestamp DEFAULT now()
```

**Лимит бесплатного тарифа:** 5 активных услуг (`WHERE is_active = true`). При попытке добавить 6-ю — показываем предложение перейти на Pro.

### Таблица: `bookings`

```sql
id              uuid PRIMARY KEY
master_id       uuid REFERENCES masters(id)
service_id      uuid REFERENCES services(id)
client_tg_id    bigint              -- Telegram ID клиента
client_name     text
question        text
preferred_date  date
status          text DEFAULT 'new'  -- 'new' | 'confirmed' | 'done' | 'cancelled'
payment_status  text DEFAULT 'pending' -- 'pending' | 'paid' | 'refunded'
payment_method  text                -- 'stars' | 'stripe' | 'manual'
created_at      timestamp DEFAULT now()
```

### Таблица: `subscriptions`

```sql
id              uuid PRIMARY KEY
master_id       uuid REFERENCES masters(id)
plan            text                -- 'pro' | 'studio'
amount          integer             -- сумма в центах
payment_method  text                -- 'stars' | 'stripe'
stripe_sub_id   text                -- ID подписки в Stripe (если Stripe)
starts_at       timestamp
expires_at      timestamp
created_at      timestamp DEFAULT now()
```

---

## API — какие эндпоинты нужны

Все роуты в `api/` (Vercel serverless).

### Публичные (без авторизации)

| Метод | URL | Что делает |
|---|---|---|
| `GET` | `/api/masters/[slug]` | Профиль мастера + активные услуги |
| `POST` | `/api/bookings` | Создать заявку от клиента |
| `GET` | `/api/webhook` | Проверка работоспособности |
| `POST` | `/api/webhook` | Telegram webhook (команды бота) |

### Только для мастера (проверяем `telegram_id` из `initData`)

| Метод | URL | Что делает |
|---|---|---|
| `GET` | `/api/master/me` | Свой профиль и тариф |
| `PUT` | `/api/master/me` | Обновить профиль (имя, bio, цвет) |
| `GET` | `/api/master/services` | Список своих услуг |
| `POST` | `/api/master/services` | Создать услугу |
| `PUT` | `/api/master/services/[id]` | Редактировать услугу |
| `DELETE` | `/api/master/services/[id]` | Удалить / скрыть услугу |
| `GET` | `/api/master/bookings` | Все заявки от клиентов |
| `PUT` | `/api/master/bookings/[id]` | Изменить статус заявки |
| `POST` | `/api/master/upload` | Загрузить фото (аватар/фон/услуга) |

### Только для суперадмина

| Метод | URL | Что делает |
|---|---|---|
| `GET` | `/api/admin/masters` | Все мастера и их статусы |
| `PUT` | `/api/admin/masters/[id]/plan` | Изменить тариф вручную |

---

## Онбординг мастера через бота

Мастер пишет `/start` главному боту платформы:

```
Бот: «Привет! Ты мастер или хочешь записаться к мастеру?»
  → [Я мастер] [Я клиент]

Мастер нажимает [Я мастер]:

Бот: «Как тебя зовут? Напиши своё имя»
  → Мастер: «Ana Krista Goyya»

Бот: «Напиши 1–2 предложения о себе»
  → Мастер: «Таролог с 10-летним опытом...»

Бот: «Отправь своё фото»
  → Мастер: [фото]

Бот: «Готово! Твоё приложение:
  t.me/TaroAppBot/app?start=ana-krista

  Добавь первые услуги:»
  → [Добавить услугу]
```

Весь процесс — внутри Telegram, без браузера.

---

## Панель мастера

Мастер управляет приложением прямо из бота или через Mini App.

**В боте:**
- Список входящих заявок
- Статистика за неделю (сколько заявок, сколько просмотров)
- Кнопка «Изменить услуги»

**В Mini App (вкладка «Мастер», видна только мастеру):**
- Редактор услуг: добавить / изменить / скрыть
- Загрузка фото
- Выбор цветовой схемы (платно)
- Статус тарифа и кнопка продления

---

## Тарифы и ограничения

| | **Бесплатно** | **Pro — $19/мес** | **Studio — $49/мес** |
|---|---|---|---|
| Услуги | до 5 | неограниченно | неограниченно |
| Свой бот-токен | ❌ | ✅ | ✅ |
| Выбор цветов | ❌ | ✅ | ✅ |
| Статистика | ❌ | ✅ | ✅ |
| Мастеров в аккаунте | 1 | 1 | до 5 |
| Автоматические напоминания | ❌ | ✅ | ✅ |

---

## Оплата клиентов мастера

Поддерживаем оба варианта — Россия и Весь мир:

| Способ | Как работает | Для кого |
|---|---|---|
| **Telegram Stars** | Встроено в Telegram, без банков | Весь мир (Россия, США, Европа) |
| **Stripe** | Обычная карта, внешняя страница | США, Европа |
| **Вручную** | Мастер присылает реквизиты сам | Всегда доступно бесплатно |

**Для v2 рекомендация:** стартовать с ручной оплаты + Telegram Stars. Stripe добавить в v3.

---

## Оплата подписки мастеров (тебе)

| Способ | Кому подходит |
|---|---|
| **Telegram Stars** | Мастера из России и СНГ |
| **Stripe** | Мастера из США и Европы |

Stripe поддерживает регулярные подписки (recurring) — мастер платит раз и забывает.

---

## Хранение файлов

**Supabase Storage** — бесплатно до 1GB.

```
avatars/[master_id]/avatar.jpg
backgrounds/[master_id]/bg.jpg
services/[master_id]/[service_id].jpg
```

Публичный доступ на чтение (картинки открыты для клиентов).  
Запись — только авторизованный мастер через `/api/master/upload`.

---

## Безопасность — кто что видит

| Данные | Клиент | Мастер | Другой мастер | Суперадмин |
|---|---|---|---|---|
| Профиль мастера | ✅ только свой | ✅ | ❌ | ✅ все |
| Услуги мастера | ✅ только активные | ✅ все | ❌ | ✅ все |
| Заявки | ❌ | ✅ свои | ❌ | ✅ все |
| Telegram ID клиентов | ❌ | ✅ своих | ❌ | ✅ |
| Токен бота мастера | ❌ | ✅ | ❌ | ✅ |

**Авторизация мастера:** `Telegram.WebApp.initData` содержит подписанные данные пользователя. Сервер проверяет подпись через HMAC-SHA256 с токеном бота — это стандартная защита Telegram Mini Apps.

---

## Что менять в текущем коде

Текущий `data.js` — статические данные. Нужно заменить на API-запросы.

**Было:**
```javascript
const SERVICES = [ { id: 'reading-year', title: '...', price: 3500 } ]
```

**Станет:**
```javascript
const { master, services } = await fetch(`/api/masters/${masterSlug}`).then(r => r.json())
```

**Mini App определяет slug мастера из URL:**
```javascript
const params = new URLSearchParams(window.Telegram.WebApp.initDataUnsafe.start_param)
const masterSlug = params.get('master') || 'ana-krista' // fallback для текущей версии
```

---

## Порядок разработки

```
Шаг 1: База данных
  Создать Supabase проект
  Создать таблицы masters, services, bookings
  Перенести данные Аны из data.js в БД

Шаг 2: Публичное API
  GET /api/masters/[slug]  → Mini App грузит данные из БД
  POST /api/bookings       → заявки пишутся в БД

Шаг 3: Онбординг мастера
  Бот принимает /start от нового мастера
  Диалог через бота → запись в masters

Шаг 4: Панель мастера
  Новая вкладка в Mini App (видна только мастеру)
  CRUD услуг через API
  Загрузка фото в Supabase Storage

Шаг 5: Тарифы
  Проверка лимита (5 услуг бесплатно)
  Подключение Telegram Stars для оплаты подписки

Шаг 6: White Label
  Выбор accent_color (для Pro)
  Подключение своего bot_token (для Pro)
```

---

## Технический стек

| Компонент | Технология | Почему |
|---|---|---|
| База данных | **Supabase** (PostgreSQL) | Бесплатно, встроенный Auth, Storage, realtime |
| Хостинг API | **Vercel Serverless** | Уже там, бесплатно |
| Хранение файлов | **Supabase Storage** | Встроено в Supabase |
| Фронтенд | HTML+CSS+JS (уже есть) | Менять не нужно |
| Оплата (клиенты) | **Telegram Stars** + вручную | Простейший старт |
| Оплата (подписки) | **Stripe** + **Telegram Stars** | Россия и весь мир |
