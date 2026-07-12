const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { Telegraf, Markup } = require('telegraf');

const app = express();
app.use(cors());
app.use(express.json()); // قراءة البيانات القادمة بصيغة JSON
app.use(express.static(path.join(__dirname, 'public')));

// مسارات ملفات البيانات
const GRADES_FILE = path.join(__dirname, 'data/grades.json');
const LESSONS_FILE = path.join(__dirname, 'data/lessons-data.json');

// 🤖 إعداد بوت تليجرام (امسح التوكن والرابط وحط بياناتك الحقيقية لما تجهز)
const BOT_TOKEN = 'YOUR_TELEGRAM_BOT_TOKEN'; 
const GITHUB_PAGES_URL = 'https://YOUR_USERNAME.github.io/professor-academy/';

const bot = new Telegraf(BOT_TOKEN);
bot.start((ctx) => {
    ctx.reply(
        `🇸🇦 مرحباً بك في أكاديمية الأستاذ التعليمية للمنهج السعودي.\n\nمنصة سريعة ومبسطة لصفوف الابتدائي والمتوسط.\nاضغط على الزر أدناه لبدء التعلم مباشرة!`,
        Markup.keyboard([[Markup.button.webApp('📚 دخول المنصة المباشر', GITHUB_PAGES_URL)]]).resize()
    );
});
bot.launch().catch(err => console.log('تنبيه: البوت لم يشتغل لعدم وجود توكن صحيح، ولكن السيرفر يعمل كالمعتاد.'));

// ============================================================
// 🧠 محرك إدارة وإضافة الدروس الموحد والسريع (CMS Engine)
// ============================================================
app.post('/api/cms/add-lesson', (req, res) => {
    try {
        const { gradeId, subjectName, unitId, unitName, lessonId, lessonName } = req.body;

        // التحقق من المدخلات الأساسية
        if (!gradeId || !subjectName || !unitId || !unitName || !lessonId || !lessonName) {
            return res.status(400).json({ success: false, message: 'برجاء إرسال جميع حقول الدرس المطلوبة.' });
        }

        // 1. قراءة ملف الدروس الحالي
        let rawData = fs.readFileSync(LESSONS_FILE, 'utf8');
        let lessonsData = rawData ? JSON.parse(rawData) : {};

        // 2. إذا كان الصف الدراسي (مثل p4) مش موجود، ننشئه
        if (!lessonsData[gradeId]) {
            lessonsData[gradeId] = { subjects: {} };
        }

        // 3. إذا كانت المادة (مثل "الرياضيات") مش موجودة جوه الصف، ننشئها
        if (!lessonsData[gradeId].subjects[subjectName]) {
            lessonsData[gradeId].subjects[subjectName] = { units: [] };
        }

        // 4. البحث عن الوحدة جوه المادة
        let unit = lessonsData[gradeId].subjects[subjectName].units.find(u => u.id === unitId);
        if (!unit) {
            unit = { id: unitId, name: unitName, lessons: [] };
            lessonsData[gradeId].subjects[subjectName].units.push(unit);
        }

        // 5. التحقق من عدم تكرار الدرس وحقنه برمجياً
        const lessonExists = unit.lessons.some(l => l.id === lessonId);
        if (lessonExists) {
            return res.status(400).json({ success: false, message: 'هذا الدرس مضاف بالفعل في هذه الوحدة!' });
        }

        // إضافة الدرس بنجاح
        unit.lessons.push({ id: lessonId, name: lessonName });

        // 6. حفظ التعديل فوراً في ملف الـ JSON المحلي
        fs.writeFileSync(LESSONS_FILE, JSON.stringify(lessonsData, null, 2), 'utf8');

        return res.json({ success: true, message: `تم إضافة درس (${lessonName}) بنجاح وتحديث قاعدة البيانات! 🎉` });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

// مسار لجلب البيانات للفرونت إند
app.get('/api/lessons', (req, res) => {
    let rawData = fs.readFileSync(LESSONS_FILE, 'utf8');
    res.json(JSON.parse(rawData || '{}'));
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`💻 المحرك يعمل بنجاح ومستعد لإضافة الدروس على: http://localhost:${PORT}`);
});