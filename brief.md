# Telegram Mini App — Каталог услуг Ana Krista Goyya

> **Для разработки:** Используй `superpowers:subagent-driven-development` или `superpowers:executing-plans` для пошагового выполнения.

**Цель:** Telegram Mini App — персональная витрина тарологa Ana Krista, через которую клиент за 3 тапа выбирает услугу, оставляет заявку или покупает цифровой продукт, не выходя из Telegram.

**Архитектура:** Новый entry point `mini-app.html` / `src/mini-app/` добавляется к существующему Vite-проекту. Telegram SDK инициализируется на mount, навигация — useState-стек без роутера, отправка заявок — через `Telegram.WebApp.sendData()` к боту. Никакого нового backend в v1.

**Tech Stack:** React 19 + TypeScript + Vite + Tailwind CSS 4 + motion/react + Telegram Mini Apps SDK (`@telegram-apps/sdk`)

---

## Список экранов

```
[Home]
  ↓ тап на карточку
[Service Detail]
  ↓ MainButton «Записаться» (для консультаций)
[Booking Form]
  ↓ MainButton «Отправить»
[Confirmation]
  ↓ MainButton «Вернуться в каталог»
[Home]

[Service Detail]
  ↓ MainButton «Получить» (для цифровых продуктов)
[Confirmation]
```

---

## Экраны — детальная спецификация

---

### Экран 1: Home / Каталог

**Что видит пользователь:**

```
┌─────────────────────────────────┐
│  [фото Аны, круглое, 72px]      │
│  Ana Krista Goyya               │
│  Таролог · 5 лет · 2000+ сессий │
│                                  │
│  [Расклады] [Материалы] [Курсы] │  ← tabs, горизонтальный скролл
│                                  │
│  ┌────────┐  ┌────────┐         │
│  │ 🔮     │  │ 📖     │         │  ← карточки услуг 2 колонки
│  │ Расклад│  │ PDF    │         │
│  │на год  │  │Гайд    │         │
│  │ 3500₽  │  │ 990₽   │         │
│  └────────┘  └────────┘         │
│  ┌────────┐  ┌────────┐         │
│  │ 🌙     │  │ ✨     │         │
│  │ Лунный │  │ Карта  │         │
│  │ Ритуал │  │ дня    │         │
│  │ 790₽   │  │ 490₽   │         │
│  └────────┘  └────────┘         │
└─────────────────────────────────┘
```

**Элементы:**
- Круглое фото Аны (72×72px)
- Имя `Ana Krista Goyya` — текст белый, 18px, bold
- Подзаголовок — «Таролог · 5 лет · 2000+ сессий» — muted, 13px
- Горизонтальные tabs-chips: «Все», «Расклады», «Материалы», «Курсы»
- Сетка карточек 2 колонки
- Каждая карточка: иконка/emoji (40px), название, цена, тёмный фон `#0d0a1e`, border `border-white/10`

**Действия:**
- Тап на tab → фильтрация карточек (без перезагрузки, motion fade)
- Тап на карточку → переход на Service Detail
- Haptic `impactOccurred('light')` при тапе на карточку

**Переходы:**
- Карточка → `[Service Detail]` (slide up / bottom sheet анимация)

**SDK при входе:**
```typescript
Telegram.WebApp.expand()
Telegram.WebApp.ready()
Telegram.WebApp.setHeaderColor('#080614')
Telegram.WebApp.setBackgroundColor('#080614')
BackButton.hide()
MainButton.hide()
```

---

### Экран 2: Service Detail

**Что видит пользователь:**

```
┌─────────────────────────────────┐
│ ← (BackButton Telegram)         │
│                                  │
│  [иллюстрация/иконка услуги]    │  ← 160px высота, rounded-2xl
│                                  │
│  Расклад на год                 │  ← название, 22px bold
│  Онлайн · 60 мин                │  ← формат, muted
│                                  │
│  Что ты получишь:               │  ← секция
│  ✓ Анализ 12 сфер жизни        │
│  ✓ Запись консультации          │
│  ✓ PDF-конспект после сессии   │
│                                  │
│  ❝ Наконец-то поняла свой путь │
│    — Катя, Москва ❞            │  ← 1 отзыв, курсив
│                                  │
│  3 500 ₽                        │  ← крупная цена, оранжевый
│                                  │
└─────────────────────────────────┘
│         Записаться              │  ← Telegram MainButton (оранжевый)
```

**Элементы:**
- Иллюстрация услуги или large emoji на тёмном градиентном фоне (160px)
- Название услуги — 22px, белый
- Формат — «Онлайн · 60 мин» или «PDF · Мгновенно» — 13px, muted
- Список «Что ты получишь» — 3–5 пунктов с ✓
- Один отзыв — курсив, muted, в кавычках
- Цена — 28px, `#f97316` оранжевый
- Telegram MainButton: для консультаций — «Записаться», для цифровых продуктов — «Получить»

**Действия:**
- BackButton → `[Home]`
- MainButton «Записаться» → `[Booking Form]`
- MainButton «Получить» → `[Confirmation]` (для цифровых продуктов — сразу)
- Haptic `impactOccurred('medium')` при нажатии MainButton

