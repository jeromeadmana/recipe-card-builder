'use client';

import { useState } from 'react';
import { api, setToken } from '@/lib/api';
import { UserRole } from '@/lib/types';

interface RoleSwitcherProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export default function RoleSwitcher({ currentRole, onRoleChange }: RoleSwitcherProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleRoleChange(role: UserRole) {
    if (role === currentRole) return;

    setError('');
    setLoading(true);

    try {
      const response = await api.auth.switchRole(role);
      setToken(response.token);
      onRoleChange(role);
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Failed to switch role');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-3">Switch Role (Demo Mode)</h3>
      {error && (
        <div className="bg-red-50 text-red-600 p-2 rounded mb-3 text-sm">{error}</div>
      )}
      <div className="space-y-2">
        <button
          onClick={() => handleRoleChange('guest')}
          disabled={loading || currentRole === 'guest'}
          className={`w-full px-4 py-2 rounded text-left ${
            currentRole === 'guest'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 hover:bg-gray-200'
          } disabled:opacity-50`}
        >
          <div className="font-medium">Guest</div>
          <div className="text-sm opacity-75">View public recipes only</div>
        </button>

        <button
          onClick={() => handleRoleChange('home_cook')}
          disabled={loading || currentRole === 'home_cook'}
          className={`w-full px-4 py-2 rounded text-left ${
            currentRole === 'home_cook'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 hover:bg-gray-200'
          } disabled:opacity-50`}
        >
          <div className="font-medium">Home Cook</div>
          <div className="text-sm opacity-75">Create and manage your recipes</div>
        </button>

        <button
          onClick={() => handleRoleChange('chef')}
          disabled={loading || currentRole === 'chef'}
          className={`w-full px-4 py-2 rounded text-left ${
            currentRole === 'chef'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 hover:bg-gray-200'
          } disabled:opacity-50`}
        >
          <div className="font-medium">Chef</div>
          <div className="text-sm opacity-75">Full access to all recipes and templates</div>
        </button>
      </div>
    </div>
  );
}
