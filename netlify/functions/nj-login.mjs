// natijalar.html: o'qituvchi Telegram orqali kiradi -> belgi (token) va obuna holati
import {checkTelegram, signUser} from './lib/admin-auth.mjs';
import {json} from './lib/counter.mjs';
import {saveProfile, userActive} from './lib/subs.mjs';

const clip = (v, n) => String(v || '').slice(0, n);

export default async (req) => {
  if (req.method !== 'POST') return json({ok: false, reason: 'method'}, 405);
  const user = (await req.json().catch(() => ({}))).user;
  if (!checkTelegram(user)) return json({ok: false, reason: 'bad_auth'}, 401);
  const id = String(user.id);
  const u = await saveProfile(id, {first: clip(user.first_name, 64), last: clip(user.last_name, 64), username: clip(user.username, 64)});
  return json({ok: true, token: signUser(id), name: u.first, active: userActive(u), until: u.until || null});
};
