'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { X, Share2, Link2, Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShareScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  scheduleId: Id<'schedules'>;
  scheduleName?: string;
}

export function ShareScheduleModal({
  isOpen,
  onClose,
  scheduleId,
  scheduleName,
}: ShareScheduleModalProps) {
  const [name, setName] = useState(scheduleName || 'My Festival Schedule');
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const shareSchedule = useMutation(api.schedules.shareSchedule);

  const handleGenerateLink = async () => {
    setIsGenerating(true);
    try {
      const shareToken = await shareSchedule({
        scheduleId,
        scheduleName: name,
      });

      const url = `${window.location.origin}/shared/${shareToken}`;
      setShareUrl(url);
    } catch (error) {
      console.error('Error generating share link:', error);
      alert('Failed to generate share link. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setShareUrl(null);
    setCopied(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <Card className="relative z-10 w-full max-w-lg border-white/10 bg-slate-900/95 backdrop-blur-xl">
        {/* Header */}
        <div className="border-b border-white/10 bg-gradient-to-r from-blue-500/10 to-purple-600/10 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-300/30 bg-blue-500/20">
                <Share2 className="h-6 w-6 text-blue-300" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-50">Share Schedule</h2>
                <p className="text-sm text-slate-400">
                  Create a link to share your festival plan
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:border-blue-300/40 hover:text-blue-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {!shareUrl ? (
            <>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300">
                  Schedule Name
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My Festival Schedule"
                  className="h-12 rounded-xl border-white/10 bg-white/5 text-slate-100"
                />
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-slate-300">
                  💡 Anyone with the link will be able to view your schedule (but not edit it)
                </p>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border border-green-400/30 bg-green-500/10 p-4">
                <div className="flex items-center gap-2 text-green-300">
                  <Check className="h-5 w-5" />
                  <p className="font-semibold">Share link created!</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300">
                  Share URL
                </label>
                <div className="flex gap-2">
                  <Input
                    value={shareUrl}
                    readOnly
                    className="h-12 flex-1 rounded-xl border-white/10 bg-white/5 text-slate-100"
                  />
                  <Button
                    onClick={handleCopy}
                    className={cn(
                      'gap-2 rounded-xl border px-4 transition',
                      copied
                        ? 'border-green-400/40 bg-green-500/20 text-green-100'
                        : 'border-blue-300/40 bg-blue-500/20 text-blue-100 hover:bg-blue-500/30'
                    )}
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-slate-300">
                  Share this link via social media, email, or messaging apps!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 bg-slate-900/90 p-6">
          {!shareUrl ? (
            <div className="flex justify-end gap-3">
              <Button
                onClick={handleClose}
                variant="ghost"
                className="rounded-xl border border-white/10 bg-white/5 px-6 py-2 text-slate-300 hover:border-blue-300/40 hover:text-blue-100"
              >
                Cancel
              </Button>
              <Button
                onClick={handleGenerateLink}
                disabled={isGenerating}
                className="gap-2 rounded-xl border border-blue-300/40 bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-2 font-semibold text-white hover:from-blue-600 hover:to-purple-700"
              >
                {isGenerating ? (
                  'Generating...'
                ) : (
                  <>
                    <Link2 className="h-4 w-4" />
                    Generate Link
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="flex justify-end">
              <Button
                onClick={handleClose}
                className="rounded-xl border border-blue-300/40 bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-2 font-semibold text-white hover:from-blue-600 hover:to-purple-700"
              >
                Done
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

