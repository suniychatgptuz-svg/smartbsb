// natijalar.html (o'qituvchi). Kirish: nj-login bergan belgi, "Authorization: Bearer ..." sarlavhasida.
//   GET  ?part=status          -> {active, until, name}
//   POST ?part=activate {code} -> kodni faollashtirish
//   GET  ?part=app             -> Natijalar jadvali dasturi (faqat obunasi faollarga)
import {APP} from './lib/admin-app.mjs';
import {readUser} from './lib/admin-auth.mjs';
import {json} from './lib/counter.mjs';
import {activate, getUser, userActive} from './lib/subs.mjs';

export default async (req) => {
  const id = readUser(req);
  if (!id) return json({ok: false, reason: 'auth'}, 401);
  const part = new URL(req.url).searchParams.get('part');
  const u = (await getUser(id)) || {};

  if (part === 'status') return json({ok: true, active: userActive(u), until: u.until || null, name: u.first || ''});
  if (part === 'activate' && req.method === 'POST') {
    const body = await req.json().catch(() => ({}));
    return json(await activate(id, body.code, u));
  }
  if (part === 'app') {
    if (!userActive(u)) return json({ok: false, reason: 'inactive'}, 402);
    return new Response(APP, {headers: {'Content-Type': 'text/javascript; charset=utf-8', 'Cache-Control': 'no-store'}});
  }
  return json({ok: false, reason: 'part'}, 400);
};
