# tg-app — Telegram Mini App Ana Krista · Таро

Каталог услуг тарологa без фреймворков: чистый HTML + CSS + JavaScript.

---

## Файлы

```
tg-app/
  index.html       — Точка входа. Подключает SDK, стили, скрипты.
  css/
    styles.css     — Все стили. Тема Telegram через CSS-переменные.
  js/
    data.js        — Данные: профиль Ana, категории, услуги.
    app.js         — Логика: Telegram SDK, навигация, рендеры экранов.
  CLAUDE.md        — Этот файл.
```

---

## Навигация между экранами

Навигация — это стек строк. Никакого роутера, никаких URL.

```
home → detail → booking → confirmation → (сброс) → home
home → detail → confirmation             (цифровые продукты)
```

### Как перейти вперёд

```javascript
navigate('detail', serviceObject); // с данными
navigate('booking');               // без новых данных
navigate('confirmation');
```

### Как вернуться назад

Telegram BackButton вызывает `_goBack()` автоматически.
В браузере — BackButton не отображается, нужно навигировать кнопками внутри экрана.

### Текущий экран

`_navStack` — массив строк, последний элемент = текущий экран.

### Выбранная услуга

`_curService` — объект `Service` из `SERVICES`, устанавливается при `navigate('detail', svc)`.

---

## Где менять данные

### Профиль мастера
`js/data.js` → объект `ANA`:
```javascript
const ANA = {
  name:   'Ana Krista Goyya',
  meta:   'Таролог · 5 лет · 2000+ сессий',
  avatar: '🔮',          // Замени на 'img/ana.jpg' для реального фото
  bio:    '...',
};
```

### Услуги
`js/data.js` → массив `SERVICES`. Каждый объект:

| Поле | Тип | Описание |
|---|---|---|
| `id` | string | Уникальный идентификатор |
| `category` | `readings` \| `materials` \| `courses` | Вкладка фильтра |
| `type` | `consultation` \| `digital` | consultation → форма записи, digital → сразу подтверждение |
| `emoji` | string | Иконка карточки |
| `title` | string | Название |
| `subtitle` | string | Подзаголовок («Онлайн · 60 мин») |
| `desc` | string | Описание на экране деталей |
| `includes` | string[] | Список «Что ты получишь» |
| `testimonial` | string | Цитата отзыва |
| `testimonialAuthor` | string | Автор отзыва |
| `price` | number | Цена в рублях |
| `gradient` | string | CSS-градиент для иллюстрации |

### Вкладки категорий
`js/data.js` → массив `CATEGORIES`. Добавь новый объект `{ id: 'courses', label: 'Курсы' }`.

---

## Telegram SDK — что используется

| Метод | Где | Зачем |
|---|---|---|
| `WebApp.ready()` | init | Скрыть нативный лоадер Telegram |
| `WebApp.expand()` | init | Развернуть на весь экран |
| `MainButton` | каждый экран | Основная CTA-кнопка |
| `BackButton` | navigate | Кнопка «Назад» в шапке |
| `HapticFeedback` | тапы, переходы | Тактильный отклик |
| `initDataUnsafe.user` | форма | Имя пользователя |
| `sendData()` | submit формы | Отправить заявку боту |
| `enableClosingConfirmation()` | форма | Не дать случайно закрыть |

### Fallback без Telegram
В браузере SDK отсутствует. В этом случае:
- `IN_TG = false` — HTML-кнопка `#js-main-btn` отображается
- Haptic и MainButton молча игнорируются
- `sendData()` не вызывается (данные никуда не уходят)

---

## Темы — светлая и тёмная

Telegram автоматически инжектирует CSS-переменные:

```css
--tg-theme-bg-color             /* фон */
--tg-theme-secondary-bg-color   /* фон карточек */
--tg-theme-text-color           /* основной текст */
--tg-theme-hint-color           /* подсказки, метаданные */
--tg-theme-button-color         /* акцент (#2AABEE по умолчанию) */
--tg-theme-button-text-color    /* текст на кнопках */
```

Все компоненты в `styles.css` используют эти переменные — тёмная тема работает автоматически.

---

## Добавить новую услугу

1. Открой `js/data.js`
2. Добавь объект в массив `SERVICES`
3. Укажи `category` совпадающий с одним из `CATEGORIES[].id`
4. Готово — карточка появится в каталоге автоматически

## Добавить категорию «Курсы»

1. В `CATEGORIES` уже есть `{ id: 'courses', label: 'Курсы' }`
2. Добавь услуги с `category: 'courses'` в `SERVICES`
3. Вкладка появится — но только если есть хотя бы одна услуга этой категории (иначе пустое состояние)

---

## Деплой

Mini App — это статика. Хостить на любом HTTPS-хостинге:
- **Vercel**: `vercel tg-app/` (отдельный проект или подпапка)
- **GitHub Pages**: выгрузи содержимое `tg-app/` в `gh-pages` ветку
- **Netlify**: drag & drop папки `tg-app/`

URL регистрируется через **@BotFather** → `/newapp` → указать URL.
