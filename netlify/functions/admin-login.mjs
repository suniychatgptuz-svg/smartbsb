// Eski Telegram orqali admin kirish. Endi admin panelga parol bilan kiriladi (admin-api.mjs).
// Fayl GitHub'da qolib ketsa ham zarar qilmasligi uchun shunchaki "ishlatilmaydi" deb javob beradi.
export default async () =>
  new Response(JSON.stringify({ok: false, reason: 'gone'}), {status: 410, headers: {'Content-Type': 'application/json'}});
