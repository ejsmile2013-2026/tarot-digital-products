// POST /api/bookings
// Клиент оставляет заявку из Mini App
// Сохраняет в БД, отправляет уведомление мастеру и подтверждение клиенту

import { supabase, setCors } from './_lib/supabase.js';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const APP_URL   = 'https://tg-app-nine-lovat.vercel.app';

async function sendTg(chatId, text, extra = {}) {
  if (!BOT_TOKEN || !chatId) return;
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML', ...extra }),
  });
}

const openAppBtn = (slug) => ({
  reply_markup: {
    inline_keyboard: [[{
      text:    '🔮 Открыть каталог',
      web_app: { url: `${APP_URL}?master=${slug}` },
    }]],
  },
});

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const {
    masterSlug,
    serviceId,
    serviceTitle,
    clientTgId,
    clientName,
    question,
    preferredDate,
  } = req.body;

  if (!masterSlug || !question) {
    return res.status(400).json({ error: 'masterSlug и question обязательны' });
  }

  // Найти мастера по slug
  const { data: master } = await supabase
    .from('masters')
    .select('id, name, telegram_id, slug')
    .eq('slug', masterSlug)
    .single();

  if (!master) return res.status(404).json({ error: 'Мастер не найден' });

  // Сохранить заявку в БД
  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({
      master_id:      master.id,
      service_id:     serviceId || null,
      service_title:  serviceTitle || null,
      client_tg_id:   clientTgId || null,
      client_name:    clientName || null,
      question,
      preferred_date: preferredDate || null,
    })
    .select('id')
    .single();

  if (error) {
    console.error('Booking insert error:', error);
    return res.status(500).json({ error: 'Ошибка сохранения заявки' });
  }

  // Уведомление мастеру
  await sendTg(
    master.telegram_id,
    `🔔 <b>Новая заявка!</b>\n\n` +
    `👤 Клиент: ${clientName || 'Аноним'}${clientTgId ? ` (id: <code>${clientTgId}</code>)` : ''}\n` +
    `🔮 Услуга: ${serviceTitle || '—'}\n` +
    `📅 Дата: ${preferredDate || 'не указана'}\n\n` +
    `💬 Вопрос:\n${question}`,
    openAppBtn(master.slug)
  );

  // Подтверждение клиенту
  if (clientTgId) {
    await sendTg(
      clientTgId,
      `✅ <b>Заявка принята!</b>\n\n` +
      `${master.name} свяжется с тобой в течение 24 часов — уточнит детали и пришлёт способ оплаты.`,
      openAppBtn(master.slug)
    );
  }

  return res.status(201).json({ ok: true, bookingId: booking.id });
}
