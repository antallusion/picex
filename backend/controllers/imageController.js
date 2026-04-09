const puppeteerService = require('../services/puppeteerService');

// Контроллер для извлечения изображений
const extractImages = async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL обязателен' });
  }

  try {
    // Вызов функции извлечения изображений через Puppeteer
    const images = await puppeteerService.getImagesFromPage(url);

    if (images.length === 0) {
      return res.status(404).json({ message: 'Изображения не найдены на указанной странице' });
    }

    res.json({ images });
  } catch (error) {
    console.error('Ошибка при извлечении изображений:', error.message);
    res.status(500).json({ error: 'Ошибка при парсинге страницы' });
  }
};

module.exports = { extractImages };
