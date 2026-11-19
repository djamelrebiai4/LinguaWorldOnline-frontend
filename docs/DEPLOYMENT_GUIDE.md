# دليل النشر النهائي — Lexi Explorer

## نظرة عامة

هذا المشروع يتكون من ثلاثة أجزاء منفصلة:
1. **فرونت إند** — Next.js + React (يُنشر على Vercel)
2. **باك إند** — Node.js + Express + TypeScript (يُنشر على Render)
3. **قاعدة البيانات** — Supabase PostgreSQL + Auth + Storage

كل جزء يُنشر بشكل مستقل وله متغيرات البيئة الخاصة به.

## الهيكل الأمني (Backend-Driven)

الفرونت إند أصبح طبقة عرض فقط — كل المحتوى (المفردات، المهام، الحوارات، الإعدادات) يأتي من الباك إند عبر API. الباك إند يفحص:
- **نطاق الطلب (Domain Guard)** — فقط النطاقات المصرح بها يمكنها استدعاء API
- **توكن الاعتماد (JWT)** — جميع العمليات الخاصة تحتاج توكن صالح من Supabase
- **مفتاح القتل (Kill Switch)** — يمكن إلغاء تفعيل أي نطاق مسروق فوراً من قاعدة البيانات

---

## المتطلبات المسبقة

