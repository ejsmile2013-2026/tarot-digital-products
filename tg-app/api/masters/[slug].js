// GET /api/masters/:slug
// Публичный эндпоинт — профиль мастера + его активные услуги
// Используется Mini App при загрузке

import { supabase, setCors } from '../_lib/supabase.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { slug } = req.query;

  // Профиль мастера
  const { data: master, error: masterErr } = await supabase
    .from('masters')
    .select('id, slug, name, bio, meta, stats, avatar_url, bg_url, channel_url, whatsapp, accent_color, plan')
    .eq('slug', slug)
    .single();

  if (masterErr || !master) {
    return res.status(404).json({ error: `Мастер '${slug}' не найден` });
  }

  // Активные услуги мастера — сортировка по sort_order
  const { data: services, error: svcErr } = await supabase
    .from('services')
    .select('id, category, type, emoji, title, subtitle, description, includes, testimonial, testimonial_author, price, image_url, gradient, sort_order')
    .eq('master_id', master.id)
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (svcErr) {
    return res.status(500).json({ error: 'Ошибка загрузки услуг' });
  }

  return res.status(200).json({ master, services: services || [] });
}
