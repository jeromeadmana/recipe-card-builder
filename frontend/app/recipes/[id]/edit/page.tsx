'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Recipe, CanvasData, CanvasElement } from '@/lib/types';
import Canvas from '@/components/designer/Canvas';
import ElementPalette from '@/components/designer/ElementPalette';
import ExportButton from '@/components/designer/ExportButton';

export default function EditRecipePage() {
  const params = useParams();
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [canvasData, setCanvasData] = useState<CanvasData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRecipe();
  }, [params.id]);

  async function loadRecipe() {
    try {
      const response = await api.recipes.get(params.id as string);
      const r = response.recipe;
      setRecipe(r);
      setTitle(r.title);
      setDescription(r.description || '');
      setIsPublic(r.is_public);
      setCanvasData(r.canvas_data);
    } catch (err: any) {
      setError(err.message || 'Failed to load recipe');
    } finally {
      setLoading(false);
    }
  }

  function handleAddElement(element: Omit<CanvasElement, 'id'>) {
    if (!canvasData) return;

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

    if (!canvasData) {
      alert('Canvas data is missing');
      return;
    }

    setSaving(true);

    try {
      await api.recipes.update(params.id as string, {
        title,
        description: description || undefined,
        is_public: isPublic,
        canvas_data: canvasData
      });

      router.push(`/recipes/${params.id}`);
    } catch (error: any) {
      alert(error.message || 'Failed to save recipe');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (error || !recipe || !canvasData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Recipe not found'}</p>
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Edit Recipe</h1>
            <div className="space-x-4">
              <Link href={`/recipes/${params.id}`} className="text-gray-600 hover:text-gray-900">
                Cancel
              </Link>
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-blue-400"
              >
                {saving ? 'Saving...' : 'Save Changes'}
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
