'use client';

import { useState, useEffect } from 'react';
import ResetDataModal from '../common/ResetDataModal';

interface RecipeStatsData {
  recipeCount: number;
  recipeLimit: number;
  remainingSlots: number;
  limitReached: boolean;
}

export default function RecipeStats() {
  const [stats, setStats] = useState<RecipeStatsData | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/recipes/stats/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleReset = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/recipes/reset/all`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMessage({ type: 'success', text: `Successfully deleted ${data.deletedCount} recipe${data.deletedCount !== 1 ? 's' : ''}!` });
        await fetchStats(); // Refresh stats

        // Clear message after 5 seconds
        setTimeout(() => setMessage(null), 5000);

        // Trigger page refresh to update recipe list
        window.location.reload();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to reset recipes' });
        setTimeout(() => setMessage(null), 5000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while resetting recipes' });
      setTimeout(() => setMessage(null), 5000);
    }
  };

  if (!stats) {
    return null;
  }

  const percentage = (stats.recipeCount / stats.recipeLimit) * 100;
  const isWarning = stats.remainingSlots <= 3 && stats.remainingSlots > 0;
  const isDanger = stats.limitReached;

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recipe Usage</h3>
        {stats.recipeCount > 0 && (
          <button
            onClick={() => setShowResetModal(true)}
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Clear All Recipes
          </button>
        )}
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded ${
          message.type === 'success'
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className={`text-2xl font-bold ${
            isDanger ? 'text-red-600' :
            isWarning ? 'text-yellow-600' :
            'text-gray-900'
          }`}>
            {stats.recipeCount} / {stats.recipeLimit}
          </span>
          <span className="text-sm text-gray-600">
            {stats.remainingSlots} slot{stats.remainingSlots !== 1 ? 's' : ''} remaining
          </span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full transition-all ${
              isDanger ? 'bg-red-600' :
              isWarning ? 'bg-yellow-500' :
              'bg-blue-600'
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          ></div>
        </div>

        {isWarning && !isDanger && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3">
            <p className="text-sm text-yellow-700">
              <strong>Warning:</strong> You have only {stats.remainingSlots} recipe slot{stats.remainingSlots !== 1 ? 's' : ''} left!
            </p>
          </div>
        )}

        {isDanger && (
          <div className="bg-red-50 border-l-4 border-red-500 p-3">
            <p className="text-sm text-red-700">
              <strong>Limit Reached!</strong> You've reached the maximum of {stats.recipeLimit} recipes. Please delete some recipes or clear all data to continue.
            </p>
          </div>
        )}

        <div className="pt-2 text-xs text-gray-500">
          <p>Demo Mode: Maximum {stats.recipeLimit} recipes per user</p>
        </div>
      </div>

      <ResetDataModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={handleReset}
        recipeCount={stats.recipeCount}
      />
    </div>
  );
}
