'use client';

import { useEffect, useState } from 'react';

export default function ClientRuntimeDiagnostics() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const showError = (detail: unknown) => {
      const text = detail instanceof Error ? detail.message : String(detail);
      setMessage(text || 'Unknown client error');
    };

    const onError = (event: ErrorEvent) => showError(event.error || event.message);
    const onRejection = (event: PromiseRejectionEvent) => showError(event.reason);

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);

    window.setTimeout(() => {
      document.documentElement.dataset.clientReady = 'true';
    }, 0);

    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, []);

  if (!message) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-[100] rounded-md border border-red-300 bg-red-950 p-3 text-sm text-white shadow-lg">
      <div className="font-semibold">Safari client error</div>
      <div className="mt-1 break-words text-white/80">{message}</div>
    </div>
  );
}
