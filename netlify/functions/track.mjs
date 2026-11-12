// Har bir yuklab olingan fayl (PDF / Excel) shu yerda hisobga olinadi.
// Sayt yuboradi: {did, fmt, mode, kind, school, sub, cls}
import {bump, inc, json, store, today} from './lib/counter.mjs';

const FMT = new Set(['pdf', 'excel']);
const MODE = new Set(['bsb', 'chsb', 'dg', 'nj']);
const clip = (v, n) => String(v || '').replace(/\s+/g, ' ').trim().slice(0, n);

export default async (req) => {
  if (req.method !== 'POST') return json({ok: false, reason: 'method'}, 405);
  let b;
  try {
    b = await req.json();
  } catch (e) {
    return json({ok: false, reason: 'body'}, 400);
  }
  const fmt = FMT.has(b.fmt) ? b.fmt : 'other';
  const mode = MODE.has(b.mode) ? b.mode : 'other';
  const kind = b.kind === 'tahlil' ? 'tahlil' : 'jadval';
  const did = clip(b.did, 40).replace(/[^a-z0-9]/gi, '') || 'anon';
  const school = clip(b.school, 120);
  const sub = clip(b.sub, 40);
  const cls = clip(b.cls, 12);
  const day = today();
  const now = new Date().toISOString();
  const st = store();

  try {
    await bump(st, 'day/' + day, (d) => {
      inc(d, 'total');
      inc(d, fmt);
      inc(d, mode);
      inc(d, `${mode}_${fmt}_${kind}`);
      d.devices = d.devices || {};
      inc(d.devices, did);
    });
    await bump(st, 'device/' + did, (d) => {
      d.first = d.first || now;
      d.last = now;
      inc(d, 'total');
      inc(d, fmt);
      inc(d, mode);
      if (school) d.school = school;
      if (sub) {
        d.subs = d.subs || {};
        inc(d.subs, sub);
      }
      if (cls) {
        d.classes = d.classes || {};
        inc(d.classes, cls);
      }
    });
    return json({ok: true});
  } catch (e) {
    return json({ok: false, reason: 'store'}, 500);
  }
};
