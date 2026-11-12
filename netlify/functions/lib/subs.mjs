// "Natijalar jadvali" obunasi: kodlar va ulangan o'qituvchilar (Netlify Blobs, "subs" ombori).
//   code/<KOD>  {code, days, created, user, activated, until, left, revoked}
//   user/<id>   {id, first, last, username, firstSeen, lastSeen, code, until}
import crypto from 'node:crypto';
import {getStore} from '@netlify/blobs';
import {bump, readAll} from './counter.mjs';

export const subs = () => getStore({name: 'subs', consistency: 'strong'});
const DAY = 86400e3;

export const normCode = (c) => String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
// Saqlashda chiziqchasiz, ko'rsatishda NJ-XXXX-XXXX
export const showCode = (c) => (c.length === 10 ? `${c.slice(0, 2)}-${c.slice(2, 6)}-${c.slice(6)}` : c);

const ABC = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // 0/O, 1/I/L kabi chalkash belgilar yo'q
function newCode() {
  const b = crypto.randomBytes(8);
  let s = 'NJ';
  for (let i = 0; i < 8; i++) s += ABC[b[i] % ABC.length];
  return s;
}

export async function generate(days, count) {
  const st = subs();
  const out = [];
  for (let i = 0; i < count; i++) {
    for (let t = 0; t < 5; t++) {
      const c = newCode();
      const r = await st.setJSON('code/' + c, {code: c, days, created: new Date().toISOString(), user: null}, {onlyIfNew: true});
      if (!r || r.modified !== false) {
        out.push(c);
        break;
      }
    }
  }
  return out;
}

export const getUser = async (id) => (await subs().get('user/' + id, {type: 'json'})) || null;
export const saveProfile = (id, p) =>
  bump(subs(), 'user/' + id, (d) => {
    const now = new Date().toISOString();
    Object.assign(d, p, {id: String(id), lastSeen: now});
    d.firstSeen = d.firstSeen || now;
  });
export const userActive = (u) => !!(u && u.until && Date.parse(u.until) > Date.now());

// O'qituvchi kodni kiritdi. Natija: {ok, until} yoki {ok:false, reason}
export async function activate(id, raw, profile) {
  const c = normCode(raw);
  if (c.length < 6) return {ok: false, reason: 'bad_code'};
  const st = subs();
  const cur = await st.get('code/' + c, {type: 'json'});
  if (!cur || cur.revoked) return {ok: false, reason: 'bad_code'};
  if (cur.user && cur.user.id !== String(id)) return {ok: false, reason: 'taken'};
  if (cur.user && cur.user.id === String(id)) {
    if (Date.parse(cur.until) <= Date.now()) return {ok: false, reason: 'expired'};
    await bump(st, 'user/' + id, (d) => { d.code = c; d.until = cur.until; });
    return {ok: true, until: cur.until, again: true};
  }
  // kod bo'sh: shu odamga bog'laymiz (bir vaqtda ikki kishi kiritsa, faqat bittasi oladi)
  const u = (await getUser(id)) || {};
  const start = userActive(u) ? Date.parse(u.until) : Date.now(); // faol bo'lsa, muddat ustiga qo'shiladi
  let won = false;
  let until = null;
  await bump(st, 'code/' + c, (d) => {
    won = false;
    if (d.revoked || (d.user && d.user.id !== String(id))) return;
    const len = d.left != null ? d.left : d.days * DAY;
    until = new Date(start + len).toISOString();
    d.user = {id: String(id), first: profile.first || '', last: profile.last || '', username: profile.username || ''};
    d.activated = new Date().toISOString();
    d.until = until;
    delete d.left;
    won = true;
  });
  if (!won) return {ok: false, reason: 'taken'};
  await bump(st, 'user/' + id, (d) => { d.code = c; d.until = until; });
  return {ok: true, until};
}

// Admin: kodni egasidan uzish (qolgan kunlar saqlanadi) yoki butunlay bekor qilish
export async function release(raw, revoke) {
  const c = normCode(raw);
  const st = subs();
  let owner = null;
  let found = false;
  await bump(st, 'code/' + c, (d) => {
    if (!d.code) return;
    found = true;
    owner = d.user ? d.user.id : null;
    if (revoke) {
      d.revoked = new Date().toISOString();
    } else if (d.user) {
      d.left = Math.max(0, Date.parse(d.until) - Date.now());
      d.user = null;
      d.until = null;
      d.activated = null;
    }
  });
  if (!found) {
    await st.delete('code/' + c);
    return {ok: false, reason: 'not_found'};
  }
  if (owner) {
    await bump(st, 'user/' + owner, (d) => {
      if (d.code === c) { d.until = null; d.code = null; }
    });
  }
  return {ok: true};
}

export const listCodes = () => readAll(subs(), 'code/', 5000);
