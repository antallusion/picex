'use client';

export default function Sprite({ icon = '', classIcon = null, width = '', height = '' }) {
  return (
    <svg className={classIcon || undefined} width={width} height={height}>
      <use href={`/images/icons.svg#${icon}`} />
    </svg>
  );
}
