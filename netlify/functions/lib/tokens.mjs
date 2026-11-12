// Tokenlar (2026-11-12): 1 yuklangan fayl = 1 token. Birinchi Telegram kirishda 5 ta sovg'a.
// Netlify Blobs, "tokens" ombori:
//   acct/<telegramId>  {id, first, last, username, bal, created, lastSeen, spent, log:[{t, d, w}]}
//   code/<KOD>         {code, n, created, used:{id, first, last, username, at}|null, revoked}
//   fail/<telegramId>  {n, since}  — noto'g'ri kod urinishlari (soatiga 5 ta)
import crypto from 'node:crypto';
import {getStore} from '@netlify/blobs';
import {bump, readAll} from './counter.mjs';

export const GIFT = 5;
export const tk = () => getStore({name: 'tokens', consistency: 'strong'});
const LOG_MAX = 60;
const FAIL_MAX = 5;
const FAIL_WIN = 3600e3;

export const normCode = (c) => String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
export const showCode = (c) => (c.length === 10 ? `${c.slice(0, 2)}-${c.slice(2, 6)}-${c.slice(6)}` : c);
const ABC = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
function newCode() {
  const b = crypto.randomBytes(8);
  let s = 'TK';
  for (let i = 0; i < 8; i++) s += ABC[b[i] % ABC.length];
  return s;
}
const clip = (v, n) => String(v || '').replace(/[\u0000-\u001f]/g, '').slice(0, n);
const addLog = (d, w, delta) => {
  d.log = Array.isArray(d.log) ? d.log : [];
  d.log.unshift({t: new Date().toISOString(), d: delta, w: clip(w, 90)});
  if (d.log.length > LOG_MAX) d.log.length = LOG_MAX;
};
export const pub = (d) => ({bal: d.bal || 0, name: d.first || '', log: (d.log || []).slice(0, 30)});

// Kirish: hisob bo'lmasa ochiladi va 5 ta sovg'a token beriladi (faqat bir marta)
export async function login(id, p) {
  let isNew = false;
  const d = await bump(tk(), 'acct/' + id, (d) => {
    const now = new Date().toISOString();
    isNew = !d.created;
    if (isNew) {
      d.id = String(id);
      d.created = now;
      d.bal = GIFT;
      d.spent = 0;
      d.log = [];
      addLog(d, 'Ro‘yxatdan o‘tish sovg‘asi', GIFT);
    }
    d.first = clip(p.first, 64);
    d.last = clip(p.last, 64);
    d.username = clip(p.username, 64);
    d.lastSeen = now;
  });
  return {...pub(d), gift: isNew ? GIFT : 0};
}

export const getAcct = async (id) => (await tk().get('acct/' + id, {type: 'json'})) || null;

// Narx serverda belgilanadi: oddiy fayl 1 token, Sifat tahlili 5 token
export const PRICE = {file: 1, sifat: 5};
export const priceOf = (kind) => PRICE[kind] || PRICE.file;

// Token sarflash. Yetmasa {ok:false, reason:'empty', need}
export async function spend(id, what, kind) {
  const n = priceOf(kind);
  const a = await getAcct(id);
  if (!a || !a.created) return {ok: false, reason: 'auth'};
  let ok = false;
  const d = await bump(tk(), 'acct/' + id, (d) => {
    ok = false;
    if (!d.created) return;
    if (!((d.bal || 0) >= n)) return;
    d.bal -= n;
    d.spent = (d.spent || 0) + n;
    addLog(d, what || 'Fayl', -n);
    ok = true;
  });
  if (!d.created) return {ok: false, reason: 'auth'};
  return ok ? {ok: true, cost: n, ...pub(d)} : {ok: false, reason: 'empty', need: n, ...pub(d)};
}

// Kod kiritish: kod bir marta ishlaydi; noto'g'ri urinishlar soatiga 5 ta bilan cheklangan
export async function redeem(id, raw) {
  const st = tk();
  const f = (await st.get('fail/' + id, {type: 'json'})) || {};
  if (f.n >= FAIL_MAX && Date.now() - Date.parse(f.since || 0) < FAIL_WIN) return {ok: false, reason: 'limit'};
  const fail = async () => {
    await bump(st, 'fail/' + id, (d) => {
      if (!d.since || Date.now() - Date.parse(d.since) >= FAIL_WIN) { d.n = 0; d.since = new Date().toISOString(); }
      d.n = (d.n || 0) + 1;
    });
    return {ok: false, reason: 'bad_code'};
  };
  const c = normCode(raw);
  if (!/^TK[A-Z0-9]{8}$/.test(c)) return fail();
  const cur = await st.get('code/' + c, {type: 'json'});
  if (!cur || cur.revoked) return fail();
  if (cur.used) return {ok: false, reason: cur.used.id === String(id) ? 'used_self' : 'taken'};
  const a = (await getAcct(id)) || {};
  if (!a.created) return {ok: false, reason: 'auth'};
  let won = false;
  let n = 0;
  await bump(st, 'code/' + c, (d) => {
    won = false;
    if (!d.code || d.revoked || d.used) return;
    d.used = {id: String(id), first: a.first || '', last: a.last || '', username: a.username || '', at: new Date().toISOString()};
    n = d.n;
    won = true;
  });
  if (!won) return {ok: false, reason: 'taken'};
  const d = await bump(st, 'acct/' + id, (d) => {
    d.bal = (d.bal || 0) + n;
    addLog(d, 'Kod: ' + showCode(c), n);
  });
  return {ok: true, added: n, ...pub(d)};
}

/* ---------- admin ---------- */
export async function generate(n, count) {
  const st = tk();
  const out = [];
  for (let i = 0; i < count; i++) {
    for (let t = 0; t < 5; t++) {
      const c = newCode();
      const r = await st.setJSON('code/' + c, {code: c, n, created: new Date().toISOString(), used: null}, {onlyIfNew: true});
      if (!r || r.modified !== false) { out.push(c); break; }
    }
  }
  return out;
}
export async function revoke(raw) {
  const c = normCode(raw);
  let found = false;
  await bump(tk(), 'code/' + c, (d) => {
    found = !!d.code;
    if (found && !d.used) d.revoked = new Date().toISOString();
  });
  if (!found) { await tk().delete('code/' + c); return {ok: false, reason: 'not_found'}; }
  return {ok: true};
}
// Admin qo'lda token qo'shadi yoki ayiradi (masalan, xato yuklashni qaytarish)
export async function give(id, n, why) {
  id = String(id || '').replace(/[^0-9]/g, '');
  n = Math.trunc(+n);
  if (!id || !n || Math.abs(n) > 1000) return {ok: false, reason: 'bad'};
  const a = await getAcct(id);
  if (!a || !a.created) return {ok: false, reason: 'not_found'};
  const d = await bump(tk(), 'acct/' + id, (d) => {
    d.bal = Math.max(0, (d.bal || 0) + n);
    addLog(d, why || (n > 0 ? 'Admin qo‘shdi' : 'Admin ayirdi'), n);
  });
  return {ok: true, bal: d.bal};
}
export const listCodes = () => readAll(tk(), 'code/', 5000);
export const listAccts = async () => (await readAll(tk(), 'acct/', 5000)).map(({log, ...a}) => ({...a, lastLog: log && log[0] ? log[0] : null}));
