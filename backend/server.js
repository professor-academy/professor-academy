require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const fs = require('fs');
const path = require('path');
const constants = require('./config/constants');
const bookingService = require('./services/bookingService');
const telegramService = require('./services/telegramService');
const logger = require('./utils/logger'); // لو موجود

const app = express();

// Middlewares
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// تسجيل الطلبات
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url}`);
  next();
});

// ============================================================
// مسارات API
// ============================================================

// 1. جلب الدروس (للاختبارات والشرح)
app.get('/api/lessons', (req, res) => {
  try {
    const rawData = fs.readFileSync(constants.LESSONS_FILE, 'utf8');
    const data = JSON.parse(rawData || '{}');
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. إضافة درس جديد (CMS)
app.post('/api/cms/add-lesson', (req, res) => {
  try {
    const { gradeId, subjectName, unitId, unitName, lessonId, lessonName } = req.body;
    
    if (!gradeId || !subjectName || !unitId || !unitName || !lessonId || !lessonName) {
      return res.status(400).json({ success: false, message: 'جميع الحقول مطلوبة' });
    }

    let rawData = fs.readFileSync(constants.LESSONS_FILE, 'utf8');
    let lessonsData = rawData ? JSON.parse(rawData) : {};

    if (!lessonsData[gradeId]) {
      lessonsData[gradeId] = { subjects: {} };
    }
    if (!lessonsData[gradeId].subjects[subjectName]) {
      lessonsData[gradeId].subjects[subjectName] = { units: [] };
    }

    let unit = lessonsData[gradeId].subjects[subjectName].units.find(u => u.id === unitId);
    if (!unit) {
      unit = { id: unitId, name: unitName, lessons: [] };
      lessonsData[gradeId].subjects[subjectName].units.push(unit);
    }

    const lessonExists = unit.lessons.some(l => l.id === lessonId);
    if (lessonExists) {
      return res.status(400).json({ success: false, message: 'الدرس موجود بالفعل' });
    }

    unit.lessons.push({ id: lessonId, name: lessonName });
    fs.writeFileSync(constants.LESSONS_FILE, JSON.stringify(lessonsData, null, 2), 'utf8');

    res.json({ success: true, message: 'تم إضافة الدرس بنجاح 🎉' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. حجز درس خصوصي
app.post('/api/booking', (req, res) => {
  try {
    const { name, phone, grade, subject, date, time, notes } = req.body;
    
    // التحقق من المدخلات
    if (!name || !phone || !grade || !subject || !date || !time) {
      return res.status(400).json({ 
        success: false, 
        message: 'جميع الحقول مطلوبة (الاسم، الهاتف، الصف، المادة، التاريخ، الوقت)' 
      });
    }

    // إضافة الحجز
    const booking = bookingService.addBooking({
      name,
      phone,
      grade,
      subject,
      date,
      time,
      notes: notes || '',
    });

    // إرسال إشعار للمشرفين (عبر تليجرام)
    const bot = telegramService.getBot();
    if (bot) {
      const message = 
        `📚 **حجز درس خصوصي جديد!**\n\n` +
        `👤 الاسم: ${name}\n` +
        `📱 الهاتف: ${phone}\n` +
        `📚 الصف: ${grade}\n` +
        `📖 المادة: ${subject}\n` +
        `📅 التاريخ: ${date}\n` +
        `⏰ الوقت: ${time}\n` +
        `📝 ملاحظات: ${notes || 'لا يوجد'}\n` +
        `🆔 رقم الحجز: ${booking.id}`;
      
      // إرسال للمشرف (يمكنك وضع معرف المشرف)
      bot.telegram.sendMessage(process.env.ADMIN_CHAT_ID, message, { parse_mode: 'Markdown' })
        .catch(err => console.error('فشل إرسال إشعار للمشرف:', err));
    }

    res.json({ 
      success: true, 
      message: 'تم استلام طلب الحجز بنجاح! سيتم التواصل معك قريباً.',
      bookingId: booking.id 
    });

  } catch (error) {
    console.error('خطأ في الحجز:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 4. جلب جميع الحجوزات (للمشرف)
app.get('/api/bookings', (req, res) => {
  try {
    const bookings = bookingService.getBookings();
    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 5. تحديث حالة الحجز (للمشرف)
app.put('/api/booking/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'حالة غير صالحة' });
    }
    
    const updated = bookingService.updateBookingStatus(id, status);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'الحجز غير موجود' });
    }
    
    res.json({ success: true, message: 'تم تحديث الحالة', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 6. فحص صحة السيرفر
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    version: '2.0.0', 
    timestamp: new Date().toISOString(),
    bookingsCount: bookingService.getBookings().length,
  });
});

// ============================================================
// تشغيل السيرفر
// ============================================================

const PORT = constants.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 السيرفر يعمل على: http://localhost:${PORT}`);
  console.log(`📚 عدد الحجوزات: ${bookingService.getBookings().length}`);
  
  // تشغيل البوت
  telegramService.initBot();
});

// إغلاق البوت عند إيقاف السيرفر
process.on('SIGINT', () => {
  const bot = telegramService.getBot();
  if (bot) {
    bot.stop('SIGINT');
  }
  process.exit(0);
});