import React from "react";
import Header from "./components/header/Header";
import Footer from "./components/footer/Footer";
import Search from "./components/search/Search";
import HomePage from "./pages/HomePage";
import PhotosPage from "./pages/PhotosPage";
import { useDispatch, useSelection } from "./context/Context";
import { ADD_IMAGES, ERROR, LOADING } from "./context/reducer/actions";

import "./styles/global.css";

function App() {
  const dispatch = useDispatch();
  const { photosPage } = useSelection();
  const fetchImages = async (url) => {
    dispatch({ type: LOADING });
    const formattedUrl =
      url.startsWith("http://") || url.startsWith("https://")
        ? url
        : `https://${url}`;

    try {
      const response = await fetch("/api/images/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: formattedUrl }), // Передаем обработанный URL
      });

      const data = await response.json();
      if (response.ok) {
        dispatch({
          type: ADD_IMAGES,
          images: data.images,
          url: url,
        });
      } else {
        dispatch({
          type: ERROR,
          message: data.message || "Ошибка при загрузке изображений",
        });
      }
    } catch (err) {
      dispatch({
        type: ERROR,
        message: "Ошибка при подключении к серверу",
      });
    }
  };

  return (
    <div className='App'>
      {photosPage ? <PhotosPage onSearch={fetchImages} /> : <HomePage  onSearch={fetchImages}/>}
      <Footer />
    </div>
  );
}

export default App;
