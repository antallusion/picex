const express = require('express');
const { extractImages } = require('../controllers/imageController');
const router = express.Router();

// Маршрут для извлечения изображений с указанного сайта
router.post('/scrape', extractImages);

module.exports = router;
