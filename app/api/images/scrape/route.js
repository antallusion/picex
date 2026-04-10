import { NextResponse } from 'next/server';
import sharp from 'sharp';

export const maxDuration = 300;

const makeAbsoluteUrl = (url, baseUrl) => {
  if (url.startsWith('//')) return `https:${url}`;
  if (!url.startsWith('http')) return new URL(url, baseUrl).href;
  return url;
};

const getImageSize = async (imageUrl) => {
  try {
    const response = await fetch(imageUrl);
    if (response.ok) {
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const metadata = await sharp(buffer).metadata();
      const fileSizeInBytes =
        parseInt(response.headers.get('content-length'), 10) || buffer.length;
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

export async function POST(request) {
  const body = await request.json();
  const { url } = body;

  if (!url) {
    return NextResponse.json({ error: 'URL обязателен' }, { status: 400 });
  }

  const { default: pLimit } = await import('p-limit');

  let browser;
  try {
    if (process.env.VERCEL) {
      const chromium = require('@sparticuz/chromium');
      const puppeteer = require('puppeteer-core');
      browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
      });
    } else {
      const puppeteer = require('puppeteer');
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    }

    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    );
    await page.setJavaScriptEnabled(true);

    const interceptedImages = new Set();
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      if (request.resourceType() === 'image') {
        interceptedImages.add(request.url());
      }
      request.continue();
    });

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 });

    const ogImages = await page.evaluate(() => {
      return [
        'meta[property="og:image"]',
        'meta[property="og:image:secure_url"]',
        'meta[property="twitter:image"]',
        'meta[name="twitter:image"]',
      ]
        .map((tag) => {
          const el = document.querySelector(tag);
          return el ? el.getAttribute('content') : null;
        })
        .filter(Boolean);
    });

    const images = await page.evaluate(() => {
      const imgTags = Array.from(document.images, (img) => img.src);
      const backgroundImages = Array.from(document.querySelectorAll('*'))
        .map((el) => getComputedStyle(el).backgroundImage)
        .filter((u) => u && u.startsWith('url'))
        .map((u) => u.slice(5, -2));
      const srcsetImages = Array.from(document.querySelectorAll('[srcset]'))
        .map((el) =>
          el.getAttribute('srcset').split(',').map((s) => s.trim().split(' ')[0])
        )
        .flat();
      const dataSrcImages = Array.from(
        document.querySelectorAll('[data-src], [data-bg]')
      ).map((el) => el.getAttribute('data-src') || el.getAttribute('data-bg'));
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
            const imageUrl = match.replace(/url\(["']?|["']?\)/g, '');
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
        .filter((imgUrl) => !imgUrl.startsWith('data:'))
        .map((imgUrl) => {
          const baseImageUrl = imgUrl.replace(/-\d+x\d+\./, '.');
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
      return NextResponse.json({ message: 'Изображения не найдены' }, { status: 404 });
    }

    return NextResponse.json({
      images: validImages.sort(
        (a, b) => b.size.width * b.size.height - a.size.width * a.size.height
      ),
    });
  } catch (error) {
    console.error('Ошибка при парсинге страницы:', error.message);
    return NextResponse.json({ error: 'Ошибка при парсинге страницы' }, { status: 500 });
  } finally {
    if (browser) await browser.close();
  }
}
