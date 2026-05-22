/* =====================================================
   app.js — Главная логика Telegram Mini App

   СТРУКТУРА:
   1. Telegram SDK — обёртка TG
   2. Навигация — стек экранов, анимации переходов
   3. Рендеры — HTML для каждого из 4 экранов
   4. Обработчики — события на каждом экране
   5. Запуск
   ===================================================== */

'use strict';

/* =====================================================
   1. TELEGRAM SDK — обёртка
   ===================================================== */
const _sdk = window.Telegram?.WebApp || null;

/* Флаг: запущены ли внутри Telegram.
   SDK загружается и в браузере, поэтому проверяем initData —
   он непустой только когда приложение открыто из Telegram. */
const IN_TG = !!_sdk?.initData;

const TG = {
  /* Инициализировать SDK */
  init() {
    if (!_sdk) return;
    _sdk.ready();    // Скрыть нативный лоадер Telegram
    _sdk.expand();   // Развернуть на весь экран
    // Цвет шапки подхватывается из --tg-theme-bg-color автоматически
  },

  /* Данные пользователя из Telegram */
  get user() {
    return _sdk?.initDataUnsafe?.user || null;
  },

  /* Тактильный отклик */
  haptic: {
    light()    { _sdk?.HapticFeedback?.impactOccurred('light');  },
    medium()   { _sdk?.HapticFeedback?.impactOccurred('medium'); },
    success()  { _sdk?.HapticFeedback?.notificationOccurred('success'); },
    select()   { _sdk?.HapticFeedback?.selectionChanged(); },
  },

  /* Отправить данные боту (закрывает Mini App) */
  sendData(payload) {
    if (_sdk) _sdk.sendData(JSON.stringify(payload));
  },

  /* Подтверждение при закрытии (форма записи) */
  lockClose()   { _sdk?.enableClosingConfirmation?.();  },
  unlockClose() { _sdk?.disableClosingConfirmation?.(); },

  /* ---- MainButton ---- */
  mb: {
    _handler: null,

    /* Показать с текстом и обработчиком */
    show(text, handler, disabled = false) {
      /* Сначала снять предыдущий обработчик */
      if (this._handler) _sdk?.MainButton?.offClick(this._handler);
      this._handler = handler;

      if (_sdk?.MainButton) {
        _sdk.MainButton.setText(text);
        _sdk.MainButton.color = '#2AABEE';
        disabled ? _sdk.MainButton.disable() : _sdk.MainButton.enable();
        _sdk.MainButton.onClick(handler);
        _sdk.MainButton.show();
      }
      /* Синхронизировать HTML fallback */
      const btn = document.getElementById('js-main-btn');
      if (btn) {
        btn.textContent = text;
        btn.disabled    = disabled;
        btn.classList.toggle('main-btn--disabled', disabled);
        btn.onclick = handler;
        /* В Telegram прячем HTML-кнопку, чтобы не было дублирования */
        btn.style.display = IN_TG ? 'none' : 'flex';
      }
    },

    /* Скрыть кнопку */
    hide() {
      if (this._handler) _sdk?.MainButton?.offClick(this._handler);
      this._handler = null;
      _sdk?.MainButton?.hide();
      const btn = document.getElementById('js-main-btn');
      if (btn) btn.style.display = 'none';
    },

    /* Активировать / деактивировать (используется в форме) */
    setEnabled(yes) {
      if (_sdk?.MainButton) yes ? _sdk.MainButton.enable() : _sdk.MainButton.disable();
      const btn = document.getElementById('js-main-btn');
      if (btn) {
        btn.disabled = !yes;
        btn.classList.toggle('main-btn--disabled', !yes);
      }
    },

    /* Показать спиннер загрузки */
    loading(on) {
      if (on) _sdk?.MainButton?.showProgress();
      else    _sdk?.MainButton?.hideProgress();
    },
  },

  /* ---- BackButton ---- */
  bb: {
    _handler: null,
    show(handler) {
      if (this._handler) _sdk?.BackButton?.offClick(this._handler);
      this._handler = handler;
      if (_sdk?.BackButton) {
        _sdk.BackButton.onClick(handler);
        _sdk.BackButton.show();
      }
    },
    hide() {
      if (this._handler) _sdk?.BackButton?.offClick(this._handler);
      this._handler = null;
      _sdk?.BackButton?.hide();
    },
  },
};

