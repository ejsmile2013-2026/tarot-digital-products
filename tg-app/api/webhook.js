// Webhook — обрабатывает все сообщения бота и заявки из Mini App

const TOKEN    = process.env.TELEGRAM_BOT_TOKEN;
const APP_URL  = 'https://tg-app-nine-lovat.vercel.app';
const ADMIN_ID = process.env.ADMIN_CHAT_ID; // Telegram ID Аны

// Отправить сообщение
async function send(chatId, text, extra = {}) {
  await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML', ...extra }),
  });
}

// Кнопка «Открыть приложение»
const openAppBtn = {
  reply_markup: {
    inline_keyboard: [[{
      text:    '🔮 Открыть каталог',
      web_app: { url: APP_URL },
    }]],
  },
};

export default async function handler(req, res) {
  // CORS для fetch из Mini App
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET /api/webhook — проверка что сервер работает
  if (req.method === 'GET') {
    return res.json({ ok: true, status: 'Bot webhook is running ✓' });
  }

  const body = req.body;
  if (!body) return res.json({ ok: true });

  // ── Заявка из Mini App (fetch от клиента) ──────────────────
  if (body.type === 'booking') {
    const { userId, userName, serviceTitle, serviceId, question, date } = body;

    // Подтверждение клиенту
    if (userId) {
      await send(userId,
        `✅ <b>Заявка принята!</b>\n\n` +
        `Ана свяжется с тобой в течение 24 часов — уточнит детали и пришлёт способ оплаты.\n\n` +
        `Если хочешь написать напрямую: @Ana_Krista`,
        openAppBtn
      );
    }

    // Уведомление Ане
    if (ADMIN_ID) {
      const dateStr = date || 'не указана';
      await send(ADMIN_ID,
        `🔔 <b>Новая заявка!</b>\n\n` +
        `👤 Клиент: ${userName || 'Аноним'}${userId ? ` (id: <code>${userId}</code>)` : ''}\n` +
        `🔮 Услуга: ${serviceTitle || serviceId}\n` +
        `📅 Дата: ${dateStr}\n\n` +
        `💬 Вопрос:\n${question || '—'}`
      );
    }

    return res.json({ ok: true });
  }

  // ── Telegram update (сообщение боту) ──────────────────────
  const msg = body.message;
  if (!msg) return res.json({ ok: true });

  const chatId = msg.chat.id;
  const text   = msg.text || '';
  const name   = msg.from?.first_name || 'друг';

  // /start
  if (text.startsWith('/start')) {
    await send(chatId,
      `Привет, ${name}! 👋\n\n` +
      `Я помогу тебе записаться к тарологу <b>Ana Krista Goyya</b>.\n\n` +
      `🔮 Расклады на отношения, год и один вопрос\n` +
      `📖 Материалы для самостоятельной работы\n` +
      `🎁 Скидка 15% для новых клиентов\n\n` +
      `Нажми кнопку ниже 👇`,
      openAppBtn
    );
    return res.json({ ok: true });
  }

  // /help
  if (text === '/help') {
    await send(chatId,
      `📞 <b>Как связаться с Аной напрямую:</b>\n\n` +
      `Telegram: @Ana_Krista\n` +
      `WhatsApp: +1 317 752 03 69\n\n` +
      `Или записывайся прямо здесь 👇`,
      openAppBtn
    );
    return res.json({ ok: true });
  }

  // Любое другое сообщение
  await send(chatId,
    `Чтобы записаться — открой каталог услуг 👇`,
    openAppBtn
  );

  return res.json({ ok: true });
}
