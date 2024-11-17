import { useEffect, useRef, useState } from "react";

const CanvasApp = () => {
  const canvasRef = useRef(null);
  const [ backgroundImage, setBackgroundImage ] = useState(null);

  const [ canvasElements, setCanvasElements ] = useState([]); // save only confirm element
  const [ uploadElements, setUploadElements ] = useState([])
  
  const [ selectedElement, setSelectedElement ] = useState(null);
  const [ tempElement, setTempElement ] = useState(null);
  const [ tempElementRotation, setTempElementRotation ] = useState(180);
  const [ tempElementScale, setTempElementScale ] = useState(1);
  const [ isAdjustControlsVisible, setAdjustControlsVisible ] = useState(false);

  const [ isFirstPlaced, setIsFirtPlaced ] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // Upload background image
  const handleBackgroundUpload = (e) => {
    const file = e.target.files[0];
    const MAX_WIDTH = 800; // Set your desired maximum width
    const MAX_HEIGHT = 600; // Optional: Set a maximum height if needed
  
    if (file) {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
  
        // Calculate the new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;
  
        if (width > MAX_WIDTH) {
          const scaleFactor = MAX_WIDTH / width;
          width = MAX_WIDTH;
          height *= scaleFactor; // Scale height proportionally
        }
  
        if (height > MAX_HEIGHT) {
          const scaleFactor = MAX_HEIGHT / height;
          height = MAX_HEIGHT;
          width *= scaleFactor; // Scale width proportionally
        }
  
        // Update the canvas size to fit the new dimensions
        canvas.width = width;
        canvas.height = height;
  
        // Draw the resized image on the canvas
        ctx.drawImage(img, 0, 0, width, height);
  
        // Store the image in state
        setBackgroundImage({type: "img", value: img, x: 0, y: 0, width, height});
      };
      img.src = URL.createObjectURL(file);
    }
  };
  

  const handleCanvasClick = (e) => {
    if (!backgroundImage) {
      alert("Please upload a background image first!");
      return;
    }

    if (isDragging) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (selectedElement) {
      // Update the temporary icon state
      setTempElement({ 
        id: canvasElements.length, 
        type: "img", 
        value: selectedElement.value, 
        x: x, 
        y: y, 
        angle: 0, 
        scale: 1, 
        width: selectedElement.width, 
        height: selectedElement.height
      });

      setAdjustControlsVisible(true);

      setIsFirtPlaced(true);
    }
  };

  const handleMouseDown = (e) => {
    // if (!isFirstPlaced) return;  
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if an element is clicked
    const element = canvasElements.find(
      (e) =>
        x >= e.x &&
        x <= e.x + e.width &&
        y >= e.y &&
        y <= e.y + e.height
    );

    console.log(element);

    if (element) {
      setTempElement(element);
      setDragOffset({ x: x - element.x, y: y - element.y });
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    
    if (isFirstPlaced) {
      setCanvasElements(canvasElements.map((prev) => prev.id === tempElement.id ? {
        ...prev, // Spread the previous state to retain all other properties
        x: x - dragOffset.x, // Modify `x` relative to its previous value
        y: y - dragOffset.y, // Modify `y` relative to its previous value
      } : prev
    ));
  } else {
      // Update element's position
      setTempElement((prev) => ({
        ...prev, // Spread the previous state to retain all other properties
        x: x - dragOffset.x, // Modify `x` relative to its previous value
        y: y - dragOffset.y, // Modify `y` relative to its previous value
      }));
    }
  };

  const handleMouseUp = () => {
    // if (!isFirstPlaced) return;
    
    setTempElement(null);
    setIsDragging(false);
    setIsFirtPlaced(false);
    // Reset dragging state
    setTimeout(() => setIsDragging(false), 0);
  };

  // Upload icons
  const handleIconUpload = (e) => {
    const newIcons = [];
    Array.from(e.target.files).forEach((file) => {
      const img = new Image();
      img.onload = () => {
        newIcons.push({id: uploadElements.length, type: "img", value: img, x: 0, y: 0, angle: 0, scale: 1, width: img.width, height: img.height});
        setUploadElements((prev) => [...prev, ...newIcons]);
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const setSelectElement = (id) => {
    const uploadElement = uploadElements.find((e) => e.id === id);
    const img = uploadElement.value;
    setSelectedElement({value: img, x: 0, y: 0, angle: 0, scale: 1, width: img.width, height: img.height});
  };

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background Image
    if (backgroundImage) {
      ctx.drawImage(backgroundImage.value, 0, 0, backgroundImage.width, backgroundImage.height);
    }

    if (tempElement) {
      canvasElements.filter((e) => e.id !== tempElement.id).forEach(({ value, x, y, angle, scale }) => {
        ctx.save();
        ctx.translate(x, y); // Move to icon's center
        ctx.rotate((angle * Math.PI) / 180); // Rotate around the center
        ctx.scale(scale, scale); // Apply scaling
        ctx.drawImage(value, -value.width / 2, -value.height / 2, value.width, value.height); // Draw icon
        ctx.restore();
      }); 
    } else {
      canvasElements.forEach(({ value, x, y, angle, scale }) => {
        ctx.save();
        ctx.translate(x, y); // Move to icon's center
        ctx.rotate((angle * Math.PI) / 180); // Rotate around the center
        ctx.scale(scale, scale); // Apply scaling
        ctx.drawImage(value, -value.width / 2, -value.height / 2, value.width, value.height); // Draw icon
        ctx.restore();
      });
    }


    // Draw temporary icon with rotation and scaling
    if (tempElement) {
      ctx.save();
      ctx.translate(tempElement.x, tempElement.y); // Move to icon's center
      ctx.rotate((tempElementRotation * Math.PI) / 180); // Rotate around its center
      ctx.scale(tempElementScale, tempElementScale); // Apply scaling
      ctx.drawImage(tempElement.value, -tempElement.value.width / 2, -tempElement.value.height / 2, tempElement.value.width, tempElement.value.height); // Draw at the center
      ctx.restore();
    }
  };

  // Handle rotation change
  const handleRotationChange = (e) => {
    const rotation = parseInt(e.target.value);
    setTempElementRotation(rotation); // Only update rotation value
  };

  // Handle scaling change
  const handleScaleChange = (e) => {
    const scale = parseFloat(e.target.value);
    setTempElementScale(scale); // Only update scale value
  };

  // // Confirm icon placement with adjusted rotation and scale
  // const handleConfirmPlacement = () => {
  //   if (tempElement) {
  //     const updatedIcon = { ...tempElement, angle: tempElementRotation, scale: tempElementScale };
  //     setIconPositions((prev) => [...prev, updatedIcon]);
  //     setTempIcon(null);
  //     setSelectedIcon(null);
  //     setIsRotationControlsVisible(false);
  //   }
  // };

  const saveElement = () => {
    setTempElement(null);
    setSelectedElement(null);
    setTempElementRotation(0);
    setTempElementScale(1);
    setAdjustControlsVisible(false);
    setCanvasElements((prev) => [...prev, { 
      id: canvasElements.length, 
      type: tempElement.type, 
      value: tempElement.value, 
      x: tempElement.x, 
      y: tempElement.y, 
      angle: tempElementRotation, 
      scale: tempElementScale, 
      width: tempElement.width * tempElementScale, 
      height: tempElement.height * tempElementScale
    }] );
  }

  // Trigger canvas redraw when tempIcon, rotation, or scale changes
  useEffect(() => {
    redrawCanvas();
  }, [canvasElements, uploadElements, tempElement, tempElementRotation, tempElementScale]);
  
  return (
    <div className="mx-20 mt-10">
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 bg-slate-300 rounded-md gap-4 flex justify-center">
          <canvas
            ref={canvasRef}
            width="400"
            height="300"
            className="border rounded-md border-black my-2 block "
            onClick={handleCanvasClick}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          ></canvas>
        </div>
        <div className="col-span-12 grid grid-cols-12 bg-slate-300 rounded-md">
          <div className="col-span-12 flex items-center"> 
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" for="file_input">Upload file</label>
            <input className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" 
              id="file_input" 
              type="file"
              onChange={handleBackgroundUpload}
            ></input>
          </div>
          <div className="col-span-12">
            {/* upload Icon */}
            <div className="col-span-12">
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" for="file_input">Upload Image</label>
              <input className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" 
                id="file_input" 
                type="file"
                onChange={handleIconUpload}
              ></input>
            </div>
            <div className="col-span-12 grid grid-cols-12 gap-2 p-2">
              {
                uploadElements
                .filter((e) => e.type === "img")
                .map((e, index) => (
                  <img
                    key={index}
                    src={e.value.src}
                    alt={`icon-${index}`}
                    className="col-span-2 p-2 h-14 w-14 rounded-md cursor-pointer bg-slate-500"
                    onClick={() => setSelectElement(e.id)}
                  />
                ))
              }
            </div>
            <div className="col-span-12">
              {
                isAdjustControlsVisible && (
                  <div className="flex bg-blue-500 text-white px-4 py-2 rounded-md" style={{
                  }}>
                    <label>Adjust Rotation:</label>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={tempElementRotation}
                      onChange={handleRotationChange}
                      className="w-full"
                    />
                    <span>{tempElementRotation}°</span>
                    <br />

                    <label>Adjust Scale:</label>
                    <input
                      type="range"
                      min="0.005"
                      max="2"
                      step="0.0005"
                      value={tempElementScale}
                      onChange={handleScaleChange}
                      className="w-full"
                    />
                    <span>{tempElementScale.toFixed(2)}x</span>

                    <br />
                    <button
                      onClick={saveElement}
                      className="mt-2 p-2 bg-yellow-500 text-white rounded"
                    >
                      OK
                    </button>
                  </div>
                )
              }
            </div>
          </div>
          <div className="col-span-12">
            <p>Draw</p>
          </div>
          <div className="col-span-12">
            <p>Text</p>
          </div>
          <div className="col-span-12">
            <p>Confirm</p>
            <button
              onClick={saveElement}
              className="mt-2 p-2 bg-yellow-500 text-white rounded"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CanvasApp;