const fs = require('fs');
const path = require('path');
const logger = require('./logger');

/**
 * قراءة ملف JSON مع معالجة الأخطاء
 */
function readJSON(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      logger.warn(`الملف غير موجود: ${filePath}`);
      return null;
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    logger.error(`خطأ في قراءة JSON من ${filePath}`, { error: error.message });
    return null;
  }
}

/**
 * كتابة كائن إلى ملف JSON مع تنسيق
 */
function writeJSON(filePath, data) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    logger.info(`تم حفظ البيانات بنجاح في ${filePath}`);
    return true;
  } catch (error) {
    logger.error(`خطأ في كتابة JSON إلى ${filePath}`, { error: error.message });
    return false;
  }
}

module.exports = { readJSON, writeJSON };