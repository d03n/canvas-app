import React, { useEffect, useRef, useState } from "react";

const Canvas = () => {
  const canvasRef = useRef(null);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [icons, setIcons] = useState([]);
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [iconPositions, setIconPositions] = useState([]);
  const [tempIcon, setTempIcon] = useState(null);
  const [tempIconRotation, setTempIconRotation] = useState(0);
  const [tempIconScale, setTempIconScale] = useState(1);
  const [isRotationControlsVisible, setIsRotationControlsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState(null);

  // Upload background image
  const handleBackgroundUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        setBackgroundImage(img);
      };
      img.src = URL.createObjectURL(file);
    }
  };

  const selectIcon = (icon) => {
    setSelectedIcon(icon);
  };

  // Upload icons
  const handleIconUpload = (e) => {
    const newIcons = [];
    Array.from(e.target.files).forEach((file) => {
      const img = new Image();
      img.onload = () => {
        newIcons.push(img);
        setIcons((prevIcons) => [...prevIcons, ...newIcons]);
      };
      img.src = URL.createObjectURL(file);
    });
  };

  // Handle canvas click: start placing icon
  const handleCanvasClick = (e) => {
    if (!backgroundImage) {
      alert("Please upload a background image first!");
      return;
    }

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setMousePosition({x: e.clientX, y: e.clientY});

    if (selectedIcon) {
      // Update the temporary icon state
      setTempIcon({ icon: selectedIcon, x, y, angle: 0, scale: 1 });
      setIsRotationControlsVisible(true);
    }
  };

  // Redraw canvas with background, icons, and text
  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (backgroundImage) {
      ctx.drawImage(backgroundImage, 0, 0);
    }

    // Draw placed icons
    iconPositions.forEach(({ icon, x, y, angle, scale }) => {
      ctx.save();
      ctx.translate(x, y); // Move to icon's center
      ctx.rotate((angle * Math.PI) / 180); // Rotate around the center
      ctx.scale(scale, scale); // Apply scaling
      ctx.drawImage(icon, -icon.width / 2, -icon.height / 2, icon.width, icon.height); // Draw icon
      ctx.restore();
    });

    // Draw temporary icon with rotation and scaling
    if (tempIcon) {
      ctx.save();
      ctx.translate(tempIcon.x, tempIcon.y); // Move to icon's center
      ctx.rotate((tempIconRotation * Math.PI) / 180); // Rotate around its center
      ctx.scale(tempIconScale, tempIconScale); // Apply scaling
      ctx.drawImage(tempIcon.icon, -tempIcon.icon.width / 2, -tempIcon.icon.height / 2, tempIcon.icon.width, tempIcon.icon.height); // Draw at the center
      ctx.restore();
    }
  };

  // Handle rotation change
  const handleRotationChange = (e) => {
    const rotation = parseInt(e.target.value);
    setTempIconRotation(rotation); // Only update rotation value
  };

  // Handle scaling change
  const handleScaleChange = (e) => {
    const scale = parseFloat(e.target.value);
    setTempIconScale(scale); // Only update scale value
  };

  // Confirm icon placement with adjusted rotation and scale
  const handleConfirmPlacement = () => {
    if (tempIcon) {
      const updatedIcon = { ...tempIcon, angle: tempIconRotation, scale: tempIconScale };
      setIconPositions((prev) => [...prev, updatedIcon]);
      setTempIcon(null);
      setSelectedIcon(null);
      setIsRotationControlsVisible(false);
    }
  };

  // Save canvas as JPG
  const handleSaveImage = () => {
    const canvas = canvasRef.current;
    const dataURL = canvas.toDataURL("image/jpeg", 1.0);
    const link = document.createElement("a");
    link.download = "canvas-output.jpg";
    link.href = dataURL;
    link.click();
  };

  // Trigger canvas redraw when tempIcon, rotation, or scale changes
  useEffect(() => {
    redrawCanvas();
  }, [tempIcon, tempIconRotation, tempIconScale, iconPositions]);

  const checkMouse = (e) => {
    console.log(`${e.clientX} ${e.clientY}`);
  }

  return (
    <div className="flex justify-center">
      {/* Icon uploaded */}
      <div className="w-48 p-4 border border-gray-300 mr-4">
        <p>Uploaded Icons:</p>
        <input type="file" onChange={handleIconUpload} accept="image/*" multiple className="mb-4" />
        <div className="space-y-2">
          {icons.map((icon, index) => (
            <img
              key={index}
              src={icon.src}
              alt={`icon-${index}`}
              className="w-12 cursor-pointer"
              onClick={() => selectIcon(icon)}
            />
          ))}
        </div>
      </div>

      <div>
        <input type="file" onChange={handleBackgroundUpload} accept="image/*" />
        <canvas
          ref={canvasRef}
          width="800"
          height="600"
          className="border border-black mt-2 block"
          onClick={handleCanvasClick}
        ></canvas>
        <button
          onClick={handleSaveImage}
          className="mt-4 p-2 bg-blue-500 text-white rounded"
        >
          Save as JPG
        </button>

        <br />

        <label className="block mt-4">Text:</label>
        <input type="text" className="border border-gray-300 p-2 w-full" placeholder="Enter text" />
        <button
          className="mt-2 p-2 bg-green-500 text-white rounded"
        >
          Add Text to Canvas
        </button>

        {isRotationControlsVisible && mousePosition && (
          <div className="absolute bg-blue-500 text-white px-4 py-2 rounded-md" style={{
            left: mousePosition.x,
            top: mousePosition.y,
            transform: 'translate(-50%, -50%)',
          }}>
            <label>Adjust Rotation:</label>
            <input
              type="range"
              min="0"
              max="360"
              value={tempIconRotation}
              onChange={handleRotationChange}
              className="w-full"
            />
            <span>{tempIconRotation}°</span>
            <br />

            <label>Adjust Scale:</label>
            <input
              type="range"
              min="0.005"
              max="2"
              step="0.0005"
              value={tempIconScale}
              onChange={handleScaleChange}
              className="w-full"
            />
            <span>{tempIconScale.toFixed(2)}x</span>

            <br />
            <button
              onClick={handleConfirmPlacement}
              className="mt-2 p-2 bg-yellow-500 text-white rounded"
            >
              OK
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Canvas;
