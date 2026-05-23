// PUT    /api/master/services/:id  — обновить услугу
// DELETE /api/master/services/:id  — скрыть услугу (is_active = false)
// Мастер может редактировать только свои услуги

import { supabase, setCors } from '../../_lib/supabase.js';
import { requireMaster } from '../../_lib/auth.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const master = await requireMaster(req, res);
  if (!master) return;

  const { id } = req.query;

  // Убедиться что услуга принадлежит этому мастеру
  const { data: svc } = await supabase
    .from('services')
    .select('id, master_id')
    .eq('id', id)
    .single();

  if (!svc || svc.master_id !== master.id) {
    return res.status(404).json({ error: 'Услуга не найдена' });
  }

  // ── PUT: обновить поля услуги ────────────────────────────
  if (req.method === 'PUT') {
    const allowed = ['category', 'type', 'emoji', 'title', 'subtitle', 'description',
                     'includes', 'testimonial', 'testimonial_author', 'price',
                     'image_url', 'gradient', 'sort_order', 'is_active'];

    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    if (updates.price !== undefined) updates.price = parseInt(updates.price);

    const { data, error } = await supabase
      .from('services')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: 'Ошибка обновления услуги' });

    return res.status(200).json({ service: data });
  }

  // ── DELETE: скрыть услугу (не удалять, чтобы не сломать заявки) ──
  if (req.method === 'DELETE') {
    const { error } = await supabase
      .from('services')
      .update({ is_active: false })
      .eq('id', id);

    if (error) return res.status(500).json({ error: 'Ошибка удаления услуги' });

    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
