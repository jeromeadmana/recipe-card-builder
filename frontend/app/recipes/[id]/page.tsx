'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Recipe } from '@/lib/types';
import Canvas from '@/components/designer/Canvas';
import ExportButton from '@/components/designer/ExportButton';

export default function ViewRecipePage() {
  const params = useParams();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRecipe();
  }, [params.id]);

  async function loadRecipe() {
    try {
      const response = await api.recipes.get(params.id as string);
      setRecipe(response.recipe);
    } catch (err: any) {
      setError(err.message || 'Failed to load recipe');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (error || !recipe) {
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
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{recipe.title}</h1>
              {recipe.description && (
                <p className="text-gray-600 mt-1">{recipe.description}</p>
              )}
            </div>
            <div className="space-x-4">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                Back to Dashboard
              </Link>
              <Link
                href={`/recipes/${recipe.id}/edit`}
                className="text-blue-600 hover:text-blue-800"
              >
                Edit
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Recipe Card</h2>
            <ExportButton canvasData={recipe.canvas_data} filename={recipe.title} />
          </div>

          <div className="flex justify-center" data-canvas="true">
            <Canvas data={recipe.canvas_data} onChange={() => {}} readonly />
          </div>
        </div>
      </main>
    </div>
  );
}
