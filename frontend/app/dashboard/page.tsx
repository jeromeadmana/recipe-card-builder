'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, removeToken } from '@/lib/api';
import { User, Recipe } from '@/lib/types';
import RoleSwitcher from '@/components/auth/RoleSwitcher';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [userResponse, recipesResponse] = await Promise.all([
        api.auth.getMe(),
        api.recipes.list()
      ]);
      setUser(userResponse.user);
      setRecipes(recipesResponse.recipes);
    } catch (error) {
      console.error('Failed to load data:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    removeToken();
    router.push('/');
  }

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this recipe?')) return;

    try {
      await api.recipes.delete(id.toString());
      setRecipes(recipes.filter(r => r.id !== id));
    } catch (error: any) {
      alert(error.message || 'Failed to delete recipe');
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  const userRecipes = recipes.filter(r => r.user_id === user.id);
  const canCreateRecipe = user.role !== 'guest';

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">
                Logged in as <span className="font-medium">{user.username}</span> ({user.role})
              </p>
            </div>
            <div className="space-x-4">
              <Link href="/" className="text-blue-600 hover:text-blue-800">
                Home
              </Link>
              <Link href="/templates" className="text-blue-600 hover:text-blue-800">
                Templates
              </Link>
              <button
                onClick={handleLogout}
                className="text-red-600 hover:text-red-800"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">
                {user.role === 'chef' ? 'All Recipes' : 'My Recipes'}
              </h2>
              {canCreateRecipe && (
                <Link
                  href="/recipes/new"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Create Recipe
                </Link>
              )}
            </div>

            {recipes.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <p className="text-gray-500">No recipes yet.</p>
                {canCreateRecipe && (
                  <Link
                    href="/recipes/new"
                    className="text-blue-600 hover:text-blue-800 mt-2 inline-block"
                  >
                    Create your first recipe
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {recipes.map((recipe) => (
                  <div key={recipe.id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">{recipe.title}</h3>
                        {recipe.description && (
                          <p className="text-gray-600 mb-3">{recipe.description}</p>
                        )}
                        <div className="flex gap-2 text-sm text-gray-500">
                          <span className={recipe.is_public ? 'text-green-600' : 'text-gray-500'}>
                            {recipe.is_public ? 'Public' : 'Private'}
                          </span>
                          {user.role === 'chef' && recipe.user_id !== user.id && (
                            <span>• Owner ID: {recipe.user_id}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Link
                          href={`/recipes/${recipe.id}`}
                          className="text-blue-600 hover:text-blue-800 px-3 py-1"
                        >
                          View
                        </Link>
                        {(user.role === 'chef' || recipe.user_id === user.id) && (
                          <>
                            <Link
                              href={`/recipes/${recipe.id}/edit`}
                              className="text-blue-600 hover:text-blue-800 px-3 py-1"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDelete(recipe.id)}
                              className="text-red-600 hover:text-red-800 px-3 py-1"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <RoleSwitcher currentRole={user.role} onRoleChange={(role) => setUser({ ...user, role })} />
          </div>
        </div>
      </main>
    </div>
  );
}
