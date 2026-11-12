// Telegram tasdiqlash yordamchi funksiyalari
const crypto = require('crypto');

const BOT_TOKEN = () => process.env.BOT_TOKEN || '';
const CHAT_ID = () => process.env.CHAT_ID || '@BSBCHSB_Hisobot';
const TOKEN_DAYS = 30;

// Telegram Login Widget'dan kelgan ma'lumotni tekshirish
function checkAuth(u) {
  if (!u || !u.hash || !u.id || !u.auth_date || !BOT_TOKEN()) return false;
  const rest = Object.assign({}, u);
  delete rest.hash;
  const str = Object.keys(rest).sort().map(k => k + '=' + rest[k]).join('\n');
  const secret = crypto.createHash('sha256').update(BOT_TOKEN()).digest();
  const h = crypto.createHmac('sha256', secret).update(str).digest('hex');
  const a = Buffer.from(h), b = Buffer.from(String(u.hash));
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  return Date.now() / 1000 - Number(u.auth_date) < 86400; // 24 soatdan eski bo'lmasin
}

// Guruhda a'zomi?
async function isMember(userId) {
  const url = 'https://api.telegram.org/bot' + BOT_TOKEN() + '/getChatMember?chat_id=' +
    encodeURIComponent(CHAT_ID()) + '&user_id=' + encodeURIComponent(userId);
  const r = await fetch(url);
  const j = await r.json();
  if (!j.ok) {
    if (/user not found|PARTICIPANT_ID_INVALID/i.test(j.description || '')) return false;
    throw new Error(j.description || 'telegram_error');
  }
  const s = j.result.status;
  return ['creator', 'administrator', 'member'].includes(s) ||
    (s === 'restricted' && j.result.is_member === true);
}

const signKey = () => crypto.createHmac('sha256', 'bsb-token-v1').update(BOT_TOKEN()).digest();

function signToken(payload) {
  const b = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const s = crypto.createHmac('sha256', signKey()).update(b).digest('base64url');
  return b + '.' + s;
}

function readToken(t) {
  try {
    const [b, s] = String(t).split('.');
    if (!b || !s) return null;
    const e = crypto.createHmac('sha256', signKey()).update(b).digest('base64url');
    const x = Buffer.from(e), y = Buffer.from(s);
    if (x.length !== y.length || !crypto.timingSafeEqual(x, y)) return null;
    const p = JSON.parse(Buffer.from(b, 'base64url').toString());
    if (!p.id || !p.exp || p.exp < Date.now() / 1000) return null;
    return p;
  } catch (e) { return null; }
}

const reply = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  body: JSON.stringify(body)
});

const parse = ev => { try { return JSON.parse(ev.body || '{}'); } catch (e) { return {}; } };

module.exports = { checkAuth, isMember, signToken, readToken, reply, parse, BOT_TOKEN, TOKEN_DAYS };
