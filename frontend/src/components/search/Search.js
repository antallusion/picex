import React, { useState } from "react";
import Sprite from "../../UI/Sprite";
import Loading from "./Loading";
import { useSelection } from "../../context/Context";

import "./search.css";

function Search({ onSearch = () => null }) {
  const [url, setUrl] = useState("");
  const { loading, images, errorMessage } = useSelection();
  const handleSearch = (e) => {
    e.preventDefault();
    if (url) {
      onSearch(url);
    }
  };

  return (
    <section
      className={`search ${images.length && !loading && "search--white"}`}
    >
      <form className="search__form" onSubmit={handleSearch}>
        <div className="search__top">
          <div className="search__item">
            <input
              className={`search__input ${loading ? "search__input--loading" : ""}`}
              type="search"
              value={url}
              disabled={loading && true}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Введите любую ссылку"
              required
            />
            <Sprite classIcon="search__url" width={17} height={14} icon="url" />
          </div>
          <button
            className={`search__button ${loading && "search__button--loading"}`}
            type="submit"
            disabled={loading && true}
          >
            <Sprite
              icon="download"
              width="14"
              height="14"
              classIcon="search__icon"
            />
            {loading ? <span>Скачиваем...</span> : <span>Скачать</span>}
          </button>
        </div>
        {loading && <Loading />}
        {errorMessage && <p className="search__error">{errorMessage}</p>}
      </form>
    </section>
  );
}

export default Search;
