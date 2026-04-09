import React, { useState, useEffect, useRef } from "react";
import Sprite from "../../UI/Sprite";
import { SORT } from "../../context/reducer/actions";
import { useDispatch } from "../../context/Context";

const items = ["По имени", "По размеру", "По длине", "По высоте"];

function List({ selected, onClose, opened, button, setSelected }) {
  const ref = useRef();
  const dispatch = useDispatch()
  useEffect(() => {
    const handleClick = (e) => {
      if (
        ref.current &&
        !ref.current.contains(e.target) &&
        e.target !== button
      ) {
        onClose();
      }
    };

    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [opened]);

  return (
    <div className="form__select-list" ref={ref}>
      {items.map((item) => (
        <button
          key={item}
          onClick={() => {
            setSelected(item);
            onClose();
      
            dispatch({
              type: SORT,
              sort:item,
            });
          }}
          className={`form__list-button ${
            item == selected ? "form__list-button--active" : ""
          }`}
        >
          <span>{item}</span>
          {item == selected && (
            <Sprite icon="select-check" width="14" height="14" />
          )}
        </button>
      ))}
    </div>
  );
}

function Select() {
  const [selected, setSelected] = useState("По размеру");
  const [opened, setOpened] = useState(false);
  const refButton = useRef();

  return (
    <div className="form__select">
      <button
        className="form__select-button form__input"
        type="button"
        ref={refButton}
        onClick={() => setOpened((o) => !o)}
      >
        <span>{selected}</span>
        <Sprite icon="select-icon" width="10" height="16" />
      </button>
      {opened && (
        <List
          opened={opened}
          selected={selected}
          setSelected={setSelected}
          button={refButton.current}
          onClose={() => setOpened(false)}
        />
      )}
    </div>
  );
}

export default Select;
