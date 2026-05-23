// POST /api/admin/masters — создать мастера вручную (из онбординга или вручную)
// Защита: заголовок X-Admin-Key должен совпадать с ADMIN_SECRET_KEY из env

import { supabase, setCors } from '../_lib/supabase.js';

export default async function handler(req, res) {
  setCors(res);

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Проверить admin-ключ
  const adminKey = req.headers['x-admin-key'];
  if (!adminKey || adminKey !== process.env.ADMIN_SECRET_KEY) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  // POST — создать мастера
  if (req.method === 'POST') {
    const { telegram_id, slug, name, bio, meta, plan = 'free' } = req.body || {};

    // Валидация обязательных полей
    if (!telegram_id || !slug || !name) {
      return res.status(400).json({
        error: 'Обязательные поля: telegram_id, slug, name',
      });
    }

    // Проверить уникальность telegram_id
    const { data: existingById } = await supabase
      .from('masters')
      .select('id')
      .eq('telegram_id', telegram_id)
      .maybeSingle();

    if (existingById) {
      return res.status(409).json({ error: 'Мастер с таким telegram_id уже существует' });
    }

    // Проверить уникальность slug
    const { data: existingBySlug } = await supabase
      .from('masters')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (existingBySlug) {
      return res.status(409).json({ error: `Slug "${slug}" уже занят` });
    }

    // Создать мастера
    const { data: master, error } = await supabase
      .from('masters')
      .insert({ telegram_id, slug, name, bio, meta, plan })
      .select()
      .single();

    if (error) {
      console.error('Ошибка создания мастера:', error);
      return res.status(500).json({ error: 'Не удалось создать мастера', detail: error.message });
    }

    return res.status(201).json({ master });
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
