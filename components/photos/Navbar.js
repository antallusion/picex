'use client';
import Sprite from '@/UI/Sprite';

export default function Navbar({ images, setIndex, index }) {
  return (
    <nav className="photos__nav">
      <button
        className="photos__prev"
        onClick={() => setIndex((i) => (i === 0 ? i : i - 1))}
      >
        <Sprite width="8" height="12" icon="arrow-left" />
      </button>
      <div className="photos__nav-buttons">
        {images.map((_, ind) => (
          <button
            key={ind}
            className={`photos__nav-button ${index === ind ? 'photos__nav-button--active' : ''}`}
            onClick={() => setIndex(ind)}
          >
            {ind + 1}
          </button>
        ))}
      </div>
      <button
        className="photos__next"
        onClick={() => setIndex((i) => (i === images.length - 1 ? i : i + 1))}
      >
        <Sprite width="8" height="12" icon="arrow-next" />
      </button>
    </nav>
  );
}
