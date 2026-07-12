const { Telegraf, Markup } = require('telegraf');
const constants = require('../config/constants');
const logger = require('../utils/logger');

let bot = null;

function initBot() {
  if (!constants.BOT_TOKEN) {
    logger.warn('BOT_TOKEN غير موجود في متغيرات البيئة، البوت لن يعمل.');
    return null;
  }

  bot = new Telegraf(constants.BOT_TOKEN);

  bot.start((ctx) => {
    ctx.reply(
      `🇸🇦 مرحباً بك في ${constants.APP_NAME} التعليمية للمنهج السعودي.\n\nمنصة سريعة ومبسطة لصفوف الابتدائي والمتوسط.\nاضغط على الزر أدناه لبدء التعلم مباشرة!`,
      Markup.keyboard([
        [Markup.button.webApp('📚 دخول المنصة المباشر', constants.GITHUB_PAGES_URL)]
      ]).resize()
    );
  });

  // يمكن إضافة أوامر أخرى هنا

  bot.launch().then(() => {
    logger.info('🤖 بوت تليجرام يعمل بنجاح.');
  }).catch(err => {
    logger.error(`فشل تشغيل البوت: ${err.message}`);
  });

  return bot;
}

function getBot() {
  return bot;
}

module.exports = { initBot, getBot };