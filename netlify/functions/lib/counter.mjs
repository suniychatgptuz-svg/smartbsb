// Yuklashlar hisoblagichi uchun umumiy yordamchilar (Netlify Blobs)
import {getStore} from '@netlify/blobs';

export const store = () => getStore({name: 'stats', consistency: 'strong'});

export const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {status, headers: {'Content-Type': 'application/json', 'Cache-Control': 'no-store'}});

// Toshkent vaqti bo'yicha sana: 2026-11-03
export const today = () => new Date(Date.now() + 5 * 3600e3).toISOString().slice(0, 10);

export const inc = (o, k, n = 1) => {
  o[k] = (o[k] || 0) + n;
};

// O'qish -> o'zgartirish -> yozish. Bir vaqtda ikki yozuv bo'lsa (etag mos kelmasa) qayta urinadi.
export async function bump(st, key, fn) {
  for (let i = 0; i < 6; i++) {
    const cur = await st.getWithMetadata(key, {type: 'json'});
    const data = cur ? cur.data : {};
    fn(data);
    const opt = cur ? {onlyIfMatch: cur.etag} : {onlyIfNew: true};
    const r = await st.setJSON(key, data, opt);
    if (!r || r.modified !== false) return data;
  }
  throw new Error('busy: ' + key);
}

// Prefiks bo'yicha barcha yozuvlarni o'qiydi (statistika uchun)
export async function readAll(st, prefix, limit) {
  const {blobs} = await st.list({prefix});
  const keys = blobs.map((b) => b.key).sort().reverse().slice(0, limit);
  const out = [];
  for (let i = 0; i < keys.length; i += 20) {
    const part = await Promise.all(keys.slice(i, i + 20).map((k) => st.get(k, {type: 'json'})));
    part.forEach((v, j) => v && out.push({key: keys[i + j].slice(prefix.length), ...v}));
  }
  return out;
}
