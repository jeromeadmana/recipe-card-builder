'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Recipe } from '@/lib/types';
import Link from 'next/link';

export default function HomePage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecipes();
  }, []);

  async function loadRecipes() {
    try {
      const data = await api.recipes.list();
      setRecipes(data.recipes);
    } catch (error) {
      console.error('Failed to load recipes:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Recipe Card Builder</h1>
            <div className="space-x-4">
              <Link href="/login" className="text-blue-600 hover:text-blue-800">
                Login
              </Link>
              <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Register
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold mb-6">Public Recipes</h2>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : recipes.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No public recipes yet. Be the first to create one!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <div key={recipe.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                <h3 className="text-xl font-semibold mb-2">{recipe.title}</h3>
                {recipe.description && (
                  <p className="text-gray-600 mb-4">{recipe.description}</p>
                )}
                <Link
                  href={`/recipes/${recipe.id}`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  View Recipe →
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
