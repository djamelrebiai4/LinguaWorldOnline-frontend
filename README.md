# Frontend — Lexi Explorer

واجهة الموقع تُنشر بشكل مستقل عن الخادم وقاعدة البيانات.

- ملفات الموقع الحالي وأصوله موجودة في `public/`.
- الصفحة الرئيسية تحوّل إلى `public/index.html`.
- `app/` و`components/` تحتوي تطبيق Next.js ومكوناته.
- سكربت التشغيل المحلي موجود في `serve_lexiexplorer-clone.py`، خارج `public/`.

## النشر على Vercel

1. اربط المستودع بـ Vercel.
2. عيّن **Root Directory** إلى `frontend`.
3. استخدم إعداد Next.js وأمر البناء `npm run build`.
4. اضبط `NEXT_PUBLIC_API_URL` على عنوان الخلفية المنشور عند الحاجة إلى API.

لا تضع مفاتيح Supabase السرية أو مفاتيح الخدمات في الواجهة؛ تبقى الأسرار في إعدادات بيئة الخلفية فقط.
