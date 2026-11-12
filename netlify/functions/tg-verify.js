// Telegram orqali kirgan odam guruh a'zosimi? A'zo bo'lsa, imzolangan belgi (token) beradi.
const T = require('./lib/tg');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return T.reply(405, { ok: false, reason: 'method' });
  if (!T.BOT_TOKEN()) return T.reply(500, { ok: false, reason: 'config' });
  const user = T.parse(event).user;
  if (!T.checkAuth(user)) return T.reply(401, { ok: false, reason: 'bad_auth' });
  try {
    if (!(await T.isMember(user.id))) return T.reply(200, { ok: false, reason: 'not_member' });
    const exp = Math.floor(Date.now() / 1000) + T.TOKEN_DAYS * 86400;
    return T.reply(200, { ok: true, token: T.signToken({ id: user.id, exp }) });
  } catch (e) {
    return T.reply(502, { ok: false, reason: 'telegram' });
  }
};
