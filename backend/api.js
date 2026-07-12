const express = require('express');
const router = express.Router();
const cmsController = require('../controllers/cmsController');
const { validateLesson } = require('../middlewares/validator');

// مسار إضافة درس مع التحقق
router.post('/lessons/add', validateLesson, cmsController.addLesson);

// مسار جلب جميع الدروس
router.get('/lessons', cmsController.getAllLessons);

module.exports = router;