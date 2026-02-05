'use client';

import { useState } from 'react';
import { CanvasData } from '@/lib/types';
import html2canvas from 'html2canvas';

interface ExportButtonProps {
  canvasData: CanvasData;
  filename?: string;
}

export default function ExportButton({ canvasData, filename = 'recipe-card' }: ExportButtonProps) {
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    setExporting(true);

    try {
      const canvasElement = document.querySelector('[data-canvas="true"]') as HTMLElement;

      if (!canvasElement) {
        alert('Canvas not found');
        return;
      }

      const canvas = await html2canvas(canvasElement, {
        backgroundColor: canvasData.background.color,
        scale: 2,
        logging: false,
        useCORS: true
      });

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export image');
    } finally {
      setExporting(false);
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-400 flex items-center gap-2"
    >
      {exporting ? (
        <>
          <span className="animate-spin">⏳</span>
          Exporting...
        </>
      ) : (
        <>
          <span>📥</span>
          Export as PNG
        </>
      )}
    </button>
  );
}
