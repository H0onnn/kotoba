"use client";

import { useState, useRef, ReactNode } from "react";

interface ResizablePanelsProps {
  children: [ReactNode, ReactNode, ReactNode];
  className?: string;
}

export const ResizablePanels = ({
  children,
  className = "",
}: ResizablePanelsProps) => {
  const [panelWidths, setPanelWidths] = useState([30, 40, 30]);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragPanelIndex = useRef(0);
  const initialWidths = useRef<number[]>([]);

  const handleMouseDown = (e: React.MouseEvent, panelIndex: number) => {
    e.preventDefault();
    isDragging.current = true;
    dragStartX.current = e.clientX;
    dragPanelIndex.current = panelIndex;
    initialWidths.current = [...panelWidths];

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return;

    const containerWidth = containerRef.current.offsetWidth;
    const deltaX = e.clientX - dragStartX.current;
    const deltaPercentage = (deltaX / containerWidth) * 100;

    const newWidths = [...initialWidths.current];
    const currentIndex = dragPanelIndex.current;
    const nextIndex = currentIndex + 1;

    const minWidth = 10;
    const maxWidth = 80;

    let newCurrentWidth = Math.max(
      minWidth,
      Math.min(maxWidth, newWidths[currentIndex] + deltaPercentage)
    );
    let newNextWidth = Math.max(
      minWidth,
      Math.min(maxWidth, newWidths[nextIndex] - deltaPercentage)
    );

    if (newCurrentWidth < minWidth) {
      newNextWidth += minWidth - newCurrentWidth;
      newCurrentWidth = minWidth;
    }
    if (newNextWidth < minWidth) {
      newCurrentWidth += minWidth - newNextWidth;
      newNextWidth = minWidth;
    }

    newWidths[currentIndex] = newCurrentWidth;
    newWidths[nextIndex] = newNextWidth;

    const total = newWidths.reduce((sum, width) => sum + width, 0);
    const normalizedWidths = newWidths.map((width) => (width / total) * 100);

    setPanelWidths(normalizedWidths);
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  };

  const handleTouchStart = (e: React.TouchEvent, panelIndex: number) => {
    const touch = e.touches[0];
    isDragging.current = true;
    dragStartX.current = touch.clientX;
    dragPanelIndex.current = panelIndex;
    initialWidths.current = [...panelWidths];

    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);
  };

  const handleTouchMove = (e: TouchEvent) => {
    e.preventDefault();
    if (!isDragging.current || !containerRef.current) return;

    const touch = e.touches[0];
    const containerWidth = containerRef.current.offsetWidth;
    const deltaX = touch.clientX - dragStartX.current;
    const deltaPercentage = (deltaX / containerWidth) * 100;

    const newWidths = [...initialWidths.current];
    const currentIndex = dragPanelIndex.current;
    const nextIndex = currentIndex + 1;

    const minWidth = 10;
    const maxWidth = 80;

    let newCurrentWidth = Math.max(
      minWidth,
      Math.min(maxWidth, newWidths[currentIndex] + deltaPercentage)
    );
    let newNextWidth = Math.max(
      minWidth,
      Math.min(maxWidth, newWidths[nextIndex] - deltaPercentage)
    );

    if (newCurrentWidth < minWidth) {
      newNextWidth += minWidth - newCurrentWidth;
      newCurrentWidth = minWidth;
    }
    if (newNextWidth < minWidth) {
      newCurrentWidth += minWidth - newNextWidth;
      newNextWidth = minWidth;
    }

    newWidths[currentIndex] = newCurrentWidth;
    newWidths[nextIndex] = newNextWidth;

    const total = newWidths.reduce((sum, width) => sum + width, 0);
    const normalizedWidths = newWidths.map((width) => (width / total) * 100);

    setPanelWidths(normalizedWidths);
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
    document.removeEventListener("touchmove", handleTouchMove);
    document.removeEventListener("touchend", handleTouchEnd);
  };

  return (
    <div ref={containerRef} className={`flex h-full ${className}`}>
      <div
        className="overflow-auto flex-none border-r border-gray-200"
        style={{ width: `${panelWidths[0]}%` }}
      >
        {children[0]}
      </div>

      <div
        className="flex-shrink-0 w-px bg-gray-100 transition-colors hover:bg-gray-400 cursor-col-resize"
        onMouseDown={(e) => handleMouseDown(e, 0)}
        onTouchStart={(e) => handleTouchStart(e, 0)}
      />

      <div
        className="overflow-auto flex-none border-r border-gray-200"
        style={{ width: `${panelWidths[1]}%` }}
      >
        {children[1]}
      </div>

      <div
        className="flex-shrink-0 w-px bg-gray-100 transition-colors hover:bg-gray-400 cursor-col-resize"
        onMouseDown={(e) => handleMouseDown(e, 1)}
        onTouchStart={(e) => handleTouchStart(e, 1)}
      />

      <div
        className="overflow-auto flex-none"
        style={{ width: `${panelWidths[2]}%` }}
      >
        {children[2]}
      </div>
    </div>
  );
};
