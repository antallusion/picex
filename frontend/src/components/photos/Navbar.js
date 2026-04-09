import React from "react";
import Sprite from "../../UI/Sprite";

function Navbar({ images, setIndex, index }) {
  return (
    <nav className="photos__nav">
      <button
        className="photos__prev"
        onClick={() =>
          setIndex((index) => {
            if (index == 0) return index;
            return index - 1;
          })
        }
      >
        <Sprite width="8" height="12" icon="arrow-left" />
      </button>
      <div className="photos__nav-buttons">
        {images.map((_, ind) => (
          <button
            className={`photos__nav-button ${
              index == ind && "photos__nav-button--active"
            }`}
            onClick={() => setIndex(ind)}
            key={ind}
          >
            {ind + 1}
          </button>
        ))}
      </div>

      <button
        className="photos__next"
        onClick={() =>
          setIndex((index) => {
            if (index == images.length - 1) return index;
            return index + 1;
          })
        }
      >
        <Sprite width="8" height="12" icon="arrow-next" />
      </button>
    </nav>
  );
}

export default Navbar;
