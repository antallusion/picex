'use client';
import { useEffect } from 'react';
import './advertisement.css';

export default function Advertisement() {
  useEffect(() => {
    if (window.yaContextCb) {
      window.yaContextCb.push(() => {
        Ya.Context.AdvManager.render({
          blockId: 'R-A-12923290-1',
          renderTo: 'yandex_rtb_R-A-12923290-1',
        });
      });
    }
  }, []);

  return (
    <section className="advertisement">
      <div className="container">
        <div id="yandex_rtb_R-A-12923290-1" />
      </div>
    </section>
  );
}
