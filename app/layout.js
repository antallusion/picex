import Script from 'next/script';
import './globals.css';

export const metadata = {
  title: 'Скачать картинки с сайта онлайн беслпатно • PICEX',
  description:
    'Сервис, где можно скачать картинки, иконки, гифки, пнг и другие изображения с любого сайта. Бесплатно и без регистрации скачивайте графический контент в оригинальном качестве.',
  keywords:
    'скачать изображения, загрузить картинки, парсинг изображений, скачать фото с сайта, загрузить изображения онлайн, Image Extractor, PICEX',
  verification: { yandex: '8b75838c19a91291' },
  openGraph: {
    title: 'PICEX - Легкий способ скачивания изображений',
    description:
      'Попробуйте наш онлайн-сервис для извлечения и скачивания изображений с любых веб-сайтов. Быстро, удобно и бесплатно.',
    images: ['https://picex.ru/images/picexog.jpg'],
    url: 'https://picex.ru',
  },
  icons: { icon: '/images/favicon.svg' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>
        {children}
        <noscript>
          <div>
            <img
              src="https://mc.yandex.ru/watch/98732439"
              style={{ position: 'absolute', left: '-9999px' }}
              alt=""
            />
          </div>
        </noscript>
        {/* Yandex.RTB */}
        <Script
          id="ya-rtb-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: 'window.yaContextCb=window.yaContextCb||[]' }}
        />
        <Script
          src="https://yandex.ru/ads/system/context.js"
          strategy="afterInteractive"
        />
        {/* Yandex.Metrika */}
        <Script
          id="ya-metrika"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
m[i].l=1*new Date();
for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}
k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
(window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");
ym(98732439,"init",{clickmap:true,trackLinks:true,accurateTrackBounce:true,webvisor:true});`,
          }}
        />
      </body>
    </html>
  );
}