**SDK:**
```typescript
BackButton.show()
BackButton.onClick(() => navigate('home'))
MainButton.show()
MainButton.setText('Записаться') // или 'Получить'
MainButton.color = '#f97316'
```

---

### Экран 3: Booking Form

*Только для услуг-консультаций. Цифровые продукты этот экран пропускают.*

**Что видит пользователь:**

```
┌─────────────────────────────────┐
│ ← (BackButton Telegram)         │
│                                  │
│  Расклад на год                 │  ← название услуги, muted
│                                  │
│  Как тебя зовут?                │
│  ┌─────────────────────────────┐│
│  │ Катя           (auto-fill)  ││  ← из initData, readonly стиль
│  └─────────────────────────────┘│
│                                  │
│  Твой вопрос или тема:          │
│  ┌─────────────────────────────┐│
│  │                             ││  ← textarea, 4 строки
│  │                             ││
│  └─────────────────────────────┘│
│                                  │
│  Удобная дата:                  │
│  ← [25 мая] [26 мая] [27 мая] →│  ← горизонтальный скролл
│                                  │
│  Шаг 1 из 1                     │  ← прогресс
└─────────────────────────────────┘
│           Отправить             │  ← MainButton
```

**Элементы:**
- Название услуги (хлебная крошка) — muted, 13px
- Поле «Имя» — prefilled из `initData.user.first_name`, визуально read-only (но редактируемо)
- Textarea «Вопрос» — placeholder «Что беспокоит? Над чем работаем?», минимум 80px, растёт по контенту
- Горизонтальный скролл дат — 7 дней начиная с завтра, карточки 56×64px, активная — оранжевая
- Индикатор «Шаг 1 из 1» — muted, снизу

**Действия:**
- BackButton → `[Service Detail]`
- Выбор даты → подсветка выбранной
- MainButton «Отправить» → только активна если textarea не пустая → `[Confirmation]`
- Haptic `selectionChanged()` при смене даты
- `enableClosingConfirmation()` при входе на экран

**SDK:**
```typescript
enableClosingConfirmation()
MainButton.setText('Отправить')
MainButton.disable() // пока textarea пуста
// При вводе текста:
MainButton.enable()
// При отправке:
MainButton.showProgress()
Telegram.WebApp.sendData(JSON.stringify({ service, name, question, date }))
```

---

### Экран 4: Confirmation

**Что видит пользователь:**

```
┌─────────────────────────────────┐
│                                  │
│                                  │
│            ✨                   │  ← animated emoji / success icon, 64px
│                                  │
│      Заявка отправлена!         │  ← 22px, белый
│                                  │
│  Расклад на год · 3 500 ₽       │  ← что именно, muted
│                                  │
│  ┌─────────────────────────────┐│
│  │ Что происходит дальше:      ││
│  │ Ана напишет тебе в этот чат ││
│  │ в течение 24 часов          ││
│  └─────────────────────────────┘│
│                                  │
│                                  │
└─────────────────────────────────┘
│      Вернуться в каталог        │  ← MainButton
```

**Элементы:**
- ✨ иконка (64px) с pulse-анимацией через motion/react
- Заголовок «Заявка отправлена!» или «Готово!»
- Саммари: что заказано + цена
- Блок «Что дальше» — конкретный текст: кто, когда, как свяжется
- BackButton — скрыт
- MainButton «Вернуться в каталог»

**Действия:**
- MainButton → `[Home]` + сброс стека
- При mount: `HapticFeedback.notificationOccurred('success')`
- При mount: `disableClosingConfirmation()`

**SDK:**
```typescript
BackButton.hide()
MainButton.setText('Вернуться в каталог')
MainButton.hideProgress()
HapticFeedback.notificationOccurred('success')
disableClosingConfirmation()
```

---

## Данные — структура каталога

```typescript
// src/mini-app/data/services.ts
type ServiceCategory = 'all' | 'readings' | 'materials' | 'courses'
type ServiceType = 'consultation' | 'digital'

interface Service {
  id: string
  category: ServiceCategory
  type: ServiceType          // consultation → Booking Form, digital → прямо в Confirmation
  emoji: string
  title: string
  subtitle: string           // «Онлайн · 60 мин» / «PDF · Мгновенно»
  description: string        // 1–2 предложения
  includes: string[]         // 3–5 пунктов «Что ты получишь»
  testimonial: string        // одна цитата
  testimonialAuthor: string
  price: number              // в рублях
  accentColor: string        // Tailwind класс для иллюстрации фона
}
```

**Начальный набор услуг v1:**

| id | Категория | Тип | Название | Цена |
|---|---|---|---|---|
| `reading-year` | readings | consultation | Расклад на год | 3 500 ₽ |
| `reading-love` | readings | consultation | Расклад на отношения | 2 500 ₽ |
| `reading-question` | readings | consultation | Расклад на один вопрос | 1 500 ₽ |
| `pdf-spreads` | materials | digital | PDF-Гайд по Раскладам | 990 ₽ |
| `audio-moon` | materials | digital | Лунный Ритуал (аудио) | 790 ₽ |
| `pdf-arcana` | materials | digital | Шпаргалка Арканов | 490 ₽ |

---

## Чего НЕ будет в первой версии

