const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, '../../logs/app.log');

function log(level, message, meta = {}) {
  const timestamp = new Date().toISOString();
  const entry = `[${timestamp}] [${level.toUpperCase()}] ${message} ${JSON.stringify(meta)}\n`;
  console.log(entry);
  // إضافة كتابة إلى ملف لو أردت
  // fs.appendFileSync(LOG_FILE, entry, { flag: 'a' });
}

module.exports = {
  info: (msg, meta) => log('info', msg, meta),
  warn: (msg, meta) => log('warn', msg, meta),
  error: (msg, meta) => log('error', msg, meta),
  debug: (msg, meta) => log('debug', msg, meta),
};