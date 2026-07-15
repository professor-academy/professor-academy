require('dotenv').config();
const path = require('path');

module.exports = {
  // بوت تليجرام
  BOT_TOKEN: process.env.BOT_TOKEN,
  GITHUB_PAGES_URL: process.env.GITHUB_PAGES_URL || 'https://professor-academy.github.io/professor-academy/',
  PORT: process.env.PORT || 3000,

  // معلومات الاتصال
  WHATSAPP_LINK: process.env.WHATSAPP_LINK || 'https://wa.me/01220434573',
  TELEGRAM_LINK: process.env.TELEGRAM_LINK || 'https://t.me/Professor_Ahmed_bot',
  FACEBOOK_LINK: process.env.FACEBOOK_LINK || 'https://www.facebook.com/YourPage',
  EMAIL: process.env.EMAIL || 'info@professor-academy.com',
  PHONE: process.env.PHONE || '+201220434573',

  // مسارات الملفات
  BOOKINGS_FILE: path.join(__dirname, '../data/bookings.json'),
  LESSONS_FILE: path.join(__dirname, '../data/lessons-data.json'),
};