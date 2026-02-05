'use client';

import { CanvasElement } from '@/lib/types';

interface ElementPaletteProps {
  onAddElement: (element: Omit<CanvasElement, 'id'>) => void;
}

export default function ElementPalette({ onAddElement }: ElementPaletteProps) {
  const foodIcons = [
    { name: 'Tomato', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="14" r="6" fill="#ff6347"/><path d="M10 8 Q12 6 14 8" stroke="#228b22" fill="none" stroke-width="2"/></svg>' },
    { name: 'Carrot', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 4 L16 18 L12 20 L8 18 Z" fill="#ff8c00"/><path d="M12 4 L12 2 M10 5 L9 3 M14 5 L15 3" stroke="#228b22" fill="none" stroke-width="1.5"/></svg>' },
    { name: 'Apple', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="14" r="7" fill="#dc143c"/><path d="M12 7 Q12 4 14 4" stroke="#8b4513" fill="none" stroke-width="2"/><ellipse cx="10" cy="12" rx="2" ry="3" fill="#ff69b4" opacity="0.3"/></svg>' },
  ];

  function addText() {
    onAddElement({
      type: 'text',
      position: { x: 50, y: 50 },
      size: { width: 200, height: 30 },
      zIndex: Date.now(),
      data: { text: 'Text', fontSize: 16, color: '#000000' }
    });
  }

  function addIngredient() {
    onAddElement({
      type: 'ingredient',
      position: { x: 50, y: 100 },
      size: { width: 250, height: 30 },
      zIndex: Date.now(),
      data: { text: 'Ingredient', fontSize: 14, color: '#333333' }
    });
  }

  function addStep() {
    onAddElement({
      type: 'step',
      position: { x: 50, y: 150 },
      size: { width: 300, height: 40 },
      zIndex: Date.now(),
      data: { text: 'Step 1', fontSize: 16, color: '#000000' }
    });
  }

  function addIcon(icon: { name: string; svg: string }) {
    onAddElement({
      type: 'svg-icon',
      position: { x: 100, y: 200 },
      size: { width: 60, height: 60 },
      zIndex: Date.now(),
      data: { icon: icon.name, svgPath: icon.svg, color: '#000000' }
    });
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-4">Elements</h3>

      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Text Elements</h4>
          <div className="space-y-2">
            <button
              onClick={addText}
              className="w-full px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded text-left text-sm"
            >
              + Add Text
            </button>
            <button
              onClick={addIngredient}
              className="w-full px-4 py-2 bg-green-50 hover:bg-green-100 rounded text-left text-sm"
            >
              + Add Ingredient
            </button>
            <button
              onClick={addStep}
              className="w-full px-4 py-2 bg-purple-50 hover:bg-purple-100 rounded text-left text-sm"
            >
              + Add Step
            </button>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Icons</h4>
          <div className="grid grid-cols-3 gap-2">
            {foodIcons.map((icon) => (
              <button
                key={icon.name}
                onClick={() => addIcon(icon)}
                className="p-2 bg-gray-50 hover:bg-gray-100 rounded flex items-center justify-center"
                title={icon.name}
              >
                <div
                  dangerouslySetInnerHTML={{ __html: icon.svg }}
                  className="w-8 h-8"
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
