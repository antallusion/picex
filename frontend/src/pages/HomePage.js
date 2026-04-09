import React from "react";
import About from "../components/about/About";
import Warning from "../components/warning/Warning";
import Questions from "../components/questions/Questions";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import Search from "../components/search/Search";

function HomePage({onSearch}) {
  return (
    <>
      <div className="background">
        <Header />
        <Search onSearch={onSearch} />
        <About />
        <Warning
          padding={"57px 0 44px"}
          container="homepage-container"
          title="Отказ от ответсвенности"
        >
          Все права на изображения, полученные с использованием нашего сервиса,
          принадлежат их законным владельцам, включая, но не ограничиваясь,
          владельцами веб-сайтов, с которых данные изображения были извлечены.
          Мы не претендуем на авторские или смежные права на контент, доступный
          через наш сервис.
        </Warning>
      </div>
      <Questions />
    </>
  );
}

export default HomePage;
