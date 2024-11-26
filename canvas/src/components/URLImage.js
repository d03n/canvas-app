import React, { useEffect, useState, useRef } from "react";
import { Image } from "react-konva";

const URLImage = ({ src, x, y }) => {
  const [image, setImage] = useState(null);
  const imageNodeRef = useRef(null);
  const imageRef = useRef(null); // To store the image object for cleanup

  useEffect(() => {
    const loadImage = () => {
      const img = new window.Image();
      img.src = src;
      img.addEventListener("load", () => setImage(img));
      imageRef.current = img; // Store reference to clean up later
    };

    loadImage();

    return () => {
      if (imageRef.current) {
        imageRef.current.removeEventListener("load", () => setImage(null));
      }
    };
  }, [src]);

  return (
    <Image
      x={x}
      y={y}
      image={image}
      ref={imageNodeRef} // Store a reference to the Konva Image node
    />
  );
};

export default URLImage;
