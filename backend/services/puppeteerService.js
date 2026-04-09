const puppeteer = require('puppeteer');

// Функция для извлечения изображений с указанной страницы
const getImagesFromPage = async (url) => {
  let browser;
  try {
    // Запуск браузера Puppeteer
    browser = await puppeteer.launch({
      headless: true, // Включаем headless режим (без UI)
      args: ['--no-sandbox', '--disable-setuid-sandbox'], // Параметры для работы в изолированных средах
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' }); // Ожидание полной загрузки страницы

    // Извлечение всех изображений со страницы
    const images = await page.evaluate(() =>
      Array.from(document.images, img => img.src)
    );

    await browser.close();
    return images;
  } catch (error) {
    if (browser) await browser.close(); // Закрываем браузер при ошибке
    console.error('Ошибка Puppeteer:', error.message);
    throw new Error('Ошибка при извлечении изображений');
  }
};

module.exports = { getImagesFromPage };
