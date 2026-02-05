'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Template } from '@/lib/types';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, []);

  async function loadTemplates() {
    try {
      const response = await api.templates.list();
      setTemplates(response.templates);
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Templates</h1>
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : templates.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No templates available yet.</p>
            <p className="text-sm text-gray-400 mt-2">Templates can be created by Chef users.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div key={template.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                <h3 className="text-xl font-semibold mb-2">{template.name}</h3>
                {template.description && (
                  <p className="text-gray-600 mb-4">{template.description}</p>
                )}
                <button className="text-blue-600 hover:text-blue-800">
                  Use Template →
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
