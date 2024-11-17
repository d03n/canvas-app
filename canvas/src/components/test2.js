import React, { useEffect, useRef, useState } from "react";

const DraggableCanvas = () => {
  const canvasRef = useRef(null);
  const [elements, setElements] = useState([]);
  const [draggingElement, setDraggingElement] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    redrawCanvas();
  }, [elements]);

  const handleCanvasClick = (e) => {
    // Prevent creating a new rectangle during dragging
    if (isDragging) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Add a new element
    const newElement = {
      id: elements.length,
      x: x - 25,
      y: y - 25,
      width: 50,
      height: 50,
      color: `hsl(${Math.random() * 360}, 100%, 50%)`,
    };
    setElements((prev) => [...prev, newElement]);
  };

  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if an element is clicked
    const element = elements.find(
      (el) =>
        x >= el.x &&
        x <= el.x + el.width &&
        y >= el.y &&
        y <= el.y + el.height
    );

    if (element) {
      setDraggingElement(element);
      setDragOffset({ x: x - element.x, y: y - element.y });
    }
  };

  const handleMouseMove = (e) => {
    if (!draggingElement) return;

    setIsDragging(true);

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Update element's position
    const updatedElements = elements.map((el) =>
      el.id === draggingElement.id
        ? { ...el, x: x - dragOffset.x, y: y - dragOffset.y }
        : el
    );
    setElements(updatedElements);
  };

  const handleMouseUp = () => {
    setDraggingElement(null);

    // Reset dragging state
    setTimeout(() => setIsDragging(false), 0);
  };

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    elements.forEach((el) => {
      ctx.fillStyle = el.color;
      ctx.fillRect(el.x, el.y, el.width, el.height);
    });
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        width="800"
        height="600"
        style={{ border: "1px solid black" }}
        onClick={handleCanvasClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
    </div>
  );
};

export default DraggableCanvas;
