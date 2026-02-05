'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { CanvasData, CanvasElement } from '@/lib/types';
import Canvas from '@/components/designer/Canvas';
import ElementPalette from '@/components/designer/ElementPalette';
import ExportButton from '@/components/designer/ExportButton';

export default function NewRecipePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [canvasData, setCanvasData] = useState<CanvasData>({
    version: '1.0',
    dimensions: { width: 800, height: 1000 },
    background: { color: '#ffffff', image: null },
    elements: []
  });
  const [saving, setSaving] = useState(false);

  function handleAddElement(element: Omit<CanvasElement, 'id'>) {
    const newElement: CanvasElement = {
      ...element,
      id: `element-${Date.now()}-${Math.random()}`
    };
    setCanvasData({
      ...canvasData,
      elements: [...canvasData.elements, newElement]
    });
  }

  async function handleSave() {
    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }

    setSaving(true);

    try {
      const response = await api.recipes.create({
        title,
        description: description || undefined,
        is_public: isPublic,
        canvas_data: canvasData
      });

      router.push(`/recipes/${response.recipe.id}`);
    } catch (error: any) {
      alert(error.message || 'Failed to save recipe');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Create Recipe</h1>
            <div className="space-x-4">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                Cancel
              </Link>
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-blue-400"
              >
                {saving ? 'Saving...' : 'Save Recipe'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="My Amazing Recipe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="A delicious recipe for..."
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="isPublic" className="text-sm text-gray-700">
                    Make this recipe public
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Recipe Card Design</h2>
                <ExportButton canvasData={canvasData} filename={title || 'recipe-card'} />
              </div>

              <div className="flex justify-center" data-canvas="true">
                <Canvas data={canvasData} onChange={setCanvasData} />
              </div>
            </div>
          </div>

          <div>
            <ElementPalette onAddElement={handleAddElement} />
          </div>
        </div>
      </main>
    </div>
  );
}
