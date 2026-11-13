// Admin panel (admin.html). Kirish: STATS_KEY paroli, "x-key" sarlavhasida.
//   GET  ?part=app      -> panel dasturi
//   GET  ?part=stats    -> yuklashlar statistikasi
//   GET  ?part=codes    -> barcha kodlar
//   POST ?part=gen      {days, count} -> yangi kodlar
//   POST ?part=release  {code}        -> kodni egasidan uzish (qolgan kunlar saqlanadi)
//   POST ?part=revoke   {code}        -> kodni bekor qilish
//   GET  ?part=tkcodes | tkaccts      -> token kodlari | o'qituvchilar balansi
//   GET  ?part=tkacct&id=<telegramId> -> bitta o'qituvchi (token tarixi bilan)
//   POST ?part=tkgen {n, count} · tkrevoke {code} · tkgive {id, n, why}
import {APP} from './lib/admin-app.mjs';
import {isAdmin} from './lib/admin-auth.mjs';
import {json, readAll, store} from './lib/counter.mjs';
import {generate, listCodes, release} from './lib/subs.mjs';
import * as T from './lib/tokens.mjs';

export default async (req) => {
  if (!process.env.STATS_KEY) return json({ok: false, reason: 'config'}, 500);
  if (!isAdmin(req)) return json({ok: false, reason: 'key'}, 401);
  const part = new URL(req.url).searchParams.get('part');
  const body = req.method === 'POST' ? await req.json().catch(() => ({})) : {};

  if (part === 'app') {
    return new Response(APP, {headers: {'Content-Type': 'text/javascript; charset=utf-8', 'Cache-Control': 'no-store'}});
  }
  if (part === 'stats') {
    const st = store();
    const days = await readAll(st, 'day/', 400);
    const devices = (await readAll(st, 'device/', 5000)).sort((a, b) => (b.total || 0) - (a.total || 0));
    return json({ok: true, days, devices});
  }
  if (part === 'codes') return json({ok: true, codes: await listCodes()});
  if (req.method === 'POST' && part === 'gen') {
    const days = [31, 92, 366].includes(+body.days) ? +body.days : 31;
    const count = Math.min(50, Math.max(1, Math.floor(+body.count || 1)));
    return json({ok: true, codes: await generate(days, count)});
  }
  if (req.method === 'POST' && (part === 'release' || part === 'revoke')) return json(await release(body.code, part === 'revoke'));
  // tokenlar
  if (part === 'tkcodes') return json({ok: true, codes: await T.listCodes()});
  if (part === 'tkaccts') return json({ok: true, accts: await T.listAccts()});
  if (part === 'tkacct') {
    const id = String(new URL(req.url).searchParams.get('id') || '').replace(/[^0-9]/g, '');
    const acct = id ? await T.getAcct(id) : null;
    return acct ? json({ok: true, acct}) : json({ok: false, reason: 'not_found'});
  }
  if (req.method === 'POST' && part === 'tkgen') {
    const n = Math.min(500, Math.max(1, Math.floor(+body.n || 0)));
    const count = Math.min(50, Math.max(1, Math.floor(+body.count || 1)));
    return json({ok: true, codes: await T.generate(n, count)});
  }
  if (req.method === 'POST' && part === 'tkrevoke') return json(await T.revoke(body.code));
  if (req.method === 'POST' && part === 'tkgive') return json(await T.give(body.id, body.n, String(body.why || '').slice(0, 80)));
  return json({ok: false, reason: 'part'}, 400);
};
