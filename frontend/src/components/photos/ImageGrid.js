import React from "react";
import Card from "./Card";
import { useSelection } from "../../context/Context";

function ImageGrid({ index }) {
  const { images } = useSelection();
  return (
    <div className="photos__images">
      {images.length > 0 &&
        images[index].map((image, index) => <Card key={index} {...image} />)}
    </div>
  );
}

export default ImageGrid;
