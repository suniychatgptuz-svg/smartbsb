// Kirishni tekshirish yordamchilari.
//  - Admin: Netlify'dagi STATS_KEY paroli (so'rov sarlavhasi x-key).
//  - O'qituvchi: Telegram Login Widget imzosi (BOT_TOKEN bilan).
import crypto from 'node:crypto';

const BOT = () => process.env.BOT_TOKEN || '';

// Admin paroli to'g'rimi?
export function isAdmin(req) {
  const need = process.env.STATS_KEY || '';
  const got = req.headers.get('x-key') || '';
  if (!need || !got) return false;
  const a = Buffer.from(crypto.createHash('sha256').update(need).digest('hex'));
  const b = Buffer.from(crypto.createHash('sha256').update(got).digest('hex'));
  return crypto.timingSafeEqual(a, b);
}

// Telegram Login Widget ma'lumoti haqiqiymi (bot kaliti bilan imzolanganmi, 24 soatdan eski emasmi)?
export function checkTelegram(u) {
  if (!u || !u.hash || !u.id || !u.auth_date || !BOT()) return false;
  const rest = {...u};
  delete rest.hash;
  const str = Object.keys(rest).sort().map((k) => k + '=' + rest[k]).join('\n');
  const secret = crypto.createHash('sha256').update(BOT()).digest();
  const h = crypto.createHmac('sha256', secret).update(str).digest('hex');
  const a = Buffer.from(h);
  const b = Buffer.from(String(u.hash));
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  return Date.now() / 1000 - Number(u.auth_date) < 86400;
}

// O'qituvchi belgisi (token), 30 kun amal qiladi
const key = () => crypto.createHmac('sha256', 'smartbsb-user-v1').update(BOT()).digest();
export function signUser(id) {
  const p = Buffer.from(JSON.stringify({id: String(id), role: 'user', exp: Math.floor(Date.now() / 1000) + 30 * 86400})).toString('base64url');
  return p + '.' + crypto.createHmac('sha256', key()).update(p).digest('base64url');
}
export function readUser(req) {
  try {
    const t = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
    const [p, s] = t.split('.');
    if (!p || !s || !BOT()) return null;
    const e = Buffer.from(crypto.createHmac('sha256', key()).update(p).digest('base64url'));
    const g = Buffer.from(s);
    if (e.length !== g.length || !crypto.timingSafeEqual(e, g)) return null;
    const d = JSON.parse(Buffer.from(p, 'base64url').toString());
    return d.role === 'user' && d.exp > Date.now() / 1000 ? String(d.id) : null;
  } catch (e) {
    return null;
  }
}