| Фича | Почему отложено |
|---|---|
| Онлайн-оплата (Telegram Payments / Stars) | Требует BotFather настройку и тестирование флоу — v2 |
| История заказов / личный кабинет | Нет backend, нет персистентности — v2 |
| Корзина (несколько товаров) | Избыточно для соло-практика — v3 |
| Отзывы с реальными данными | Статичные данные достаточно для старта |
| Поиск по каталогу | Каталог маленький, фильтр по категориям достаточен |
| Telegram-авторизация с верификацией на сервере | Без backend — не нужна |
| Напоминания и follow-up нотификации | Нужен бот с webhook — v2 |
| Рейтинг и звёзды | Нет механики сбора — v2 |
| Анимация карточек таро (flip) | Другой продукт (Calculator) — не мешать |
| React Router | Конфликт с Telegram BackButton — никогда |
| Горизонтальный swipe между экранами | Конфликт со swipe-to-close Mini App — никогда |

---

## Файловая структура

```
src/
  mini-app/
    MiniApp.tsx              ← root компонент, SDK init, навигационный стек
    data/
      services.ts            ← массив Service[], типы, фильтрация
    screens/
      HomeScreen.tsx         ← каталог + tabs + грид карточек
      ServiceDetailScreen.tsx ← детали + MainButton
      BookingFormScreen.tsx  ← форма + дата-скролл
      ConfirmationScreen.tsx ← success state
    components/
      ServiceCard.tsx        ← карточка в гриде (reusable)
      DatePicker.tsx         ← горизонтальный скролл дней
      SkeletonCard.tsx       ← skeleton loader для грида
    hooks/
      useTelegram.ts         ← обёртка над window.Telegram.WebApp
      useNavigation.ts       ← стек экранов + BackButton sync
    types.ts                 ← Service, Screen, NavigationState
mini-app.html                ← новый entry point для Mini App
```

**Существующие файлы — не трогать:**
- `src/App.tsx`, `src/Guide.tsx`, `src/Calculator.tsx` — остаются как есть
- `index.html` — не изменять
- `vite.config.ts` — добавить второй entry point (`mini-app.html`)

---

## Пошаговый план реализации

---

### Задача 1: Установка SDK и настройка entry point

**Файлы:**
- Создать: `mini-app.html`
- Создать: `src/mini-app/main-mini-app.tsx`
- Создать: `src/mini-app/types.ts`
- Изменить: `vite.config.ts`

- [ ] **Шаг 1.1: Установить SDK**
```bash
npm install @telegram-apps/sdk
```

- [ ] **Шаг 1.2: Создать `mini-app.html`**
```html
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <title>Ana Krista · Таро</title>
  <script src="https://telegram.org/js/telegram-web-app.js"></script>
</head>
<body>
  <div id="mini-app-root"></div>
  <script type="module" src="/src/mini-app/main-mini-app.tsx"></script>
</body>
</html>
```

- [ ] **Шаг 1.3: Добавить entry point в `vite.config.ts`**
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        miniapp: resolve(__dirname, 'mini-app.html'),
      },
    },
  },
})
```

- [ ] **Шаг 1.4: Создать `src/mini-app/types.ts`**
```typescript
export type ServiceCategory = 'all' | 'readings' | 'materials' | 'courses'
export type ServiceType = 'consultation' | 'digital'
export type ScreenName = 'home' | 'detail' | 'booking' | 'confirmation'

export interface Service {
  id: string
  category: Exclude<ServiceCategory, 'all'>
  type: ServiceType
  emoji: string
  title: string
  subtitle: string
  description: string
  includes: string[]
  testimonial: string
  testimonialAuthor: string
  price: number
  accentColor: string
}

export interface NavigationState {
  screen: ScreenName
  selectedService: Service | null
}
```

- [ ] **Шаг 1.5: Создать `src/mini-app/main-mini-app.tsx`**
```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import MiniApp from './MiniApp'
import '../index.css'

ReactDOM.createRoot(document.getElementById('mini-app-root')!).render(
  <React.StrictMode>
    <MiniApp />
  </React.StrictMode>
)
```

- [ ] **Шаг 1.6: Проверить сборку**
```bash
npm run build
# Ожидаем: dist/mini-app.html существует, ошибок нет
```

- [ ] **Шаг 1.7: Коммит**
```bash
git add mini-app.html src/mini-app/main-mini-app.tsx src/mini-app/types.ts vite.config.ts package.json package-lock.json
git commit -m "feat: add Telegram Mini App entry point and types"
```

---

### Задача 2: Хуки — useTelegram и useNavigation

**Файлы:**
- Создать: `src/mini-app/hooks/useTelegram.ts`
- Создать: `src/mini-app/hooks/useNavigation.ts`

- [ ] **Шаг 2.1: Создать `src/mini-app/hooks/useTelegram.ts`**
```typescript
import { useEffect } from 'react'

declare global {
  interface Window {
    Telegram: {
      WebApp: TelegramWebApp
    }
  }
}

