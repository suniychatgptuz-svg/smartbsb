// Statistika (faqat admin uchun): stats.html shu yerdan oladi.
// Netlify'da STATS_KEY muhit o'zgaruvchisi bilan himoyalangan.
import {json, readAll, store} from './lib/counter.mjs';


export default async (req) => {
  const need = process.env.STATS_KEY || '';
  if (!need) return json({ok: false, reason: 'config'}, 500);
  if ((req.headers.get('x-key') || '') !== need) return json({ok: false, reason: 'key'}, 401);
  const st = store();
  const days = await readAll(st, 'day/', 400);
  const devices = (await readAll(st, 'device/', 5000)).sort((a, b) => (b.total || 0) - (a.total || 0));
  return json({ok: true, days, devices});
};
