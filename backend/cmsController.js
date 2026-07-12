const lessonRepo = require('../repositories/lessonRepository');
const logger = require('../utils/logger');

/**
 * إضافة درس جديد (يستقبل البيانات من request)
 */
function addLesson(req, res) {
  try {
    const { gradeId, subjectName, unitId, unitName, lessonId, lessonName } = req.body;

    // التحقق الأولي (المزيد من التحقق سيتم في middleware)
    if (!gradeId || !subjectName || !unitId || !unitName || !lessonId || !lessonName) {
      return res.status(400).json({ success: false, message: 'جميع الحقول مطلوبة.' });
    }

    const updatedData = lessonRepo.addLesson(gradeId, subjectName, unitId, unitName, lessonId, lessonName);
    logger.info(`تم إضافة درس جديد: ${lessonName} (${lessonId}) للصف ${gradeId}`);
    return res.status(200).json({ success: true, message: 'تم إضافة الدرس بنجاح.', data: updatedData });
  } catch (error) {
    logger.error(`فشل إضافة الدرس: ${error.message}`);
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * جلب جميع الدروس (للوحة التحكم)
 */
function getAllLessons(req, res) {
  try {
    const data = lessonRepo.getAllLessons();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    logger.error(`فشل جلب الدروس: ${error.message}`);
    return res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = { addLesson, getAllLessons };