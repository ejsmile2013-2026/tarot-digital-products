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

/* Проверить: текущий пользователь Telegram — мастер этой страницы */
function checkIsMaster() {
  return !!(
    IN_TG &&
    TG.user?.id &&
    window._masterData?.telegram_id &&
    String(TG.user.id) === String(window._masterData.telegram_id)
  );
}

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

let _navStack   = [];      // ['home', 'detail', 'booking']
let _curService = null;    // Выбранная услуга
let _selDate    = null;    // Выбранная дата в форме
let _animating  = false;   // Блокировка двойных нажатий
let _activeTab  = 'catalog'; // Активная вкладка нижнего меню
let _homeFilter = 'all';   // Фильтр для home ('all'|'readings'|'materials')

/* Экраны где видно нижнее меню */
const TAB_SCREENS = ['home', 'contact', 'master'];

/* Категория по вкладке */
const TAB_FILTER = {
  catalog:   'all',
  readings:  'readings',
  materials: 'materials',
};

/* Показать / скрыть нижнее меню */
function showNav()  { document.getElementById('bottom-nav')?.classList.remove('bottom-nav--hidden'); }
function hideNav()  { document.getElementById('bottom-nav')?.classList.add('bottom-nav--hidden'); }

/* Переключить активную вкладку */
function setActiveTab(tab) {
  _activeTab = tab;
  document.querySelectorAll('.nav-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });
}

function navigate(name, service) {
  if (_animating) return;

  if (service !== undefined) _curService = service;

  _navStack.push(name);
  _transition(name, 'forward');

  /* Нижнее меню всегда видно */
  showNav();
  if (TAB_SCREENS.includes(name)) {
    TG.bb.hide();
  } else {
    TG.bb.show(_goBack);
  }
}

/* Переключение вкладки (fade без истории) */
function switchTab(tab) {
  if (_animating) return;
  setActiveTab(tab);

  if (tab === 'contact') {
    _navStack = ['contact'];
    _transition('contact', 'fade');
  } else if (tab === 'master') {
    _navStack = ['master'];
    _transition('master', 'fade');
  } else {
    _homeFilter = TAB_FILTER[tab] || 'all';
    _navStack = ['home'];
    _transition('home', 'fade');
  }

  showNav();
  TG.bb.hide();
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

  /* fade — для переключения вкладок (без сдвига) */
  if (direction === 'fade') {
    newEl.style.opacity = '0';
    oldEl.classList.add('screen--exit');
    app.appendChild(newEl);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        newEl.style.transition = 'opacity 0.18s ease';
        oldEl.style.transition = 'opacity 0.18s ease';
        newEl.style.opacity = '1';
        oldEl.style.opacity = '0';
        setTimeout(() => {
          oldEl.remove();
          newEl.style.transition = '';
          newEl.style.opacity = '';
          _animating = false;
          window.scrollTo(0, 0);
        }, 200);
      });
    });
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
    case 'home':         el.innerHTML = _htmlHome();         break;
    case 'detail':       el.innerHTML = _htmlDetail();        break;
    case 'booking':      el.innerHTML = _htmlBooking();       break;
    case 'confirmation': el.innerHTML = _htmlConfirmation();  break;
    case 'contact':      el.innerHTML = _htmlContact();       break;
    case 'master':       el.innerHTML = _htmlMasterPanel();   break;
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
  const avatarInner = (ANA.avatar.startsWith('img/') || ANA.avatar.startsWith('http'))
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
          <button class="action-btn" id="js-whatsapp-btn">WhatsApp</button>
          <button class="action-btn" id="js-write-btn">✉ Написать</button>
        </div>
        <button class="share-btn" id="js-share-btn">
          🔗 Поделиться с другом
        </button>
      </div>

      <!-- Портфолио — сетка 3 колонки -->
      <div class="home-section">
        <p class="home-section__title">Расклады и материалы</p>
        <div class="portfolio-grid" id="js-portfolio">
          ${filterServices(_homeFilter).map(s => `
            <button class="portfolio-card" data-id="${s.id}" aria-label="${s.title}">
              ${s.image
                ? `<img src="${s.image}" alt="${s.title}" loading="lazy">`
                : `<div class="portfolio-card__gradient" style="background:${s.gradient}"><span class="portfolio-card__emoji">${s.emoji}</span></div>`
              }
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Список услуг -->
      <div class="home-section" style="margin-top:20px;">
        <p class="home-section__title">Услуги</p>
        <div class="services-list" id="js-services-list">
          ${filterServices(_homeFilter).map(s => `
            <button class="service-row" data-id="${s.id}" aria-label="${s.title}">
              <div class="service-row__icon">${s.image ? `<img src="${s.image}" alt="${s.title}">` : `<span style="font-size:28px;line-height:1">${s.emoji}</span>`}</div>
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

        <!-- HTML fallback (скрыта в Telegram) -->
        <button class="main-btn" id="js-main-btn" style="display:none" aria-label="${btnLabel}">${btnLabel}</button>
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

        <!-- HTML fallback (скрыта в Telegram) -->
        <button class="main-btn main-btn--disabled" id="js-main-btn" style="display:none" disabled aria-label="Отправить">
          Отправить
        </button>
      </div>
    </div>
  `;
}

/* ---- Экран 5: Связаться ---- */
function _htmlContact() {
  return `
    <div class="contact-screen">
      <div class="contact-avatar">
        <img src="img/ana.jpg" alt="Ana Krista">
      </div>
      <h2 class="contact-title">Ana Krista Goyya</h2>
      <p class="contact-subtitle">Таролог с 10-летним опытом<br>Онлайн · По всему миру</p>

      <div class="contact-buttons">
        <button class="contact-btn" id="js-contact-tg">
          <span class="contact-btn__icon">✈️</span>
          <span class="contact-btn__text">
            <span class="contact-btn__title">Написать в Telegram</span>
            <span class="contact-btn__sub">@Ana_Krista</span>
          </span>
        </button>
        <button class="contact-btn" id="js-contact-wa">
          <span class="contact-btn__icon">💬</span>
          <span class="contact-btn__text">
            <span class="contact-btn__title">Написать в WhatsApp</span>
            <span class="contact-btn__sub">+1 317 752 03 69</span>
          </span>
        </button>
      </div>

      <div class="contact-info">
        ${ANA.bio}
      </div>

      <button class="main-btn" id="js-main-btn" style="display:none"></button>
    </div>
  `;
}

function _evContact(el) {
  TG.mb.hide();

  el.querySelector('#js-contact-tg')?.addEventListener('click', () => {
    TG.haptic.light();
    if (_sdk) _sdk.openTelegramLink(ANA.channelUrl);
    else window.open(ANA.channelUrl, '_blank');
  });

  el.querySelector('#js-contact-wa')?.addEventListener('click', () => {
    TG.haptic.light();
    window.open(ANA.whatsapp, '_blank');
  });
}

/* ---- Экран 4: Подтверждение ---- */
function _htmlConfirmation() {
  const s = _curService;
  return `
    <div class="confirm-screen">

      <button id="js-back-btn" class="nav-back" aria-label="Назад">
        <span class="nav-back__arrow">‹</span> Назад
      </button>

      <div class="confirm-body">

        <div class="success-icon" aria-hidden="true">✨</div>

        <h2 class="confirm-title">Заявка отправлена!</h2>

        <p class="confirm-service">${s?.title || 'Услуга'} · ${s ? fmtPrice(s.price) : ''}</p>

        <div class="next-steps">
          <p class="section-label">Что происходит дальше</p>
          <p class="next-steps__text">
            Ана напишет тебе в этот чат в течение 24 часов — уточнит детали и пришлёт способ оплаты.
          </p>
        </div>

        <!-- HTML fallback (скрыта в Telegram, показана только в браузере) -->
        <button class="confirm-back-btn" id="js-main-btn" style="display:none" aria-label="Вернуться в каталог">
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
    case 'contact':      _evContact(el);      break;
    case 'master':       _evMasterPanel(el);  break;
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

  /* Кнопка «Поделиться с другом» */
  el.querySelector('#js-share-btn')?.addEventListener('click', () => {
    TG.haptic.light();
    const shareUrl = 'https://t.me/AnaKristaTaro_Bot/taro';
    const text = encodeURIComponent('Нашла классного таролога — Ana Krista Goyya. Здесь можно записаться на расклад 🔮');
    if (_sdk?.shareToStory) {
      /* Telegram Share */
      _sdk.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${text}`);
    } else {
      window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${text}`, '_blank');
    }
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

  TG.mb.hide(); // не перекрываем нижнее меню

  const htmlBtn = el.querySelector('#js-main-btn');
  if (htmlBtn) {
    htmlBtn.style.display = 'flex';
    htmlBtn.textContent   = btn;
    htmlBtn.onclick       = handler;
  }
}

/* ---- Форма записи ---- */
function _evBooking(el) {
  _attachBackBtn(el);
  /* Подтверждение при случайном закрытии */
  TG.lockClose();

  const textarea = el.querySelector('#js-question');
  const datesEl  = el.querySelector('#js-dates');
  const htmlBtn  = el.querySelector('#js-main-btn');

  TG.mb.hide(); // не перекрываем нижнее меню

  /* Показать HTML кнопку внутри экрана, изначально неактивна */
  if (htmlBtn) {
    htmlBtn.style.display = 'flex';
    htmlBtn.disabled      = true;
    htmlBtn.classList.add('main-btn--disabled');
    htmlBtn.addEventListener('click', _submitBooking);
  }

  /* Включить кнопку когда есть текст ≥ 20 символов */
  textarea?.addEventListener('input', () => {
    const ok = textarea.value.trim().length >= 20;
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
}

async function _submitBooking() {
  const textarea = document.querySelector('#js-question');
  const question = textarea?.value.trim();
  if (!question || question.length < 20) return;

  const htmlBtn = document.querySelector('#js-main-btn');
  if (htmlBtn) { htmlBtn.disabled = true; htmlBtn.textContent = '...'; }
  TG.haptic.medium();

  try {
    const res = await fetch('/api/bookings', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        masterSlug:    window._masterSlug || 'ana-krista',
        serviceId:     _curService?.id,
        serviceTitle:  _curService?.title,
        clientTgId:    TG.user?.id        || null,
        clientName:    TG.user?.first_name || null,
        question,
        preferredDate: _selDate,
      }),
    });

    if (!res.ok) throw new Error('server error');
  } catch (e) {
    console.warn('Booking send error:', e);
    if (htmlBtn) { htmlBtn.disabled = false; htmlBtn.textContent = 'Отправить'; }
    if (_sdk) _sdk.showAlert('Не удалось отправить заявку. Попробуй ещё раз или напиши мастеру напрямую.');
    else alert('Не удалось отправить заявку. Попробуй ещё раз.');
    return;
  }

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

  TG.mb.hide(); // не перекрываем нижнее меню

  const htmlBtn = el.querySelector('#js-main-btn');
  if (htmlBtn) {
    htmlBtn.style.display = 'flex';
    htmlBtn.onclick       = handler;
  }
}

/* =====================================================
   5. ПАНЕЛЬ МАСТЕРА
   ===================================================== */

/* Заголовок авторизации для запросов мастера */
function _masterAuthHeader() {
  return { 'Authorization': `tma ${_sdk?.initData || ''}` };
}

/* ---- Главный экран панели мастера ---- */
function _htmlMasterPanel() {
  return `
    <div class="master-panel">
      <div class="master-panel__header">
        <h2 class="master-panel__title">Панель мастера</h2>
        <p class="master-panel__sub">${window._masterData?.name || ''}</p>
      </div>

      <div class="master-tabs" id="js-master-tabs" role="tablist">
        <button class="master-tab active" data-mtab="bookings" role="tab" aria-selected="true">Заявки</button>
        <button class="master-tab" data-mtab="services" role="tab" aria-selected="false">Услуги</button>
        <button class="master-tab" data-mtab="profile" role="tab" aria-selected="false">Профиль</button>
      </div>

      <div class="master-content" id="js-master-content">
        <div class="master-loading">Загрузка...</div>
      </div>
    </div>
  `;
}

/* ---- Обработчики панели мастера ---- */
function _evMasterPanel(el) {
  TG.mb.hide();

  const tabsEl   = el.querySelector('#js-master-tabs');
  const contentEl = el.querySelector('#js-master-content');

  /* Переключение внутренних вкладок */
  tabsEl?.addEventListener('click', e => {
    const btn = e.target.closest('.master-tab');
    if (!btn) return;
    const mtab = btn.dataset.mtab;
    tabsEl.querySelectorAll('.master-tab').forEach(b => {
      b.classList.toggle('active', b === btn);
      b.setAttribute('aria-selected', b === btn ? 'true' : 'false');
    });
    TG.haptic.select();
    _renderMasterTab(contentEl, mtab);
  });

  /* По умолчанию — загрузить заявки */
  _renderMasterTab(contentEl, 'bookings');
}

/* Рендер содержимого вкладки мастера */
async function _renderMasterTab(container, tab) {
  container.innerHTML = '<div class="master-loading">Загрузка...</div>';
  try {
    if (tab === 'bookings') {
      container.innerHTML = await _htmlMasterBookings();
      _attachMasterBookingEvents(container);
    } else if (tab === 'services') {
      container.innerHTML = await _htmlMasterServices();
      _attachMasterServiceEvents(container);
    } else if (tab === 'profile') {
      container.innerHTML = _htmlMasterProfile();
      _attachMasterProfileEvents(container);
    }
  } catch (e) {
    container.innerHTML = `<p class="master-error">Ошибка загрузки. Попробуй позже.</p>`;
    console.warn('Master tab error:', e);
  }
}

/* ---- Экран заявок мастера ---- */
async function _htmlMasterBookings() {
  const res = await fetch('/api/master/bookings', {
    headers: _masterAuthHeader(),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const { bookings } = await res.json();

  if (!bookings || bookings.length === 0) {
    return `<p class="master-empty">Заявок пока нет</p>`;
  }

  const statusLabel = { pending: 'Ожидает', confirmed: 'Подтверждена', cancelled: 'Отменена' };
  const statusClass = { pending: 'status--pending', confirmed: 'status--confirmed', cancelled: 'status--cancelled' };

  return `
    <div class="bookings-list">
      ${bookings.map(b => `
        <div class="booking-card" data-id="${b.id}">
          <div class="booking-card__head">
            <span class="booking-card__name">${b.client_name || 'Клиент'}</span>
            <span class="booking-status ${statusClass[b.status] || ''}">${statusLabel[b.status] || b.status}</span>
          </div>
          <p class="booking-card__service">${b.service_title || '—'}</p>
          ${b.preferred_date ? `<p class="booking-card__date">📅 ${b.preferred_date}</p>` : ''}
          ${b.question ? `<p class="booking-card__question">"${b.question}"</p>` : ''}
          ${b.status === 'pending' ? `
            <div class="booking-card__actions">
              <button class="btn-confirm" data-id="${b.id}">Подтвердить</button>
              <button class="btn-cancel"  data-id="${b.id}">Отменить</button>
              <button class="btn-delete"  data-id="${b.id}">🗑</button>
            </div>
          ` : ''}
        </div>
      `).join('')}
    </div>
  `;
}

function _attachMasterBookingEvents(container) {
  container.addEventListener('click', async e => {
    const confirmBtn = e.target.closest('.btn-confirm');
    const cancelBtn  = e.target.closest('.btn-cancel');
    const deleteBtn  = e.target.closest('.btn-delete');

    /* Удалить заявку */
    if (deleteBtn) {
      const id   = deleteBtn.dataset.id;
      const card = container.querySelector(`.booking-card[data-id="${id}"]`);
      deleteBtn.textContent = '...';
      deleteBtn.disabled = true;
      try {
        const res = await fetch('/api/master/bookings', {
          method:  'DELETE',
          headers: { 'Content-Type': 'application/json', ..._masterAuthHeader() },
          body:    JSON.stringify({ id }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        TG.haptic.success();
        card?.remove();
      } catch (err) {
        deleteBtn.textContent = '🗑';
        deleteBtn.disabled = false;
        if (_sdk) _sdk.showAlert('Не удалось удалить заявку.');
        else alert('Не удалось удалить заявку.');
      }
      return;
    }

    const btn = confirmBtn || cancelBtn;
    if (!btn) return;

    const id     = btn.dataset.id;
    const status = confirmBtn ? 'confirmed' : 'cancelled';
    btn.disabled = true;
    btn.textContent = '...';

    try {
      const res = await fetch('/api/master/bookings', {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json', ..._masterAuthHeader() },
        body:    JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      TG.haptic.success();
      const card = container.querySelector(`.booking-card[data-id="${id}"]`);
      if (card) {
        const actionsEl = card.querySelector('.booking-card__actions');
        const statusEl  = card.querySelector('.booking-status');
        if (actionsEl) actionsEl.remove();
        if (statusEl) {
          statusEl.textContent = status === 'confirmed' ? 'Подтверждена' : 'Отменена';
          statusEl.className   = `booking-status ${status === 'confirmed' ? 'status--confirmed' : 'status--cancelled'}`;
        }
      }
    } catch (e) {
      btn.disabled = false;
      btn.textContent = confirmBtn ? 'Подтвердить' : 'Отменить';
      if (_sdk) _sdk.showAlert('Не удалось обновить статус. Попробуй ещё раз.');
      else alert('Не удалось обновить статус.');
    }
  });
}

/* ---- Экран услуг мастера ---- */
async function _htmlMasterServices() {
  const res = await fetch('/api/master/services', {
    headers: _masterAuthHeader(),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const { services, plan } = await res.json();
  const isFree     = !plan || plan === 'free';
  const atLimit    = isFree && services && services.length >= 5;

  const listHtml = (!services || services.length === 0)
    ? `<p class="master-empty">Услуг пока нет</p>`
    : `<div class="services-mgmt-list">
        ${services.map(s => `
          <div class="service-item" data-id="${s.id}">
            <div class="service-item__thumb">
              ${s.image_url
                ? `<img src="${_esc(s.image_url)}" alt="${_esc(s.title)}" id="js-svc-thumb-${s.id}">`
                : `<span class="service-item__thumb-placeholder" id="js-svc-thumb-${s.id}">🔮</span>`}
            </div>
            <div class="service-item__info">
              <p class="service-item__title">${s.title}</p>
              <p class="service-item__price">${s.price ? s.price + ' ₽' : '—'}</p>
            </div>
            <button class="service-item__photo-btn" data-id="${s.id}" title="Загрузить фото">📷</button>
            <input type="file" class="service-item__photo-input" data-id="${s.id}" accept="image/*" style="display:none">
            <button class="service-item__toggle ${s.is_active ? 'toggle--active' : 'toggle--hidden'}"
                    data-id="${s.id}" data-active="${s.is_active ? '1' : '0'}">
              ${s.is_active ? 'Скрыть' : 'Показать'}
            </button>
          </div>
        `).join('')}
      </div>`;

  const addFormHtml = atLimit
    ? `<div class="master-upgrade-note">
        Бесплатный план ограничен 5 услугами.<br>Обновите план, чтобы добавить больше.
      </div>`
    : `<div class="add-service-form" id="js-add-service-form">
        <p class="master-section-label">Добавить услугу</p>
        <input class="master-input" id="js-new-service-title" type="text" placeholder="Название" maxlength="120">
        <input class="master-input" id="js-new-service-price" type="number" placeholder="Цена (₽)" min="0">
        <button class="master-btn" id="js-add-service-btn">+ Добавить</button>
      </div>`;

  return `${listHtml}${addFormHtml}`;
}

function _attachMasterServiceEvents(container) {
  /* ---- Кнопка 📷 — открыть input для конкретной услуги ---- */
  container.addEventListener('click', e => {
    const photoBtn = e.target.closest('.service-item__photo-btn');
    if (!photoBtn) return;
    const id = photoBtn.dataset.id;
    const input = container.querySelector(`.service-item__photo-input[data-id="${id}"]`);
    input?.click();
  });

  /* ---- Загрузка фото услуги ---- */
  container.addEventListener('change', async e => {
    const input = e.target.closest('.service-item__photo-input');
    if (!input) return;
    const file = input.files?.[0];
    if (!file) return;
    const id = input.dataset.id;
    const thumbEl = container.querySelector(`#js-svc-thumb-${id}`);
    const prevHtml = thumbEl ? thumbEl.outerHTML : '';

    if (thumbEl) thumbEl.replaceWith(Object.assign(document.createElement('span'), {
      id: `js-svc-thumb-${id}`,
      textContent: '⏳',
      className: 'service-item__thumb-placeholder',
    }));

    try {
      const uploadedUrl = await _uploadFile(file, 'service', id);
      const newThumb = container.querySelector(`#js-svc-thumb-${id}`);
      if (newThumb) {
        const img = document.createElement('img');
        img.src = uploadedUrl;
        img.alt = 'service';
        img.id = `js-svc-thumb-${id}`;
        newThumb.replaceWith(img);
      }
      TG.haptic.success();
    } catch (err) {
      /* Восстановить предыдущее превью */
      const newThumb = container.querySelector(`#js-svc-thumb-${id}`);
      if (newThumb) newThumb.outerHTML = prevHtml;
      console.warn('Service photo upload error:', err);
      if (_sdk) _sdk.showAlert('Не удалось загрузить фото услуги: ' + err.message);
      else alert('Не удалось загрузить фото услуги: ' + err.message);
    }
  });

  /* Скрыть/показать услугу */
  container.addEventListener('click', async e => {
    const toggleBtn = e.target.closest('.service-item__toggle');
    if (!toggleBtn) return;

    const id       = toggleBtn.dataset.id;
    const isActive = toggleBtn.dataset.active === '1';
    toggleBtn.disabled = true;

    try {
      const res = await fetch('/api/master/services', {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json', ..._masterAuthHeader() },
        body:    JSON.stringify({ id, is_active: !isActive }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      TG.haptic.success();
      toggleBtn.dataset.active = isActive ? '0' : '1';
      toggleBtn.textContent    = isActive ? 'Показать' : 'Скрыть';
      toggleBtn.className      = `service-item__toggle ${isActive ? 'toggle--hidden' : 'toggle--active'}`;
    } catch (e) {
      console.warn('Service toggle error:', e);
      toggleBtn.disabled = false;
    }
  });

  /* Добавить услугу */
  container.querySelector('#js-add-service-btn')?.addEventListener('click', async () => {
    const titleInput = container.querySelector('#js-new-service-title');
    const priceInput = container.querySelector('#js-new-service-price');
    const title = titleInput?.value.trim();
    const price = parseInt(priceInput?.value, 10) || 0;

    if (!title) {
      titleInput?.focus();
      return;
    }

    const btn = container.querySelector('#js-add-service-btn');
    btn.disabled     = true;
    btn.textContent  = '...';

    try {
      const res = await fetch('/api/master/services', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', ..._masterAuthHeader() },
        body:    JSON.stringify({ title, price }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      TG.haptic.success();
      /* Перерендерить список */
      const contentEl = document.querySelector('#js-master-content');
      if (contentEl) _renderMasterTab(contentEl, 'services');
    } catch (e) {
      console.warn('Add service error:', e);
      btn.disabled    = false;
      btn.textContent = '+ Добавить';
      if (_sdk) _sdk.showAlert('Не удалось добавить услугу.');
      else alert('Не удалось добавить услугу.');
    }
  });
}

/* ---- Экран профиля мастера ---- */
function _htmlMasterProfile() {
  const d = window._masterData || {};
  return `
    <div class="master-form" id="js-master-profile-form">
      <p class="master-section-label">Редактировать профиль</p>

      <div class="upload-section">
        <div class="upload-item">
          <p class="upload-label">Фото профиля</p>
          <div class="upload-preview" id="js-avatar-preview">
            ${d.avatar_url
              ? `<img src="${_esc(d.avatar_url)}" alt="avatar">`
              : `<span class="upload-placeholder">👤</span>`}
          </div>
          <label class="upload-btn" for="js-avatar-input">Загрузить фото</label>
          <p class="upload-hint">JPG/PNG · 400×400px</p>
          <input type="file" id="js-avatar-input" accept="image/jpeg,image/png,image/webp" style="display:none">
        </div>
        <div class="upload-item">
          <p class="upload-label">Фон приложения</p>
          <div class="upload-preview upload-preview--rect" id="js-bg-preview">
            ${d.bg_url
              ? `<img src="${_esc(d.bg_url)}" alt="bg">`
              : `<span class="upload-placeholder">🖼</span>`}
          </div>
          <label class="upload-btn" for="js-bg-input">Загрузить фон</label>
          <p class="upload-hint">JPG/PNG · 1080×1920px</p>
          <input type="file" id="js-bg-input" accept="image/jpeg,image/png,image/webp" style="display:none">
        </div>
      </div>

      <label class="master-form__label">Имя</label>
      <input class="master-input" id="js-profile-name" type="text" value="${_esc(d.name || '')}" maxlength="100">

      <label class="master-form__label">О себе (bio)</label>
      <textarea class="master-textarea" id="js-profile-bio" rows="4" maxlength="500">${_esc(d.bio || '')}</textarea>

      <label class="master-form__label">Telegram канал / ссылка</label>
      <input class="master-input" id="js-profile-channel" type="url" value="${_esc(d.channel_url || '')}" placeholder="https://t.me/...">

      <label class="master-form__label">WhatsApp (номер или ссылка)</label>
      <input class="master-input" id="js-profile-wa" type="text" value="${_esc(d.whatsapp || '')}" placeholder="+7...">

      <button class="master-btn" id="js-profile-save">Сохранить</button>
    </div>
  `;
}

/* Вспомогательная функция: читает файл как base64 и загружает через API */
/* Сжать изображение через Canvas перед отправкой */
function _compressImage(file, maxW, maxH, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Не удалось прочитать файл'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Не удалось загрузить изображение'));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxW || height > maxH) {
          const ratio = Math.min(maxW / width, maxH / height);
          width  = Math.round(width  * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width  = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

async function _uploadFile(file, type, serviceId) {
  /* Размеры сжатия по типу */
  const dims = type === 'avatar'  ? [400,  400]  :
               type === 'bg'      ? [1200, 900]  :
                                    [800,  800];
  const base64 = await _compressImage(file, dims[0], dims[1]);

  const url = serviceId
    ? `/api/master/upload?type=${type}&serviceId=${serviceId}`
    : `/api/master/upload?type=${type}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ..._masterAuthHeader() },
    body: JSON.stringify({ file: base64, fileName: 'photo.jpg' }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `HTTP ${res.status}`);
  }
  const { url: uploadedUrl } = await res.json();
  return uploadedUrl;
}

/* Показать спиннер в превью */
function _setPreviewLoading(previewEl, on) {
  if (on) {
    previewEl.dataset.prevContent = previewEl.innerHTML;
    previewEl.innerHTML = '<span class="upload-spinner">⏳</span>';
  } else {
    if (previewEl.dataset.prevContent !== undefined) {
      previewEl.innerHTML = previewEl.dataset.prevContent;
      delete previewEl.dataset.prevContent;
    }
  }
}

function _attachMasterProfileEvents(container) {
  /* ---- Загрузка аватара ---- */
  container.querySelector('#js-avatar-input')?.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewEl = container.querySelector('#js-avatar-preview');
    _setPreviewLoading(previewEl, true);
    try {
      const uploadedUrl = await _uploadFile(file, 'avatar');
      previewEl.innerHTML = `<img src="${uploadedUrl}" alt="avatar">`;
      if (window._masterData) window._masterData.avatar_url = uploadedUrl;
      /* Обновить ANA.avatar */
      ANA.avatar = uploadedUrl;
      TG.haptic.success();
    } catch (err) {
      _setPreviewLoading(previewEl, false);
      console.warn('Avatar upload error:', err);
      if (_sdk) _sdk.showAlert('Не удалось загрузить фото: ' + err.message);
      else alert('Не удалось загрузить фото: ' + err.message);
    } finally {
      e.target.value = '';
    }
  });

  /* ---- Загрузка фона ---- */
  container.querySelector('#js-bg-input')?.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    const previewEl = document.getElementById('js-bg-preview');
    if (previewEl) previewEl.innerHTML = '<span style="font-size:24px;line-height:80px">⏳</span>';
    try {
      /* Читаем файл */
      const dataUrl = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload  = ev => res(ev.target.result);
        r.onerror = () => rej(new Error('Ошибка чтения файла'));
        r.readAsDataURL(file);
      });
      /* Сжимаем через Canvas до 1200×900 */
      const compressed = await new Promise((res, rej) => {
        const img = new Image();
        img.onerror = () => rej(new Error('Ошибка загрузки изображения'));
        img.onload  = () => {
          try {
            const MAX_W = 1080, MAX_H = 1920;
            let w = img.width, h = img.height;
            if (w > MAX_W || h > MAX_H) {
              const r = Math.min(MAX_W / w, MAX_H / h);
              w = Math.round(w * r); h = Math.round(h * r);
            }
            const c = document.createElement('canvas');
            c.width = w; c.height = h;
            c.getContext('2d').drawImage(img, 0, 0, w, h);
            res(c.toDataURL('image/jpeg', 0.82));
          } catch(ex) { rej(ex); }
        };
        img.src = dataUrl;
      });
      /* Отправляем */
      const apiRes = await fetch('/api/master/upload?type=bg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ..._masterAuthHeader() },
        body: JSON.stringify({ file: compressed, fileName: 'bg.jpg' }),
      });
      if (!apiRes.ok) {
        const d = await apiRes.json().catch(() => ({}));
        throw new Error(d.error || `HTTP ${apiRes.status}`);
      }
      const { url } = await apiRes.json();
      if (previewEl) previewEl.innerHTML = `<img src="${url}" alt="bg">`;
      if (window._masterData) window._masterData.bg_url = url;
      document.documentElement.style.setProperty('--bg-image', `url('${url}')`);
      TG.haptic.success();
    } catch (err) {
      if (previewEl) previewEl.innerHTML = '<span class="upload-placeholder">🖼</span>';
      const msg = 'Не удалось загрузить фон: ' + (err.message || 'неизвестная ошибка');
      if (_sdk) _sdk.showAlert(msg); else alert(msg);
    }
  });

  container.querySelector('#js-profile-save')?.addEventListener('click', async () => {
    const btn = container.querySelector('#js-profile-save');
    btn.disabled    = true;
    btn.textContent = '...';

    const body = {
      name:        container.querySelector('#js-profile-name')?.value.trim()    || '',
      bio:         container.querySelector('#js-profile-bio')?.value.trim()     || '',
      channel_url: container.querySelector('#js-profile-channel')?.value.trim() || '',
      whatsapp:    container.querySelector('#js-profile-wa')?.value.trim()      || '',
    };

    try {
      const res = await fetch('/api/master/me', {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json', ..._masterAuthHeader() },
        body:    JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      /* Обновить кэш */
      if (window._masterData) Object.assign(window._masterData, body);
      /* Обновить ANA */
      if (body.name)        ANA.name       = body.name;
      if (body.bio)         ANA.bio        = body.bio;
      if (body.channel_url) ANA.channelUrl = body.channel_url;
      if (body.whatsapp)    ANA.whatsapp   = body.whatsapp;

      TG.haptic.success();
      btn.textContent = 'Сохранено ✓';
      setTimeout(() => {
        btn.disabled    = false;
        btn.textContent = 'Сохранить';
      }, 2000);
    } catch (e) {
      console.warn('Profile save error:', e);
      btn.disabled    = false;
      btn.textContent = 'Сохранить';
      if (_sdk) _sdk.showAlert('Не удалось сохранить профиль.');
      else alert('Не удалось сохранить профиль.');
    }
  });
}

/* Экранирование HTML-спецсимволов в атрибутах */
function _esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/* =====================================================
   6. ОФФЕР-МОДАЛКА (показывается один раз)
   ===================================================== */

const ONBOARD_KEY = 'ana_onboard_shown';
const OFFER_KEY   = 'ana_offer_shown';

/* ---- Онбординг (первое открытие) ---- */
function showOnboarding() {
  if (localStorage.getItem(ONBOARD_KEY)) return;

  const user = TG.user;
  const name = user?.first_name ? `, ${user.first_name}` : '';

  const overlay = document.createElement('div');
  overlay.className = 'offer-overlay';
  overlay.innerHTML = `
    <div class="offer-card onboard-card">
      <div class="offer-emoji">🔮</div>
      <h2 class="offer-title">Привет${name}!</h2>
      <p class="offer-sub">Я помогу тебе найти ясность там, где кажется, что выхода нет</p>
      <ul class="offer-bullets">
        <li>Записаться на личный расклад к Ане</li>
        <li>Купить материалы для самостоятельной работы</li>
        <li>Получить ответ на один важный вопрос</li>
      </ul>
      <button class="offer-btn" id="js-onboard-start">Начать →</button>
    </div>
  `;

  document.getElementById('app').appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('offer-overlay--visible'));

  overlay.querySelector('#js-onboard-start').addEventListener('click', () => {
    TG.haptic.medium();
    localStorage.setItem(ONBOARD_KEY, '1');
    overlay.classList.remove('offer-overlay--visible');
    setTimeout(() => {
      overlay.remove();
      /* После онбординга показать оффер */
      setTimeout(showOffer, 600);
    }, 300);
  });
}

function showOffer() {
  /* Уже видели — не показывать */
  if (localStorage.getItem(OFFER_KEY)) return;

  const overlay = document.createElement('div');
  overlay.className = 'offer-overlay';
  overlay.innerHTML = `
    <div class="offer-card">
      <div class="offer-emoji">🎁</div>
      <h2 class="offer-title">Скидка 15% на первую запись</h2>
      <p class="offer-sub">Подпишитесь на бота — получите промокод в личное сообщение</p>
      <ul class="offer-bullets">
        <li>Напомним о записи за день</li>
        <li>Первыми узнаёте о свободных окошках</li>
        <li>Эксклюзивные акции для подписчиков</li>
      </ul>
      <button class="offer-btn" id="js-offer-accept">Получить скидку 15%</button>
      <button class="offer-skip" id="js-offer-skip">Пропустить</button>
    </div>
  `;

  document.getElementById('app').appendChild(overlay);

  /* Анимация появления */
  requestAnimationFrame(() => overlay.classList.add('offer-overlay--visible'));

  function closeOffer() {
    localStorage.setItem(OFFER_KEY, '1');
    overlay.classList.remove('offer-overlay--visible');
    setTimeout(() => overlay.remove(), 300);
  }

  /* Кнопка «Получить скидку» — открыть бота */
  overlay.querySelector('#js-offer-accept').addEventListener('click', () => {
    TG.haptic.medium();
    closeOffer();
    const url = 'https://t.me/AnaKristaTaro_Bot?start=from_app';
    if (_sdk) _sdk.openTelegramLink(url);
    else window.open(url, '_blank');
  });

  /* Кнопка «Пропустить» */
  overlay.querySelector('#js-offer-skip').addEventListener('click', () => {
    TG.haptic.light();
    closeOffer();
  });
}

/* =====================================================
   6. ЗАПУСК
   ===================================================== */

function initBottomNav() {
  document.getElementById('bottom-nav')?.addEventListener('click', e => {
    const tab = e.target.closest('.nav-tab')?.dataset.tab;
    if (!tab || tab === _activeTab) return;
    TG.haptic.select();
    switchTab(tab);
  });
}

/* =====================================================
   ЗАГРУЗКА ДАННЫХ ИЗ API
   Заменяет статический data.js при наличии Supabase.
   Fallback — данные из data.js (работает всегда).
   ===================================================== */

async function loadMasterData() {
  /* Определяем slug мастера:
     1. Из параметра start_param (t.me/Bot?start=ana-krista)
     2. Из URL ?master=ana-krista
     3. Fallback — 'ana-krista' */
  const startParam = _sdk?.initDataUnsafe?.start_param || '';
  const urlParam   = new URLSearchParams(window.location.search).get('master');
  const masterSlug = startParam || urlParam || 'ana-krista';

  try {
    const res  = await fetch(`/api/masters/${masterSlug}`);
    if (!res.ok) return; // fallback на data.js

    const { master, services } = await res.json();
    if (!master) return;

    /* Обновить глобальный объект ANA */
    ANA.name        = master.name        || ANA.name;
    ANA.bio         = master.bio         || ANA.bio;
    ANA.meta        = master.meta        || ANA.meta;
    ANA.stats       = master.stats       || ANA.stats;
    ANA.channelUrl  = master.channel_url || ANA.channelUrl;
    ANA.whatsapp    = master.whatsapp    || ANA.whatsapp;
    ANA.channel     = master.channel_url ? `🔮 ${master.channel_url.replace('https://t.me/', '@')}` : ANA.channel;
    if (master.avatar_url) ANA.avatar = master.avatar_url;
    if (master.bg_url)     document.documentElement.style.setProperty('--bg-image', `url('${master.bg_url}')`);
    if (master.accent_color) document.documentElement.style.setProperty('--accent', master.accent_color);

    /* Обновить глобальный массив SERVICES */
    if (services && services.length > 0) {
      SERVICES.length = 0; // очистить массив
      services.forEach(s => SERVICES.push({
        id:                s.id,
        category:          s.category,
        type:              s.type,
        emoji:             s.emoji             || '🔮',
        title:             s.title,
        subtitle:          s.subtitle          || '',
        desc:              s.description       || '',
        includes:          Array.isArray(s.includes) ? s.includes : [],
        testimonial:       s.testimonial       || '',
        testimonialAuthor: s.testimonial_author || '',
        price:             s.price,
        image:             s.image_url         || null,
        gradient:          s.gradient          || 'linear-gradient(135deg, #4c1d95 0%, #3730a3 100%)',
      }));
    }

    /* Сохранить slug для отправки заявок */
    window._masterSlug = masterSlug;

    /* Сохранить данные мастера (включая telegram_id для проверки прав) */
    window._masterData = {
      telegram_id:  master.telegram_id  || null,
      name:         master.name         || ANA.name,
      bio:          master.bio          || ANA.bio,
      channel_url:  master.channel_url  || ANA.channelUrl,
      whatsapp:     master.whatsapp     || ANA.whatsapp,
      plan:         master.plan         || 'free',
      avatar_url:   master.avatar_url   || null,
      bg_url:       master.bg_url       || null,
    };

  } catch (e) {
    console.warn('API недоступен, используем статические данные:', e.message);
  }
}

async function init() {
  TG.init();

  /* Загрузить данные мастера из API (или использовать data.js) */
  await loadMasterData();

  /* Показать вкладку «Мастер» если пользователь = владелец страницы */
  if (checkIsMaster()) {
    document.querySelector('[data-tab="master"]')?.classList.remove('hidden');
  }

  navigate('home');
  initBottomNav();

  /* Онбординг при первом открытии, затем оффер */
  setTimeout(() => {
    if (!localStorage.getItem(ONBOARD_KEY)) {
      showOnboarding();
    } else {
      showOffer();
    }
  }, 1000);
}

/* Запускаем после загрузки DOM */
document.addEventListener('DOMContentLoaded', init);
