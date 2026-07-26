# 🏪 وميض ستور (Wameed Store)

متجر إلكتروني عربي كامل (RTL) مبني بـ Next.js 16 + TypeScript + Prisma + PostgreSQL.

للتوثيق التقني الكامل (البنية، قاعدة البيانات، الـ API، الأمان...) راجع
[`WAMEED-STORE-DOCS.md`](./WAMEED-STORE-DOCS.md). سجل التغييرات موجود في
[`CHANGELOG.md`](./CHANGELOG.md).

## المتطلبات

- Node.js 20+
- npm

## التشغيل محلياً

```bash
npm install
cp .env.example .env      # ثم ضع رابط قاعدة PostgreSQL في DATABASE_URL
npm run db:push           # ينشئ الجداول في قاعدة البيانات من prisma/schema.prisma
npm run db:seed           # (اختياري) بيانات تجريبية
npm run dev                # يشتغل على http://localhost:3000
```

> يحتاج المشروع قاعدة PostgreSQL فعلية حتى للتطوير المحلي (لا يعمل بدون قاعدة
> بيانات حقيقية). أسهل طريقة: أنشئ قاعدة مجانية من تبويب **Storage** في Vercel
> (راجع قسم النشر تحت) وانسخ نفس رابط الاتصال هنا محلياً أيضاً.

## متغيرات البيئة

راجع [`.env.example`](./.env.example) — كل قسم فيه معلّق وموثّق. أهم ما يجب تغييره
**قبل النشر**:

| المتغير | الوصف |
|---|---|
| `DATABASE_URL` | رابط اتصال قاعدة PostgreSQL — إجباري، لا يعمل المتجر بدونه |
| `ADMIN_PASSWORD` | كلمة مرور لوحة التحكم — القيمة الافتراضية معروفة، غيّرها حتماً |
| `ADMIN_SESSION_SECRET` | سر توقيع جلسة الأدمن — استخدم نصاً عشوائياً طويلاً (`openssl rand -hex 32`) |
| `NEXT_PUBLIC_SITE_URL` | رابط الموقع الفعلي (يُستخدم في SEO وروابط البريد و Stripe) |

الدفع عند الاستلام (COD) يعمل بدون أي إعداد إضافي بخلاف قاعدة البيانات. Stripe
والبريد الإلكتروني اختياريان بالكامل.

## البناء والنشر

### Vercel (موصى به)

المشروع مهيأ بالفعل عبر `vercel.json`. فقط:

1. ادفع المستودع إلى GitHub واستورده في Vercel.
2. من تبويب المشروع في Vercel: **Storage → Create Database → Postgres**، ثم
   اربطها بالمشروع (Connect Project). سيضيف Vercel متغير `DATABASE_URL`
   تلقائياً بدون أي إعداد يدوي.
3. أضف باقي متغيرات البيئة المطلوبة (`ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`
   على الأقل) من **Settings → Environment Variables**.
4. Deploy. عند أول نشر، شغّل مرة واحدة من جهازك (بعد وضع نفس `DATABASE_URL`
   في ملف `.env` المحلي):
   ```bash
   npx prisma db push --schema=prisma/schema.prisma
   ```
   لإنشاء الجداول في قاعدة البيانات، ثم أعد النشر (Redeploy) من Vercel.

### استضافة ذاتية (VPS / Docker وغيرها)

```bash
npm install
npm run build   # ينتج .next/standalone جاهز للتشغيل المستقل
npm run start   # يشغّل الخادم على المنفذ 3000
```

ضع الخادم خلف Nginx/Caddy كـ reverse proxy مع HTTPS.

## الأمان قبل الإطلاق (Checklist)

- [ ] غيّر `ADMIN_PASSWORD` و `ADMIN_SESSION_SECRET`
- [ ] لا ترفع ملف `.env` إلى Git أبداً (مستثنى بالفعل في `.gitignore`)
- [ ] فعّل HTTPS في بيئة الإنتاج
- [ ] راجع صلاحيات مفاتيح Stripe (استخدم مفاتيح live فقط عند الإطلاق الفعلي)

## الرخصة

MIT — راجع [`LICENSE`](./LICENSE).
