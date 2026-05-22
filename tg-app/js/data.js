/* =====================================================
   data.js — Данные каталога услуг Ana Krista Goyya

   ЧТО РЕДАКТИРОВАТЬ ЗДЕСЬ:
   - ANA            → имя, подзаголовок, аватар, биография
   - CATEGORIES     → вкладки фильтра (id + label)
   - SERVICES       → все услуги: название, цена, описание, отзыв
   ===================================================== */

'use strict';

/* ---- Профиль мастера ---- */
const ANA = {
  name:     'Ana Krista Goyya',
  meta:     'Таролог · 10 лет опыта',
  initials: 'AK',
  avatar:   'img/ana.jpg',
  channel:  '🔮 @Ana_Krista',
  channelUrl: 'https://t.me/Ana_Krista',
  whatsapp: 'https://wa.me/13177520369',
  stats:    '2000+ сессий · Онлайн',
  bio:      '10 лет в практике Таро — это тысячи прочитанных раскладов, сотни изменённых судеб и глубокое понимание каждой карты. Помогаю найти ясность там, где кажется, что выхода нет: в отношениях, карьере, жизненных переменах.',
};

/* ---- Категории (вкладки) ---- */
const CATEGORIES = [
  { id: 'all',       label: 'Все'        },
  { id: 'readings',  label: 'Расклады'   },
  { id: 'materials', label: 'Материалы'  },
  { id: 'courses',   label: 'Курсы'      },
];

/* ---- Услуги ----
   type: 'consultation' → идёт через форму записи
   type: 'digital'      → переходит прямо на подтверждение
*/
const SERVICES = [
  {
    id:       'reading-year',
    category: 'readings',
    type:     'consultation',
    emoji:    '🔮',
    image:    'img/reading-year.png',
    icon:     'img/icon-reading-year.png',
    title:    'Расклад на год',
    subtitle: 'Онлайн · 60 мин',
    desc:     'Разберём 12 сфер жизни: что ждёт тебя в карьере, отношениях, здоровье и деньгах.',
    includes: [
      'Анализ 12 сфер жизни',
      'Запись консультации',
      'PDF-конспект после сессии',
      'Ответы на 3 уточняющих вопроса',
    ],
    testimonial:       'Наконец-то поняла свой путь — появилась ясность и спокойствие.',
    testimonialAuthor: 'Катя, Москва',
    price:    3500,
    gradient: 'linear-gradient(135deg, #4c1d95 0%, #3730a3 100%)',
  },
  {
    id:       'reading-love',
    category: 'readings',
    type:     'consultation',
    emoji:    '💜',
    image:    'img/reading-love.png',
    icon:     'img/icon-reading-love.png',
    title:    'Расклад на отношения',
    subtitle: 'Онлайн · 45 мин',
    desc:     'Поймёшь, куда движется связь, что мешает сближению и стоит ли продолжать.',
    includes: [
      'Анализ динамики отношений',
      'Потенциал и препятствия',
      'Рекомендации по действиям',
      'Запись консультации',
    ],
    testimonial:       'Ответила на вопрос, который мучил меня 2 года. Прямо и честно.',
    testimonialAuthor: 'Алина, Санкт-Петербург',
    price:    2500,
    gradient: 'linear-gradient(135deg, #831843 0%, #9d174d 100%)',
  },
  {
    id:       'reading-question',
    category: 'readings',
    type:     'consultation',
    emoji:    '✨',
    image:    'img/reading-question.png',
    icon:     'img/icon-reading-question.png',
    title:    'Расклад на вопрос',
    subtitle: 'Онлайн · 30 мин',
    desc:     'Один вопрос — развёрнутый ответ. Идеально, если уже знаешь, что спросить.',
    includes: [
      'Развёрнутый анализ ситуации',
      'Рекомендации по действиям',
      'Ответ в течение 24 часов',
    ],
    testimonial:       'Быстро, чётко, по делу. Буду обращаться снова!',
    testimonialAuthor: 'Марина, Екатеринбург',
    price:    1500,
    gradient: 'linear-gradient(135deg, #92400e 0%, #b45309 100%)',
  },
  {
    id:       'pdf-spreads',
    category: 'materials',
    type:     'digital',
    emoji:    '📖',
    image:    'img/pdf-spreads.png',
    icon:     'img/icon-pdf-spreads.png',
    title:    'PDF-Гайд по Раскладам',
    subtitle: 'PDF · Мгновенно',
    desc:     '5 схем на любовь и финансы с пошаговыми инструкциями для самостоятельной работы.',
    includes: [
      '5 схем с пошаговыми инструкциями',
      'Примеры интерпретаций карт',
      'Подходит для начинающих',
      'Доступ сразу после оплаты',
    ],
    testimonial:       'Наконец-то научилась делать расклады сама!',
    testimonialAuthor: 'Лена, Казань',
    price:    990,
    gradient: 'linear-gradient(135deg, #1e3a5f 0%, #1e40af 100%)',
  },
  {
    id:       'audio-moon',
    category: 'materials',
    type:     'digital',
    emoji:    '🌙',
    image:    'img/audio-moon.png',
    icon:     'img/icon-audio-moon.png',
    title:    'Лунный Ритуал',
    subtitle: 'Аудио + PDF · Мгновенно',
    desc:     'Аудио-медитация и чек-лист под новолуние для осознанной постановки намерений.',
    includes: [
      'Аудио-медитация 20 мин',
      'Чек-лист ритуала новолуния',
      'Инструкция по работе с намерениями',
      'Доступ сразу после оплаты',
    ],
    testimonial:       'Теперь каждое новолуние — мой личный праздник.',
    testimonialAuthor: 'Ольга, Новосибирск',
    price:    790,
    gradient: 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 100%)',
  },
  {
    id:       'pdf-arcana',
    category: 'materials',
    type:     'digital',
    emoji:    '🃏',
    image:    'img/pdf-arcana.png',
    icon:     'img/icon-pdf-arcana.png',
    title:    'Шпаргалка Арканов',
    subtitle: 'PDF · Мгновенно',
    desc:     'Карманный справочник значений всех 22 Старших Арканов в прямом и перевёрнутом положении.',
    includes: [
      'Все 22 Старших Аркана',
      'Прямое и перевёрнутое значение',
      'Ключевые слова для быстрого чтения',
      'Доступ сразу после оплаты',
    ],
    testimonial:       'Всегда под рукой. Незаменимо для раскладов!',
    testimonialAuthor: 'Наташа, Воронеж',
    price:    490,
    gradient: 'linear-gradient(135deg, #064e3b 0%, #059669 100%)',
  },
];

/* ---- Вспомогательная: отфильтровать по категории ---- */
function filterServices(category) {
  if (category === 'all') return SERVICES;
  return SERVICES.filter(s => s.category === category);
}

/* ---- Вспомогательная: найти услугу по id ---- */
function findService(id) {
  return SERVICES.find(s => s.id === id) || null;
}

/* ---- Вспомогательная: форматировать цену ---- */
function fmtPrice(price) {
  return price.toLocaleString('ru-RU') + ' ₽'; // неразрывный пробел
}

/* ---- Вспомогательная: следующие 7 дней ---- */
function getNext7Days() {
  const daysRu  = ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'];
  const monthsRu = ['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек'];
  const result = [];
  for (let i = 1; i <= 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    result.push({
      day:   daysRu[d.getDay()],
      num:   d.getDate(),
      mon:   monthsRu[d.getMonth()],
      value: d.toISOString().split('T')[0],
    });
  }
  return result;
}
