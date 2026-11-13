BSB / CHSB sayti - joylash qisqacha:
1) Bu papkadagi hamma narsani GitHub'dagi yangi repozitoriyga yuklang (index.html, netlify.toml va netlify papkasi).
2) Netlify: Add new site -> Import from Git -> shu repozitoriyni tanlang. Boshqa hech narsani o'zgartirmang.
3) Netlify: Site configuration -> Environment variables -> BOT_TOKEN nomi bilan BotFather bergan kalitni kiriting (Secret qilib belgilang). Keyin Deploys -> Trigger deploy.
4) BotFather: /setdomain -> @smartbsbuzbot -> saytingiz manzili (masalan bsb-hisobot.netlify.app, https:// siz).
5) Botni https://t.me/BSBCHSB_Hisobot guruhida administrator qiling.
BOT_TOKEN kalitini hech kimga yubormang va fayllarga yozmang.

--- Yuklashlar statistikasi (2026-11-03) ---
Saytda har bir yuklab olingan PDF/Excel serverda hisoblanadi (Netlify Blobs, alohida sozlash shart emas).
Ko'rish: https://smartbsb.uz/stats.html  (parol bilan)
1) Netlify: Site configuration -> Environment variables -> STATS_KEY nomi bilan o'zingiz o'ylagan parolni kiriting (Secret).
2) Deploys -> Trigger deploy.
Yangi fayllar: stats.html, package.json, netlify/functions/track.mjs, netlify/functions/stats.mjs, netlify/functions/lib/counter.mjs

--- Admin panel va obuna (2026-11-04) ---
Admin: https://smartbsb.uz/admin.html  — STATS_KEY paroli bilan. Bo'limlar: Natijalar jadvali, Obunachilar, Statistika.
O'qituvchilar: https://smartbsb.uz/natijalar.html  (asosiy saytda "Natijalar jadvali" tugmasi).
Obuna: admin "Obunachilar" bo'limida kod yaratadi -> o'qituvchiga yuboradi -> o'qituvchi Telegram bilan kirib kodni kiritadi.
Kod birinchi kiritgan Telegram akkauntiga bog'lanadi. "Bo'shatish" — qolgan kunlar saqlanadi, "Bekor qilish" — kod o'chadi.
Panel kodi ochiq saytda turmaydi: smartbsb-admin-src/app.js -> node build.mjs -> netlify/functions/lib/admin-app.mjs

--- Xavfsizlik yangilanishi (2026-11-12, smartbsb-v2 papkasi) ---
Eski versiya zaxirasi: Новая папка/zaxira-2026-11-12/ va D:/Zaxira/smartbsb-deploy-2026-11-12.zip
1) netlify.toml: xavfsizlik sarlavhalari qo'shildi (CSP, X-Frame-Options, nosniff, Referrer-Policy,
   Permissions-Policy, HSTS). Sayt faqat o'z fayllari, cdnjs, Telegram va Google shriftlaridan foydalana oladi;
   begona saytga ma'lumot yuborish va saytni boshqa saytga yashirin joylashtirish taqiqlangan.
   admin.html va stats.html qidiruv tizimlariga chiqmaydi, keshlanmaydi.
2) index.html, natijalar.html, admin.html: cdnjs kutubxonalariga "barmoq izi" (SRI, sha512) qo'yildi.
   Kutubxona o'zgartirilsa, brauzer uni ishga tushirmaydi. Izlar cdnjs rasmiy ro'yxati bilan tekshirilgan.
3) natijalar.html: Telegram kirish "data-auth-url" usuliga o'tkazildi (eval kerak emas, CSP qattiq qoladi).
   Kirishdan keyin Telegram ma'lumoti manzil orqali keladi, faqat 7 ta Telegram maydoni olinadi va manzil darhol tozalanadi.
   Kirish oynasiga ogohlantirish: "Telegram so'rovida smartbsb.uz yozilganini tekshiring...".
