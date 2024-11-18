import { useEffect, useRef, useState } from "react";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

/* 
  Data structure:
  drawline: {
    id,
    type,
    value: {x: [], y: []},
  }
  
  img: {
    id,
    type,
    value: {img, x, y },
  }
  - click img icon
  - click on canvas, start place
  - drag to adjust position
  - adjust rotation, scale

  text: {
    id,
    type,
    value: {text, x, y},
  }
  - click on text icon
  - click on canvas to place textbox
  - type text on textbox and click confirm

  polygon: {
    id,
    type,
    value: {x: [], y: [], fillColor},
  }
  - click on polygon icon
  - click on canvas to start first position
  - click ok button
  - add-on: color picker


  type = {
    img,
    text,
    line,
    fill
  }
*/




const Canvas = () => {
  const canvasRef = useRef(null);
  const [ backgroundImage, setBackgroundImage ] = useState(null);

  const [ canvasElements, setCanvasElements ] = useState([]);
  const [ uploadElements, setUploadElements ] = useState([])
  
  const [ selectedElement, setSelectedElement ] = useState(null);
  const [ tempElement, setTempElement ] = useState(null);

  // for img
  const [ isPlaced, setIsPlaced ] = useState(false);
  const [ dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [ isDragging, setIsDragging] = useState(false);

  const [ isType, setIsType ] = useState(null);

  // Upload background image
  const handleBackgroundUpload = (e) => {
    const file = e.target.files[0];
    const MAX_WIDTH = 800; // Set your desired maximum width
    const MAX_HEIGHT = 600; // Optional: Set a maximum height if needed
  
    if (file) {
      // clear saveed canvas elements
      setCanvasElements([]);

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

    if (isPlaced) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    drawLine(x, y);


    if (selectedElement) {
      // Update the temporary icon state
      setTempElement({ 
        id: canvasElements.length, 
        type: "img", 
        value: selectedElement.value, 
        x: x, 
        y: y,
        worldX: e.clientX, 
        worldY: e.clientY,
        angle: 0, 
        scale: 1, 
        width: selectedElement.width, 
        height: selectedElement.height
      });

      setIsPlaced(true);
    }
  };

  const handleMouseDown = (e) => {
    if (!isPlaced) return;  
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if an element is clicked
    // const element = canvasElements.find(
    //   (e) =>
    //     x >= e.x &&
    //     x <= e.x + e.width &&
    //     y >= e.y &&
    //     y <= e.y + e.height
    // );

    // if (element) {
    //   setTempElement(element);
    //   setDragOffset({ x: x - element.x, y: y - element.y });
    //   setIsDragging(true);
    // }

    if (tempElement) {
      setDragOffset({ x: x - tempElement.x, y: y - tempElement.y });
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setTempElement((prev) => ({
      ...prev, // Spread the previous state to retain all other properties
      x: x - dragOffset.x, // Modify `x` relative to its previous value
      y: y - dragOffset.y, // Modify `y` relative to its previous value
      worldX: e.clientX - dragOffset.x,
      worldY: e.clientY - dragOffset.y,
    }));
  };

  const handleMouseUp = () => {
    if (!isPlaced) return;
    
    setIsDragging(false);
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


  // set select element before place elemet on canvas
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

    canvasElements.forEach(({ value, x, y, angle, scale }) => {
      ctx.save();
      ctx.translate(x, y); // Move to icon's center
      ctx.rotate((angle * Math.PI) / 180); // Rotate around the center
      ctx.scale(scale, scale); // Apply scaling
      ctx.drawImage(value, -value.width / 2, -value.height / 2, value.width, value.height); // Draw icon
      ctx.restore();
    });


    // Draw temporary icon with rotation and scaling
    if (tempElement) {
      if (tempElement.type !== "img") return;
      ctx.save();
      ctx.translate(tempElement.x, tempElement.y);
      ctx.rotate((tempElement.angle * Math.PI) / 180);
      ctx.scale(tempElement.scale, tempElement.scale);
      ctx.drawImage(tempElement.value, -tempElement.value.width / 2, -tempElement.value.height / 2, tempElement.value.width, tempElement.value.height);
      ctx.restore();
    }
    
  };

  // Handle rotation change
  const handleRotationChange = (e) => {
    const rotation = parseInt(e.target.value);
    setTempElement((prev) => ({...prev, angle: rotation}))
    console.log(tempElement);
  };

  // Handle scaling change
  const handleScaleChange = (e) => {
    const scale = parseFloat(e.target.value);
    setTempElement((prev) => ({...prev, scale: scale}))
  };

  const cancelElement = () => {
    setTempElement(null);
    setSelectedElement(null);
    setIsPlaced(false);
  }

  const saveElement = () => {
    setTempElement(null);
    setSelectedElement(null);
    setCanvasElements((prev) => [...prev, 
      tempElement
    ] );

    setIsPlaced(false);
  }

  const onInitialize = () => {
    setTempElement({
      id: canvasElements.length,
      type: "point", 
      value: null, 
      x: [ ], 
      y: [ ], 
      worldX: [ ], 
      worldY: [ ], 
      angle: 0, 
      scale: 1, 
      width: 0, 
      height: 0, 
    });
  }

  const drawLine = (x, y, worldX, worldY) => {
    setTempElement((prev) => ({
      id: canvasElements.length,
      type: "point", 
      value: null, 
      x: [...(prev?.x || []), x], // Append new x to existing x array or initialize as an array
      y: [...(prev?.y || []), y], // Append new y to existing y array or initialize as an array
      worldX: [...(prev?.worldX || []), worldX], // Append new worldX or initialize as an array
      worldY: [...(prev?.worldY || []), worldY], // Append new worldY or initialize as an array
      angle: 0, 
      scale: 1, 
      width: selectedElement?.width || 0, // Safely access width
      height: selectedElement?.height || 0, // Safely access height
    }));
    console.log(tempElement);
  };



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
  }, [canvasElements, uploadElements, tempElement]);
  
  return (
    <div className="bg-white p-4 rounded-md border-b-2 mb-4">
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-4"> 
          <label className="col-span-12 block mb-2 text-sm font-medium " for="file_input">
            Upload file
          </label>
          <input className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" 
            id="file_input" 
            type="file"
            onChange={handleBackgroundUpload}
          ></input>
        </div>
        <div className="col-span-11 bg-slate-200 rounded-md gap-4 flex justify-center">
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
        <div className="col-span-1 flex flex-col overflow-x items-center bg-slate-200 rounded-md">
          <div className=" bg-slate-300 p-2 rounded-md mb-2">
            <div className="">
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" for="file_input">
                Upload Image
                </label>
              <input className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" 
                id="file_input" 
                type="file"
                onChange={ handleIconUpload }
              ></input>
            </div>
            <div className="col-span-6 flex flex-col items-center overflow-y-auto gap-2 p-2 h-44">
              {
                uploadElements
                .filter((e) => e.type === "img")
                .map((e, index) => (
                  <img
                    key={index}
                    src={e.value.src}
                    alt={`icon-${index}`}
                    className="p-2 h-10 w-10 rounded-md cursor-pointer bg-blue-400"
                    onClick={() => setSelectElement(e.id)}
                  />
                ))
              }
            </div>
          </div>
          <div className="col-span-12 flex flex-col items-center gap-2  rounded-md border-b-2 mb-4">
            <p className="col-span-12">Draw</p>
            <button className="col-span-12 bg-blue-400 h-10 w-10 rounded-md" >
              <FontAwesomeIcon icon="fa-solid fa-slash" size="2x"/>
            </button>
            <button className="col-span-12 bg-blue-400 h-10 w-10 rounded-md">
              <FontAwesomeIcon icon="fa-solid fa-share-nodes" size="2x"/>
            </button>
            <button className="col-span-12 bg-blue-400 h-10 w-10 rounded-md">
              <FontAwesomeIcon icon="fa-solid fa-t" size="2x"/>
            </button>
            <input type="color" class="col-span-12 p-1 h-10 w-14 block bg-blue-400 border border-gray-200 cursor-pointer rounded-lg disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700" id="hs-color-input" value="#00000" title="Choose your color"></input>
          </div>
          <div className="col-span-12 bg-slate-300 rounded-md p-4 border-b-2 mb-4">
            <p>Text</p>
          </div>
        </div>
        <div className="col-span-4 border-l-2 pl-4">
          <div className="col-span-12">
            {
              tempElement && (
                <div 
                  className="absolute grid grid-cols-12 gap-4 bg-blue-500 text-white p-4 rounded-md w-72 mr-10" 
                  style={{ 
                    top: `${tempElement.worldY - tempElement.height / 2 }px`,
                    left: `${tempElement.worldX - tempElement.width / 2 - tempElement.width }px` 
                  }}
                >
                  <div className="col-span-9">
                    <label>Adjust Rotation:</label>
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      value={tempElement.angle}
                      onChange={handleRotationChange}
                      className="w-full"
                    />
                    <span>{tempElement.angle}°</span>
                  </div>
                  <div className="col-span-9">
                    <label>Adjust Scale:</label>
                    <input
                      type="range"
                      min="0.005"
                      max="2"
                      step="0.0005"
                      value={tempElement.scale}
                      onChange={handleScaleChange}
                      className="w-full"
                    />
                    <span>{tempElement.scale.toFixed(2)}x</span>
                  </div>
                  <button
                    onClick={saveElement}
                    className="col-span-4 mt-2 p-2 bg-yellow-500 text-white rounded "
                  >
                    OK
                  </button>
                  <button
                    onClick={cancelElement}
                    className="col-span-4 mt-2 p-2 bg-yellow-500 text-white rounded "
                  >
                    CANCEL
                  </button>
                </div>
              )
            }
          </div>
        </div>
        <div className="col-span-4 rounded-md border-l-2 pl-4">
          <div className="col-span-4 p-4 rounded-md bg-slate-200 ">
            <p>Save to image</p>
            <button
              onClick={handleSaveImage}
              className="mt-2 p-2 bg-yellow-500 text-white rounded"
            >
              SAVE
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Canvas;