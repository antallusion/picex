'use client';
import Card from './Card';
import { useSelection } from '@/context/Context';

export default function ImageGrid({ index }) {
  const { images } = useSelection();
  return (
    <div className="photos__images">
      {images.length > 0 && images[index].map((image, i) => <Card key={i} {...image} />)}
    </div>
  );
}