DIQQAT: index.html dagi (hozir o'chirilgan) guruh tekshiruvi hali eski "data-onauth" usulida. Uni yoqishdan oldin
   natijalar.html dagidek auth-url ga o'tkazish kerak, aks holda CSP Telegram tugmasini bloklaydi.
Sinov: mahalliy serverda aynan shu sarlavhalar bilan 4 sahifa ochildi; BSB Excel, BSB PDF (jadval, tahlil),
   CHSB PDF, Diagnostika PDF tayyorlandi; Telegram tugmasi chiqdi; konsolda bloklash xabari yo'q.

--- Yangi dizayn (2026-11-12, smartbsb-v2 papkasi) ---
Sayt endi ikki sahifadan iborat:
1) index.html — reklama sahifasi (smartbsb-redesign/landing.html namunasi asosida).
   Narx/token bo'limi olib tashlandi, o'rniga «Hisobotlar bepul» bo'limi; Natijalar jadvali — obuna.
   Oldin ishlagan o'qituvchi (brauzerida bsb_chsb_v1 bor) bu sahifani ochsa, o'zi kabinetga o'tadi.
   Reklama sahifasini baribir ko'rish: smartbsb.uz/?bosh=1 (kabinetdagi logo shu yerga olib boradi).
2) kabinet.html — o'qituvchi ish joyi: chap menyu (Bosh sahifa, Sinflarim, BSB, CHSB, Diagnostika,
   Natijalar jadvali), BSB/CHSB uchun 4 qadam (Ma'lumotlar → Savollar → O'quvchilar → Ballar),
   Diagnostika bitta sahifada. Telefonda pastki menyu va «Bittadan» kiritish (har o'quvchi alohida karta).
   Tokenlar bo'limi bu bosqichda YO'Q — hamma yuklash bepul (3-bosqichda server bilan qilinadi).
Yangi imkoniyatlar:
 - «Sinflarim»: bir nechta sinf shu brauzerda saqlanadi (kalit smartbsb_sinflar), bir bosishda almashtiriladi.
   Har sinfning BSB, CHSB, Diagnostika ro'yxati, sozlamalari va ballari alohida.
 - O'quvchini ✕ bilan olib tashlash (6 soniya ichida «Qaytarish») va bittadan qo'shish.
 - «Ma'lumotlarimni bu kompyuterdan o'chirish» (chap menyu pastida, Bosh sahifa va Sinflarimda).
 - Kirish oynasida ogohlantirish: «Telegram so'rovida smartbsb.uz yozilganini tekshiring...».
Olib tashlandi: «Aloqa uchun» bloki, muallif imzosi va ism qatori, qorong'i rejim tugmasi.
Hisob-kitob, PDF va Excel kodi eski index.html dan SO'ZMA-SO'Z ko'chirilgan (kabinet.html dagi
   «ASOSIY SKRIPT» qismi). Yangi ko'rinish alohida skriptda, eski kodga faqat ulanadi.
   Element id lari (tb, dgt, names, sv, file, pdf, pdfj, pdft, xl, xl2, dgpdf, cnum, clet...) saqlangan.
   PDF lar sahifa uslubini meros oladi, shuning uchun kabinet.html boshida «PDF bilan moslik» CSS bloki bor —
   uni o'zgartirmang.
