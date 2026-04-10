import { NextResponse } from 'next/server';

export const maxDuration = 60;

const makeAbsoluteUrl = (url, baseUrl) => {
  if (url.startsWith('//')) return `https:${url}`;
  if (!url.startsWith('http')) {
    try {
      return new URL(url, baseUrl).href;
    } catch {
      return url;
    }
  }
  return url;
};

const getImageInfo = async (imageUrl) => {
  try {
    const response = await fetch(imageUrl, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });
    
    if (response.ok) {
      const contentType = response.headers.get('content-type') || '';
      const contentLength = parseInt(response.headers.get('content-length'), 10) || 0;
      
      let format = 'unknown';
      if (contentType.includes('jpeg') || contentType.includes('jpg')) format = 'jpeg';
      else if (contentType.includes('png')) format = 'png';
      else if (contentType.includes('gif')) format = 'gif';
      else if (contentType.includes('webp')) format = 'webp';
      else if (contentType.includes('svg')) format = 'svg';
      else if (contentType.includes('ico')) format = 'ico';
      else {
        const urlLower = imageUrl.toLowerCase();
        if (urlLower.includes('.jpg') || urlLower.includes('.jpeg')) format = 'jpeg';
        else if (urlLower.includes('.png')) format = 'png';
        else if (urlLower.includes('.gif')) format = 'gif';
        else if (urlLower.includes('.webp')) format = 'webp';
        else if (urlLower.includes('.svg')) format = 'svg';
        else if (urlLower.includes('.ico')) format = 'ico';
      }
      
      const fileSizeInKb = contentLength / 1024;
      const fileSizeInMb = fileSizeInKb / 1024;
      const fileSize = fileSizeInMb > 1
        ? `${fileSizeInMb.toFixed(2)} MB`
        : `${fileSizeInKb.toFixed(2)} KB`;
      
      return {
        format,
        fileSize,
        size: contentLength,
        width: 200,
        height: 200,
      };
    }
  } catch (err) {
    console.error(`Error getting image info: ${imageUrl}`, err.message);
  }
  return null;
};

export async function POST(request) {
  const body = await request.json();
  const { url } = body;

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    if (!response.ok) {
      return NextResponse.json({ message: 'Failed to fetch the page' }, { status: 400 });
    }

    const html = await response.text();
    
    const imagePatterns = [
      /<img[^>]+src=["']([^"']+)["']/gi,
      /srcset=["']([^"']+)["']/gi,
      /data-src=["']([^"']+)["']/gi,
      /data-bg=["']([^"']+)["']/gi,
      /content=["']([^"']+\.(jpg|jpeg|png|gif|webp|svg|ico)[^"']*)["']/gi,
      /url\(["']?([^"')]+\.(jpg|jpeg|png|gif|webp|svg|ico)[^"')]*)/gi,
      /background(-image)?:\s*url\(["']?([^"')]+)["']?\)/gi,
    ];

    const allImages = new Set();

    for (const pattern of imagePatterns) {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        const imgUrl = match[1] || match[2];
        if (imgUrl && !imgUrl.startsWith('data:')) {
          const absoluteUrl = makeAbsoluteUrl(imgUrl, url);
          if (absoluteUrl.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)/i) || 
              absoluteUrl.includes('image') ||
              !absoluteUrl.includes('.js') && !absoluteUrl.includes('.css')) {
            allImages.add(absoluteUrl);
          }
        }
      }
    }

    const srcsetMatches = html.match(/srcset=["']([^"']+)["']/gi) || [];
    for (const srcsetMatch of srcsetMatches) {
      const srcset = srcsetMatch.replace(/srcset=["']|["']/g, '');
      const urls = srcset.split(',').map(s => s.trim().split(' ')[0]);
      urls.forEach(imgUrl => {
        if (imgUrl && !imgUrl.startsWith('data:')) {
          allImages.add(makeAbsoluteUrl(imgUrl, url));
        }
      });
    }

    const { default: pLimit } = await import('p-limit');
    const limit = pLimit(10);

    const validImages = [];
    const promises = Array.from(allImages).map((imgUrl) =>
      limit(async () => {
        const info = await getImageInfo(imgUrl);
        if (info && info.format !== 'unknown') {
          validImages.push({
            src: imgUrl,
            original: null,
            size: info,
          });
        }
      })
    );

    await Promise.allSettled(promises);

    if (validImages.length === 0) {
      return NextResponse.json({ message: 'No images found' }, { status: 404 });
    }

    return NextResponse.json({
      images: validImages.sort((a, b) => (b.size.size || 0) - (a.size.size || 0)),
    });
  } catch (error) {
    console.error('Error parsing page:', error.message);
    return NextResponse.json({ error: 'Error parsing page' }, { status: 500 });
  }
}
