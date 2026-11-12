// kabinet.html: o'qituvchi Telegram orqali kiradi -> belgi (natijalar.html bilan bir xil) + token balansi.
// Birinchi kirishda 5 ta sovg'a token beriladi.
import {checkTelegram, signUser} from './lib/admin-auth.mjs';
import {json} from './lib/counter.mjs';
import {login} from './lib/tokens.mjs';

export default async (req) => {
  if (req.method !== 'POST') return json({ok: false, reason: 'method'}, 405);
  const user = (await req.json().catch(() => ({}))).user;
  if (!checkTelegram(user)) return json({ok: false, reason: 'bad_auth'}, 401);
  const id = String(user.id);
  try {
    const a = await login(id, {first: user.first_name, last: user.last_name, username: user.username});
    return json({ok: true, token: signUser(id), ...a});
  } catch (e) {
    return json({ok: false, reason: 'store'}, 500);
  }
};
