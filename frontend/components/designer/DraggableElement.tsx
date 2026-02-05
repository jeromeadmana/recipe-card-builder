'use client';

import { useState, useRef, useEffect } from 'react';
import { CanvasElement } from '@/lib/types';

interface DraggableElementProps {
  element: CanvasElement;
  selected: boolean;
  readonly: boolean;
  onSelect: () => void;
  onMove: (position: { x: number; y: number }) => void;
  onUpdate: (updates: Partial<CanvasElement>) => void;
  onDelete: () => void;
}

export default function DraggableElement({
  element,
  selected,
  readonly,
  onSelect,
  onMove,
  onUpdate,
  onDelete
}: DraggableElementProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isDragging) return;

    function handleMouseMove(e: MouseEvent) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;

      onMove({
        x: Math.max(0, element.position.x + deltaX),
        y: Math.max(0, element.position.y + deltaY)
      });

      setDragStart({ x: e.clientX, y: e.clientY });
    }

    function handleMouseUp() {
      setIsDragging(false);
    }

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart, element.position, onMove]);

  function handleMouseDown(e: React.MouseEvent) {
    if (readonly) return;
    e.stopPropagation();
    onSelect();
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  }

  function handleDoubleClick() {
    if (readonly) return;
    if (element.type === 'text' || element.type === 'ingredient' || element.type === 'step') {
      setIsEditing(true);
    }
  }

  function handleTextChange(text: string) {
    onUpdate({ data: { ...element.data, text } });
  }

  function renderContent() {
    switch (element.type) {
      case 'text':
      case 'ingredient':
      case 'step':
        if (isEditing && !readonly) {
          return (
            <input
              type="text"
              value={element.data.text || ''}
              onChange={(e) => handleTextChange(e.target.value)}
              onBlur={() => setIsEditing(false)}
              onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
              autoFocus
              style={{
                fontSize: `${element.data.fontSize || 16}px`,
                color: element.data.color || '#000',
                width: '100%',
                border: 'none',
                outline: 'none',
                background: 'transparent'
              }}
              className="p-0 m-0"
            />
          );
        }
        return (
          <div
            style={{
              fontSize: `${element.data.fontSize || 16}px`,
              color: element.data.color || '#000',
              fontWeight: element.type === 'step' ? 'bold' : 'normal'
            }}
          >
            {element.data.text || `Double-click to edit ${element.type}`}
          </div>
        );

      case 'svg-icon':
        return (
          <div
            dangerouslySetInnerHTML={{ __html: element.data.svgPath || '' }}
            style={{ width: '100%', height: '100%' }}
          />
        );

      case 'image':
        return (
          <img
            src={element.data.imageUrl || ''}
            alt="Recipe element"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        );

      case 'drawing':
        return <div>Drawing placeholder</div>;

      default:
        return <div>Unknown element</div>;
    }
  }

  return (
    <div
      ref={elementRef}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      style={{
        position: 'absolute',
        left: `${element.position.x}px`,
        top: `${element.position.y}px`,
        width: `${element.size.width}px`,
        minHeight: `${element.size.height}px`,
        cursor: readonly ? 'default' : isDragging ? 'grabbing' : 'grab',
        zIndex: element.zIndex,
        padding: '8px',
        border: selected ? '2px solid #3b82f6' : '2px solid transparent',
        background: selected ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
        userSelect: isEditing ? 'text' : 'none'
      }}
      className="transition-colors"
    >
      {renderContent()}

      {selected && !readonly && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
        >
          ×
        </button>
      )}
    </div>
  );
}
