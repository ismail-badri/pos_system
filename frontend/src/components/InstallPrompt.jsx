import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

// Listens for the browser's install prompt event and shows a small banner
// so employees can add the app to their home screen with one tap.
export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    function handler(e) {
      e.preventDefault();
      setDeferredPrompt(e);
    }
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!deferredPrompt || dismissed) return null;

  async function handleInstall() {
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-ink text-white rounded-xl shadow-lg px-4 py-3 flex items-center gap-3 max-w-sm w-[calc(100%-2rem)]">
      <Download size={18} className="text-amber shrink-0" />
      <p className="text-sm flex-1">Install EL HAMDI Store on this device for quick access.</p>
      <button onClick={handleInstall} className="bg-amber text-ink-dark text-sm font-medium px-3 py-1.5 rounded-lg shrink-0">
        Install
      </button>
      <button onClick={() => setDismissed(true)} className="text-white/50 hover:text-white shrink-0">
        <X size={16} />
      </button>
    </div>
  );
}
