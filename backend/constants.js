const path = require('path');
require('dotenv').config();

module.exports = {
  APP_NAME: 'أكاديمية الأستاذ',
  VERSION: '1.0.0',
  PORT: process.env.PORT || 3000,
  BOT_TOKEN: process.env.BOT_TOKEN,
  GITHUB_PAGES_URL: process.env.GITHUB_PAGES_URL,
  FRONTEND_DATA_PATH: path.resolve(process.env.FRONTEND_DATA_PATH || '../frontend/data'),
  PRICING_TABLE: { 30: 1, 50: 2, 80: 3, 120: 6, 200: 12 }, // مثال
};