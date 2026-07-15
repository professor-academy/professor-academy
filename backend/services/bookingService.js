const fs = require('fs');
const path = require('path');
const constants = require('../config/constants');

/**
 * قراءة جميع الحجوزات من ملف JSON
 */
function getBookings() {
  try {
    if (!fs.existsSync(constants.BOOKINGS_FILE)) {
      return [];
    }
    const data = fs.readFileSync(constants.BOOKINGS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('خطأ في قراءة الحجوزات:', error);
    return [];
  }
}

/**
 * حفظ الحجوزات في ملف JSON
 */
function saveBookings(bookings) {
  try {
    const dir = path.dirname(constants.BOOKINGS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(constants.BOOKINGS_FILE, JSON.stringify(bookings, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('خطأ في حفظ الحجوزات:', error);
    return false;
  }
}

/**
 * إضافة حجز جديد
 */
function addBooking(bookingData) {
  const bookings = getBookings();
  
  // إنشاء معرف فريد للحجز
  const id = 'BK' + Date.now() + Math.floor(Math.random() * 1000);
  
  const newBooking = {
    id,
    ...bookingData,
    status: 'pending', // pending, confirmed, cancelled, completed
    createdAt: new Date().toISOString(),
  };
  
  bookings.push(newBooking);
  saveBookings(bookings);
  return newBooking;
}

/**
 * تحديث حالة الحجز
 */
function updateBookingStatus(id, status) {
  const bookings = getBookings();
  const index = bookings.findIndex(b => b.id === id);
  if (index === -1) return null;
  
  bookings[index].status = status;
  bookings[index].updatedAt = new Date().toISOString();
  saveBookings(bookings);
  return bookings[index];
}

/**
 * جلب حجوزات اليوم (للتذكير)
 */
function getTodayBookings() {
  const bookings = getBookings();
  const today = new Date().toISOString().split('T')[0];
  return bookings.filter(b => b.date === today && b.status === 'confirmed');
}

module.exports = {
  getBookings,
  addBooking,
  updateBookingStatus,
  getTodayBookings,
};