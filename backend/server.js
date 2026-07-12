require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const apiRoutes = require('./routes/api');
const errorHandler = require('./middlewares/errorHandler');
const logger = require('./utils/logger');
const constants = require('./config/constants');
const telegramService = require('./services/telegramService');

const app = express();

// Middlewares أمنية
app.use(helmet({
  contentSecurityPolicy: false, // للتسهيل مع GitHub Pages
}));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// تسجيل الطلبات
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// ربط مسارات الـ API
app.use('/api', apiRoutes);

// مسار فحص الصحة
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', version: constants.VERSION, timestamp: new Date() });
});

// معالج الأخطاء العام
app.use(errorHandler);

// تشغيل السيرفر
const PORT = constants.PORT;
app.listen(PORT, () => {
  logger.info(`🚀 السيرفر يعمل على المنفذ ${PORT}`);
  // تشغيل البوت
  telegramService.initBot();
});

// معالجة إيقاف البوت عند إغلاق التطبيق
process.on('SIGINT', () => {
  const bot = telegramService.getBot();
  if (bot) {
    bot.stop('SIGINT');
  }
  process.exit(0);
});