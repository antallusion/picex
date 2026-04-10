'use client';
import { useDispatch, useSelection } from '@/context/Context';
import { SORT } from '@/context/reducer/actions';
import Select from './Select';
import Zip from './Zip';
import Find from './Find';
import './form.css';

export default function Form() {
  const { formats, activeFormat } = useSelection();
  const dispatch = useDispatch();

  return (
    <form className="form">
      <div className="form__item">
        <h5 className="form__item-title">Сортировать изображения</h5>
        <Select />
      </div>
      <div className="form__item">
        <h5 className="form__item-title">По типу</h5>
        <div className={`form__formats ${activeFormat.length > 0 ? 'form__formats--choice' : ''}`}>
          {Object.keys(formats).map((key) => (
            <button
              key={key}
              type="button"
              className={`format format--${key} ${key === activeFormat ? 'format--active' : ''}`}
              onClick={() => dispatch({ type: SORT, format: key })}
            >
              <span>{key.toUpperCase()}</span>
              <span className="format-length"> ({formats[key].length})</span>
            </button>
          ))}
        </div>
      </div>
      <div className="form__item">
        <h5 className="form__item-title">Содержит</h5>
        <Find />
        <p className="form__bottom-text">Учитывает URL, название, формат и размер</p>
      </div>
      <div className="form__item">
        <h5 className="form__item-title">Скачать</h5>
        <Zip />
      </div>
    </form>
  );
}
