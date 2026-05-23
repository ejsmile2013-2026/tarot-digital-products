-- ============================================================
-- Схема базы данных — SaaS-платформа для мастеров Таро
-- Запускать в Supabase: Dashboard → SQL Editor → Run
-- ============================================================

-- Включить расширение для UUID
create extension if not exists "pgcrypto";

-- ============================================================
-- МАСТЕРА
-- ============================================================
create table if not exists masters (
  id            uuid primary key default gen_random_uuid(),
  telegram_id   bigint unique not null,  -- Telegram user ID мастера
  slug          text unique not null,    -- URL: 'ana-krista'
  name          text not null,
  bio           text,
  meta          text,                    -- 'Таролог · 10 лет опыта'
  avatar_url    text,
  bg_url        text,
  channel_url   text,
  whatsapp      text,
  accent_color  text not null default '#2AABEE',
  bot_token     text,                    -- NULL = общий бот платформы
  plan          text not null default 'free', -- 'free' | 'pro' | 'studio'
  plan_expires  timestamptz,
  stats         text,                    -- '2000+ сессий · Онлайн'
  created_at    timestamptz default now()
);

-- ============================================================
-- УСЛУГИ
-- ============================================================
create table if not exists services (
  id                 uuid primary key default gen_random_uuid(),
  master_id          uuid not null references masters(id) on delete cascade,
  category           text not null default 'readings', -- 'readings' | 'materials' | 'courses'
  type               text not null default 'consultation', -- 'consultation' | 'digital'
  emoji              text,
  title              text not null,
  subtitle           text,
  description        text,
  includes           jsonb default '[]'::jsonb,   -- ["пункт 1", "пункт 2"]
  testimonial        text,
  testimonial_author text,
  price              integer not null default 0,   -- в рублях
  image_url          text,
  gradient           text default 'linear-gradient(135deg, #4c1d95 0%, #3730a3 100%)',
  sort_order         integer default 0,
  is_active          boolean default true,
  created_at         timestamptz default now()
);

-- ============================================================
-- ЗАЯВКИ
-- ============================================================
create table if not exists bookings (
  id              uuid primary key default gen_random_uuid(),
  master_id       uuid not null references masters(id) on delete cascade,
  service_id      uuid references services(id) on delete set null,
  service_title   text,                    -- snapshot названия на момент записи
  client_tg_id    bigint,                  -- Telegram ID клиента
  client_name     text,
  question        text,
  preferred_date  date,
  status          text default 'new',      -- 'new' | 'confirmed' | 'done' | 'cancelled'
  payment_status  text default 'pending',  -- 'pending' | 'paid' | 'refunded'
  payment_method  text,                    -- 'stars' | 'stripe' | 'manual'
  created_at      timestamptz default now()
);

-- ============================================================
-- ПОДПИСКИ
-- ============================================================
create table if not exists subscriptions (
  id              uuid primary key default gen_random_uuid(),
  master_id       uuid not null references masters(id) on delete cascade,
  plan            text not null,
  amount_cents    integer,
  payment_method  text,
  stripe_sub_id   text,
  starts_at       timestamptz,
  expires_at      timestamptz,
  created_at      timestamptz default now()
);

-- ============================================================
-- СЕССИИ ОНБОРДИНГА МАСТЕРОВ
-- Состояние диалога хранится в БД (Vercel serverless — stateless)
-- ============================================================
create table if not exists onboarding_sessions (
  telegram_id   bigint primary key,
  step          text not null default 'name', -- 'name' | 'bio' | 'niche'
  data          jsonb not null default '{}'::jsonb,
  created_at    timestamptz default now()
);

