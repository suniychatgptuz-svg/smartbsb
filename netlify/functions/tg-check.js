// Saqlangan belgi hali haqiqiymi va odam hamon guruhdami? (har yuklashda tekshiriladi)
const T = require('./lib/tg');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return T.reply(405, { ok: false, reason: 'method' });
  if (!T.BOT_TOKEN()) return T.reply(500, { ok: false, reason: 'config' });
  const p = T.readToken(T.parse(event).token);
  if (!p) return T.reply(200, { ok: false, reason: 'bad_token' });
  try {
    if (!(await T.isMember(p.id))) return T.reply(200, { ok: false, reason: 'not_member' });
    return T.reply(200, { ok: true });
  } catch (e) {
    return T.reply(502, { ok: false, reason: 'telegram' });
  }
};
