'use client';
import { useState } from 'react';
import Sprite from '@/UI/Sprite';
import './warning.css';

export default function Warning({
  padding = null,
  container = 'container',
  title = '',
  close = false,
  children = [],
}) {
  const [showWarning, setShowWarning] = useState(true);

  if (!showWarning) return null;
  return (
    <section className="warning" style={padding ? { padding } : undefined}>
      <div className={container}>
        <div className="warning__block">
          <div className="warning__top">
            <Sprite icon="warning" width="20" height="20" />
            <h5 className="warning__title">{title}</h5>
          </div>
          <p className="warning__text">{children}</p>
          {close && (
            <button className="warning__close" onClick={() => setShowWarning(false)}>
              <Sprite width="14" height="14" icon="close" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
