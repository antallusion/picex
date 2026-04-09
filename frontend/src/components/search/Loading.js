import React, { useEffect, useState } from "react";
import { FINISH_LOADING } from "../../context/reducer/actions";
import { useDispatch, useSelection } from "../../context/Context";

const titles = [
  "«Автоботы, вперед!» — Трансформеры (2007)",
  "«Это работает! Это работает!» — Звёздные войны: Эпизод I  (1999)",
  "«Вот так это делается!» — Форсаж (2001)",
];

function Loading() {
  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(0);
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState(false);
  const dispatch = useDispatch();
  const { imagesHas } = useSelection();

  useEffect(() => {
    const interval = setInterval(() => {
      if (!message) {
        setCount((count) => {
          if (count + 1.8 > 15) {
            setMessage(true);
          }

          return count + 1.8;
        });
      }

      if (width === 100) {
        clearInterval(interval);

        return;
      }

      const randNum = Math.floor(Math.random() * 20);

      if (width + randNum >= 50 && index < 1) {
        setIndex(index + 1);
      } else if (width + randNum >= 90 && index < 2) {
        setIndex(index + 1);
      }

      if (width + randNum < 98) {
        setWidth(width + randNum);
      } else if (width !== 100 && width !== 98) {
        setWidth(98);
      }

      if (imagesHas) {
        setWidth(100);
        setMessage(false);
        if (index !== 2) {
          setIndex(2);
        }
        setTimeout(() => {
          dispatch({
            type: FINISH_LOADING,
          });
        }, 1000);
      }
    }, 1800);
    return () => {
      clearInterval(interval);
    };
  }, [width, imagesHas, index, message]);

  return (
    <>
      <div className="search__loading">
        <h5 className="search__title">{titles[index]}</h5>
        <div className="search__line">
          <div
            className="search__line-item"
            style={{ width: `${width}%` }}
          ></div>
        </div>
      </div>
      {message && (
        <p className="search__message">
          Сайт объемный, мы очень стараемся, не закрывайте страницу..
        </p>
      )}
    </>
  );
}

export default Loading;
