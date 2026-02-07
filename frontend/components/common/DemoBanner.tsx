'use client';

import { useState } from 'react';

export default function DemoBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-yellow-500 text-black px-4 py-2 text-center relative">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex-1 text-sm md:text-base">
          <strong>Demo Mode:</strong> This is a portfolio project.
          Accounts and recipes are automatically deleted after 14-30 days.
          Max 10 recipes per user.
          <a
            href="https://github.com/yourusername/recipe-card-builder"
            target="_blank"
            rel="noopener noreferrer"
            className="underline ml-2 hover:text-gray-800"
          >
            View Source Code
          </a>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="ml-4 text-black hover:text-gray-800 font-bold text-xl"
          aria-label="Close banner"
        >
          ×
        </button>
      </div>
    </div>
  );
}
