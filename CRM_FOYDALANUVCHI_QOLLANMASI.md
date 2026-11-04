# ASMON MEBEL CRM - Foydalanuvchi Qo'llanmasi

## 📋 Umumiy Ma'lumotlar

Bu CRM tizimi mebel do'konlari uchun to'liq hisob-kitob va mijozlar boshqaruvi tizimidir. Barcha ma'lumotlar Supabase cloud database'da saqlanadi.

---

## 🎯 CRM Qismlari

### 1. Yangi Buyurtma (Kassa va Hisob-kitoblar)

**Nima qiladi?**
- Yangi buyurtma yaratish
- Materiallarni ombordan tanlash
- Xizmatlar narxini hisoblash
- Foydani real-time hisoblash

**Qanday ishlaydi?**

#### A. Mijoz tanlash
- Mijozlar bazasidan mijoz tanlang yoki yangi mijoz qo'shing
- Yangi mijoz qo'shish tugmasi bosilganda modal ochiladi
- Mijoz ismi va telefon raqamini kiriting

#### B. Avans/olingan pul
- Mijozdan qancha pul olganingizni kiriting
- Bu suma buyurtma jami summasidan oshmasligi kerak
- Agar oshsa, xatolik chiqadi

#### C. Materiallar tanlash
1. **Kategoriya tanlash** (masalan: LDSP, LMDF, Kromka)
2. **Format tanlash** (ixtiyoriy, masalan: 4.57 kv, 3.6 kv)
3. **Material tanlash** (masalan: Oq Premier, Qora)
4. **Soni kiriting** (omborda qancha borligi ko'rsatiladi)
5. **Ustama kiritish** (ixtiyoriy, olish narxidan ustama)

**Hisoblash:**
- Material narxi = (Olish narxi + Ustama) × Soni
- Olish narxi = materials jadvalidan olinadi
- Ustama = materialning sell_price - cost_price yoki custom ustama

#### D. Xizmatlar (Mijoz hisobiga qo'shiladi)
- **Bazis** - Bazis ishlari narxi
- **Arra** - Arra ishlari narxi
- **Kromka** - Kromka ishlari narxi
- **Teshish** - Teshish ishlari narxi
- **Rover** - Rover ishlari narxi

#### E. Ichki xarajatlar (Foydadan ayriladi, mijoz hisobiga qo'shilmaydi)
- **Usta haqi** - Ustaga to'lanadigan haq
- **Zapchast xarajati** - Zapchast narxi
- **Boshqa xarajat** - Boshqa ichki xarajatlar

#### F. Hisob-kitob (Avtomatik)
```
Buyurtma jami = Materiallar jami + Xizmatlar
Materiallar jami = Σ(Material narxi × Soni)
Material tannarxi = Σ(Olish narxi × Soni)
Material ustamasi = Materiallar jami - Material tannarxi
Jami xarajat = Material tannarxi + Ichki xarajatlar
Sof foyda = (Material ustamasi + Xizmatlar) - Ichki xarajatlar
```

**Saqlash:**
- "Saqlash" tugmasini bosing
- Buyurtma Supabase'da saqlanadi
- Ombor avtomatik kamayadi
- Tarixga qo'shiladi

---

### 2. Xaridlar Tarixi

**Nima qiladi?**
- Barcha buyurtmalarni ko'rish
- Qidirish (mijoz nomi bo'yicha)
- Filterlash (sana bo'yicha)
- Buyurtmani o'chirish

**Qanday ishlaydi?**
- Barcha buyurtmalar ro'yxati ko'rsatiladi
- Har bir buyurtma uchun: mijoz, materiallar, xizmatlar, foyda
- Qidiruv qutisiga mijoz nomini kiriting
- Sana filteri: "Barcha", "Oylik"
- O'chirish tugmasi - buyurtmani o'chiradi (ombor qaytarilmaydi!)

---

### 3. Ombor Kuzatuvi

**Nima qiladi?**
- Kategoriyalarni boshqarish
- Formatlarni boshqarish
- Materiallarni boshqarish
- Qoldiqni kuzatish

**Qanday ishlaydi?**

#### A. Kategoriya qo'shish
- "Yangi kategoriya" bo'limiga o'ting
- Kategoriya nomini kiriting (masalan: LDSP)
- "Saqlash" tugmasini bosing

#### B. Format qo'shish
- Kategoriyani tanlang
- "Format qo'shish" bo'limiga o'ting
- Format nomini kiriting (masalan: 4.57 kv)
- Default narxni kiriting (ixtiyoriy)
- "Formatni qo'shish" tugmasini bosing

#### C. Material qo'shish
- Kategoriyani tanlang
- Formatni tanlang
- Material nomini kiriting (masalan: Oq Premier)
- Sonini kiriting (omborda qancha bor)
- Olish narxini kiriting (tan narxi)
- Sotish narxini kiriting (mijozga sotiladigan narx)
- "Omborga qo'shish" tugmasini bosing

**Hisoblash:**
- Sotish narxi = Olish narxi + Ustama
- Ustama avtomatik hisoblanadi

#### D. Materialni tahrirlash
- Material ustiga "Tahrirlash" ikonkasini bosing
- Ma'lumotlarni o'zgartiring
- "Yangilash" tugmasini bosing

#### E. Materialni o'chirish
- Material ustiga "O'chirish" ikonkasini bosing
- Tasdiqlashni bosing
- Material o'chiriladi

---

### 4. Mijozlar Bazasi

**Nima qiladi?**
- Mijozlarni qo'shish
- Mijozlarni tahrirlash
- Mijozlarni o'chirish
- Qidirish

**Qanday ishlaydi?**
- "Yangi mijoz qo'shish" tugmasini bosing
- Ism, telefon, manzil, izohlarni kiriting
- "Saqlash" tugmasini bosing
- Qidiruv qutisiga ism yoki telefon kiriting

---

### 5. To'lovlar Boshqaruvi

**Nima qiladi?**
- To'lovlarni qayd etish
- To'lov tarixini ko'rish
- Mijozning to'lovlarini kuzatish

**Qanday ishlaydi?**
- "Yangi to'lov qo'shish" tugmasini bosing
- Mijozni tanlang
- Summani kiriting
- To'lov turini tanlang (Naqd, Karta, O'tkazma)
- Izohlarni kiriting (ixtiyoriy)
- "Saqlash" tugmasini bosing

---

### 6. Hisobotlar va Analitika

**Nima qiladi?**
- Umumiy foydani ko'rish
- Oylik hisobotlar
- Materiallar savdosi
- Xizmatlar daromadi

**Qanday ishlaydi?**
- Sana oraliqini tanlang
- Hisobotni ko'ring
- PDF yoki Excel ga eksport qilish (kelgusida)

---

### 7. Hisob-kitoblar (Fakturalar)

**Nima qiladi?**
- Faktura yaratish
- Mijozga faktura yuborish
- To'lov kuzatuvi

**Qanday ishlaydi?**
- Mijozni tanlang
- Buyurtmani tanlang
- Faktura yaratish
- Print yoki email yuborish (kelgusida)

---

## 🔐 Xavfsizlik

- Barcha ma'lumotlar Supabase cloud database'da saqlanadi
- RLS (Row Level Security) yoqilgan
- Har bir foydalanuvchi o'z ma'lumotlarini ko'radi
- Parollar shifrlangan saqlanadi

---

## 📊 Hisob-kitob Formulalari

### Buyurtma:
```
Buyurtma jami = Σ(Material narxi × Soni) + Σ(Xizmatlar narxi)
Material tannarxi = Σ(Olish narxi × Soni)
Material ustamasi = Σ((Sotish narxi - Olish narxi) × Soni)
Xizmatlar daromadi = Σ(Bazis + Arra + Kromka + Teshish + Rover)
Ichki xarajatlar = Σ(Usta haqi + Zapchast + Boshqa)
Jami xarajat = Material tannarxi + Ichki xarajatlar
Sof foyda = (Material ustamasi + Xizmatlar daromadi) - Ichki xarajatlar
Qolgan qarz = Buyurtma jami - Olingan pul
```

### Ombor:
```
Qoldiq = Boshlang'ich qoldiq - Sotilgan dona
Olish narxi = Xarid narxi
Sotish narxi = Olish narxi + Ustama
Ustama = Sotish narxi - Olish narxi
Marja (%) = (Ustama / Olish narxi) × 100
```

---

## ⚠️ Muhim Eslatmalar

1. **Ombor:** Material sotilganda avtomatik kamayadi
2. **O'chirish:** Buyurtma o'chirilganda ombor qaytarilmaydi
3. **Avans:** Avans buyurtma jami summasidan oshmasligi kerak
4. **Foyda:** Ichki xarajatlar foydadan ayriladi, mijoz hisobiga qo'shilmaydi
5. **Backup:** Supabase avtomatik backup qiladi
6. **Offline:** Internet yo'q bo'lsa, ishlamaydi

---

## 🎓 Tezkor Boshlash

1. **Birinchi:** Ombor bo'limiga o'ting va materiallarni qo'shing
2. **Ikkinchi:** Mijozlar bazasiga mijozlarni qo'shing
3. **Uchinchi:** Yangi buyurtma yarating
4. **To'rtinchi:** To'lovlarni qayd eting
5. **Beshinchi:** Hisobotlarni tekshiring

---

## 📞 Yordam

Agar muammo bo'lsa:
1. Internetni tekshiring
2. Supabase ulanishini tekshiring
3. Browser console'ni tekshiring (F12)
4. Admin bilan bog'laning

---

## 🔄 Updates

CRM doimiy ravishda yangilanadi:
- Yangi features qo'shiladi
- Buglar tuzatiladi
- UI yaxshilanadi
- Performance oshiriladi

---

**Versiya:** 1.0.0
**Yaratilgan:** 2026
**Texnologiyalar:** React, Redux, Supabase, Tailwind CSS
