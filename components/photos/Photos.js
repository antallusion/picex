'use client';
import { useState } from 'react';
import Form from '@/components/form/Form';
import ImageGrid from './ImageGrid';
import Navbar from './Navbar';
import { useSelection } from '@/context/Context';
import './photos.css';

export default function Photos() {
  const [index, setIndex] = useState(0);
  const { images, pageUrl, allImages } = useSelection();

  return (
    <section className="photos">
      <div className="container">
        <div className="photos__content">
          <Form />
          <div className="photos__wrapper">
            <div className="photos__top">
              <p className="photos__text">
                Показано {images.length && images[index].length} из {allImages.length} изображений с
                сайта <b>{pageUrl}</b>
              </p>
              <div className="photos__top-navbar">
                <Navbar images={images} setIndex={setIndex} index={index} />
              </div>
            </div>
            <ImageGrid index={index} />
            <div className="photos__bottom-navbar">
              <Navbar images={images} setIndex={setIndex} index={index} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