/* =====================================================
   2. НАВИГАЦИЯ — стек экранов, анимации
   ===================================================== */

let _navStack  = [];       // ['home', 'detail', 'booking']
let _curService = null;    // Выбранная услуга
let _selDate    = null;    // Выбранная дата в форме
let _animating  = false;   // Блокировка двойных нажатий

function navigate(name, service) {
  if (_animating) return;

  if (service !== undefined) _curService = service;

  const direction = 'forward';
  _navStack.push(name);
  _transition(name, direction);

  /* BackButton — показывать когда есть куда вернуться */
  if (_navStack.length > 1) {
    TG.bb.show(_goBack);
  } else {
    TG.bb.hide();
  }
}

function _goBack() {
  if (_animating || _navStack.length <= 1) return;
  TG.unlockClose();

  _navStack.pop();
  const prev = _navStack[_navStack.length - 1];
  _transition(prev, 'back');

  if (_navStack.length <= 1) TG.bb.hide();
  else TG.bb.show(_goBack);
}

function _transition(name, direction) {
  _animating = true;

  const app    = document.getElementById('app');
  const oldEl  = app.querySelector('.screen');
  const newEl  = _buildScreen(name);

  /* Первый экран — без анимации */
  if (!oldEl) {
    app.appendChild(newEl);
    _animating = false;
    window.scrollTo(0, 0);
    return;
  }

  /* Начальная позиция нового экрана */
  newEl.style.transform = direction === 'forward' ? 'translateX(100%)' : 'translateX(-28%)';
  newEl.style.opacity   = direction === 'forward' ? '1' : '0.6';

  /* Старый экран фиксируем поверх, чтобы scroll не прыгал */
  oldEl.classList.add('screen--exit');
  app.appendChild(newEl);

  /* Запуск CSS-перехода через двойной rAF (нужно для Firefox) */
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const easing = 'cubic-bezier(0.33, 1, 0.68, 1)';
      const dur    = '240ms';
      newEl.style.transition = `transform ${dur} ${easing}, opacity ${dur} ease`;
      oldEl.style.transition = `transform ${dur} ${easing}, opacity ${dur} ease`;

      /* Куда уходит старый */
      if (direction === 'forward') {
        oldEl.style.transform = 'translateX(-28%)';
        oldEl.style.opacity   = '0.6';
      } else {
        oldEl.style.transform = 'translateX(100%)';
        oldEl.style.opacity   = '0';
      }

      /* Новый приходит на место */
      newEl.style.transform = 'translateX(0)';
      newEl.style.opacity   = '1';

      setTimeout(() => {
        oldEl.remove();
        /* Очищаем инлайн-стили, чтобы CSS-классы работали чисто */
        ['transition','transform','opacity'].forEach(p => newEl.style.removeProperty(p));
        _animating = false;
        window.scrollTo(0, 0);
      }, 260);
    });
  });
}

/* =====================================================
   3. РЕНДЕРЫ — HTML для каждого экрана
   ===================================================== */

function _buildScreen(name) {
  const el = document.createElement('div');
  el.className = 'screen';
  el.dataset.screen = name;

  switch (name) {
    case 'home':         el.innerHTML = _htmlHome();            break;
    case 'detail':       el.innerHTML = _htmlDetail();          break;
    case 'booking':      el.innerHTML = _htmlBooking();         break;
    case 'confirmation': el.innerHTML = _htmlConfirmation();    break;
    default:
      el.innerHTML = `<p style="padding:24px;color:var(--hint)">Неизвестный экран</p>`;
  }

  /* Подключить обработчики событий */
  _attachEvents(el, name);

  return el;
}

