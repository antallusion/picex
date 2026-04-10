'use client';
import Header from './header/Header';
import Footer from './footer/Footer';
import Search from './search/Search';
import HomePage from '@/views/HomePage';
import PhotosPage from '@/views/PhotosPage';
import { useDispatch, useSelection } from '@/context/Context';
import { ADD_IMAGES, ERROR, LOADING } from '@/context/reducer/actions';

export default function App() {
  const dispatch = useDispatch();
  const { photosPage } = useSelection();

  const fetchImages = async (url) => {
    dispatch({ type: LOADING });
    const formattedUrl =
      url.startsWith('http://') || url.startsWith('https://')
        ? url
        : `https://${url}`;

    try {
      const response = await fetch('/api/images/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: formattedUrl }),
      });

      const data = await response.json();
      if (response.ok) {
        dispatch({ type: ADD_IMAGES, images: data.images, url });
      } else {
        dispatch({ type: ERROR, message: data.message || 'Ошибка при загрузке изображений' });
      }
    } catch (err) {
      dispatch({ type: ERROR, message: 'Ошибка при подключении к серверу' });
    }
  };

  return (
    <div className="App">
      {photosPage ? (
        <PhotosPage onSearch={fetchImages} />
      ) : (
        <HomePage onSearch={fetchImages} />
      )}
      <Footer />
    </div>
  );
}