- حساب على [Vercel](https://vercel.com)
- حساب على [Render](https://render.com)
- حساب على [Supabase](https://supabase.com)
- Node.js مثبت محلياً (للبناء والاختبار)

---

## الخطوة 1: إعداد Supabase

1. أنشئ مشروعاً جديداً على [supabase.com](https://supabase.com)
2. اذهب إلى **SQL Editor** في لوحة التحكم
3. شغّل ملف `database/migrations/001_initial_schema.sql` لإنشاء الجداول وسياسات RLS
4. شغّل ملف `database/migrations/002_authorized_domains.sql` لإنشاء جدول النطاقات المصرح بها
5. شغّل ملف `database/seed.sql` لتلقيح البيانات الأولية (المفردات، المهام، الحوارات، النطاقات المصرح بها)
6. من صفحة **Settings → API**، انسخ القيم التالية:
   - `Project URL` → `SUPABASE_URL`
   - `service_role` key → `SUPABASE_SECRET_KEY` (سري، لا تُشاركه)
7. من صفحة **Settings → General**، انسخ:
   - `JWT Secret` → `SUPABASE_JWT_SECRET`

---

## الخطوة 2: نشر الباك إند على Render

### الخيار أ: باستخدام render.yaml (مُوصى به)

اربط مستودع GitHub بـ.Render وسيستخدم ملف `render.yaml` تلقائياً.

### الخيار ب: يدوياً على لوحة تحكم Render

1. أنشئ **Web Service** جديد على Render
2. اربط مستودع GitHub الخاص بك
3. Configure كالتالي:
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Root Directory**: `backend`

4. أضف متغيرات البيئة من `backend/.env.example`:
   ```
   PORT=3000
   NODE_ENV=production
   FRONTEND_ORIGIN=https://your-frontend.vercel.app
   AUTHORIZED_DOMAINS=https://your-frontend.vercel.app
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SECRET_KEY=your-service-role-key
   SUPABASE_JWT_SECRET=your-jwt-secret
   GROQ_API_KEY=your-groq-api-key
   GROQ_MODEL=openai/gpt-oss-20b
   ```

   **هام**: `AUTHORIZED_DOMAINS` يجب أن يحتوي على نطاق الفرونت إند الفعلي المفصول بفواصل إذا كان هناك أكثر من نطاق.

5. بعد النشر، انسخ رابط الباك إند (مثلاً: `https://lexiexplorer-backend.onrender.com`)

---

## الخطوة 3: نشر الفرونت إند على Vercel

1. أنشئ مشروعاً جديداً على [Vercel](https://vercel.com)
2. اربط مستودع GitHub الخاص بك
3. Configure كالتالي:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next` (تلقائي)

4. أضف متغير البيئة:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api/v1
   ```

5. استبدل `your-backend.onrender.com` برابط الباك إند الفعلي من الخطوة 2

6. انقر **Deploy**

---

## الخطوة 4: تحديث النطاقات المصرح بها

بعد معرفة رابط الفرونت إند على Vercel، تأكد من أن `AUTHORIZED_DOMAINS` في الباك إند يحتوي على هذا النطاق. إذا اكتشفت موقعاً منسوخاً، يمكنك إلغاء تفعيل نطاقه عبر جدول `authorized_domains` في Supabase (ضبط `is_active = false`).

---

## متغيرات البيئة النهائية

### فرونت إند (Vercel)
| المتغير | القيمة |
|----------|--------|
| `NEXT_PUBLIC_API_URL` | `https://your-backend.onrender.com/api/v1` |

### باك إند (Render)
| المتغير | القيمة |
|----------|--------|
| `PORT` | `3000` |
| `NODE_ENV` | `production` |
| `FRONTEND_ORIGIN` | `https://your-frontend.vercel.app` |
| `AUTHORIZED_DOMAINS` | `https://your-frontend.vercel.app` (أو أكثر مفصول بفاصلة) |
| `SUPABASE_URL` | `https://your-project.supabase.co` |
| `SUPABASE_SECRET_KEY` | `your-service-role-key` |
| `SUPABASE_JWT_SECRET` | `your-jwt-secret` |
| `GROQ_API_KEY` | `your-groq-api-key` |
| `GROQ_MODEL` | `openai/gpt-oss-20b` |

---

## نقطة النهاية الصحية للتحقق

بعد النشر، تأكد من أن الباك إند يعمل:
```bash
curl https://your-backend.onrender.com/api/v1/health
```
يجب أن تستجيب بـ: `{"status":"ok","timestamp":"..."}`

---

## هيكل الملفات النهائي

```
lexiexplorer-clone/
├── .gitignore
├── README.md
├── backend/                 # Node.js + Express + TypeScript (Render)
│   ├── src/
│   │   ├── app.ts
│   │   ├── server.ts
│   │   ├── config/          # env, supabase, cors
│   │   ├── middleware/      # auth, domain-guard, rateLimit, validation, error
│   │   ├── routes/          # health, auth, content, user, chat, admin
│   │   ├── services/        # domain.service
│   │   ├── validators/      # Zod schemas
│   │   └── utils/           # JWT verification
│   ├── package.json
│   ├── tsconfig.json
│   ├── render.yaml
│   └── .env.example
├── frontend/                # Next.js + React + TypeScript (Vercel)
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── types/
│   ├── package.json
│   ├── next.config.ts
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vercel.json
│   └── .env.example
│   ├── public/               # الموقع الحالي وأصوله الثابتة
│   └── docs/                 # توثيق المشروع وخططه
└── database/                 # قاعدة البيانات وسياسات الأمان
    ├── migrations/
    │   ├── 001_initial_schema.sql
    │   └── 002_authorized_domains.sql
    ├── seed.sql
    └── README.md
```

---

## اختبار الأمان (بعد النشر)

اختبر ما يلي للتأكد من فعالية الحماية:

### اختبار قفل النطاق (Domain Locking)
1. **نطاق غير مصرح**: استدعاء API من نطاق غير في `AUTHORIZED_DOMAINS` → يجب أن يعيد 403
2. **نطاق معطل**: إلغاء تفعيل نطاق في Supabase (`is_active = false`) → طلبات ذلك النطاق تُرفض بـ 403
3. **نقطة الصحة (Health)**: `GET /api/v1/health` تعمل بدون نطاق مصرح (عامة)

### اختبار المصادقة (Authentication)
4. **وصول غير مصادق**: `GET /api/v1/user/progress` دون توكن → يجب أن يعيد 401
5. **توكن غير صالح**: إرسال توكن مزيف → يجب أن يعيد 401
6. **بيانات مستخدم آخر**: مستخدم A يحاول الوصول لبيانات مستخدم B → يجب أن يرفض
7. **عمليات المدير**: مستخدم عادي يحاول الوصول ل `/api/v1/admin/users` → يجب أن يرفض

### اختبار المحتوى (Content)
8. **المفردات من backend**: صفحة `/words` يجب أن تجلب البيانات من الباك إند، لا تحتوي على كلمات ثابتة في الكود
9. **اللعب بدون توكن**: لعبة Der/Die/Das تعمل للمحتوى العام، لكن إرسال نقاط يحتاج توكن صالح

### اختبار المعدل والمدخلات
10. **حدود المعدل**: إرسال عدد كبير من الطلبات → يجب أن يعيد 429
11. **مدخلات غير صالحة**: إرسال بيانات ناقصة أو خاطئة → يجب أن يعيد 400

---

## ملاحظات مهمة

- **لا ترفع ملفات `.env` إلى Git** — تحتوي على مفاتيح سرية
- **مفتاح `SUPABASE_SECRET_KEY` يجب أن يبقى في الباك إند فقط** — لا تُضيفه للفرونت إند
- **CORS ليس وسيلة مصادقة** — تعتمد الحماية على التحقق من التوكن (JWT) من Supabase
- **الفرونت إند عام بالكامل** — يمكن نسخ واجهة المستخدم (HTML/CSS)، لكنها لن تعمل بدون الباك إند لأن كل المحتوى يأتي منه
- **إلغاء تفعيل نطاق مسروق**: اذهب إلى جدول `authorized_domains` في Supabase واضبط `is_active = false` للنطاق المسروق