interface TelegramWebApp {
  expand: () => void
  ready: () => void
  setHeaderColor: (color: string) => void
  setBackgroundColor: (color: string) => void
  sendData: (data: string) => void
  enableClosingConfirmation: () => void
  disableClosingConfirmation: () => void
  MainButton: {
    text: string
    color: string
    show: () => void
    hide: () => void
    enable: () => void
    disable: () => void
    showProgress: (leaveActive?: boolean) => void
    hideProgress: () => void
    setText: (text: string) => void
    onClick: (fn: () => void) => void
    offClick: (fn: () => void) => void
  }
  BackButton: {
    show: () => void
    hide: () => void
    onClick: (fn: () => void) => void
    offClick: (fn: () => void) => void
  }
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void
    selectionChanged: () => void
  }
  initDataUnsafe: {
    user?: {
      id: number
      first_name: string
      last_name?: string
      username?: string
    }
  }
}

export function useTelegram() {
  const tg = window.Telegram?.WebApp

  useEffect(() => {
    if (!tg) return
    tg.expand()
    tg.ready()
    tg.setHeaderColor('#080614')
    tg.setBackgroundColor('#080614')
  }, [])

  return {
    tg,
    user: tg?.initDataUnsafe?.user,
    haptic: tg?.HapticFeedback,
    mainButton: tg?.MainButton,
    backButton: tg?.BackButton,
  }
}
```

- [ ] **Шаг 2.2: Создать `src/mini-app/hooks/useNavigation.ts`**
```typescript
import { useState, useEffect } from 'react'
import type { ScreenName, NavigationState, Service } from '../types'

export function useNavigation(backButton: { show: () => void; hide: () => void; onClick: (fn: () => void) => void; offClick: (fn: () => void) => void } | undefined) {
  const [stack, setStack] = useState<NavigationState[]>([
    { screen: 'home', selectedService: null },
  ])

  const current = stack[stack.length - 1]

  function push(screen: ScreenName, selectedService: Service | null = null) {
    setStack(prev => [...prev, { screen, selectedService }])
  }

  function pop() {
    setStack(prev => (prev.length > 1 ? prev.slice(0, -1) : prev))
  }

  function reset() {
    setStack([{ screen: 'home', selectedService: null }])
  }

  useEffect(() => {
    if (!backButton) return
    if (stack.length > 1) {
      backButton.show()
      backButton.onClick(pop)
    } else {
      backButton.hide()
    }
    return () => {
      backButton.offClick(pop)
    }
  }, [stack.length, backButton])

  return { current, push, pop, reset }
}
```

- [ ] **Шаг 2.3: Коммит**
```bash
git add src/mini-app/hooks/
git commit -m "feat: add useTelegram and useNavigation hooks"
```

---

### Задача 3: Данные каталога

**Файлы:**
- Создать: `src/mini-app/data/services.ts`

- [ ] **Шаг 3.1: Создать `src/mini-app/data/services.ts`**
```typescript
import type { Service } from '../types'

export const SERVICES: Service[] = [
  {
    id: 'reading-year',
    category: 'readings',
    type: 'consultation',
    emoji: '🔮',
    title: 'Расклад на год',
    subtitle: 'Онлайн · 60 мин',
    description: 'Разберём 12 сфер жизни: что ждёт тебя в карьере, отношениях, здоровье и деньгах.',
    includes: [
      'Анализ 12 сфер жизни',
      'Запись консультации',
      'PDF-конспект после сессии',
      'Ответы на 3 уточняющих вопроса',
    ],
    testimonial: 'Наконец-то поняла свой путь — появилась ясность и спокойствие.',
    testimonialAuthor: 'Катя, Москва',
    price: 3500,
    accentColor: 'from-purple-900/60 to-indigo-900/60',
  },
  {
    id: 'reading-love',
    category: 'readings',
    type: 'consultation',
    emoji: '💜',
    title: 'Расклад на отношения',
    subtitle: 'Онлайн · 45 мин',
    description: 'Поймёшь, куда движется связь, что мешает сближению и стоит ли продолжать.',
    includes: [
      'Анализ динамики отношений',
      'Потенциал и препятствия',
      'Запись консультации',
    ],
    testimonial: 'Ответила на вопрос, который мучил меня 2 года. Прямо и честно.',
    testimonialAuthor: 'Алина, Санкт-Петербург',
    price: 2500,
    accentColor: 'from-pink-900/60 to-rose-900/60',
  },
  {
    id: 'reading-question',
    category: 'readings',
    type: 'consultation',
    emoji: '✨',
    title: 'Расклад на один вопрос',
    subtitle: 'Онлайн · 30 мин',
    description: 'Один вопрос — развёрнутый ответ. Идеально, если уже знаешь, что спросить.',
    includes: [
      'Развёрнутый анализ ситуации',
      'Рекомендации по действиям',
      'Ответ в течение 24 часов',
    ],
    testimonial: 'Быстро, чётко, по делу. Рекомендую!',
    testimonialAuthor: 'Марина, Екатеринбург',
    price: 1500,
    accentColor: 'from-amber-900/60 to-orange-900/60',
  },
  {
    id: 'pdf-spreads',
    category: 'materials',
    type: 'digital',
    emoji: '📖',
    title: 'PDF-Гайд по Раскладам',
    subtitle: 'PDF · Мгновенно',
    description: '5 схем на любовь и финансы с подробными инструкциями.',
    includes: [
      '5 схем с пошаговыми инструкциями',
      'Примеры интерпретаций',
      'Доступ сразу после оплаты',
    ],
    testimonial: 'Наконец-то научилась делать расклады сама!',
    testimonialAuthor: 'Лена, Казань',
    price: 990,
    accentColor: 'from-indigo-900/60 to-blue-900/60',
  },
  {
    id: 'audio-moon',
    category: 'materials',
    type: 'digital',
    emoji: '🌙',
    title: 'Лунный Ритуал',
    subtitle: 'Аудио + PDF · Мгновенно',
    description: 'Аудио-медитация и чек-лист под новолуние для постановки намерений.',
    includes: [
      'Аудио-медитация 20 мин',
      'Чек-лист ритуала',
      'Инструкция по работе с новолунием',
    ],
    testimonial: 'Теперь каждое новолуние — мой личный праздник.',
    testimonialAuthor: 'Ольга, Новосибирск',
    price: 790,
    accentColor: 'from-blue-900/60 to-sky-900/60',
  },
  {
    id: 'pdf-arcana',
    category: 'materials',
    type: 'digital',
    emoji: '🃏',
    title: 'Шпаргалка Арканов',
    subtitle: 'PDF · Мгновенно',
    description: 'Карманный справочник значений всех 22 Старших Арканов.',
    includes: [
      'Все 22 Старших Аркана',
      'Прямое и перевёрнутое значение',
      'Ключевые слова для быстрого чтения',
    ],
    testimonial: 'Всегда под рукой. Незаменимо!',
    testimonialAuthor: 'Наташа, Воронеж',
    price: 490,
    accentColor: 'from-emerald-900/60 to-teal-900/60',
  },
]

