// Клиент Supabase — используется во всех API-роутах
// SUPABASE_URL и SUPABASE_SERVICE_KEY задаются в Vercel Environment Variables

import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_KEY; // service_role — обходит RLS на сервере

if (!url || !key) {
  throw new Error('SUPABASE_URL или SUPABASE_SERVICE_KEY не заданы в env');
}

// Один инстанс на весь сервер (Vercel переиспользует между запросами)
export const supabase = createClient(url, key, {
  auth: { persistSession: false },
});

// Хелпер: стандартный CORS + JSON заголовки
export function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}