-- ============================================================
-- ИНДЕКСЫ — для быстрых запросов
-- ============================================================
create index if not exists idx_services_master    on services(master_id) where is_active = true;
create index if not exists idx_bookings_master    on bookings(master_id);
create index if not exists idx_bookings_client    on bookings(client_tg_id);
create index if not exists idx_masters_slug       on masters(slug);
create index if not exists idx_masters_tg_id      on masters(telegram_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Мастер видит и редактирует только своё
-- ============================================================
alter table masters     enable row level security;
alter table services    enable row level security;
alter table bookings    enable row level security;
alter table subscriptions enable row level security;

-- Профиль мастера: читать могут все, писать — только сам мастер
-- (через service_role key в API — RLS обходится только на сервере)
create policy "public read masters"
  on masters for select using (true);

-- Услуги: читать могут все (только активные — через WHERE в запросе)
create policy "public read services"
  on services for select using (true);

-- Заявки: видит только мастер через service_role на сервере
-- (клиент не имеет прямого доступа к таблице)
create policy "no direct access bookings"
  on bookings for select using (false);

create policy "no direct access subscriptions"
  on subscriptions for select using (false);

-- ============================================================
-- ДАННЫЕ ANA KRISTA — первый мастер
-- Запускать отдельно после создания таблиц
-- ============================================================

-- Вставить мастера (заменить telegram_id на реальный ID Аны — 449959218)
insert into masters (
  telegram_id, slug, name, bio, meta, stats,
  channel_url, whatsapp, accent_color, plan
) values (
  449959218,
  'ana-krista',
  'Ana Krista Goyya',
  '10 лет в практике Таро — это тысячи прочитанных раскладов, сотни изменённых судеб и глубокое понимание каждой карты. Помогаю найти ясность там, где кажется, что выхода нет: в отношениях, карьере, жизненных переменах.',
  'Таролог · 10 лет опыта',
  '2000+ сессий · Онлайн',
  'https://t.me/Ana_Krista',
  'https://wa.me/13177520369',
  '#2AABEE',
  'pro'
) on conflict (slug) do nothing;

-- Вставить услуги Аны (master_id заполнится через подзапрос)
insert into services (master_id, category, type, emoji, title, subtitle, description, includes, testimonial, testimonial_author, price, gradient, sort_order)
select
  m.id,
  s.category, s.type, s.emoji, s.title, s.subtitle, s.description,
  s.includes::jsonb, s.testimonial, s.testimonial_author, s.price, s.gradient, s.sort_order
from masters m, (values
  ('readings',  'consultation', '🔮', 'Расклад на год',          'Онлайн · 60 мин',        'Разберём 12 сфер жизни: что ждёт тебя в карьере, отношениях, здоровье и деньгах.',          '["Анализ 12 сфер жизни","Запись консультации","PDF-конспект после сессии","Ответы на 3 уточняющих вопроса"]', 'Наконец-то поняла свой путь — появилась ясность и спокойствие.', 'Катя, Москва',              3500, 'linear-gradient(135deg, #4c1d95 0%, #3730a3 100%)', 1),
  ('readings',  'consultation', '💜', 'Расклад на отношения',    'Онлайн · 45 мин',        'Поймёшь, куда движется связь, что мешает сближению и стоит ли продолжать.',                '["Анализ динамики отношений","Потенциал и препятствия","Рекомендации по действиям","Запись консультации"]', 'Ответила на вопрос, который мучил меня 2 года. Прямо и честно.',  'Алина, Санкт-Петербург',   2500, 'linear-gradient(135deg, #831843 0%, #9d174d 100%)',  2),
  ('readings',  'consultation', '✨', 'Расклад на вопрос',       'Онлайн · 30 мин',        'Один вопрос — развёрнутый ответ. Идеально, если уже знаешь, что спросить.',                '["Развёрнутый анализ ситуации","Рекомендации по действиям","Ответ в течение 24 часов"]',                    'Быстро, чётко, по делу. Буду обращаться снова!',                  'Марина, Екатеринбург',     1500, 'linear-gradient(135deg, #92400e 0%, #b45309 100%)',  3),
  ('materials', 'digital',      '📖', 'PDF-Гайд по Раскладам',   'PDF · Мгновенно',        '5 схем на любовь и финансы с пошаговыми инструкциями для самостоятельной работы.',          '["5 схем с пошаговыми инструкциями","Примеры интерпретаций карт","Подходит для начинающих","Доступ сразу после оплаты"]', 'Наконец-то научилась делать расклады сама!', 'Лена, Казань',             990,  'linear-gradient(135deg, #1e3a5f 0%, #1e40af 100%)',  4),
  ('materials', 'digital',      '🌙', 'Лунный Ритуал',           'Аудио + PDF · Мгновенно','Аудио-медитация и чек-лист под новолуние для осознанной постановки намерений.',             '["Аудио-медитация 20 мин","Чек-лист ритуала новолуния","Инструкция по работе с намерениями","Доступ сразу после оплаты"]', 'Теперь каждое новолуние — мой личный праздник.', 'Ольга, Новосибирск',       790,  'linear-gradient(135deg, #0c4a6e 0%, #0369a1 100%)',  5),
  ('materials', 'digital',      '🃏', 'Шпаргалка Арканов',       'PDF · Мгновенно',        'Карманный справочник значений всех 22 Старших Арканов в прямом и перевёрнутом положении.', '["Все 22 Старших Аркана","Прямое и перевёрнутое значение","Ключевые слова для быстрого чтения","Доступ сразу после оплаты"]', 'Всегда под рукой. Незаменимо для раскладов!', 'Наташа, Воронеж',          490,  'linear-gradient(135deg, #064e3b 0%, #059669 100%)',  6)
) as s(category, type, emoji, title, subtitle, description, includes, testimonial, testimonial_author, price, gradient, sort_order)
where m.slug = 'ana-krista'
on conflict do nothing;
