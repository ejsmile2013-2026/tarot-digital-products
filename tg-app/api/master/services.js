// GET  /api/master/services         — все услуги мастера (включая неактивные)
// POST /api/master/services         — создать услугу

import { supabase, setCors } from '../_lib/supabase.js';
import { requireMaster, canAddService } from '../_lib/auth.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const master = await requireMaster(req, res);
  if (!master) return;

  // ── GET: список всех услуг мастера ──────────────────────
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('master_id', master.id)
      .order('sort_order', { ascending: true });

    if (error) return res.status(500).json({ error: 'Ошибка загрузки услуг' });

    return res.status(200).json({ services: data || [] });
  }

  // ── POST: создать новую услугу ───────────────────────────
  if (req.method === 'POST') {
    // Проверить лимит (5 услуг для free)
    const allowed = await canAddService(master.id, master.plan);
    if (!allowed) {
      return res.status(403).json({
        error:   'Лимит услуг на бесплатном тарифе — 5',
        upgrade: true, // сигнал для UI показать экран апгрейда
      });
    }

    const { category, type, emoji, title, subtitle, description,
            includes, testimonial, testimonial_author, price,
            image_url, gradient, sort_order } = req.body;

    if (!title || !price) {
      return res.status(400).json({ error: 'title и price обязательны' });
    }

    const { data, error } = await supabase
      .from('services')
      .insert({
        master_id:          master.id,
        category:           category || 'readings',
        type:               type     || 'consultation',
        emoji:              emoji    || '🔮',
        title,
        subtitle:           subtitle    || '',
        description:        description || '',
        includes:           includes    || [],
        testimonial:        testimonial || '',
        testimonial_author: testimonial_author || '',
        price:              parseInt(price),
        image_url:          image_url || null,
        gradient:           gradient  || 'linear-gradient(135deg, #4c1d95 0%, #3730a3 100%)',
        sort_order:         sort_order || 0,
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: 'Ошибка создания услуги' });

    return res.status(201).json({ service: data });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