export function filterServices(services: Service[], category: string): Service[] {
  if (category === 'all') return services
  return services.filter(s => s.category === category)
}

export function getServiceById(id: string): Service | undefined {
  return SERVICES.find(s => s.id === id)
}
```

- [ ] **Шаг 3.2: Коммит**
```bash
git add src/mini-app/data/
git commit -m "feat: add services catalog data"
```

---

### Задача 4: Компоненты — ServiceCard и SkeletonCard

**Файлы:**
- Создать: `src/mini-app/components/ServiceCard.tsx`
- Создать: `src/mini-app/components/SkeletonCard.tsx`

- [ ] **Шаг 4.1: Создать `src/mini-app/components/ServiceCard.tsx`**
```typescript
import { motion } from 'motion/react'
import type { Service } from '../types'

interface Props {
  service: Service
  onTap: (service: Service) => void
}

export function ServiceCard({ service, onTap }: Props) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={() => onTap(service)}
      className="w-full text-left rounded-2xl border border-white/10 bg-[#0d0a1e] p-4 flex flex-col gap-2 min-h-[120px]"
    >
      <span className="text-3xl">{service.emoji}</span>
      <span className="text-white text-sm font-semibold leading-tight line-clamp-2">
        {service.title}
      </span>
      <span className="text-[#f97316] text-sm font-bold mt-auto">
        {service.price.toLocaleString('ru-RU')} ₽
      </span>
    </motion.button>
  )
}
```

- [ ] **Шаг 4.2: Создать `src/mini-app/components/SkeletonCard.tsx`**
```typescript
export function SkeletonCard() {
  return (
    <div className="w-full rounded-2xl border border-white/10 bg-[#0d0a1e] p-4 min-h-[120px] flex flex-col gap-2 animate-pulse">
      <div className="w-10 h-10 rounded-lg bg-white/10" />
      <div className="h-4 w-3/4 rounded bg-white/10" />
      <div className="h-4 w-1/2 rounded bg-white/10 mt-auto" />
    </div>
  )
}
```

- [ ] **Шаг 4.3: Коммит**
```bash
git add src/mini-app/components/
git commit -m "feat: add ServiceCard and SkeletonCard components"
```

---

### Задача 5: DatePicker компонент

**Файлы:**
- Создать: `src/mini-app/components/DatePicker.tsx`

- [ ] **Шаг 5.1: Создать `src/mini-app/components/DatePicker.tsx`**
```typescript
import { useRef } from 'react'

interface Props {
  value: string | null
  onChange: (date: string) => void
  onHaptic: () => void
}

function getNext7Days(): { label: string; value: string; dayName: string }[] {
  const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
  const result = []
  for (let i = 1; i <= 7; i++) {
    const d = new Date()
    d.setDate(d.getDate() + i)
    result.push({
      label: d.getDate().toString(),
      value: d.toISOString().split('T')[0],
      dayName: days[d.getDay()],
    })
  }
  return result
}

