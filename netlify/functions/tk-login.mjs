// kabinet.html: o'qituvchi Telegram orqali kiradi -> belgi (natijalar.html bilan bir xil) + token balansi.
// Birinchi kirishda 5 ta sovg'a token beriladi. Bot ichida (Telegram Mini App) ochilganda initData bilan avtomatik kiradi.
import {checkTelegram, checkWebApp, signUser} from './lib/admin-auth.mjs';
import {json} from './lib/counter.mjs';
import {login} from './lib/tokens.mjs';

export default async (req) => {
  if (req.method !== 'POST') return json({ok: false, reason: 'method'}, 405);
  const b = await req.json().catch(() => ({}));
  // Bot ichidagi Mini App -> initData; oddiy brauzer -> Telegram Login Widget (avvalgidek)
  const user = b.initData ? checkWebApp(b.initData) : (checkTelegram(b.user) ? b.user : null);
  if (!user) return json({ok: false, reason: 'bad_auth'}, 401);
  const id = String(user.id);
  try {
    const a = await login(id, {first: user.first_name, last: user.last_name, username: user.username});
    return json({ok: true, token: signUser(id), ...a});
  } catch (e) {
    return json({ok: false, reason: 'store'}, 500);
  }
};
