// Webhook — обрабатывает все сообщения бота, заявки из Mini App и онбординг мастеров

import { supabase } from './_lib/supabase.js';

const TOKEN    = process.env.TELEGRAM_BOT_TOKEN;
const APP_URL  = 'https://tg-app-nine-lovat.vercel.app';
const ADMIN_ID = process.env.ADMIN_CHAT_ID; // Telegram ID Аны (для уведомлений о заявках)

// ── Утилиты ─────────────────────────────────────────────────────────────────

/**
 * Отправить сообщение в Telegram.
 * extra — любые дополнительные поля (reply_markup, parse_mode и т.д.)
 */
async function sendTg(chatId, text, extra = {}) {
  await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML', ...extra }),
  });
}

/**
 * Ответить на callback_query (убирает «часики» на кнопке).
 */
async function answerCallback(callbackQueryId, text = '') {
  await fetch(`https://api.telegram.org/bot${TOKEN}/answerCallbackQuery`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ callback_query_id: callbackQueryId, text }),
  });
}

/**
 * Транслитерация имени в slug:
 *   "Анна Крист" → "anna-krist"
 *   "Мария Иванова" → "maria-ivanova"
 */
function nameToSlug(name) {
  const map = {
    'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo',
    'ж':'zh','з':'z','и':'i','й':'j','к':'k','л':'l','м':'m',
    'н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u',
    'ф':'f','х':'kh','ц':'ts','ч':'ch','ш':'sh',
    'щ':'shch','ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya',
  };
  return name.toLowerCase()
    .split('').map(c => map[c] ?? c)
    .join('').replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Проверить уникальность slug, при необходимости добавить суффикс-цифру.
 * Возвращает готовый уникальный slug.
 */
async function uniqueSlug(base) {
  let candidate = base;
  let counter = 2;
  while (true) {
    const { data } = await supabase
      .from('masters')
      .select('id')
      .eq('slug', candidate)
      .maybeSingle();
    if (!data) return candidate; // свободен
    candidate = `${base}-${counter}`;
    counter++;
  }
}

// ── Кнопки ───────────────────────────────────────────────────────────────────

/** Inline-кнопки на /start */
const startKeyboard = {
  reply_markup: {
    inline_keyboard: [
      [
        { text: '🔮 Я мастер',       callback_data: 'register_master' },
        { text: '📖 Открыть каталог', web_app: { url: APP_URL } },
      ],
    ],
  },
};

/** Кнопка «Открыть приложение» после завершения онбординга */
function openAppForMaster(slug) {
  return {
    reply_markup: {
      inline_keyboard: [[
        { text: '🚀 Открыть приложение', web_app: { url: `${APP_URL}?master=${slug}` } },
      ]],
    },
  };
}

// ── Онбординг ────────────────────────────────────────────────────────────────

/**
 * Начало онбординга — создать или перезаписать сессию с step='name'.
 */
async function startOnboarding(userId, chatId) {
  await supabase
    .from('onboarding_sessions')
    .upsert({ telegram_id: userId, step: 'name', data: {} });

  await sendTg(chatId,
    'Отлично! Давай создадим твоё приложение.\n\n' +
    '📝 <b>Как тебя зовут?</b> Напиши имя и фамилию:'
  );
}

/**
 * Обработать текущий шаг онбординга.
 */
async function handleOnboardingStep(session, userId, chatId, text) {
  const { step, data } = session;

  if (step === 'name') {
    // Сохранить имя, перейти к bio
    const newData = { ...data, name: text };
    await supabase
      .from('onboarding_sessions')
      .update({ step: 'bio', data: newData })
      .eq('telegram_id', userId);

    await sendTg(chatId,
      `Приятно познакомиться, <b>${text}</b>! 👋\n\n` +
      '📖 <b>Напиши 1–2 предложения о себе</b> — это увидят твои клиенты:'
    );
    return;
  }

  if (step === 'bio') {
    // Сохранить bio, перейти к niche
    const newData = { ...data, bio: text };
    await supabase
      .from('onboarding_sessions')
      .update({ step: 'niche', data: newData })
      .eq('telegram_id', userId);

    await sendTg(chatId,
      '✨ Отлично!\n\n' +
      '🔮 <b>В какой нише работаешь?</b>\n' +
      'Например: таро, нумерология, травничество, психология, астрология:'
    );
    return;
  }

  if (step === 'niche') {
    // Сохранить niche, создать мастера
    const masterName = data.name;
    const masterBio  = data.bio;
    const masterNiche = text;

    // Генерировать slug
    const baseSlug = nameToSlug(masterName);
    const slug = await uniqueSlug(baseSlug);

    // Создать мастера в БД
    const { data: master, error } = await supabase
      .from('masters')
      .insert({
        telegram_id: userId,
        slug,
        name: masterName,
        bio:  masterBio,
        meta: masterNiche,
        plan: 'free',
      })
      .select()
      .single();

    if (error) {
      console.error('Ошибка создания мастера:', error);
      await sendTg(chatId,
        '⚠️ Что-то пошло не так при создании профиля. Попробуй снова — напиши /start'
      );
      return;
    }

    // Удалить сессию онбординга
    await supabase
      .from('onboarding_sessions')
      .delete()
      .eq('telegram_id', userId);

    // Финальное сообщение с результатом
    const masterLink = `${APP_URL}?master=${slug}`;
    await sendTg(chatId,
      `🎉 <b>Готово! Твоё приложение создано.</b>\n\n` +
      `🔗 <b>Ссылка для клиентов:</b>\n` +
      `${masterLink}\n\n` +
      `Перешли её своим подписчикам — они попадут прямо к тебе.\n\n` +
      `<b>Следующий шаг</b> — добавь свои услуги:`,
      openAppForMaster(slug)
    );
    return;
  }
}

// ── Главный обработчик ───────────────────────────────────────────────────────

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET /api/webhook — healthcheck
  if (req.method === 'GET') {
    return res.json({ ok: true, status: 'Bot webhook is running ✓' });
  }

  const body = req.body;
  if (!body) return res.json({ ok: true });

  // ── Заявка из Mini App (fetch от клиента) ──────────────────────────────────
  if (body.type === 'booking') {
    const { userId, userName, serviceTitle, serviceId, question, date } = body;

    // Подтверждение клиенту
    if (userId) {
      await sendTg(userId,
        `✅ <b>Заявка принята!</b>\n\n` +
        `Мастер свяжется с тобой в течение 24 часов — уточнит детали и пришлёт способ оплаты.\n\n` +
        `Если хочешь написать напрямую: @Ana_Krista`,
        { reply_markup: { inline_keyboard: [[{ text: '🔮 Открыть каталог', web_app: { url: APP_URL } }]] } }
      );
    }

    // Уведомление мастеру
    if (ADMIN_ID) {
      const dateStr = date || 'не указана';
      await sendTg(ADMIN_ID,
        `🔔 <b>Новая заявка!</b>\n\n` +
        `👤 Клиент: ${userName || 'Аноним'}${userId ? ` (id: <code>${userId}</code>)` : ''}\n` +
        `🔮 Услуга: ${serviceTitle || serviceId}\n` +
        `📅 Дата: ${dateStr}\n\n` +
        `💬 Вопрос:\n${question || '—'}`
      );
    }

    return res.json({ ok: true });
  }

  // ── callback_query (нажатие inline-кнопки) ─────────────────────────────────
  if (body.callback_query) {
    const cq     = body.callback_query;
    const userId = cq.from.id;
    const chatId = cq.message.chat.id;
    const cbData = cq.data;

    await answerCallback(cq.id);

    if (cbData === 'register_master') {
      // Проверить — мастер уже существует?
      const { data: existing } = await supabase
        .from('masters')
        .select('slug')
        .eq('telegram_id', userId)
        .maybeSingle();

      if (existing) {
        const masterLink = `${APP_URL}?master=${existing.slug}`;
        await sendTg(chatId,
          `✅ Твой профиль уже создан!\n\n` +
          `🔗 <b>Ссылка для клиентов:</b>\n${masterLink}`,
          openAppForMaster(existing.slug)
        );
      } else {
        await startOnboarding(userId, chatId);
      }
    }

    return res.json({ ok: true });
  }

  // ── Telegram update — сообщение от пользователя ────────────────────────────
  const msg = body.message;
  if (!msg) return res.json({ ok: true });

  const chatId = msg.chat.id;
  const userId = msg.from?.id;
  const text   = msg.text || '';
  const name   = msg.from?.first_name || 'друг';

  // /start
  if (text.startsWith('/start')) {
    await sendTg(chatId,
      `Привет, ${name}! 👋\n\n` +
      `Я помогу тебе записаться к мастеру или создать своё приложение.\n\n` +
      `Кто ты?`,
      startKeyboard
    );
    return res.json({ ok: true });
  }

  // /help
  if (text === '/help') {
    await sendTg(chatId,
      `📞 <b>Как связаться с Аной напрямую:</b>\n\n` +
      `Telegram: @Ana_Krista\n` +
      `WhatsApp: +1 317 752 03 69\n\n` +
      `Или записывайся прямо здесь 👇`,
      { reply_markup: { inline_keyboard: [[{ text: '🔮 Открыть каталог', web_app: { url: APP_URL } }]] } }
    );
    return res.json({ ok: true });
  }

  // Проверить активную сессию онбординга для любого входящего текста
  if (userId && text && !text.startsWith('/')) {
    const { data: session } = await supabase
      .from('onboarding_sessions')
      .select('*')
      .eq('telegram_id', userId)
      .maybeSingle();

    if (session) {
      await handleOnboardingStep(session, userId, chatId, text);
      return res.json({ ok: true });
    }
  }

  // Любое другое сообщение (нет активной сессии)
  await sendTg(chatId,
    `Чтобы записаться — открой каталог услуг, или нажми /start чтобы зарегистрироваться как мастер.`,
    { reply_markup: { inline_keyboard: [[{ text: '🔮 Открыть каталог', web_app: { url: APP_URL } }]] } }
  );

  return res.json({ ok: true });
}
