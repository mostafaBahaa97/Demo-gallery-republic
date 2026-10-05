# Gallery Republic — نسخة Next.js

نفس المتجر والداشبورد اللي كانوا شغالين بالـ HTML، دلوقتي معمولين بـ **Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + Framer Motion**. الباك إند (Google Apps Script + Google Sheets) **متغيّرش خالص** — نفس الـ API، فمفيش داعي تعملي أي حاجة في جوجل شيت من الأول، هي شغالة زي ما هي.

## 🚀 التشغيل

```bash
npm install
npm run dev
```

افتحي [http://localhost:3000](http://localhost:3000) للمتجر، و [http://localhost:3000/admin](http://localhost:3000/admin) للوحة التحكم.

رابط الـ Apps Script بتاعك موجود بالفعل في `.env.local`، فمفيش حاجة تانية تتظبط عشان تشتغلي محليًا فورًا.

## 📁 هيكل المشروع

```
app/
├── page.tsx              ← صفحة المتجر
├── admin/page.tsx         ← صفحة لوحة التحكم
├── layout.tsx             ← الخطوط + الميتاداتا العامة
└── globals.css            ← ألوان وخطوط البراند (Tailwind v4 @theme)

components/                ← مكوّنات المتجر (Header, Hero, ProductCard, CheckoutForm...)
components/admin/          ← مكوّنات لوحة التحكم (LoginForm, OrdersTab, InventoryTab, PrintModal)

lib/
├── config.ts               ← إعدادات عامة (رابط الـ API، رقم الواتساب، نسب الخصم)
├── products.ts              ← المنتجات الـ12
├── governorates.ts           ← المحافظات ومناطق القاهرة/الإسكندرية
├── api.ts                     ← طابور الطلبات (Request Queue) + الاتصال بـ Apps Script
├── validation.ts               ← التحقق من الاسم ورقم الهاتف
└── types.ts                     ← أنواع TypeScript المشتركة

hooks/
├── useCart.tsx              ← حالة السلة (كميات، خصومات، إجمالي)
├── useToast.tsx               ← نظام إشعارات بسيط
└── useRateLimit.ts              ← حد الطلبات (3 كل ساعتين لكل جهاز)

.env.local                   ← رابط Apps Script + رقم الواتساب (القيم الحالية هي بتاعتك بالظبط)
```

## ⚙️ الإعدادات (`.env.local`)

```env
NEXT_PUBLIC_APPS_SCRIPT_URL=https://script.google.com/macros/s/xxxxx/exec
NEXT_PUBLIC_WHATSAPP_PHONE=201550111419
```

لو نشرتِ نسخة جديدة من Apps Script مستقبلًا، غيّري `NEXT_PUBLIC_APPS_SCRIPT_URL` بس. باقي الإعدادات (نسب الخصم، الحد الأقصى للقطع) في `lib/config.ts`.

## ✏️ تعديل المنتجات
المنتجات في `lib/products.ts` — لازم أسماؤها تفضل مطابقة تمامًا لأسماء المنتجات في شيت `Inventory` بجوجل شيت (زي الأول بالظبط). لإضافة صورة حقيقية، غيّري قيمة `image` لأي منتج.

## 🎨 إيه اللي اتغيّر عن نسخة HTML
- كل حاجة اتقسّمت لمكوّنات React منظمة بدل ملف واحد طويل.
- الأنيميشن بقى بـ **Framer Motion** (بدل CSS يدوي) — أنعم وأدق، خصوصًا خط الرسم في الهيرو وتأثيرات الظهور عند السكرول.
- كروت المنتجات بقى ليها لمسة "برواز المعرض" — زوايا ذهبية بتظهر عند الـ hover، تيمة مرتبطة باسم البراند نفسه (Gallery).
- الصور بقت بتتعامل عن طريق `next/image` (تحسين تلقائي + lazy loading حقيقي).
- كل حاجة TypeScript، فالأخطاء بتتمسك وقت الكتابة قبل ما توصل للمتصفح.
- منطق السلة، الخصومات، محدودية الطلبات، الـ honeypot، والتحقق من البيانات **كلهم نفس السلوك بالظبط** زي النسخة اللي كانت شغالة، غيّر بس شكل الكود.

## 🏗️ البناء للإنتاج

```bash
npm run build
npm run start
```

## ☁️ النشر
المشروع جاهز للنشر المباشر على **Vercel** (زي أي مشروع Next.js): ادفعيه على GitHub واربطيه بـ Vercel، وحطي متغيرات البيئة اللي في `.env.local` في إعدادات المشروع على Vercel (Environment Variables).

## 🛡️ الحماية (نفس المنطق زي الأول)
- طابور طلبات (Request Queue) بيبعت الطلبات واحد ورا التاني مع إعادة محاولة تلقائية.
- Honeypot لمنع البوتات.
- حد أقصى 3 طلبات كل ساعتين لكل جهاز (localStorage).
- التحقق من رقم الهاتف المصري (010/011/012/015 + 11 رقم).
- LockService في Apps Script (Code.gs — متغيّرش) بيمنع تضارب الكتابة وقت الضغط.
