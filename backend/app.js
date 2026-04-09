const puppeteer = require("puppeteer");
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const sharp = require("sharp");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

(async () => {
  const pLimit = (await import("p-limit")).default;

  // Редирект с www на non-www
  app.use((req, res, next) => {
    if (req.headers.host.startsWith("www.")) {
      const newHost = req.headers.host.slice(4);
      return res.redirect(301, `${req.protocol}://${newHost}${req.originalUrl}`);
    }
    next();
  });

  // Функция для приведения относительного URL к абсолютному
  const makeAbsoluteUrl = (url, baseUrl) => {
    if (url.startsWith("//")) {
      return `https:${url}`; // Подставляем https, если схема не указана
    }
    if (!url.startsWith("http")) {
      return new URL(url, baseUrl).href; // Приводим к абсолютному URL
    }
    return url;
  };

  // Функция для получения размеров изображения
  const getImageSize = async (url) => {
    try {
      const response = await fetch(url);
      if (response.ok) {
        const buffer = await response.buffer();
        const metadata = await sharp(buffer).metadata();
        const fileSizeInBytes = parseInt(response.headers.get('content-length'), 10) || buffer.length;

        // Преобразуем байты в Кб или Мб
        const fileSizeInKb = fileSizeInBytes / 1024;
        const fileSizeInMb = fileSizeInKb / 1024;
        const fileSize = fileSizeInMb > 1 ? `${fileSizeInMb.toFixed(2)} Мб` : `${fileSizeInKb.toFixed(2)} Кб`;

        return {
          width: metadata.width,
          height: metadata.height,
          format: metadata.format,
          size: metadata.size,
          buffer,
          fileSize: fileSize 
        };
      }
    } catch (err) {
      console.error(`Ошибка получения размера изображения: ${url}`, err);
    }
    return { width: 0, height: 0 };
  };

  app.post("/api/images/scrape", async (req, res) => {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: "URL обязателен" });
    }

    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
      const page = await browser.newPage();

      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      );
      await page.setJavaScriptEnabled(true);

      const interceptedImages = new Set();
      await page.setRequestInterception(true);
      page.on("request", (request) => {
        if (request.resourceType() === "image") {
          interceptedImages.add(request.url());
          request.continue();
        } else {
          request.continue();
        }
      });

      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 120000 });

      const ogImages = await page.evaluate(() => {
        const ogTags = [
          'meta[property="og:image"]',
          'meta[property="og:image:secure_url"]',
          'meta[property="twitter:image"]',
          'meta[name="twitter:image"]',
        ];
        const ogImages = ogTags
          .map((tag) => {
            const element = document.querySelector(tag);
            return element ? element.getAttribute("content") : null;
          })
          .filter(Boolean);
        return ogImages;
      });

      const images = await page.evaluate(() => {
        const imgTags = Array.from(document.images, (img) => img.src);
        const backgroundImages = Array.from(document.querySelectorAll("*"))
          .map((el) => getComputedStyle(el).backgroundImage)
          .filter((url) => url && url.startsWith("url"))
          .map((url) => url.slice(5, -2));
        const srcsetImages = Array.from(document.querySelectorAll("[srcset]"))
          .map((el) =>
            el
              .getAttribute("srcset")
              .split(",")
              .map((s) => s.trim().split(" ")[0])
          )
          .flat();
        const dataSrcImages = Array.from(
          document.querySelectorAll("[data-src], [data-bg]")
        ).map(
          (el) => el.getAttribute("data-src") || el.getAttribute("data-bg")
        );
        return [
          ...imgTags,
          ...backgroundImages,
          ...srcsetImages,
          ...dataSrcImages,
        ];
      });

      const cssFiles = await page.$$eval('link[rel="stylesheet"]', (links) =>
        links.map((link) => link.href)
      );

      const cssImages = [];
      for (const file of cssFiles) {
        try {
          const cssResponse = await fetch(file);
          const cssText = await cssResponse.text();
          const matches = cssText.match(/url\(([^)]+)\)/g);
          if (matches) {
            matches.forEach((match) => {
              const imageUrl = match.replace(/url\(["']?|["']?\)/g, "");
              if (imageUrl.match(/\.(jpeg|jpg|png|svg|webp|gif|ico)$/i)) {
                cssImages.push(imageUrl);
              }
            });
          }
        } catch (err) {
          console.error(`Ошибка загрузки CSS-файла: ${file}`, err);
        }
      }

      let allImages = [
        ...new Set([
          ...images,
          ...cssImages,
          ...interceptedImages,
          ...ogImages,
        ]),
      ];

      allImages = allImages.map((imgUrl) => makeAbsoluteUrl(imgUrl, url));

      const validImages = [];
      const baseUrls = new Set();

      const limit = pLimit(5);
      const sizePromises = [];

      for (const imgUrl of allImages) {
        if (imgUrl.startsWith("data:")) continue;

        const baseImageUrl = imgUrl.replace(/-\d+x\d+\./, ".");

        if (!baseUrls.has(baseImageUrl)) {
          baseUrls.add(baseImageUrl);
          const sizePromise = limit(() =>
            getImageSize(baseImageUrl).then((size) => {
              if (size.width > 1 && size.height > 1) {
                validImages.push({
                  src: imgUrl,
                  original: baseImageUrl !== imgUrl ? baseImageUrl : null,
                  size,
                });
              }
            })
          );
          sizePromises.push(sizePromise);
        }
      }

      await Promise.allSettled(sizePromises);

      if (validImages.length === 0) {
        return res.status(404).json({ message: "Изображения не найдены" });
      }

      const sortedImages = validImages.sort(
        (a, b) => b.size.width * b.size.height - a.size.width * a.size.height
      );

      res.json({ images: sortedImages });
    } catch (error) {
      console.error("Ошибка при парсинге страницы:", error.message);
      res.status(500).json({ error: "Ошибка при парсинге страницы" });
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  });
  
  // Настройка статической папки для доступа к статическим файлам
  app.use(express.static(path.join(__dirname, "/public")));
  
  // Обработка 404 - возвращаем страницу 404
  app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, "/public", "404.html"));
  });

  app.listen(5000, () => {
    console.log("Backend server is running on port 5000");
  });
})();
