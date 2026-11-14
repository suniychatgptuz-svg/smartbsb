// kabinet.html tokenlari. Kirish: tk-login (yoki nj-login) bergan belgi, "Authorization: Bearer ...".
//   GET  ?part=me              -> {bal, name, log}
//   POST ?part=spend  {what, kind} -> token sarflash (oddiy fayl 1, kind:'sifat' yoki 'hisobot' 5) — fayl yuklashdan oldin
//   POST ?part=redeem {code}   -> kodni faollashtirish
//   POST ?part=send {name, data} -> (faqat bot ichida) tayyor faylni o'qituvchining Telegram chatiga yuborish; token spend'da olingan
import {readUser} from './lib/admin-auth.mjs';
import {json} from './lib/counter.mjs';
import {getAcct, pub, redeem, spend} from './lib/tokens.mjs';

const clip = (v, n) => String(v || '').replace(/\s+/g, ' ').trim().slice(0, n);

export default async (req) => {
  const id = readUser(req);
  if (!id) return json({ok: false, reason: 'auth'}, 401);
  const part = new URL(req.url).searchParams.get('part');
  try {
    if (part === 'me') {
      const a = await getAcct(id);
      if (!a || !a.created) return json({ok: false, reason: 'auth'}, 401);
      return json({ok: true, ...pub(a)});
    }
    if (req.method !== 'POST') return json({ok: false, reason: 'method'}, 405);
    const b = await req.json().catch(() => ({}));
    if (part === 'spend') {
      const r = await spend(id, clip(b.what, 80), ['sifat', 'hisobot'].includes(b.kind) ? b.kind : 'file');
      return json(r, r.reason === 'auth' ? 401 : 200);
    }
    if (part === 'send') {
      const name = clip(b.name, 120).replace(/[\\/:*?"<>|]/g, '_');
      if (!/\.(pdf|xlsx)$/i.test(name) || typeof b.data !== 'string') return json({ok: false, reason: 'bad'}, 400);
      const buf = Buffer.from(b.data, 'base64');
      if (!buf.length || buf.length > 4.3 * 1024 * 1024) return json({ok: false, reason: 'size'}, 400);
      const fd = new FormData();
      fd.append('chat_id', id);
      fd.append('caption', 'smartbsb.uz · ' + name);
      fd.append('document', new Blob([buf], {type: /\.pdf$/i.test(name) ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}), name);
      const r = await fetch('https://api.telegram.org/bot' + (process.env.BOT_TOKEN || '') + '/sendDocument', {method: 'POST', body: fd});
      const j = await r.json().catch(() => ({}));
      if (j.ok) return json({ok: true});
      return json({ok: false, reason: j.error_code === 403 || /chat not found/i.test(j.description || '') ? 'blocked' : 'tg'});
    }
    if (part === 'redeem') {
      const r = await redeem(id, b.code);
      return json(r, r.reason === 'auth' ? 401 : 200);
    }
  } catch (e) {
    return json({ok: false, reason: 'store'}, 500);
  }
  return json({ok: false, reason: 'part'}, 400);
};
