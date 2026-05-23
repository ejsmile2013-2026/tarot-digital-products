// Авторизация через Telegram initData
// Каждый запрос от мастера содержит заголовок Authorization: tma <initData>
// Сервер проверяет подпись через HMAC-SHA256 — стандарт Telegram Mini Apps

import { createHmac } from 'crypto';
import { supabase } from './supabase.js';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

/**
 * Проверяет подпись initData от Telegram.
 * Возвращает объект user или null если подпись неверна.
 */
export function verifyInitData(initData) {
  if (!initData || !BOT_TOKEN) return null;

  const params = new URLSearchParams(initData);
  const hash   = params.get('hash');
  if (!hash) return null;

  params.delete('hash');

  // Строка для проверки — ключи отсортированы по алфавиту
  const dataCheckString = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');

  // Ключ подписи = HMAC(BOT_TOKEN, "WebAppData")
  const secretKey = createHmac('sha256', 'WebAppData')
    .update(BOT_TOKEN)
    .digest();

  const expected = createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  if (expected !== hash) return null;

  // Вернуть объект пользователя
  const userRaw = params.get('user');
  if (!userRaw) return null;

  try {
    return JSON.parse(decodeURIComponent(userRaw));
  } catch {
    return null;
  }
}

/**
 * Мидлвар для защищённых роутов мастера.
 * Читает заголовок Authorization: tma <initData>
 * Проверяет подпись, находит мастера в БД.
 * Возвращает { master } или отвечает 401/403.
 */
export async function requireMaster(req, res) {
  const authHeader = req.headers['authorization'] || '';
  const initData   = authHeader.replace('tma ', '');

  const tgUser = verifyInitData(initData);
  if (!tgUser) {
    res.status(401).json({ error: 'Неверная подпись Telegram' });
    return null;
  }

  const { data: master, error } = await supabase
    .from('masters')
    .select('*')
    .eq('telegram_id', tgUser.id)
    .single();

  if (error || !master) {
    res.status(403).json({ error: 'Мастер не найден. Пройди регистрацию.' });
    return null;
  }

  return master;
}

/**
 * Проверяет лимит услуг для бесплатного тарифа.
 * Возвращает true если добавление разрешено.
 */
export async function canAddService(masterId, plan) {
  if (plan !== 'free') return true;

  const { count } = await supabase
    .from('services')
    .select('id', { count: 'exact', head: true })
    .eq('master_id', masterId)
    .eq('is_active', true);

  return (count || 0) < 5;
}
