import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

const OfflineBanner = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="bg-amber-500 text-slate-950 font-medium text-xs py-1.5 px-4 text-center flex items-center justify-center gap-2 shadow-md">
      <WifiOff className="w-4 h-4 animate-pulse" />
      <span>You are currently offline. Changes will sync automatically when connectivity is restored.</span>
    </div>
  );
};

export default OfflineBanner;
