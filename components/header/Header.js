'use client';
import Sprite from '@/UI/Sprite';
import { useSelection } from '@/context/Context';
import './header.css';

export default function Header() {
  const { photosPage } = useSelection();
  return (
    <header className={`header ${photosPage ? 'header--photos-page' : ''}`}>
      <div className="header__wrapper">
        <Sprite classIcon="header__logo" icon="logo" width={184} height={36} />
        {!photosPage && (
          <>
            <h1 className="header__title">Скачать изображения</h1>
            <p className="header__subtitle">с любого сайта</p>
          </>
        )}
      </div>
    </header>
  );
}