export function DatePicker({ value, onChange, onHaptic }: Props) {
  const dates = getNext7Days()
  const scrollRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={scrollRef}
      className="flex gap-2 overflow-x-auto pb-1 scrollbar-none snap-x snap-mandatory"
    >
      {dates.map(date => (
        <button
          key={date.value}
          onClick={() => {
            onChange(date.value)
            onHaptic()
          }}
          className={`flex-shrink-0 snap-start flex flex-col items-center justify-center w-14 h-16 rounded-xl border transition-colors ${
            value === date.value
              ? 'bg-[#f97316] border-[#f97316] text-white'
              : 'bg-[#0d0a1e] border-white/10 text-[#94a3b8]'
          }`}
        >
          <span className="text-xs">{date.dayName}</span>
          <span className="text-lg font-bold">{date.label}</span>
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Шаг 5.2: Коммит**
```bash
git add src/mini-app/components/DatePicker.tsx
git commit -m "feat: add DatePicker component"
```

---

### Задача 6: HomeScreen

**Файлы:**
- Создать: `src/mini-app/screens/HomeScreen.tsx`

- [ ] **Шаг 6.1: Создать `src/mini-app/screens/HomeScreen.tsx`**
```typescript
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { SERVICES, filterServices } from '../data/services'
import { ServiceCard } from '../components/ServiceCard'
import { SkeletonCard } from '../components/SkeletonCard'
import type { Service, ServiceCategory } from '../types'

interface Props {
  onSelectService: (service: Service) => void
  userName: string | undefined
}

const TABS: { id: ServiceCategory; label: string }[] = [
  { id: 'all', label: 'Все' },
  { id: 'readings', label: 'Расклады' },
  { id: 'materials', label: 'Материалы' },
  { id: 'courses', label: 'Курсы' },
]

export function HomeScreen({ onSelectService, userName }: Props) {
  const [activeTab, setActiveTab] = useState<ServiceCategory>('all')
  const [loaded, setLoaded] = useState(false)

  // Имитируем загрузку для skeleton (в реальности данные синхронные)
  useState(() => {
    const t = setTimeout(() => setLoaded(true), 400)
    return () => clearTimeout(t)
  })

  const services = filterServices(SERVICES, activeTab)

  return (
    <div className="flex flex-col min-h-screen bg-[#080614] text-white">
      {/* Профиль Аны */}
      <div className="flex flex-col items-center pt-8 pb-4 px-4">
        <div className="w-18 h-18 rounded-full bg-gradient-to-br from-purple-600 to-indigo-800 flex items-center justify-center text-3xl mb-3 border-2 border-white/10">
          🔮
        </div>
        <h1 className="text-lg font-bold">Ana Krista Goyya</h1>
        <p className="text-[#94a3b8] text-sm mt-1">
          {userName ? `Привет, ${userName}! ` : ''}Таролог · 5 лет · 2000+ сессий
        </p>
      </div>

      {/* Категории */}
      <div className="flex gap-2 overflow-x-auto px-4 pb-4 scrollbar-none">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-[#f97316] text-white'
                : 'bg-white/10 text-[#94a3b8]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Грид услуг */}
      <div className="grid grid-cols-2 gap-3 px-4 pb-8">
        <AnimatePresence mode="wait">
          {!loaded
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : services.map(service => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, delay: 0.05 }}
                >
                  <ServiceCard service={service} onTap={onSelectService} />
                </motion.div>
              ))}
        </AnimatePresence>
        {loaded && services.length === 0 && (
          <div className="col-span-2 text-center py-12 text-[#94a3b8]">
            <p className="text-4xl mb-3">🌙</p>
            <p>Здесь пока пусто</p>
            <p className="text-sm mt-1">Написать Ане напрямую →</p>
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Шаг 6.2: Коммит**
```bash
git add src/mini-app/screens/HomeScreen.tsx
git commit -m "feat: add HomeScreen with categories and service grid"
```

---

### Задача 7: ServiceDetailScreen

**Файлы:**
- Создать: `src/mini-app/screens/ServiceDetailScreen.tsx`

- [ ] **Шаг 7.1: Создать `src/mini-app/screens/ServiceDetailScreen.tsx`**
```typescript
import { useEffect } from 'react'
import type { Service } from '../types'

interface Props {
  service: Service
  onBook: () => void
  mainButton: { show: () => void; setText: (t: string) => void; onClick: (fn: () => void) => void; offClick: (fn: () => void) => void; color: string } | undefined
  onHaptic: () => void
}

export function ServiceDetailScreen({ service, onBook, mainButton, onHaptic }: Props) {
  useEffect(() => {
    if (!mainButton) return
    const label = service.type === 'consultation' ? 'Записаться' : 'Получить'
    mainButton.setText(label)
    mainButton.color = '#f97316'
    mainButton.show()
    const handler = () => {
      onHaptic()
      onBook()
    }
    mainButton.onClick(handler)
    return () => {
      mainButton.offClick(handler)
      mainButton.show() // keep visible between screens
    }
  }, [service, mainButton, onBook, onHaptic])

  return (
    <div className="flex flex-col min-h-screen bg-[#080614] text-white pb-20">
      {/* Иллюстрация */}
      <div className={`w-full h-40 bg-gradient-to-br ${service.accentColor} flex items-center justify-center rounded-b-3xl`}>
        <span className="text-7xl">{service.emoji}</span>
      </div>

      <div className="px-4 pt-5 flex flex-col gap-5">
        {/* Заголовок */}
        <div>
          <h2 className="text-2xl font-bold">{service.title}</h2>
          <p className="text-[#94a3b8] text-sm mt-1">{service.subtitle}</p>
        </div>

        {/* Описание */}
        <p className="text-[#f1f5f9] text-base leading-relaxed">{service.description}</p>

        {/* Что ты получишь */}
        <div>
          <p className="text-[#94a3b8] text-xs uppercase tracking-widest mb-3">Что ты получишь</p>
          <ul className="flex flex-col gap-2">
            {service.includes.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[#f1f5f9]">
                <span className="text-[#f97316] mt-0.5">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Отзыв */}
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
          <p className="text-[#f1f5f9] italic text-sm leading-relaxed">❝ {service.testimonial} ❞</p>
          <p className="text-[#94a3b8] text-xs mt-2">— {service.testimonialAuthor}</p>
        </div>

        {/* Цена */}
        <p className="text-[#f97316] text-3xl font-bold">
          {service.price.toLocaleString('ru-RU')} ₽
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Шаг 7.2: Коммит**
```bash
git add src/mini-app/screens/ServiceDetailScreen.tsx
git commit -m "feat: add ServiceDetailScreen"
```

---

### Задача 8: BookingFormScreen

**Файлы:**
- Создать: `src/mini-app/screens/BookingFormScreen.tsx`

- [ ] **Шаг 8.1: Создать `src/mini-app/screens/BookingFormScreen.tsx`**
```typescript
import { useState, useEffect } from 'react'
import { DatePicker } from '../components/DatePicker'
import type { Service } from '../types'

interface Props {
  service: Service
  userName: string
  onSubmit: (data: { question: string; date: string | null }) => void
  mainButton: {
    show: () => void
    setText: (t: string) => void
    enable: () => void
    disable: () => void
    showProgress: () => void
    onClick: (fn: () => void) => void
    offClick: (fn: () => void) => void
  } | undefined
  onEnableClosing: () => void
  onHaptic: (type: 'selection' | 'medium') => void
}

export function BookingFormScreen({ service, userName, onSubmit, mainButton, onEnableClosing, onHaptic }: Props) {
  const [question, setQuestion] = useState('')
  const [date, setDate] = useState<string | null>(null)

  useEffect(() => {
    onEnableClosing()
  }, [])

  useEffect(() => {
    if (!mainButton) return
    mainButton.setText('Отправить')
    mainButton.show()
    if (question.trim().length > 0) {
      mainButton.enable()
    } else {
      mainButton.disable()
    }
    const handler = () => {
      if (!question.trim()) return
      mainButton.showProgress()
      onHaptic('medium')
      onSubmit({ question, date })
    }
    mainButton.onClick(handler)
    return () => mainButton.offClick(handler)
  }, [question, date, mainButton, onSubmit, onHaptic])

  return (
    <div className="flex flex-col min-h-screen bg-[#080614] text-white px-4 pt-6 pb-24 gap-6">
      {/* Хлебная крошка */}
      <p className="text-[#94a3b8] text-sm">{service.title}</p>

      {/* Имя */}
      <div className="flex flex-col gap-2">
        <label className="text-sm text-[#94a3b8]">Как тебя зовут?</label>
        <div className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white text-base">
          {userName || 'Аноним'}
        </div>
      </div>

      {/* Вопрос */}
      <div className="flex flex-col gap-2">
        <label className="text-sm text-[#94a3b8]">Твой вопрос или тема:</label>
        <textarea
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="Что беспокоит? Над чем работаем?"
          rows={4}
          className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white text-base placeholder:text-[#4a5568] resize-none focus:outline-none focus:border-[#f97316]/50"
        />
      </div>

      {/* Дата */}
      <div className="flex flex-col gap-2">
        <label className="text-sm text-[#94a3b8]">Удобная дата:</label>
        <DatePicker
          value={date}
          onChange={setDate}
          onHaptic={() => onHaptic('selection')}
        />
      </div>

      <p className="text-xs text-[#4a5568] text-center">Шаг 1 из 1</p>
    </div>
  )
}
```

- [ ] **Шаг 8.2: Коммит**
```bash
git add src/mini-app/screens/BookingFormScreen.tsx
git commit -m "feat: add BookingFormScreen"
```

---

### Задача 9: ConfirmationScreen

**Файлы:**
- Создать: `src/mini-app/screens/ConfirmationScreen.tsx`

- [ ] **Шаг 9.1: Создать `src/mini-app/screens/ConfirmationScreen.tsx`**
```typescript
import { useEffect } from 'react'
import { motion } from 'motion/react'
import type { Service } from '../types'

interface Props {
  service: Service
  onHome: () => void
  mainButton: {
    show: () => void
    hide: () => void
    hideProgress: () => void
    setText: (t: string) => void
    onClick: (fn: () => void) => void
    offClick: (fn: () => void) => void
  } | undefined
  onSuccess: () => void
  onDisableClosing: () => void
}

export function ConfirmationScreen({ service, onHome, mainButton, onSuccess, onDisableClosing }: Props) {
  useEffect(() => {
    onSuccess()
    onDisableClosing()
    if (!mainButton) return
    mainButton.hideProgress()
    mainButton.setText('Вернуться в каталог')
    mainButton.show()
    mainButton.onClick(onHome)
    return () => mainButton.offClick(onHome)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#080614] text-white px-6 pb-24 gap-6">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="text-6xl"
      >
        ✨
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col items-center gap-2 text-center"
      >
        <h2 className="text-2xl font-bold">Заявка отправлена!</h2>
        <p className="text-[#94a3b8] text-sm">
          {service.title} · {service.price.toLocaleString('ru-RU')} ₽
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="w-full bg-white/5 border border-white/10 rounded-2xl p-5"
      >
        <p className="text-[#94a3b8] text-xs uppercase tracking-widest mb-3">Что происходит дальше</p>
        <p className="text-[#f1f5f9] text-sm leading-relaxed">
          Ана напишет тебе в этот чат в течение 24 часов — уточнит детали и пришлёт способ оплаты.
        </p>
      </motion.div>
    </div>
  )
}
```

- [ ] **Шаг 9.2: Коммит**
```bash
git add src/mini-app/screens/ConfirmationScreen.tsx
git commit -m "feat: add ConfirmationScreen with success animation"
```

---

### Задача 10: MiniApp.tsx — корневой компонент и сборка

**Файлы:**
- Создать: `src/mini-app/MiniApp.tsx`

- [ ] **Шаг 10.1: Создать `src/mini-app/MiniApp.tsx`**
```typescript
import { AnimatePresence, motion } from 'motion/react'
import { useTelegram } from './hooks/useTelegram'
import { useNavigation } from './hooks/useNavigation'
import { HomeScreen } from './screens/HomeScreen'
import { ServiceDetailScreen } from './screens/ServiceDetailScreen'
import { BookingFormScreen } from './screens/BookingFormScreen'
import { ConfirmationScreen } from './screens/ConfirmationScreen'

export default function MiniApp() {
  const { tg, user, mainButton, backButton, haptic } = useTelegram()
  const { current, push, reset } = useNavigation(backButton)

  function handleSelectService(service: Parameters<typeof push>[1]) {
    haptic?.impactOccurred('light')
    push('detail', service)
  }

  function handleBook() {
    const s = current.selectedService
    if (!s) return
    if (s.type === 'digital') {
      push('confirmation', s)
    } else {
      push('booking', s)
    }
  }

  function handleSubmit() {
    push('confirmation', current.selectedService)
    if (tg && current.selectedService) {
      tg.sendData(
        JSON.stringify({
          service: current.selectedService.id,
          user: user?.id,
          name: user?.first_name,
        })
      )
    }
  }

  const screenVariants = {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -12 },
  }

  return (
    <div className="bg-[#080614] min-h-screen">
      <AnimatePresence mode="wait">
        <motion.div
          key={current.screen}
          variants={screenVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.2 }}
        >
          {current.screen === 'home' && (
            <HomeScreen
              onSelectService={handleSelectService}
              userName={user?.first_name}
            />
          )}
          {current.screen === 'detail' && current.selectedService && (
            <ServiceDetailScreen
              service={current.selectedService}
              onBook={handleBook}
              mainButton={mainButton}
              onHaptic={() => haptic?.impactOccurred('medium')}
            />
          )}
          {current.screen === 'booking' && current.selectedService && (
            <BookingFormScreen
              service={current.selectedService}
              userName={user?.first_name ?? 'Аноним'}
              onSubmit={handleSubmit}
              mainButton={mainButton}
              onEnableClosing={() => tg?.enableClosingConfirmation()}
              onHaptic={type =>
                type === 'selection'
                  ? haptic?.selectionChanged()
                  : haptic?.impactOccurred('medium')
              }
            />
          )}
          {current.screen === 'confirmation' && current.selectedService && (
            <ConfirmationScreen
              service={current.selectedService}
              onHome={reset}
              mainButton={mainButton}
              onSuccess={() => haptic?.notificationOccurred('success')}
              onDisableClosing={() => tg?.disableClosingConfirmation()}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
```

- [ ] **Шаг 10.2: Проверить сборку**
```bash
npm run build
# Ожидаем: сборка без ошибок, dist/mini-app.html существует
```

- [ ] **Шаг 10.3: Проверить в браузере**
```bash
npm run dev
# Открыть http://localhost:5173/mini-app.html
# Проверить на ширине 375px (DevTools → iPhone SE)
```

- [ ] **Шаг 10.4: Финальный коммит**
```bash
git add src/mini-app/MiniApp.tsx
git commit -m "feat: add MiniApp root component, complete Mini App v1"
```

---

## Self-review — проверка плана

### Покрытие требований

| Требование | Реализовано в |
|---|---|
| Список экранов | Задачи 6–10 (Home, Detail, Booking, Confirmation) |
| Элементы на каждом экране | Задачи 6–9, детальные JSX |
| Действия | useTelegram + MainButton handlers |
| Переходы | useNavigation + MiniApp.tsx |
| Чего НЕ будет в v1 | Раздел «Чего НЕ будет» выше |
| Нативный стиль Telegram | useTelegram: expand/ready/setHeader/setBackground |
| Кнопки ≥ 44px | MainButton (нативный, всегда 44px+), DatePicker h-16=64px |
| Русский язык | Все строки на русском |
| Не как сайт | expand(), BackButton, MainButton, sendData вместо fetch |

### Типы и имена — консистентность
- `Service` определён в `types.ts`, импортируется везде ✓
- `ServiceCategory` используется в `data/services.ts` и `HomeScreen.tsx` ✓
- `mainButton` тип выведен из `useTelegram`, передаётся в экраны ✓
- `useNavigation` принимает `backButton` из `useTelegram` ✓

### Нет плейсхолдеров
- Все экраны содержат полный JSX ✓
- Все хуки содержат полный код ✓
- Все команды с ожидаемым результатом ✓
