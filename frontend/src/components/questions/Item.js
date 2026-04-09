import React from "react";
import Sprite from "../../UI/Sprite";

function Item({ title, pointList,list, children }) {
  return (
    <li className="questions__item">
      <div className="questions__top">
        <Sprite icon="question" width="32" height="32" />
        <h3 className="questions__item-title">{title}</h3>
      </div>
      <div className="questions__block">
        <p className="questions__text"> {children}</p>
        {pointList && (
          <ul className="questions__point-list">
            {pointList.map((text,index) => (
              <li className="questions__point-item" key={index}>{text}</li>
            ))}
          </ul>
        )}
        {list &&  (
          <ol className="questions__number-list">
            {list.map((text,index) => (
              <li className="questions__number-item" key={index}>{text}</li>
            ))}
          </ol>
        )}
      </div>
    </li>
  );
}

export default Item;
