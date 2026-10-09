import React, { useState, useEffect } from 'react';
import { Sparkles, X } from 'lucide-react';

export default function BannerNotice() {
  const [notice, setNotice] = useState('');
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        if (data.bannerNotice && data.bannerNotice.trim()) {
          setNotice(data.bannerNotice);
        }
      })
      .catch(() => {});
  }, []);

  if (!notice || !visible) return null;

  return (
    <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white text-xs md:text-sm font-medium py-2 px-4 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2 truncate">
          <Sparkles className="w-4 h-4 flex-shrink-0 animate-pulse text-amber-200" />
          <span className="truncate">{notice}</span>
        </div>
        <button
          onClick={() => setVisible(false)}
          className="text-white/80 hover:text-white p-1 rounded transition-colors"
          title="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
