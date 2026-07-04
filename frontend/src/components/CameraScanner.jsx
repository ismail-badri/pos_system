import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { X, Camera, AlertTriangle } from 'lucide-react';

// Opens the device camera and continuously decodes barcodes/QR codes from the
// live video feed. Calls onDetected(text) once with the decoded value, then
// stops the camera. Works in any modern mobile browser and inside a
// Capacitor-wrapped Android app (with the camera permission granted).
export default function CameraScanner({ onDetected, onClose }) {
  const videoRef = useRef(null);
  const readerRef = useRef(null);
  const controlsRef = useRef(null);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const reader = new BrowserMultiFormatReader();
    readerRef.current = reader;

    async function start() {
      try {
        const devices = await BrowserMultiFormatReader.listVideoInputDevices();
        if (devices.length === 0) {
          throw new Error('No camera was found on this device.');
        }

        // Prefer the back/environment-facing camera on phones
        const backCamera = devices.find((d) => /back|rear|environment/i.test(d.label)) || devices[devices.length - 1];

        const controls = await reader.decodeFromVideoDevice(
          backCamera.deviceId,
          videoRef.current,
          (result, err, ctrls) => {
            if (cancelled) return;
            if (result) {
              ctrls.stop();
              onDetected(result.getText());
            }
          }
        );
        controlsRef.current = controls;
        if (!cancelled) setReady(true);
      } catch (err) {
        if (!cancelled) {
          setError(
            err?.name === 'NotAllowedError'
              ? 'Camera access was denied. Please allow camera permission and try again.'
              : err.message || 'Unable to access the camera.'
          );
        }
      }
    }

    start();

    return () => {
      cancelled = true;
      controlsRef.current?.stop();
    };
  }, [onDetected]);

  function handleClose() {
    controlsRef.current?.stop();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-ink-dark/70 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl w-full max-w-sm overflow-hidden relative">
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-10 bg-white/90 rounded-full p-1.5 text-ink hover:bg-white"
        >
          <X size={18} />
        </button>

        <div className="p-4 pb-3 flex items-center gap-2 border-b border-stone-100">
          <Camera size={18} className="text-amber-dark" />
          <h2 className="font-display font-semibold text-ink text-sm">Scan a barcode</h2>
        </div>

        <div className="relative bg-ink-dark aspect-[3/4]">
          <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />

          {ready && !error && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-4/5 h-24 border-2 border-amber rounded-lg" />
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
              <AlertTriangle className="text-amber" size={24} />
              <p className="text-white text-sm">{error}</p>
            </div>
          )}
        </div>

        <p className="text-xs text-ink/50 text-center py-3 px-4">
          Point the camera at the product's barcode. It will be added automatically once recognized.
        </p>
      </div>
    </div>
  );
}
