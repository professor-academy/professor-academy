const { Telegraf, Markup } = require('telegraf');
const constants = require('../config/constants');
const bookingService = require('./bookingService');

let bot = null;

function initBot() {
  if (!constants.BOT_TOKEN) {
    console.warn('⚠️ BOT_TOKEN غير موجود، البوت لن يعمل.');
    return null;
  }

  bot = new Telegraf(constants.BOT_TOKEN);

  // أمر /start
  bot.start((ctx) => {
    const userName = ctx.from.first_name || 'الطالب';
    ctx.reply(
      `🇸🇦 أهلًا بك يا ${userName} في **أكاديمية الأستاذ**!\n\n` +
      `📚 منصة تعليمية شاملة للمناهج السعودية.\n` +
      `🎯 اختر الصف والمادة وابدأ التعلم مباشرة.\n\n` +
      `📞 للحجز والدعم: /booking`,
      {
        parse_mode: 'Markdown',
        ...Markup.keyboard([
          [Markup.button.webApp('📚 دخول المنصة', constants.GITHUB_PAGES_URL)],
          [Markup.button.url('📞 حجز دروس خصوصية', constants.GITHUB_PAGES_URL + 'pages/Contact/index.html')]
        ]).resize()
      }
    );
  });

  // أمر /booking - حجز درس خصوصي
  bot.command('booking', (ctx) => {
    ctx.reply(
      `📚 **حجز درس خصوصي**\n\n` +
      `يرجى ملء النموذج عبر الرابط التالي:\n` +
      `${constants.GITHUB_PAGES_URL}pages/Contact/index.html\n\n` +
      `أو أرسل معلوماتك على هذا البوت وسنقوم بالتواصل معك.`,
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.url('📝 اذهب للنموذج', constants.GITHUB_PAGES_URL + 'pages/Contact/index.html')],
          [Markup.button.callback('📱 واتساب', 'whatsapp')]
        ])
      }
    );
  });

  // زر واتساب
  bot.action('whatsapp', (ctx) => {
    ctx.answerCbQuery('جاري التوجيه إلى واتساب...');
    ctx.reply(`📱 تواصل معنا عبر واتساب:\n${constants.WHATSAPP_LINK}`);
  });

  // أمر /contact - معلومات الاتصال
  bot.command('contact', (ctx) => {
    ctx.reply(
      `📞 **معلومات التواصل:**\n\n` +
      `📱 واتساب: ${constants.WHATSAPP_LINK}\n` +
      `🤖 تليجرام: ${constants.TELEGRAM_LINK}\n` +
      `📧 إيميل: ${constants.EMAIL}\n` +
      `📞 هاتف: ${constants.PHONE}`,
      { parse_mode: 'Markdown' }
    );
  });

  // أمر /about
  bot.command('about', (ctx) => {
    ctx.reply(
      `🏫 **أكاديمية الأستاذ**\n\n` +
      `منصة تعليمية سعودية متخصصة في المناهج الدراسية.\n` +
      `نقدم دروساً تفاعلية واختبارات لجميع الصفوف.\n\n` +
      `📚 ${constants.GITHUB_PAGES_URL}`,
      { parse_mode: 'Markdown' }
    );
  });

  // أمر /help
  bot.help((ctx) => {
    ctx.reply(
      `🤖 **الأوامر المتاحة:**\n` +
      `/start - القائمة الرئيسية\n` +
      `/booking - حجز درس خصوصي\n` +
      `/contact - معلومات التواصل\n` +
      `/about - عن الأكاديمية\n` +
      `/help - هذه الرسالة`,
      { parse_mode: 'Markdown' }
    );
  });

  // تشغيل البوت
  bot.launch().then(() => {
    console.log('🤖 بوت تليجرام يعمل بنجاح!');
  }).catch(err => {
    console.error('❌ فشل تشغيل البوت:', err.message);
  });

  return bot;
}

function getBot() {
  return bot;
}

module.exports = { initBot, getBot };