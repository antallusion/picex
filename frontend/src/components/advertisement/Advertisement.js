import React, { useEffect } from 'react';

import './advertisement.css';

function Advertisement() {
  useEffect(() => {
    // Проверяем, что `yaContextCb` доступен
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
        {/* Контейнер для рекламы */}
        <div id="yandex_rtb_R-A-12923290-1"></div>
      </div>
    </section>
  );
}

export default Advertisement;

<!-- Yandex.RTB R-A-12923290-1 -->
<div id="yandex_rtb_R-A-12923290-1"></div>
<script>
window.yaContextCb.push(() => {
    Ya.Context.AdvManager.render({
        "blockId": "R-A-12923290-1",
        "renderTo": "yandex_rtb_R-A-12923290-1"
    })
})
</script>