/* ---- Экран 1: Главный ---- */
function _htmlHome() {
  /* Аватар: фото или инициалы */
  const avatarInner = ANA.avatar.startsWith('img/')
    ? `<img src="${ANA.avatar}" alt="${ANA.name}">`
    : ANA.initials;

  return `
    <div class="home-screen">

      <!-- Профиль мастера (центрированный) -->
      <div class="profile">
        <div class="profile__avatar">${avatarInner}</div>
        <h1 class="profile__name">${ANA.name}</h1>
        <p class="profile__meta">${ANA.meta}</p>
        <a class="profile__link" href="${ANA.channelUrl}" id="js-channel-link">${ANA.channel}</a>
        <p class="profile__stats">${ANA.stats}</p>
        <p class="profile__bio">${ANA.bio}</p>
        <div class="profile__actions">
          <button class="action-btn" id="js-whatsapp-btn">
            WhatsApp
          </button>
          <button class="action-btn" id="js-write-btn">
            ✉ Написать
          </button>
        </div>
      </div>

      <!-- Портфолио — сетка 3 колонки -->
      <div class="home-section">
        <p class="home-section__title">Расклады и материалы</p>
        <div class="portfolio-grid" id="js-portfolio">
          ${SERVICES.map(s => `
            <button class="portfolio-card" data-id="${s.id}" aria-label="${s.title}">
              <img src="${s.image}" alt="${s.title}" loading="lazy">
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Список услуг -->
      <div class="home-section" style="margin-top:20px;">
        <p class="home-section__title">Услуги</p>
        <div class="services-list" id="js-services-list">
          ${SERVICES.map(s => `
            <button class="service-row" data-id="${s.id}" aria-label="${s.title}">
              <div class="service-row__icon"><img src="${s.icon}" alt="${s.title}"></div>
              <div class="service-row__info">
                <p class="service-row__name">${s.title}</p>
                <p class="service-row__sub">${s.subtitle}</p>
              </div>
              <p class="service-row__price">${fmtPrice(s.price)}</p>
            </button>
          `).join('')}
        </div>
      </div>

      <button class="main-btn" id="js-main-btn" style="display:none"></button>
    </div>
  `;
}

/* ---- Экран 2: Детали услуги ---- */
function _htmlDetail() {
  const s = _curService;
  if (!s) return `<p style="padding:24px;color:var(--hint)">Услуга не найдена</p>`;

  const btnLabel = s.type === 'consultation' ? 'Записаться' : 'Получить';

  return `
    <div class="detail-screen">

      <button id="js-back-btn" class="nav-back" aria-label="Назад">
        <span class="nav-back__arrow">‹</span> Назад
      </button>

      <!-- Иллюстрация -->
      <div class="detail-hero" aria-hidden="true">
        <img src="${s.image}" alt="${s.title}">
      </div>

      <!-- Контент -->
      <div class="detail-body">

        <div>
          <h2 class="detail-title">${s.title}</h2>
          <p class="detail-sub">${s.subtitle}</p>
        </div>

        <p class="detail-desc">${s.desc}</p>

        <!-- Что ты получишь -->
        <div>
          <p class="section-label">Что ты получишь</p>
          <ul class="includes" aria-label="Состав услуги">
            ${s.includes.map(item => `
              <li>
                <span class="includes__check" aria-hidden="true">✓</span>
                <span>${item}</span>
              </li>
            `).join('')}
          </ul>
        </div>

        <!-- Отзыв -->
        <figure class="testimonial">
          <blockquote class="testimonial__quote">❝ ${s.testimonial} ❞</blockquote>
          <figcaption class="testimonial__author">— ${s.testimonialAuthor}</figcaption>
        </figure>

        <!-- Цена -->
        <div class="price-row">
          <span class="price-row__label">Стоимость</span>
          <span class="price-row__value">${fmtPrice(s.price)}</span>
        </div>

        <!-- HTML fallback -->
        <button class="main-btn" id="js-main-btn" aria-label="${btnLabel}">${btnLabel}</button>
      </div>
    </div>
  `;
}

/* ---- Экран 3: Форма записи ---- */
function _htmlBooking() {
  const s    = _curService;
  const name = TG.user?.first_name || '';
  const days = getNext7Days();

  return `
    <div class="booking-screen">

      <button id="js-back-btn" class="nav-back" aria-label="Назад">
        <span class="nav-back__arrow">‹</span> Назад
      </button>

      <div class="booking-body">

        <!-- Хлебная крошка -->
        <p class="breadcrumb">${s?.emoji || ''} ${s?.title || ''}</p>

        <!-- Имя (auto-filled) -->
        <div class="field">
          <label class="field__label">Как тебя зовут?</label>
          <div class="field__readonly" aria-label="Имя из Telegram">${name || 'Твоё имя'}</div>
        </div>

        <!-- Вопрос -->
        <div class="field">
          <label class="field__label" for="js-question">Твой вопрос или тема:</label>
          <textarea
            id="js-question"
            class="field__textarea"
            placeholder="Что беспокоит? Над чем работаем?"
            aria-required="true"
            rows="4"
          ></textarea>
        </div>

        <!-- Выбор даты -->
        <div class="field">
          <label class="field__label">Удобная дата:</label>
          <div class="date-picker" id="js-dates" role="group" aria-label="Выбор даты">
            ${days.map(d => `
              <button class="date-btn" data-date="${d.value}" aria-label="${d.day} ${d.num} ${d.mon}">
                <span class="date-btn__day">${d.day}</span>
                <span class="date-btn__num">${d.num}</span>
                <span class="date-btn__mon">${d.mon}</span>
              </button>
            `).join('')}
          </div>
        </div>

        <p class="form-note">Ана свяжется с тобой для подтверждения времени</p>

        <!-- HTML fallback (disabled пока нет текста) -->
        <button class="main-btn main-btn--disabled" id="js-main-btn" disabled aria-label="Отправить">
          Отправить
        </button>
      </div>
    </div>
  `;
}

/* ---- Экран 4: Подтверждение ---- */
function _htmlConfirmation() {
  const s = _curService;
  return `
    <div class="confirm-screen" style="align-items:flex-start;padding:0;">

      <button id="js-back-btn" class="nav-back" aria-label="Назад">
        <span class="nav-back__arrow">‹</span> Назад
      </button>

      <div class="confirm-body" style="padding-top:24px;">

        <div class="success-icon" aria-hidden="true">✨</div>

        <h2 class="confirm-title">Заявка отправлена!</h2>

        <p class="confirm-service">${s?.title || 'Услуга'} · ${s ? fmtPrice(s.price) : ''}</p>

        <div class="next-steps">
          <p class="section-label">Что происходит дальше</p>
          <p class="next-steps__text">
            Ана напишет тебе в этот чат в течение 24 часов — уточнит детали и пришлёт способ оплаты.
          </p>
        </div>

        <!-- HTML fallback -->
        <button class="main-btn" id="js-main-btn" aria-label="Вернуться в каталог">
          Вернуться в каталог
        </button>
      </div>
    </div>
  `;
}

/* =====================================================
   4. ОБРАБОТЧИКИ СОБЫТИЙ — по каждому экрану
   ===================================================== */

function _attachEvents(el, name) {
  switch (name) {
    case 'home':         _evHome(el);         break;
    case 'detail':       _evDetail(el);       break;
    case 'booking':      _evBooking(el);      break;
    case 'confirmation': _evConfirmation(el); break;
  }
}

/* ---- Главный экран ---- */
function _evHome(el) {
  TG.mb.hide();

  /* Тапы по портфолио-сетке */
  el.querySelector('#js-portfolio')?.addEventListener('click', e => {
    const card = e.target.closest('.portfolio-card');
    if (!card) return;
    const svc = findService(card.dataset.id);
    if (!svc) return;
    TG.haptic.light();
    navigate('detail', svc);
  });

  /* Тапы по списку услуг */
  el.querySelector('#js-services-list')?.addEventListener('click', e => {
    const row = e.target.closest('.service-row');
    if (!row) return;
    const svc = findService(row.dataset.id);
    if (!svc) return;
    TG.haptic.light();
    navigate('detail', svc);
  });

  /* Кнопка WhatsApp */
  el.querySelector('#js-whatsapp-btn')?.addEventListener('click', () => {
    TG.haptic.light();
    window.open(ANA.whatsapp, '_blank');
  });

  /* Кнопка «Написать» — открыть Telegram */
  el.querySelector('#js-write-btn')?.addEventListener('click', () => {
    TG.haptic.light();
    if (_sdk) _sdk.openTelegramLink(ANA.channelUrl);
    else window.open(ANA.channelUrl, '_blank');
  });

  /* Ссылка @Ana_Krista */
  el.querySelector('#js-channel-link')?.addEventListener('click', e => {
    e.preventDefault();
    TG.haptic.light();
    if (_sdk) _sdk.openTelegramLink(ANA.channelUrl);
    else window.open(ANA.channelUrl, '_blank');
  });
}

function _attachCardEvents(container) {
  container?.addEventListener('click', e => {
    const card = e.target.closest('.card');
    if (!card) return;
    const svc = findService(card.dataset.id);
    if (!svc) return;
    TG.haptic.light();
    navigate('detail', svc);
  });
}

/* ---- Вспомогательная: подключить кнопку «Назад» ---- */
function _attachBackBtn(el) {
  const btn = el.querySelector('#js-back-btn');
  if (!btn) return;
  /* В Telegram BackButton уже есть в шапке — скрываем HTML-дубль */
  if (IN_TG) { btn.classList.add('hidden'); return; }
  btn.addEventListener('click', _goBack);
}

/* ---- Детали услуги ---- */
function _evDetail(el) {
  _attachBackBtn(el);
  const s   = _curService;
  const btn = s?.type === 'consultation' ? 'Записаться' : 'Получить';

  const handler = () => {
    TG.haptic.medium();
    navigate(s.type === 'consultation' ? 'booking' : 'confirmation');
  };

  TG.mb.show(btn, handler);

  /* HTML fallback */
  el.querySelector('#js-main-btn')?.addEventListener('click', handler);
}

/* ---- Форма записи ---- */
function _evBooking(el) {
  _attachBackBtn(el);
  /* Подтверждение при случайном закрытии */
  TG.lockClose();

  const textarea = el.querySelector('#js-question');
  const datesEl  = el.querySelector('#js-dates');
  const htmlBtn  = el.querySelector('#js-main-btn');

  /* Изначально кнопка неактивна */
  TG.mb.show('Отправить', _submitBooking, true);

  /* Включить кнопку когда есть текст */
  textarea?.addEventListener('input', () => {
    const ok = textarea.value.trim().length > 0;
    TG.mb.setEnabled(ok);
    if (htmlBtn) {
      htmlBtn.disabled = !ok;
      htmlBtn.classList.toggle('main-btn--disabled', !ok);
    }
  });

  /* Выбор даты */
  datesEl?.addEventListener('click', e => {
    const btn = e.target.closest('.date-btn');
    if (!btn) return;
    datesEl.querySelectorAll('.date-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    _selDate = btn.dataset.date;
    TG.haptic.select();
  });

  /* HTML fallback */
  htmlBtn?.addEventListener('click', _submitBooking);
}

function _submitBooking() {
  const textarea = document.querySelector('#js-question');
  const question = textarea?.value.trim();
  if (!question) return;

  TG.mb.loading(true);
  TG.haptic.medium();

  /* Отправить структурированные данные боту (если в Telegram) */
  TG.sendData({
    service:  _curService?.id,
    question,
    date:     _selDate,
    userName: TG.user?.first_name || null,
  });

  /* Перейти на экран подтверждения */
  navigate('confirmation');
}

/* ---- Подтверждение ---- */
function _evConfirmation(el) {
  _attachBackBtn(el);
  TG.haptic.success();
  TG.unlockClose();
  TG.mb.loading(false);

  const handler = () => {
    /* Полностью сбросить состояние и вернуться на главную */
    _navStack   = [];
    _curService = null;
    _selDate    = null;
    navigate('home');
  };

  TG.mb.show('Вернуться в каталог', handler);
  el.querySelector('#js-main-btn')?.addEventListener('click', handler);
}

/* =====================================================
   5. ЗАПУСК
   ===================================================== */

function init() {
  TG.init();
  navigate('home');
}

/* Запускаем после загрузки DOM */
document.addEventListener('DOMContentLoaded', init);
