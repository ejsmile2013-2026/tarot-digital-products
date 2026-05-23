// GET  /api/master/me  — профиль текущего мастера
// PUT  /api/master/me  — обновить профиль
// Только для авторизованного мастера (Authorization: tma <initData>)

import { supabase, setCors } from '../_lib/supabase.js';
import { requireMaster } from '../_lib/auth.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const master = await requireMaster(req, res);
  if (!master) return; // requireMaster уже ответил 401/403

  // ── GET: вернуть полный профиль ──────────────────────────
  if (req.method === 'GET') {
    // Посчитать количество заявок
    const { count: bookingsCount } = await supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('master_id', master.id);

    // Посчитать количество активных услуг
    const { count: servicesCount } = await supabase
      .from('services')
      .select('id', { count: 'exact', head: true })
      .eq('master_id', master.id)
      .eq('is_active', true);

    return res.status(200).json({
      master,
      stats: {
        bookings: bookingsCount || 0,
        services: servicesCount || 0,
        servicesLimit: master.plan === 'free' ? 5 : null,
      },
    });
  }

  // ── PUT: обновить профиль ────────────────────────────────
  if (req.method === 'PUT') {
    const allowed = ['name', 'bio', 'meta', 'stats', 'avatar_url', 'bg_url',
                     'channel_url', 'whatsapp', 'accent_color'];

    // Фильтруем только разрешённые поля
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    // accent_color только для Pro и Studio
    if (updates.accent_color && master.plan === 'free') {
      delete updates.accent_color;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'Нет полей для обновления' });
    }

    const { data, error } = await supabase
      .from('masters')
      .update(updates)
      .eq('id', master.id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: 'Ошибка обновления профиля' });

    return res.status(200).json({ master: data });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
