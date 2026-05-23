// GET /api/master/bookings  — заявки текущего мастера
// PUT /api/master/bookings  — обновить статус заявки (тело: { id, status })

import { supabase, setCors } from '../_lib/supabase.js';
import { requireMaster } from '../_lib/auth.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const master = await requireMaster(req, res);
  if (!master) return;

  // ── GET: список заявок (новые первыми) ───────────────────
  if (req.method === 'GET') {
    const status = req.query.status; // ?status=new фильтр по статусу

    let query = supabase
      .from('bookings')
      .select('*')
      .eq('master_id', master.id)
      .order('created_at', { ascending: false })
      .limit(100);

    if (status) query = query.eq('status', status);

    const { data, error } = await query;

    if (error) return res.status(500).json({ error: 'Ошибка загрузки заявок' });

    return res.status(200).json({ bookings: data || [] });
  }

  // ── PUT: изменить статус заявки ──────────────────────────
  if (req.method === 'PUT') {
    const { id, status, payment_status } = req.body;
    const VALID_STATUSES = ['new', 'confirmed', 'done', 'cancelled'];
    const VALID_PAYMENTS = ['pending', 'paid', 'refunded'];

    if (!id) return res.status(400).json({ error: 'id обязателен' });
    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: `status должен быть: ${VALID_STATUSES.join(', ')}` });
    }

    // Проверить что заявка принадлежит этому мастеру
    const { data: booking } = await supabase
      .from('bookings')
      .select('id, master_id')
      .eq('id', id)
      .single();

    if (!booking || booking.master_id !== master.id) {
      return res.status(404).json({ error: 'Заявка не найдена' });
    }

    const updates = {};
    if (status)         updates.status         = status;
    if (payment_status && VALID_PAYMENTS.includes(payment_status)) {
      updates.payment_status = payment_status;
    }

    const { data, error } = await supabase
      .from('bookings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: 'Ошибка обновления заявки' });

    return res.status(200).json({ booking: data });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
