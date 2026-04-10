'use client';
import JSZip from 'jszip';
import Sprite from '@/UI/Sprite';
import { useDispatch, useSelection } from '@/context/Context';
import { CANCEL_ALL, CHECK_ALL } from '@/context/reducer/actions';

function handleClick(checked) {
  const zip = new JSZip();
  checked.forEach((item) => {
    zip.file(item.name + '.' + item.size.format, item.size.buffer.data);
  });
  zip.generateAsync({ type: 'blob' }).then((blob) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.click();
  });
}

export default function Zip() {
  const { checked } = useSelection();
  const dispatch = useDispatch();

  return (
    <div className="form__zip">
      <button
        className="form__zip-button form__check-all"
        type="button"
        onClick={() => dispatch({ type: CHECK_ALL })}
      >
        <Sprite icon="select-check" width="14" height="14" />
        <span>Выделить все</span>
      </button>
      <button
        className="form__zip-button form__cancel-all"
        disabled={checked.length === 0}
        type="button"
        onClick={() => dispatch({ type: CANCEL_ALL })}
      >
        <Sprite icon="select-cancel" width="14" height="14" />
        <span>Отменить</span>
      </button>
      <button
        type="button"
        className="form__zip-button form__zip-download"
        onClick={() => handleClick(checked)}
      >
        <Sprite icon="download" width="14" height="14" />
        <span> Скачать выделенное</span>
        <span>({checked.length})</span>
      </button>
    </div>
  );
}
