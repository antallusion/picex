import React from "react";
import Advertisement from "../components/advertisement/Advertisement";
import Warning from "../components/warning/Warning";
import Photos from "../components/photos/Photos";
import Header from "../components/header/Header";
import Search from "../components/search/Search";

function PhotosPage({onSearch}) {
  return (
    <>
      <Header />
      <Search onSearch={onSearch} />
      <Advertisement />
      <Warning title="Отказ от ответсвенности" close={true}>
        Все права на изображения, полученные с использованием нашего сервиса,
        принадлежат их законным владельцам, включая, но не ограничиваясь,
        владельцами веб-сайтов, с которых данные изображения были извлечены. Мы
        не претендуем на авторские или смежные права на контент, доступный через
        наш сервис.
      </Warning>
      <Photos />
    </>
  );
}

export default PhotosPage;
