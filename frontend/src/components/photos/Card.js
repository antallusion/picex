import React, { useRef } from "react";
import Sprite from "../../UI/Sprite";
import { useDispatch } from "../../context/Context";
import { CHECK } from "../../context/reducer/actions";

function download(array, format, name) {
  const uint = new Uint8Array(array);
  const buffer = uint.buffer;
  const blob = new Blob([buffer], { type: "image/" + format });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name + "." + format;
  a.click();
}

function Card(props) {
  const dispatch = useDispatch();
  const size = `${props.size.width} x ${props.size.height}`;
  const ref = useRef();
  const name = props.name;

  return (
    <div className="photos__card">
      <button
        className="photos__card-button"
        onClick={() => {
          const id = props.id;
          dispatch({
            type: CHECK,
            id,
          });
        }}
      >
        <div className="photos__container">
          <div
            className={`photos__check ${
              props.check ? "photos__check--active" : ""
            }`}
          >
            {props.check && <Sprite icon="check-icon" width="38" height="38" />}
          </div>
          <img
            className="photos__image"
            ref={ref}
            alt="image"
            src={props.src}
          />
          <div className="photos__size">
            <span>{size}</span>
          </div>
          <div className="photos__file-size">{props.size.fileSize}</div>
        </div>
      </button>
      <div className="photos__card-wrapper">
        <h5 className="photos__name">
          {name.length > 14 ? props.name.slice(0, 14) + "..." : name}
        </h5>
        <button
          className="photos__copy"
          onClick={() => navigator.clipboard.writeText(props.src)}
        >
          <Sprite width="16" height="13" icon="url" />
        </button>
      </div>
      <div className="photos__border"></div>
      <div className="photos__bottom">
        <div className={`format format--${props.size.format}`}>
          <span>{props.size.format.toUpperCase()}</span>
        </div>
        <button
          className="photos__download"
          onClick={() => {
            download(props.size.buffer.data, props.size.format, props.name);
          }}
        >
          <Sprite width="14" height="14" icon="download" />
        </button>
      </div>
    </div>
  );
}

export default Card;