Yangi fayllar: kabinet.html, icons.js (Lucide belgilari, ISC litsenziya, o'z serverimizdan), logo-96.png.
   Yangi tashqi kutubxona qo'shilmadi; CSP (netlify.toml) o'zgarmadi.
Sinov (mahalliy server, netlify.toml sarlavhalari bilan): bir xil sinov ma'lumoti bilan eski va yangi
   sahifada 5 ta fayl (BSB Excel, BSB PDF jadval, BSB PDF tahlil, CHSB PDF, Diagnostika PDF) tayyorlandi —
   telefon (586 px) va kompyuter (1366 px) kengligida ichidagi rasm/katakchalar bir xil chiqdi.
   Jami/foiz bir xil. Kompyuter 1366/1920 va telefon 375 px ko'rinishlari tekshirildi; konsolda CSP xatosi yo'q.
DIQQAT: eski index.html dagi (o'chirilgan) Telegram guruh tekshiruvi kabinet.html ga ham o'tdi va hali
   «data-onauth» usulida. Uni yoqishdan oldin natijalar.html dagidek data-auth-url ga o'tkazish kerak.
Yuklashdan oldin: GitHub'ga index.html, kabinet.html, icons.js, logo-96.png ni qo'shing (qolganlari avvalgidek).

--- Tokenlar (2026-11-12, smartbsb-v2) ---
Qoida: ball kiritish va hisoblash bepul. Fayl (BSB Excel/PDF, CHSB PDF, Diagnostika PDF) yuklash uchun
   Telegram orqali kirish SHART. Birinchi kirishda 5 ta token sovg'a (bir Telegram akkauntga bir marta).
   1 yuklangan fayl = 1 token. Qolganini o'qituvchi sotib oladi: Telegramda (@volumes_analysis) yozadi ->
   to'lov -> admin kod yuboradi -> o'qituvchi kabinetdagi «Kod kiritish» ga yozadi.
   Natijalar jadvali o'zgarmadi (alohida obuna, eski kodlar ishlayveradi).
Balans serverda (Netlify Blobs, "tokens" ombori) — brauzerda o'zgartirib bo'lmaydi.
   Token fayl tayyor bo'lgandan keyin, saqlashdan oldin ayiriladi: fayl chiqmasa token ketmaydi.
   Kod bir marta ishlaydi; noto'g'ri kod: soatiga 5 ta urinish.
   Kirish belgisi natijalar.html bilan umumiy (bir marta kirsa, ikkala sahifada ham kirgan bo'ladi).
Admin panel: yangi «Tokenlar» bo'limi — kod yaratish (necha token, nechta kod), bo'sh kodlar (Nusxalash/O'chirish),
   o'qituvchilar balansi va «±» (qo'lda qo'shish/ayirish), ishlatilgan kodlar.
Yangi/o'zgargan fayllar: netlify/functions/tk-login.mjs, tk-api.mjs, lib/tokens.mjs, admin-api.mjs,
   lib/admin-app.mjs (smartbsb-admin-src/app.js dan qurilgan; build.mjs endi smartbsb-v2 ga yozadi;
   eski nusxa app.js.bak-2026-11-12), kabinet.html, index.html (narx bo'limi).
   Yangi sozlama (env) kerak emas: BOT_TOKEN va STATS_KEY avvalgidek.
Telegram kirish faqat haqiqiy domenda ishlaydi (BotFather /setdomain -> smartbsb.uz, avval qilingan).
   Mahalliy kompyuterda «Bot domain invalid» chiqishi normal.
Sinov: soxta xotira va sinov bot kaliti bilan haqiqiy funksiyalar ishga tushirildi: kirish -> 5 token sovg'a,
   5 ta fayl yuklandi, 6-sida «Token tugadi», noto'g'ri kod rad etildi, admin yaratgan 20 tokenlik kod qo'shildi,
   qayta ishlatib bo'lmadi, 5 ta noto'g'ri urinishdan keyin bloklandi, bir vaqtda 30 so'rovda ortiqcha ayirish yo'q.
Bilish kerak: fayllar o'qituvchi kompyuterida tayyorlanadi, shuning uchun dasturchi darajasidagi odam
   tekshiruvni chetlab o'tishi mumkin. Oddiy foydalanuvchi uchun yetarli.

--- Menyuga qo'shildi (2026-11-12, kabinet.html) ---
«YORDAM» qismi: Qo'llanma (8 ta qisqa javob + YouTube @Smartbsbuz havolasi), Yordam (6 ta ko'p uchraydigan muammo
   va yechimi, «Telegramda yozish», ismsiz texnik ma'lumotni nusxalash), Sozlamalar (maktab nomi, 3 ta imzo,
   baho chegaralari 86/71/55 — o'zgartirish va «Asl holiga», ma'lumotlarni o'chirish). Menyudagi to'g'ridan-to'g'ri Telegram havolasi olib tashlandi.
Ism ustuni eng uzun ismga moslashadi (kompyuterda kamida 180 px); menyu uzun bo'lsa aylantiriladi.

--- Sifat tahlili (2026-11-12, kabinet.html) ---
Yangi bo'lim (menyuda Diagnostikadan keyin). Jurnal yuklanmaydi: o'qituvchi foizlarni o'zi yozadi
   (masalan 5-A — BSB 75, CHSB 68), fan, davr, fan o'qituvchisi (ism familiya), Sifat yoki O'zlashtirish.
   Ko'pi bilan 8 sinf va 4 ustun (BSB, CHSB, II-BSB...), ustun nomlari tahrirlanadi.
   Diagramma: tik ustunlar yoki yotiq chiziqlar; ↑↓ strelkalar; «Metodik xulosa» raqamlarga qarab o'zi yoziladi.
   Natija: bitta A4 (tik varaq) PDF — admin paneldagi Sifat tahlili ko'rinishida. 5 TOKEN (narx serverda:
   lib/tokens.mjs PRICE = {file: 1, sifat: 5}; o'zgartirish uchun shu raqamni almashtiring).
   Ma'lumot brauzerda (kalit smartbsb_sifat). Admin paneldagi jurnal bilan ishlaydigan Sifat tahlili o'zgarmadi.

--- CHSB jadvali namunadagidek (2026-11-12) ---
Tepada rangli guruh qatori (BILISH / QO'LLASH / MULOHAZA), har guruhdan keyin «Jami» ustuni (o'quvchi bali,
   pastda guruh foizi va o'rtacha bali), ixcham ✓/✕. «Bittadan» rejimida ham guruh sarlavhasi va guruh jamisi.
   Eski hisob-kitob kodi o'zgarmagan: ustunlar jadval chizilgandan keyin qo'shiladi. CHSB PDF o'zgarmaydi.

--- CHSB PDF va baho chegarasi (2026-11-12, foydalanuvchi so'rovi) ---
CHSB PDF 1-beti: «O'rtacha ko'rsatkich» qatoridan keyin «Sinf samaradorligi» (5 va 4 olganlar ulushi), «5 baho / 4 baho / 3 baho — N ta».
Baho chegarasi Nizom bo'yicha 86 / 66 / 30 (avval 86 / 71 / 55). Eski chegarani o'zi tanlamagan foydalanuvchi avtomatik o'tadi;
   Sozlamalardan o'zgartirish mumkin. O'quvchi foizi avvalgidek: jami ball ÷ maksimal ball.
CHSB: bali 30% dan past o'quvchi jadvalda qizil, ostida izoh; ballar to'g'rilanmaguncha CHSB PDF yuklanmaydi (oyna ro'yxat bilan chiqadi).
Eslatma: bu o'zgarishlar kabinet.html dagi eski skriptga ataylab kiritilgan (qurish skriptida aniq joylar bo'yicha). BSB PDF/Excel va Diagnostika o'zgarmagan.

--- Ko'rinish rejimi (2026-11-12) ---
Kabinet yuqori panelida rejim tugmasi: Avto → Yorug' → Qorong'i (bosilganda almashadi). Sozlamalarda ham tanlov bor.
   Avto: kunduzi 07:00–19:00 yorug', qolgan vaqtda qorong'i; kompyuter/telefon qorong'i rejimda bo'lsa — doim qorong'i.
   Har daqiqada tekshiriladi, sahifa ochiq turganda ham o'zi almashadi. Tanlov brauzerda (smartbsb_theme).
   PDF/Excel ikkala rejimda bir xil (tekshirilgan). Telefonda Bosh sahifa tugmalari ekrandan chiqib ketishi tuzatildi.

--- Fanlar ro'yxati (2026-11-12) ---
30 ta fan (alifbo tartibida): Adabiyot … Texnologiya, jumladan Chizmachilik, CHQBT, Fransuz/Nemis tili, Iqtisodiyot,
   Jismoniy tarbiya, Musiqa madaniyati, O'zbekiston tarixi, Tabiiy fan, Tarix, Tasviriy san'at, Tadbirkorlik asoslari.
   Eski nom bilan saqlangan fan (masalan «Musiqa», «O'zbek tarix», «CHYoT») ro'yxatda o'zi qo'shilib ko'rinadi — ma'lumot yo'qolmaydi.
   Eski nomlar sahifa ochilganda o'zi yangilanadi: Musiqa → Musiqa madaniyati, O'zbek tarix → O'zbekiston tarixi,
   J:tarbiya → Jismoniy tarbiya, Davlat va huquq → … asoslari, Tadbirkorlik → … asoslari, CHYoT → CHQBT (barcha sinflarda va Sifat tahlilida).

--- Admin panel yangi ko'rinishda (2026-11-13) ---
admin.html kabinet uslubida: chap menyu (Tokenlar, Obunachilar, Statistika, Natijalar jadvali, Sifat tahlili),
   yorug'/qorong'i rejim (kabinet bilan umumiy), telefonda menyu tepada. Belgilar icons.js dan.
Tokenlar: asosiy yo'l endi to'g'ridan-to'g'ri berish — o'qituvchini qidirish (ism, @username, ID),
   +10 / +20 / +50 / +100 tugmalari, «Boshqa» (istalgan son, minus bilan ayirish, izoh), «Tarix» (oxirgi amallar).
   Har berishdan keyin 9 soniya «Bekor qilish» chiqadi. Kodlar qoldi («Kod orqali berish» — saytga hali kirmaganlar uchun).
O'zgargan fayllar: admin.html, netlify/functions/admin-api.mjs (yangi ?part=tkacct), lib/admin-app.mjs
   (smartbsb-admin-src/app.js dan qurilgan). Eski nusxalar: smartbsb-admin-src/*.bak-2026-11-12-dizayndan-oldin.
Lokal sinov: launch.json "v2-admin" (port 5351, sinov paroli testkey, soxta xotira).

--- Natijalar jadvali sahifasi yangi ko'rinishda (2026-11-13) ---
natijalar.html ham kabinet uslubida (chap menyu: Natijalar jadvali, Kabinet, Rejim, Chiqish; yorug'/qorong'i). Uslub admin.html dagi bilan bir xil.
   Kirish va obuna kodi oynasi yangilandi, ishlash tartibi o'zgarmadi. Menyuga keyin yangi bo'limlar qo'shiladi.
   O'zgargan fayllar: natijalar.html, netlify/functions/lib/admin-app.mjs. Eski nusxa: smartbsb-admin-src/natijalar.html.bak-2026-11-13-dizayndan-oldin.

--- BSB va CHSB hisoboti (2026-11-13, natijalar.html va admin) ---
Yangi bo'lim (namuna-hisobot.pdf asosida): har bir sinf + fan uchun BSB-1..4 va CHSB-1..4 foizlari (chorak bo'yicha).
   eMaktab «Fan jurnali» fayli tashlansa, sinf, fan, chorak va foiz o'zi olinadi. Foiz = sinfning o'rtacha bali / maksimal ball
   (bir chorakda bir nechta BSB bo'lsa — ularning o'rtachasi). Kataklarni qo'lda tuzatish, qator qo'shish/o'chirish mumkin.
   Ma'lumot brauzerda saqlanadi (kalit nj_hb) — keyingi chorakda faqat yangi jurnal qo'shiladi.
   Natija: yotiq A4 PDF — BSB diagrammalari (betiga 4 ta), umumiy jadval, CHSB diagrammalari; o'qituvchi ismi yozilsa imzo qatori.
   Obuna ichida (alohida token olinmaydi). natijalar.html ga jspdf kutubxonasi qo'shildi (SRI bilan).
   O'zgargan fayllar: natijalar.html, netlify/functions/lib/admin-app.mjs.

--- «BSB va CHSB hisoboti» kabinetga ham qo'shildi (2026-11-13) ---
Kabinet menyusida Sifat tahlilidan keyin. Natijalar jadvali sahifasidagi bilan bir xil ishlaydi va ma'lumot umumiy (kalit nj_hb).
   Kabinetda PDF = 5 token (Sifat tahlili kabi); Natijalar jadvali obunachilari uchun u sahifada bepul.
   Narx serverda: lib/tokens.mjs PRICE.hisobot = 5. tk-api.mjs endi 'hisobot' turini ham qabul qiladi.
   O'zgargan fayllar: kabinet.html (manba: smartbsb-v2-manba/k_head.html, k_tail.html -> python build.py),
   netlify/functions/tk-api.mjs, netlify/functions/lib/tokens.mjs.
