const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const path = require('path');
const fs = require('fs');

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

// تحميل الـ Schema
const lessonSchema = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../schemas/lesson.schema.json'), 'utf8')
);

/**
 * Middleware للتحقق من صحة بيانات الدرس الواردة في الطلب
 * نتحقق من أن البيانات تطابق القالب الأساسي (يمكن تخصيصها حسب الحاجة)
 */
function validateLesson(req, res, next) {
  const { gradeId, subjectName, unitId, unitName, lessonId, lessonName } = req.body;

  // التحقق من وجود الحقول
  if (!gradeId || !subjectName || !unitId || !unitName || !lessonId || !lessonName) {
    return res.status(400).json({ success: false, message: 'جميع الحقول مطلوبة.' });
  }

  // يمكن إضافة تحقق أعمق باستخدام Ajv على هيكل البيانات الكامل
  // لكن هنا نكتفي بالتحقق الأساسي
  // في المستقبل يمكن تمرير البيانات الكاملة إلى Ajv

  next();
}

module.exports = { validateLesson };