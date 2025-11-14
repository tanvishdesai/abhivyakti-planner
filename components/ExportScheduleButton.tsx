'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Download, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';

interface ExportScheduleButtonProps {
  scheduleElementId: string;
  filename?: string;
}

export function ExportScheduleButton({
  scheduleElementId,
  filename = 'my-festival-schedule',
}: ExportScheduleButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const element = document.getElementById(scheduleElementId);
      if (!element) {
        alert('Schedule element not found');
        return;
      }

      // Create canvas from the schedule element
      const canvas = await html2canvas(element, {
        backgroundColor: '#0f172a',
        scale: 2, // Higher quality
        logging: false,
        useCORS: true,
      });

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = `${filename}.png`;
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);
        }
      });
    } catch (error) {
      console.error('Error exporting schedule:', error);
      alert('Failed to export schedule. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={isExporting}
      className="gap-2 rounded-xl border border-purple-300/40 bg-gradient-to-r from-purple-500/20 to-pink-600/20 px-4 py-2 text-sm font-semibold text-purple-100 transition hover:from-purple-500/30 hover:to-pink-600/30"
    >
      {isExporting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          Export as Image
        </>
      )}
    </Button>
  );
}

