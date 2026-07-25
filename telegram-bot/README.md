# 🤖 Telegram Bot - Academic Library Bridge

مشروع بوت تلجرام مستقل لاستعراض المكتبة الجامعية (الكليات، المستويات، المواد، المحاضرات، والملفات) والربط مع خادم API الخاص بالموقع وقاعدة بيانات Firebase.

---

## 📁 الهيكلية البرمجية (Project Structure)

```text
telegram-bot/
├── src/
│   ├── api/
│   │   └── client.ts            # عميل الاتصال بـ API الـ Backend (/telegram/*)
│   ├── handlers/
│   │   ├── startHandler.ts      # معالج أمر /start والرسالة الترحيبية
│   │   └── callbackHandlers.ts  # معالج أزرار القوائم والتنقل والملفات
│   ├── keyboards/
│   │   └── inlineKeyboards.ts   # بناء أزرار Inline Keyboard والشاشات
│   ├── services/
│   │   └── botService.ts        # المنطق البرمجي وتنسيق النصوص
│   ├── utils/
│   │   └── helpers.ts           # أدوات مساعدة وتنسيق الأحجام والرموز
│   └── bot.ts                   # تهيئة مكتبة Telegraf وإعدادات البوت
├── index.ts                     # مشغل البوت (Main Entrypoint)
└── README.md                    # هذا الملف
```

---

## ⚙️ متطلبات التشغيل (Environment Variables)

يتم ضبط المتغيرات في ملف `.env` في الجذر أو بيئة التشغيل:

```env
# توكن البوت الصادر من @BotFather
TELEGRAM_BOT_TOKEN="your_bot_token_from_botfather"

# رابط خادم الـ API للموقع
TELEGRAM_API_URL="http://localhost:3000/telegram"

# المفتاح السري لحماية خادم الـ API
TELEGRAM_API_SECRET="default_telegram_secret_key_2026"
```

---

## 🚀 طريقة التشغيل (Run Instructions)

1. تأكد من تشغيل خادم الموقع الرئيسي (`npm run dev`).
2. قم بإضافة `TELEGRAM_BOT_TOKEN` الخاص بك.
3. شغل البوت بالأمر:

```bash
npx tsx telegram-bot/index.ts
```

---

## 🎯 الميزات ودورة العمل

1. **الترحيب (/start):**
   يقوم البوت بطلب الإعدادات الترحيبية من `GET /telegram/settings` وعرض زر `"📚 تصفح المكتبة"`.

2. **التنقل بالـ Inline Keyboards:**
   - **الكليات:** `GET /telegram/colleges`
   - **المستويات:** `GET /telegram/levels/:collegeId`
   - **المواد:** `GET /telegram/courses/:levelId`
   - **المحاضرات:** `GET /telegram/lectures/:courseId`
   - **الملفات:** `GET /telegram/files/:lectureId`

3. **إرسال الملفات:**
   - **PDF:** يتم إرساله كمستند مجاني مباشر داخل التلجرام (`replyWithDocument`).
   - **Video:** يتم إرساله كفيديو مباشر (`replyWithVideo`).
   - **ملفات أخرى:** يتم إرسال بطاقة مع زر تحميل مباشر (`Download Link`).

4. **الأمان والمعالجة:**
   - جميع الطلبات تحتوي على مفتاح الأمان `x-telegram-secret`.
   - يتم استبعاد أي عنصر محذوف (`isDeleted=true`) أو غير نشط (`status=inactive`).
   - أزرار العودة `⬅️ رجوع` متوفرة في جميع المراحل.
