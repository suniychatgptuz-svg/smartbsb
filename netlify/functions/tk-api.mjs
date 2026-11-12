// kabinet.html tokenlari. Kirish: tk-login (yoki nj-login) bergan belgi, "Authorization: Bearer ...".
//   GET  ?part=me              -> {bal, name, log}
//   POST ?part=spend  {what, kind} -> token sarflash (oddiy fayl 1, kind:'sifat' 5) — fayl yuklashdan oldin
//   POST ?part=redeem {code}   -> kodni faollashtirish
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
      const r = await spend(id, clip(b.what, 80), b.kind === 'sifat' ? 'sifat' : 'file');
      return json(r, r.reason === 'auth' ? 401 : 200);
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
