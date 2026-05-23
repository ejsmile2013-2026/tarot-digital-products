// POST /api/master/upload?type=avatar|bg|service&serviceId=[uuid]
// Загружает файл в Supabase Storage bucket 'taro-masters'
// Принимает base64 в JSON: { file: "data:image/jpeg;base64,...", fileName: "photo.jpg" }
// Возвращает { url } — публичный URL файла

import { supabase, setCors } from '../_lib/supabase.js';
import { requireMaster } from '../_lib/auth.js';

// Увеличить лимит тела запроса — base64 фото занимает больше 1MB по умолчанию
export const config = {
  api: { bodyParser: { sizeLimit: '12mb' } },
};

const MAX_BASE64_LEN = 8_000_000; // ~6MB исходного файла // ~2 MB после декодирования
const ALLOWED_EXT    = ['.jpg', '.jpeg', '.png', '.webp'];

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // 1. Проверить авторизацию
  const master = await requireMaster(req, res);
  if (!master) return; // requireMaster уже ответил 401/403

  // 2. Получить type и serviceId из query
  const { type, serviceId } = req.query;
  if (!type || !['avatar', 'bg', 'service'].includes(type)) {
    return res.status(400).json({ error: 'Параметр type должен быть avatar, bg или service' });
  }
  if (type === 'service' && !serviceId) {
    return res.status(400).json({ error: 'Параметр serviceId обязателен для type=service' });
  }

  // 3. Получить файл из тела запроса
  const { file, fileName } = req.body || {};
  if (!file || !fileName) {
    return res.status(400).json({ error: 'Поля file и fileName обязательны' });
  }

  // 4a. Проверить расширение файла
  const lowerName = fileName.toLowerCase();
  const isAllowed = ALLOWED_EXT.some(ext => lowerName.endsWith(ext));
  if (!isAllowed) {
    return res.status(400).json({ error: 'Допустимые форматы: jpg, jpeg, png, webp' });
  }

  // 4b. Проверить размер base64 строки
  if (typeof file !== 'string' || file.length > MAX_BASE64_LEN) {
    return res.status(400).json({ error: 'Файл слишком большой. Максимум 2 МБ.' });
  }

  // 5. Декодировать base64 → Buffer
  // file = "data:image/jpeg;base64,/9j/4AAQ..."
  let buffer;
  try {
    const base64Data = file.includes(',') ? file.split(',')[1] : file;
    buffer = Buffer.from(base64Data, 'base64');
  } catch (e) {
    return res.status(400).json({ error: 'Не удалось декодировать файл' });
  }

  // Определить content-type из data URI или расширения
  let contentType = 'image/jpeg';
  if (lowerName.endsWith('.png')) contentType = 'image/png';
  else if (lowerName.endsWith('.webp')) contentType = 'image/webp';
  else if (file.startsWith('data:')) {
    const mime = file.split(';')[0].replace('data:', '');
    if (mime && mime.startsWith('image/')) contentType = mime;
  }

  // 6. Определить путь в Storage (с меткой времени для сброса кэша)
  const ts = Date.now();
  let storagePath;
  if (type === 'avatar') {
    storagePath = `avatars/${master.id}/avatar_${ts}.jpg`;
  } else if (type === 'bg') {
    storagePath = `backgrounds/${master.id}/bg_${ts}.jpg`;
  } else {
    storagePath = `services/${master.id}/${serviceId}_${ts}.jpg`;
  }

  // 7. Загрузить в Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('taro-masters')
    .upload(storagePath, buffer, { contentType, upsert: false });

  if (uploadError) {
    console.error('Storage upload error:', uploadError);
    return res.status(500).json({ error: 'Ошибка загрузки файла в хранилище' });
  }

  // 8. Получить публичный URL
  const { data: { publicUrl } } = supabase.storage
    .from('taro-masters')
    .getPublicUrl(storagePath);

  // 9. Обновить поле в БД
  if (type === 'avatar') {
    const { error: dbError } = await supabase
      .from('masters')
      .update({ avatar_url: publicUrl })
      .eq('id', master.id);
    if (dbError) console.warn('DB update avatar_url error:', dbError);

  } else if (type === 'bg') {
    const { error: dbError } = await supabase
      .from('masters')
      .update({ bg_url: publicUrl })
      .eq('id', master.id);
    if (dbError) console.warn('DB update bg_url error:', dbError);

  } else if (type === 'service') {
    const { error: dbError } = await supabase
      .from('services')
      .update({ image_url: publicUrl })
      .eq('id', serviceId)
      .eq('master_id', master.id);
    if (dbError) console.warn('DB update services.image_url error:', dbError);
  }

  // 10. Вернуть публичный URL
  return res.status(200).json({ url: publicUrl });
}
