require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sharp = require("sharp");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Редирект с www на non-www
app.use((req, res, next) => {
  if (req.headers.host && req.headers.host.startsWith("www.")) {
    const newHost = req.headers.host.slice(4);
    return res.redirect(301, `${req.protocol}://${newHost}${req.originalUrl}`);
  }
  next();
});

// Функция для приведения относительного URL к абсолютному
const makeAbsoluteUrl = (url, baseUrl) => {
  if (url.startsWith("//")) return `https:${url}`;
  if (!url.startsWith("http")) return new URL(url, baseUrl).href;
  return url;
};

// Функция для получения размеров изображения
const getImageSize = async (imageUrl) => {
  try {
    const response = await fetch(imageUrl);
    if (response.ok) {
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const metadata = await sharp(buffer).metadata();
      const fileSizeInBytes =
        parseInt(response.headers.get("content-length"), 10) || buffer.length;
      const fileSizeInKb = fileSizeInBytes / 1024;
      const fileSizeInMb = fileSizeInKb / 1024;
      const fileSize =
        fileSizeInMb > 1
          ? `${fileSizeInMb.toFixed(2)} Мб`
          : `${fileSizeInKb.toFixed(2)} Кб`;
      return {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: metadata.size,
        fileSize,
      };
    }
  } catch (err) {
    console.error(`Ошибка получения размера изображения: ${imageUrl}`, err.message);
  }
  return { width: 0, height: 0 };
};

app.post("/api/images/scrape", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "URL обязателен" });

  const { default: pLimit } = await import("p-limit");

  let browser;
  try {
    // На Vercel используем @sparticuz/chromium, локально — обычный puppeteer
    if (process.env.VERCEL) {
      const chromium = require("@sparticuz/chromium");
      const puppeteer = require("puppeteer-core");
      browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
      });
    } else {
      const puppeteer = require("puppeteer");
      browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
    }

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
      }
      request.continue();
    });

    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 120000 });

    const ogImages = await page.evaluate(() => {
      return [
        'meta[property="og:image"]',
        'meta[property="og:image:secure_url"]',
        'meta[property="twitter:image"]',
        'meta[name="twitter:image"]',
      ]
        .map((tag) => {
          const el = document.querySelector(tag);
          return el ? el.getAttribute("content") : null;
        })
        .filter(Boolean);
    });

    const images = await page.evaluate(() => {
      const imgTags = Array.from(document.images, (img) => img.src);
      const backgroundImages = Array.from(document.querySelectorAll("*"))
        .map((el) => getComputedStyle(el).backgroundImage)
        .filter((u) => u && u.startsWith("url"))
        .map((u) => u.slice(5, -2));
      const srcsetImages = Array.from(document.querySelectorAll("[srcset]"))
        .map((el) =>
          el.getAttribute("srcset").split(",").map((s) => s.trim().split(" ")[0])
        )
        .flat();
      const dataSrcImages = Array.from(
        document.querySelectorAll("[data-src], [data-bg]")
      ).map((el) => el.getAttribute("data-src") || el.getAttribute("data-bg"));
      return [...imgTags, ...backgroundImages, ...srcsetImages, ...dataSrcImages];
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
        console.error(`Ошибка загрузки CSS-файла: ${file}`, err.message);
      }
    }

    const allImages = [
      ...new Set([...images, ...cssImages, ...interceptedImages, ...ogImages]),
    ].map((imgUrl) => makeAbsoluteUrl(imgUrl, url));

    const validImages = [];
    const baseUrls = new Set();
    const limit = pLimit(5);

    await Promise.allSettled(
      allImages
        .filter((imgUrl) => !imgUrl.startsWith("data:"))
        .map((imgUrl) => {
          const baseImageUrl = imgUrl.replace(/-\d+x\d+\./, ".");
          if (baseUrls.has(baseImageUrl)) return Promise.resolve();
          baseUrls.add(baseImageUrl);
          return limit(() =>
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
        })
    );

    if (validImages.length === 0) {
      return res.status(404).json({ message: "Изображения не найдены" });
    }

    res.json({
      images: validImages.sort(
        (a, b) => b.size.width * b.size.height - a.size.width * a.size.height
      ),
    });
  } catch (error) {
    console.error("Ошибка при парсинге страницы:", error.message);
    res.status(500).json({ error: "Ошибка при парсинге страницы" });
  } finally {
    if (browser) await browser.close();
  }
});

// Раздача собранного фронтенда (для локального запуска на одном порту)
const frontendBuild = path.join(__dirname, "../frontend/build");
app.use(express.static(frontendBuild));
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendBuild, "index.html"));
});

// Запуск сервера только вне Vercel (локально)
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
