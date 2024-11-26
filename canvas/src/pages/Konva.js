import React, { useRef, useState, useEffect } from "react";
import { Stage, Layer, Transformer, Image as KonvaImage } from "react-konva";
import Pallete from "../components/Palette";

const TransformableImage = ({ imageProps, isSelected, onSelect, onChange }) => {
  const imageRef = useRef();
  const trRef = useRef();

  useEffect(() => {
    if (isSelected) {
      // Attach transformer
      trRef.current.nodes([imageRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <div>
      <KonvaImage
        onClick={onSelect}
        onTap={onSelect}
        ref={imageRef}
        {...imageProps}
        draggable
        onDragEnd={(e) => {
          onChange({
            ...imageProps,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={(e) => {
          const node = imageRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          // Reset scale after applying to dimensions
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            ...imageProps,
            x: node.x(),
            y: node.y(),
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(5, node.height() * scaleY),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            // Limit resizing to a minimum size
            if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </div>
  );
};

const KonvaCanvas = () => {
  const [images, setImages] = useState([]);
  const [presets, setPresets] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const compRef = useRef();

  const handleUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const img = new window.Image();
      img.onload = () => {
        const newImage = {
          x: 50,
          y: 50,
          width: img.width,
          height: img.height,
          image: img,
          id: `image-${images.length + 1}`,
        };
        setImages((prev) => [...prev, newImage]);
      };
      img.src = URL.createObjectURL(file);
    }
  };

  const checkDeselect = (e) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      setSelectedId(null);
    }
  };

  return (
    <div className="mx-32 my-10 shadow-lg"
      ref={compRef}
    >
      <Pallete></Pallete>
      <input
        type="file"
        onChange={handleUpload}
        style={{ margin: "10px" }}
      />
      <Stage
        // width={window.innerWidth}
        // height={window.innerHeight}
        width={compRef.current?.getBoundingClientRect()?.width || 1024}
        height={800}
        onMouseDown={checkDeselect}
        onTouchStart={checkDeselect}
      >
        <Layer>
          {images.map((image, i) => (
            <TransformableImage
              key={image.id}
              imageProps={image}
              isSelected={image.id === selectedId}
              onSelect={() => setSelectedId(image.id)}
              onChange={(newAttrs) => {
                const imgs = images.slice();
                imgs[i] = newAttrs;
                setImages(imgs);
              }}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
};

export default KonvaCanvas;
