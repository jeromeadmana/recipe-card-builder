'use client';

import { useState, useRef, useEffect } from 'react';
import { CanvasData, CanvasElement } from '@/lib/types';
import DraggableElement from './DraggableElement';

interface CanvasProps {
  data: CanvasData;
  onChange: (data: CanvasData) => void;
  readonly?: boolean;
}

export default function Canvas({ data, onChange, readonly = false }: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);

  function handleElementMove(id: string, newPosition: { x: number; y: number }) {
    const updatedElements = data.elements.map(el =>
      el.id === id ? { ...el, position: newPosition } : el
    );
    onChange({ ...data, elements: updatedElements });
  }

  function handleElementUpdate(id: string, updates: Partial<CanvasElement>) {
    const updatedElements = data.elements.map(el =>
      el.id === id ? { ...el, ...updates } : el
    );
    onChange({ ...data, elements: updatedElements });
  }

  function handleElementDelete(id: string) {
    const updatedElements = data.elements.filter(el => el.id !== id);
    onChange({ ...data, elements: updatedElements });
    if (selectedElement === id) {
      setSelectedElement(null);
    }
  }

  function handleCanvasClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) {
      setSelectedElement(null);
    }
  }

  return (
    <div className="relative">
      <div
        ref={canvasRef}
        onClick={handleCanvasClick}
        style={{
          width: `${data.dimensions.width}px`,
          height: `${data.dimensions.height}px`,
          backgroundColor: data.background.color,
          backgroundImage: data.background.image ? `url(${data.background.image})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
        className="relative border-2 border-gray-300 overflow-hidden"
      >
        {data.elements
          .sort((a, b) => a.zIndex - b.zIndex)
          .map((element) => (
            <DraggableElement
              key={element.id}
              element={element}
              selected={selectedElement === element.id}
              readonly={readonly}
              onSelect={() => setSelectedElement(element.id)}
              onMove={(pos) => handleElementMove(element.id, pos)}
              onUpdate={(updates) => handleElementUpdate(element.id, updates)}
              onDelete={() => handleElementDelete(element.id)}
            />
          ))}
      </div>
    </div>
  );
}
