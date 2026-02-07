'use client';

import { useState } from 'react';

interface ResetDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  recipeCount: number;
}

export default function ResetDataModal({ isOpen, onClose, onConfirm, recipeCount }: ResetDataModalProps) {
  const [isResetting, setIsResetting] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsResetting(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Reset failed:', error);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Reset All Recipes?</h2>

        <div className="mb-6">
          <p className="text-gray-700 mb-4">
            This will permanently delete all of your recipes. This action cannot be undone.
          </p>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Warning:</strong> You are about to delete <strong>{recipeCount}</strong> recipe{recipeCount !== 1 ? 's' : ''}.
                </p>
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            <p className="font-semibold mb-2">The following will be deleted:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>All your recipe cards</li>
              <li>All recipe designs and elements</li>
              <li>All recipe descriptions</li>
            </ul>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            <p className="font-semibold">What will NOT be deleted:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Your user account</li>
              <li>Your login credentials</li>
            </ul>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isResetting}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isResetting}
            className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isResetting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Resetting...
              </>
            ) : (
              'Yes, Delete All Recipes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
