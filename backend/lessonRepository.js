const path = require('path');
const { readJSON, writeJSON } = require('../utils/fileUtils');
const logger = require('../utils/logger');
const constants = require('../config/constants');

const LESSONS_FILE = path.join(constants.FRONTEND_DATA_PATH, 'lessons-data.json');

/**
 * جلب جميع الدروس
 */
function getAllLessons() {
  return readJSON(LESSONS_FILE) || {};
}

/**
 * إضافة درس جديد أو تحديث وحدة موجودة
 * @param {string} gradeId - معرف الصف (مثل p6)
 * @param {string} subjectName - اسم المادة
 * @param {string} unitId - معرف الوحدة
 * @param {string} unitName - اسم الوحدة
 * @param {string} lessonId - معرف الدرس
 * @param {string} lessonName - اسم الدرس
 */
function addLesson(gradeId, subjectName, unitId, unitName, lessonId, lessonName) {
  const data = getAllLessons();

  if (!data[gradeId]) {
    data[gradeId] = { subjects: {} };
  }
  if (!data[gradeId].subjects[subjectName]) {
    data[gradeId].subjects[subjectName] = { units: [] };
  }

  let unit = data[gradeId].subjects[subjectName].units.find(u => u.id === unitId);
  if (!unit) {
    unit = { id: unitId, name: unitName, lessons: [] };
    data[gradeId].subjects[subjectName].units.push(unit);
  }

  // تجنب التكرار
  const exists = unit.lessons.some(l => l.id === lessonId);
  if (exists) {
    throw new Error(`الدرس (${lessonId}) موجود مسبقاً في هذه الوحدة.`);
  }

  unit.lessons.push({ id: lessonId, name: lessonName });
  const success = writeJSON(LESSONS_FILE, data);
  if (!success) {
    throw new Error('فشل في حفظ البيانات.');
  }
  return data;
}

module.exports = { getAllLessons, addLesson };