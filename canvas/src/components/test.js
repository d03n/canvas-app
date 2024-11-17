import { useEffect, useRef, useState } from 'react';

const useCanvas = (draw) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    draw(ctx);
  }, [draw]);

  return canvasRef;
};

const Canvas = () => {
  const canvasRef = useRef(null);
  const [image, setImage] = useState(null); // Holds the image object
  const [previewPos, setPreviewPos] = useState(null); // Tracks preview position
  const [drawings, setDrawings] = useState([]); // Stores placed images or paths

  // Function to handle image upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        setImage(img); // Set the uploaded image
      };
    }
  };

  // Mouse move to update the preview position
  const handleMouseMove = (event) => {
    if (!image) return; // Only show the preview if an image is uploaded
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    setPreviewPos({ x, y }); // Update the preview position
  };

  // Mouse click to place the image
  const handleMouseClick = (event) => {
    if (!image) return; // Do nothing if no image is selected
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Save the placed image position
    setDrawings([...drawings, { x, y, image }]);
    setPreviewPos(null); // Clear the preview
  };

  // Redraw the canvas with all placed images and preview
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas

    // Draw all placed images
    drawings.forEach(({ x, y, image }) => {
      ctx.drawImage(image, x - image.width / 2, y - image.height / 2);
    });

    // Draw the preview image if exists
    if (previewPos && image) {
      ctx.globalAlpha = 0.5; // Set transparency for preview
      ctx.drawImage(
        image,
        previewPos.x - image.width / 2,
        previewPos.y - image.height / 2
      );
      ctx.globalAlpha = 1.0; // Reset transparency
    }
  }, [drawings, previewPos, image]);

  return (
    <div>
      <input type="file" onChange={handleImageUpload} accept="image/*" />
      <canvas
        ref={canvasRef}
        width={400}
        height={300}
        style={{ border: '1px solid black' }}
        onMouseMove={handleMouseMove}
        onClick={handleMouseClick}
      />
    </div>
  );
};

export default Canvas;
